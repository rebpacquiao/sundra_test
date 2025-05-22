import { useAuthStore } from '@/stores/AuthStore'

export default defineNuxtPlugin((nuxtApp) => {
    const authStore = useAuthStore()
    const { debug } = useRuntimeConfig().public
    const { user } = storeToRefs(authStore)
    addRouteMiddleware('subscription-auth', async (to, from) => {
        if (String(to.name).toLocaleLowerCase().includes('admin') && !user.value?.is_admin) {
            return await navigateTo('/dashboard')
        }
    }, { global: true })
})
