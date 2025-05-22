import Tus from '@uppy/tus'
import Uppy, { type UppyFile } from '@uppy/core'
import { defineStore } from 'pinia'
import { SundraCache, SundraUploadStatus } from '~/types/sundra'
import { useFileStore } from '@/stores/FileStore'
import { useErrorStore } from '@/stores/ErrorStore'
import { useAuthStore } from '@/stores/AuthStore'

export type UppyTusFile = UppyFile & { tus: { uploadUrl: string } }

/**
 * File Store
 * Holds all (single?) files user has uploaded
 */
export const useUppyStore = defineStore('uppy', () => {
    const { debug, backendUrl } = useRuntimeConfig().public

    const uppy = ref<Uppy|null>(null)
    const authStore = useAuthStore()
    const errorStore = useErrorStore()
    const fileStore = useFileStore()
    const updateCounter = new Map<string, number>()
    const uploadState = ref<SundraUploadStatus>(SundraUploadStatus.Idle)
    const uploads = ref<Array<UppyFile>>([])
    const totalProgress = ref<number>(0)

    function create(defaultLanguage: string, maxUploads: number = 20, chunkSize: number = 50000000, allowed: Array<string> = ['video/*', 'audio/*']) {
        if (uppy.value == null) {
            uppy.value = new Uppy({
                id: 'id',
                debug: debug,
                autoProceed: false,
                allowMultipleUploadBatches: true
            })
            .use(Tus, {
                endpoint: 'https://upload.sundra.io/files', //backendUrl+'/api/tus/',
                withCredentials: true,
                chunkSize: chunkSize,
                removeFingerprintOnSuccess: true,
                headers: {
                    'X-Xsrf-Token': useCookie("XSRF-TOKEN").value ?? '',
                    'X-Active-Team': String(authStore.activeTeam?.id ?? '')
                },
                async onBeforeRequest(req, file) {
                    try {
                        if (req.getMethod().toUpperCase() == 'POST') {
                            if (debug) { console.log(`UppyStore:${uppy.value!.getID()}:onBeforeRequest`, (req)) }
                            const token: string = await fetchUploadToken()
                            req.setHeader('Authorization', `Bearer ${token}`)
                        }
                    } catch (error) {
                        // TODO: Handle better
                        console.error(`UppyStore:${uppy.value!.getID()}:onBeforeRequest`, error)
                    }
                }
            })
            // Fired each time a file is added.
            .on("file-added", (file) => {
                if (debug) { console.log(`UppyStore:${uppy.value!.getID()}:file-added`, file) }
                uploadState.value = SundraUploadStatus.Uploading
                uppy.value!.upload()
                getUppyFiles()
            })
            .on('file-removed', (file, reason) => {
                if (debug) { console.log(`UppyStore:${uppy.value!.getID()}:file-removed`, file, reason) }
                getUppyFiles()
                if (file != null && !file.progress?.uploadComplete) { updateUpload(file, SundraUploadStatus.Cancelled) }
            })
            .on('upload', (upload) => {
                if (debug) { console.log(`UppyStore:${uppy.value!.getID()}:upload`, upload) }
            })
            // Fired each time an individual file upload progress is available
            .on('upload-progress', (file, progress) => {
                //if (debug) { console.log(`UppyStore:${uppy.value!.getID()}:upload-progress`, file, progress)}
                uploadState.value = SundraUploadStatus.Uploading
                if (file != null && !file.progress?.uploadComplete) {
                    const url = (file as UppyTusFile).tus.uploadUrl
                    if (updateCounter.has(url) && (updateCounter.get(url)! % 20) == 0) {
                        updateUpload(file, SundraUploadStatus.Uploading)
                        updateCounter.set(url, 1)
                    } else if (updateCounter.has(url)) {
                        updateCounter.set(url, updateCounter.get(url)! + 1)
                    } else {
                        let type: string = file.type?.split('/', 1)[0]?.toLowerCase() ?? 'unknown'
                        if (!['video','audio','image'].includes(type)) { type = 'unknown' }
                        // TODO: Do this on the upload server end
                        fileStore.createUpload(url, file?.name, (type as 'video'|'audio'|'image'|'unknown'), file.size, defaultLanguage)
                        updateCounter.set(url, 1)
                    }
                }
                getUppyFiles()
            })
            // Fired each time the total upload progress is updated
            .on('progress', (progress) => {
                //if (debug) { console.log(`UppyStore:${uppy.value!.getID()}:progress`, progress) }
                uploadState.value = SundraUploadStatus.Uploading
                getUppyFiles()
                totalProgress.value = progress
            })
            // Fired each time a single upload is completed.
            .on('upload-success', (file, response) => {
                if (debug) { console.log(`UppyStore:${uppy.value!.getID()}:upload-success`, file, response) }
                if (file != null) {
                    updateUpload(file, SundraUploadStatus.Waiting).then(async () => {
                        await fileStore.loadUploads(SundraCache.Reload)
                    })
                    // Remove from counter
                    const url = (file as UppyTusFile).tus.uploadUrl
                    updateCounter.delete(url)
                    getUppyFiles()
                    uppy.value?.removeFile(file.id)
                }
            })
            // Fired when all uploads are complete.
            .on('complete', (result) => {
                if (debug) { console.log(`UppyStore:${uppy.value!.getID()}:complete`, result) }
                uploadState.value = SundraUploadStatus.Completed
                getUppyFiles()
            })
            // Fired each time a single upload failed.
            .on('upload-error', (file, error, response) => {
                if (debug) { console.log(`UppyStore:${uppy.value!.getID()}:upload-error`, file, error, response) }
                errorStore.log(error.message, `UppyStore:${uppy.value!.getID()}:upload-error`, error.name)
                if (file != null) { updateUpload(file, SundraUploadStatus.Incomplete, error.message) }
                getUppyFiles()
            })
            // Fired when Uppy fails to upload/encode the entire upload.
            .on('error', (error) => {
                if (debug) { console.log(`UppyStore:${uppy.value!.getID()}:error`, error) }
                errorStore.log(error.message, `UppyStore:${uppy.value!.getID()}:error`, error.name)
                uploadState.value = SundraUploadStatus.Failed
                getUppyFiles()
            })
            .on('info-visible', () => {
                if (debug) { console.log(`UppyStore:${uppy.value!.getID()}:info-visible`, uppy.value!.getState()) }
            })
        }

        getUppyFiles()
        if (debug) { console.log(`UppyStore::create`, { maxUploads: maxUploads, chunkSize: chunkSize, allowed: allowed }) }
        return uppy
    }

    function remove(id: string) {
        uppy.value?.removeFile(id)
    }

    function getUppyFiles() {
        uploads.value.splice(0)
        uploads.value.push(...(uppy.value!.getFiles()))
    }

    async function updateUpload(file: UppyFile, status: SundraUploadStatus, error?: string) {
        if ((file as UppyTusFile).tus?.uploadUrl != null) {
            const url = (file as UppyTusFile).tus.uploadUrl
            const bytesUploaded = status == SundraUploadStatus.Waiting
                                    ? (file.progress?.bytesTotal ?? file.size)
                                    : (file.progress?.bytesUploaded ?? 0)

            fileStore.updateUpload(url, { status: status, bytes_uploaded: bytesUploaded, error: error })
        }
    }

    async function fetchUploadToken() {
        try {
            const response= await $sundrafetch("/api/files/upload/token", { method: "post" })
            return (response as { token: string }).token
        } catch (error) {
            if (debug) { console.log(error) }
            throw new Error('Unable to fetch upload token');
        }
    }

    return {
        create, remove,
        uppy, uploadState, uploads, totalProgress
    }
})