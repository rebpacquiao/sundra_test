import { useAuthStore } from '@/stores/AuthStore'

export default defineNuxtPlugin((nuxtApp) => {
    const authStore = useAuthStore()
    const { debug } = useRuntimeConfig().public
    const { authenticated, user } = storeToRefs(authStore)

    addRouteMiddleware('subscription-auth', async (to, from) => {
        const whitelist = [
            'login', 'register', 'subscription', 'onboarding-billing',
            'email-verification', 'email-verification-data',
            'reset', 'reset-password', 'reset-hash-email'
        ];
        if (authenticated.value == true) {
            if (user.value == null) {
                await authStore.fetchUser()
                if (user.value == null) { return await navigateTo('/login') }
                if (debug) { console.log("Middleware::subscription-auth: No user preloaded", user.value) }
            } else if (debug) { console.log("Middleware::subscription-auth: User already loaded", authStore.user) }

            if (!whitelist.includes(String(to.name)) && !user.value.has_subscription && !user.value.has_team) {
                if (debug) { console.log("Middleware::subscription-auth: No subscription", user.value) }
                if (user.value.has_incomplete_payment || user.value.has_ended_subscription) {
                    return await navigateTo('/subscription')
                } else {
                    return await navigateTo('/onboarding/billing')
                }
            }
        }
    }, { global: true })
})
