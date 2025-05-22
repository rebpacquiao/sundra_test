import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/AuthStore'
import type { SundraMeetingMinute } from '~/types/sundra'

interface ApiResponse {
    status: string,
    data?: SundraMeetingMinute[]
}

export const useMinutesStore = defineStore('minutes', () => {
    const { debug } = useRuntimeConfig().public
    const isLoading = ref<boolean>(false)
    const meetingMinutes = ref<SundraMeetingMinute[]>([])
    const currentMeetingMinute = ref<SundraMeetingMinute|null>()
    const authStore = useAuthStore()

    //#region Load Actions
    async function load(slug: string) {
        isLoading.value = true
        try {
            meetingMinutes.value.splice(0)
            const response = await $sundrafetch(`/api/files/aitext/${slug}`, { method: 'GET', activeTeam: authStore.activeTeam?.id })
            if (response != null) {
                meetingMinutes.value.push(...((response as ApiResponse).data as SundraMeetingMinute[]))
                return true
            }
        } catch (error) {
            if (debug) { console.error('MinutesStore::load', slug, error) }
            throw error
        } finally {
            isLoading.value = false
        }
        return false
    }

    async function generateAiText(slug: string, language: string, types: string[]) {
        try {
            isLoading.value = true
            const response = await $sundrafetch(`/api/files/aitext/${slug}`, {
                method: "post",
                body: { language: language, types: types },
                activeTeam: authStore.activeTeam?.id
            })
            return true
        } catch (error) {
            if (debug) { console.error('MinutesStore::generateAiText', slug, language, types, error) }
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function deleteMinutes(minute: SundraMeetingMinute) {
        isLoading.value = true
        try {
            await $sundrafetch(`/api/files/aitext/${minute.id}`, { method: 'DELETE', activeTeam: authStore.activeTeam?.id })
            const i = meetingMinutes.value.findIndex(i => i.id === minute.id)
            if (i > -1) { meetingMinutes.value.splice(i, 1) }
        } catch (error) {
            if (debug) { console.error('MinutesStore::deleteMinutes', minute, error) }
            throw error
        } finally {
            isLoading.value = false
        }
    }

    function open(minute: SundraMeetingMinute) {
        currentMeetingMinute.value = minute
    }

    function clear() {
        meetingMinutes.value.splice(0)
    }

    return {
        isLoading, meetingMinutes, currentMeetingMinute,
        generateAiText, deleteMinutes, load, open, clear
    }
})
