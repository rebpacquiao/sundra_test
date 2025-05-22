import { defineStore } from 'pinia'
import { useToast } from "primevue/usetoast"
import { useErrorStore } from '@/stores/ErrorStore'
import { useAuthStore } from '@/stores/AuthStore'
import { SundraUploadStatus, SundraCache, type SundraFile, type SundraUpload } from '@/types/sundra'

interface ApiResponse {
    status: string,
    data: SundraUpload[]|SundraUpload|SundraFile[]|SundraFile
}

interface UpdateFilePayload {
    title?: string,
    name?: string,
    description?: string|null,
    location?: string|null,
    language?: string|null,
    creation_date?: string|null,
    theme_category?: number|null,
    video_category?: string|null
}

/**
 * File Store
 * Holds all (single?) files user has uploaded
 */
export const useFileStore = defineStore('file', () => {
    const { debug } = useRuntimeConfig().public
    const toast = useToast()

    /* State */
    const uploads = ref<SundraUpload[]>([])
    const files = ref<SundraFile[]>([])
    const hasLoadedUploads = ref<boolean>(false)
    const hasLoadedFiles = ref<boolean>(false)
    const isLoading = ref<boolean>(false)
    const hasError = ref<boolean>(false)
    const error = ref<string|null>(null)
    const errorStore = useErrorStore()
    const authStore = useAuthStore()


/***********
 * UPLOADS
 */
    function getUpload(tus: string): SundraUpload|undefined {
        if (uploads.value == null || uploads.value.length == 0) { loadUploads() }
        return uploads.value.find(el => el.tus_url == tus)
    }

    function getUploadById(id: number): SundraUpload|undefined {
        if (uploads.value == null || uploads.value.length == 0) { loadUploads() }
        return uploads.value.find(el => el.id == id)
    }

    function getUploadBySlug(slug: string): SundraUpload|undefined {
        if (uploads.value == null || uploads.value.length == 0) { loadUploads() }
        return uploads.value.find(el => el.slug == slug)
    }

    async function loadUploads(cache: SundraCache = SundraCache.Keep, ...statuses: SundraUploadStatus[]) {
        try {
            clearError()
            if (debug) { console.log('FileStore:loadUploads', cache, statuses) }
            if (cache == SundraCache.Reload || !hasLoadedUploads.value || uploads.value == null || uploads.value.length == 0) {
                isLoading.value = true
                let response = await $sundrafetch("/api/files/uploads"+(statuses.length > 0 ? '/'+statuses.join(',') : ''), { method: 'GET', activeTeam: authStore.activeTeam?.id })
                if (response != null) {
                    uploads.value.splice(0)
                    uploads.value.push(...((response as ApiResponse).data as SundraUpload[]))
                    if (debug) { console.log('FileStore:loadUploads:uploads', uploads.value) }
                }
                hasLoadedUploads.value = true
                // We want to flag items as Incomplete only on the initial load
                if (cache == SundraCache.Keep) {
                    uploads.value.forEach(item => {
                        if (item.status == SundraUploadStatus.Uploading) {
                            updateUpload(item.tus_url, { status: SundraUploadStatus.Incomplete })
                        }
                    })
                }
            }
        } catch (error) {
            if (debug) { console.error(error) }
            setError(error as Error)
        } finally {
            isLoading.value = false
        }
    }

    async function loadUpload(id: string|number) {
        try {
            clearError()
            if (debug) { console.log('FileStore:loadUpload', id) }
            isLoading.value = true
            let response = await $sundrafetch(`/api/files/upload/${id}`, { method: 'GET', activeTeam: authStore.activeTeam?.id })
            if (debug) { console.log(`FileStore::loadUpload::${id}`, (response as ApiResponse).data as SundraUpload) }
            if (response != null) {
                const i = uploads.value.findIndex(item => {
                    const pathArr = item.tus_url.split('/')
                    if (pathArr[pathArr.length - 1] == id || item.tus_url === id || item.slug === id || item.id === id) {
                        return true
                    } else return false
                })
                if (response != null && i > -1) { uploads.value[i] = (response as ApiResponse).data as SundraUpload }
            }
        } catch (error) {
            if (debug) { console.log(error) }
            setError(error as Error)
        } finally {
            isLoading.value = false
        }
    }

    async function createUpload(tus: string, filename: string, media: 'audio'|'video'|'image'|'unknown', filesize: number, language: string = 'en-US') {
        try {
            clearError()
            isLoading.value = true
            const response = await $sundrafetch("/api/files/upload", {
                method: "post",
                body: {
                    'tus_url': tus,
                    'filename': filename,
                    'filetype': media,
                    'filesize': filesize,
                    'language': language
                },
                activeTeam: authStore.activeTeam?.id
            })
            if (response != null) {
                const i = uploads.value.findIndex(i => i.tus_url === tus)
                if (i > -1) {
                    uploads.value[i] = (response as ApiResponse).data as SundraUpload
                } else {
                    uploads.value.push(((response as ApiResponse).data as SundraUpload))
                }
            }
            if (debug) { console.log(`FileStore::createUpload`, response, uploads.value) }
        } catch (error) {
            if (debug) { console.log(error) }
            setError(error as Error)
        } finally {
            isLoading.value = false
        }
    }

    async function updateUpload(tus: string, payload: { language?: string, status?: SundraUploadStatus, error?: string, bytes_uploaded?: number }) {
        try {
            clearError()
            isLoading.value = true
            const response = await $sundrafetch("/api/files/upload", {
                method: "put",
                body: { 'tus_url': tus, ...payload },
                activeTeam: authStore.activeTeam?.id
            })
            const i = uploads.value.findIndex(i => i.tus_url === tus)
            if (debug) { console.log(`FileStore::updateUpload`, response, payload, i) }
            if (response != null && i > -1) {
                uploads.value[i] = (response as ApiResponse).data as SundraUpload
                uploads.value[i].is_displayed = true
            }
        } catch (error) {
            if (debug) { console.log(error) }
            setError(error as Error)
        } finally {
            isLoading.value = false
        }
    }

    async function deleteUpload(id: number) {
        clearError()
        isLoading.value = true
        try {
            await $sundrafetch("/api/files/upload/"+id, { method: 'DELETE', activeTeam: authStore.activeTeam?.id })
            removeUpload(id)
        } catch (error) {
            if (debug) { console.log(error) }
            setError(new Error('An error occurred while trying to delete your file'))
        } finally {
            isLoading.value = false
        }
    }

    function removeUpload(id: number) {
        const index = uploads.value.findIndex(i => i.id == id)
        if (index > -1) { uploads.value.splice(index, 1) }
    }

/***********
 * FILES
 */

    function getFile(slug: string): SundraFile|undefined {
        if (files.value == null || files.value.length == 0) { loadFiles() }
        return files.value.find(el => el.slug == slug)
    }

    function getFileById(id: number): SundraFile|undefined {
        if (files.value == null || files.value.length == 0) { loadFiles() }
        return files.value.find(el => el.id == id)
    }

    async function loadFiles(cache: SundraCache = SundraCache.Keep) {
        clearError()
        if (debug) { console.log('FileStore:loadFiles', cache == 0 ? 'Keep' : 'Reload') }
        try {
            if (cache == SundraCache.Reload || !hasLoadedFiles.value) {
                isLoading.value = true
                let response = await $sundrafetch("/api/files", { method: 'GET', activeTeam: authStore.activeTeam?.id })
                if (response != null) {
                    files.value.splice(0)
                    files.value.push(...((response as ApiResponse).data as SundraFile[]))
                    if (debug) { console.log('FileStore:loadFiles:files', files.value) }
                }
                hasLoadedFiles.value = true
            }
        } catch (error) {
            if (debug) { console.log(error) }
            setError(error as Error)
        } finally {
            isLoading.value = false
        }
    }

    async function loadFile(slug: string) {
        clearError()
        if (debug) { console.log('FileStore:loadFile', slug) }
        isLoading.value = true
        try {
            const response = await $sundrafetch("/api/files/"+slug, { method: 'GET', activeTeam: authStore.activeTeam?.id })
            if (debug) { console.log(`FileStore::loadFile::${slug}`, (response as ApiResponse).data as SundraFile) }
            let index = files.value.findIndex(v => (v.slug == slug))
            if (response != null) {
                if (index >= 0) {
                    files.value[index] = (response as ApiResponse).data as SundraFile
                    return files.value[index]
                } else {
                    files.value.push((response as ApiResponse).data as SundraFile)
                    return files.value[files.value.length - 1]
                }
            } else {
                setError(new Error("File not found"))
            }
        } catch (error) {
            files.value.splice(0)
            if (debug) { console.log(`FileStore::loadFile::${slug}`, error) }
            setError(error as Error)
        } finally {
            isLoading.value = false
        }
        return null
    }

    async function updateFile(slug: string, payload: UpdateFilePayload) {
        clearError()
        isLoading.value = true
        try {
            const response = await $sundrafetch("/api/files/"+ slug, {
                method: "put",
                body: payload,
                activeTeam: authStore.activeTeam?.id
            })
            const i = files.value.findIndex(i => i.slug === slug)
            if (response != null && i > -1) { files.value[i] = (response as ApiResponse).data as SundraFile }
            if (debug) { console.log(`FileStore::update::${slug}`, response) }
        } catch (error) {
            if (debug) { console.log(error) }
            toast.add({ severity: 'error', detail: 'An error occurred while update file data', group: 'toastAlerts', life: 3000 })
            setError(error as Error)
        } finally {
            isLoading.value = false
        }
    }

    async function deleteFile(id: number) {
        clearError()
        isLoading.value = true
        try {
            await $sundrafetch("/api/files/"+id, { method: 'DELETE', activeTeam: authStore.activeTeam?.id })
            const i = files.value.findIndex(i => i.id === id)
            if (i > -1) { files.value = files.value.slice(i, 1) }
        } catch (error) {
            if (debug) { console.log(error) }
            toast.add({ severity: 'error', detail: 'An error occurred while trying to delete your file', group: 'toastAlerts', life: 3000 })
            setError(error as Error)
        } finally {
            isLoading.value = false
        }
    }

    async function setError(err: Error) {
        hasError.value = true
        error.value = err.message

        if (error.value != null) {
            let msg = err.message +"\n"+ err.stack?.toString() +"\n"+ (err.cause ?? '');
            errorStore.log(msg, 'FileStore', err.name)
        }
    }
    function clearError() {
        hasError.value = false
        error.value = null
    }

    return {
        uploads, files, hasLoadedUploads, hasLoadedFiles, isLoading, hasError, error,
        loadUploads, loadUpload, createUpload, deleteUpload, updateUpload, getUpload, getUploadById, getUploadBySlug,
        loadFiles, loadFile, deleteFile, updateFile, getFile, getFileById
    }
})
