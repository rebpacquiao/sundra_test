import { defineStore } from 'pinia'
import { useToast } from "primevue/usetoast"
import { type SundraFile, type SundraVideo } from '@/types/sundra'
import { useAuthStore } from '@/stores/AuthStore'

interface ApiResponse {
    status: string,
    data: SundraFile[]|SundraFile|SundraVideo[]
}

interface UpdatePayload {
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
 * Video Store
 * Holds all (single?) videos user has uploaded
 */
export const useVideoStore = defineStore('video', () => {
    const { debug } = useRuntimeConfig().public;
    const toast = useToast()

    /* State */
    const currentFile = ref<SundraFile|null>()
    const searchKeyword = ref<string|null>()
    const files = ref<SundraFile[]>([])
    const videos = ref<SundraFile[]>([])
    const videosFound = ref<SundraFile[]|null>([])
    const isLoading = ref<boolean>(false)
    const authStore = useAuthStore()

    /* Getters */
    function getFile(slug: string): SundraFile|undefined {
        if (files.value == null || files.value.length == 0) { loadFiles() }
        return currentFile.value = files.value.find(el => el.slug == slug)
    }

    function getFileById(id: number): SundraFile|undefined {
        if (files.value == null || files.value.length == 0) { loadFiles() }
        return currentFile.value = files.value.find(el => el.id == id)
    }

    function getVideo(slug: string): SundraFile|undefined {
        if (videos.value == null || videos.value.length == 0) { loadVideos() }
        return currentFile.value = videos.value.find(el => el.slug == slug)
    }

    function getVideoById(id: number): SundraFile|undefined {
        if (videos.value == null || videos.value.length == 0) { loadVideos() }
        return currentFile.value = videos.value.find(el => el.id == id)
    }

    /* Actions */
    async function search(keyword: string) {
        searchKeyword.value = keyword
        if (searchKeyword.value.length >= 3) {
            try {
                isLoading.value = true
                let response = await $sundrafetch(`/api/files/transcriptions/search/${keyword}`, { method: 'GET', activeTeam: authStore.activeTeam?.id })
                if (response != null) {
                    videosFound.value = (response as ApiResponse).data as SundraFile[]
                }
            } catch (error) {
                if (debug) { console.log(error) }
                videosFound.value = null
            } finally {
                isLoading.value = false
            }
        } else {
            searchKeyword.value = null
            videosFound.value = null
        }
    }

    async function loadFiles() {
        try {
            isLoading.value = true
            let response = await $sundrafetch("/api/files", { method: 'GET', activeTeam: authStore.activeTeam?.id })
            if (response != null) {
                files.value = (response as ApiResponse).data as SundraFile[]
            }
        } catch (error) {
            if (debug) { console.log(error) }
        } finally {
            isLoading.value = false
        }
    }

    async function loadVideos() {
        try {
            isLoading.value = true
            let response = await $sundrafetch("/api/files/videos", { method: 'GET', activeTeam: authStore.activeTeam?.id })
            if (response != null) {
                videos.value = (response as ApiResponse).data as SundraFile[]
            }
        } catch (error) {
            if (debug) { console.log(error) }
        } finally {
            isLoading.value = false
        }
    }

    async function loadVideo(slug: string) {
        isLoading.value = true
        try {
            const response = await $sundrafetch("/api/files/"+slug, { method: 'GET', activeTeam: authStore.activeTeam?.id })
            if (debug) { console.log(`VideoStore::loadVideo::${slug}`, (response as ApiResponse).data as SundraFile) }
            let index = videos.value.findIndex(v => (v.slug == slug))
            if (response != null) {
                if (index >= 0) {
                    videos.value[index] = (response as ApiResponse).data as SundraFile
                    currentFile.value = videos.value[index]
                } else {
                    videos.value.push((response as ApiResponse).data as SundraFile)
                    currentFile.value = videos.value[videos.value.length - 1]
                }
            }
        } catch (error) {
            videos.value.splice(0)
            currentFile.value = null
            if (debug) { console.log(`VideoStore::loadVideo::${slug}`, error) }
        } finally {
            isLoading.value = false
        }
    }

    async function loadExports(slug: string) {
        isLoading.value = true
        try {
            const response = await $sundrafetch("/api/video/exports/"+slug, { method: 'GET', activeTeam: authStore.activeTeam?.id })
            if (debug) { console.log(`VideoStore::loadExports::${slug}`, (response as ApiResponse)?.data as SundraVideo[]) }
            let index = videos.value.findIndex(v => (v.slug == slug))
            if (response != null && index >= 0) {
                if ((index+1) > videos.value.length) { await loadVideo(slug) }
                if (!videos.value[index].hasOwnProperty('exports') || videos.value[index].exports == null) {
                    videos.value[index].exports = [] as SundraVideo[]
                }
                videos.value[index].exports?.splice(0)
                videos.value[index].exports?.push(...(response as ApiResponse).data as SundraVideo[])
                currentFile.value = videos.value[index]
            }
        } catch (error) {
            if (debug) { console.log(`VideoStore::loadExports::${slug}`, error) }
        } finally {
            isLoading.value = false
        }
    }

    async function updateVideo(slug: string, payload: UpdatePayload, reload: boolean = false) {
        isLoading.value = true
        try {
            const response = await $sundrafetch("/api/files/"+ slug, {
                method: "put",
                body: payload,
                activeTeam: authStore.activeTeam?.id
            })
            if (debug) { console.log(`VideoStore::update::${slug}`, response) }
            if (reload) { await loadVideo(slug) }
        } catch (error) {
            if (debug) { console.log(error) }
            toast.add({ severity: 'error', detail: 'An error occurred while update video data', group: 'toastAlerts', life: 3000 })
        } finally {
            isLoading.value = false
        }
    }

    async function deleteVideo(id: number, reload: boolean = false) {
        isLoading.value = true
        try {
            await $sundrafetch("/api/files/"+id, { method: 'DELETE', activeTeam: authStore.activeTeam?.id })
            if (reload) { await loadVideos() }
        } catch (error) {
            if (debug) { console.log(error) }
            toast.add({ severity: 'error', detail: 'An error occurred while trying to delete your video file', group: 'toastAlerts', life: 3000 })
        } finally {
            isLoading.value = false
        }
    }

    async function exportVideo(slug: string, language: string) {
        isLoading.value = true
        try {
            await $sundrafetch("/api/video/export/"+slug, {
                method: 'POST',
                body: {
                    language: language
                },
                activeTeam: authStore.activeTeam?.id
            })
        } catch (error) {
            if (debug) { console.log(error) }
            toast.add({ severity: 'error', detail: 'An error occurred while trying to export your video', group: 'toastAlerts', life: 3000 })
        } finally {
            isLoading.value = false
        }
    }

    return {
        currentFile, files, videos, videosFound, isLoading, searchKeyword,
        search, loadFiles, loadVideos, loadVideo, deleteVideo, updateVideo,
        getFile, getFileById, getVideo, getVideoById, exportVideo, loadExports
    }
})
