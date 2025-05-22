import { defineStore } from 'pinia';
import { type SundraTag } from '@/types/sundra'
import { useAuthStore } from '@/stores/AuthStore'

interface ApiResponse {
    status: string,
    data: SundraTag[]|SundraTag
}

/**
 * Tag Store
 * Holds all loaded tags
 */
export const useTagStore = defineStore('tags', () => {
    /* State */
    const { debug } = useRuntimeConfig().public;
    const tags = ref<SundraTag[]>([])
    const isLoading = ref<boolean>(false)
    const authStore = useAuthStore()

    /* Getters */
    async function get(slug: string) {
        try {
            if (tags.value == null) { await load() }
            if (debug) console.log(`TagStore::get::${slug}`)
            return tags.value?.find(item => item.slug == slug)
        } catch (e) {
            console.log(e)
        }
    }

    /* Actions */
    async function load() {
        try {
            isLoading.value = true
            let response = await $sundrafetch("/api/tags", { method: 'GET', activeTeam: authStore.activeTeam?.id })
            if (response != null) {
                tags.value.splice(0)
                tags.value.push(...(response as ApiResponse).data as SundraTag[])
            }
            if (debug) { console.log(`TagStore::load`, (response as ApiResponse).data as SundraTag[]) }
        } catch (error) {
            tags.value = []
            if (debug) { console.log(`TagStore::load`, error) }
        } finally {
            isLoading.value = false
        }
    }

    async function create(tag: string) {
        if (debug) { console.log(`TagStore::create`, tag) }
        try {
            isLoading.value = true
            const response: any = await $sundrafetch(`/api/tags`, {
                method: "post",
                body: { tag: tag },
                activeTeam: authStore.activeTeam?.id
            })
            if (response != null) {
                if (response.data != null) {
                    tags.value.push(response.data as SundraTag)
                }
                return response.data as SundraTag
            }
        } catch (error) {
            if (debug) { console.log(`TagStore::create::${tag}`, error) }
        } finally {
            isLoading.value = false
        }

        return null
    }

    async function add(slug: string, t: string[]) {
        if (debug) { console.log(`TagStore::add::${slug}`, t) }
        try {
            isLoading.value = true
            const response = await $sundrafetch(`/api/tags/${slug}`, {
                method: "put",
                body: { tags: t },
                activeTeam: authStore.activeTeam?.id
            })
            if ((response as ApiResponse).data != null) {
                return (response as ApiResponse).data as SundraTag[]
            } else return null
        } catch (error) {
            if (debug) { console.log(`TagStore::add::${slug}`, tags, error) }
        } finally {
            isLoading.value = false
        }

        return false
    }

    return {
        tags, isLoading,
        get, load, create, add
    }

})