import { defineStore } from 'pinia'
import { $sundrafetch, initCsrf, getCookie } from '@/utils/$sundrafetch'
import { type SundraTeam, type SundraUser } from '@/types/sundra'
import { useToast } from "primevue/usetoast"
import { FetchError } from "ofetch"
import Stripe from 'stripe'

interface UserAuthInterface {
    contact?: string,
    email: string,
    password: string,
    password_confirmation?: string,
    name?: string,
    ssn?: string,
    price_monthly?: number,
    price_minutes?: number,
    hours?: number,
    space?: number,
    users?: number
}

interface SundraBilling {
    next_tier: string|null,
    customer: Stripe.Customer,
    payment: SundraPaymentMethods,
    invoices: Stripe.Invoice[]
    subscription: Stripe.Subscription & { plan?: Stripe.Plan },
    usage?: Stripe.UsageRecord[]
}
interface SundraPaymentMethods {
    default: Stripe.PaymentMethod
}
interface ApiResponse {
    status: string,
    data: string|SundraBilling
}

export const useAuthStore = defineStore('auth', () => {
    const { debug } = useRuntimeConfig().public;
    const toast = useToast()

    /* State */
    const authenticated = ref(false)
    const loading = ref(false)
    const user = ref<SundraUser|null>(null)
    const billing = ref<SundraBilling|null>(null)
    const error = ref<string|null>(null)
    const activeTeam = ref<SundraTeam|null>(null)

    /* Getters */
    const firstName = computed(() => user.value?.name?.split(' ', 1)[0])
    const email = computed(() => user.value?.email)

    /* Actions */
    function clearActiveTeam() { activeTeam.value = null }
    function setActiveTeam(id: number): SundraTeam|null {
        const teams = user.value?.teams ?? []
        for (let i = 0; i < Number(teams.length); i++) {
            if (teams[i].id == id) {
                activeTeam.value = teams[i]
                return activeTeam.value
            }
        }
        return null
    }

    async function registerUser({ name, email, password, password_confirmation }: UserAuthInterface) {
        if (debug) { console.log(`AuthStore::registerUser`, name, email, password, password_confirmation) }
        loading.value = true
        user.value = null
        billing.value = null
        error.value = null
        try {
            await $sundrafetch("/register", {
                method: "post",
                body: {
                    name: name,
                    email: email,
                    password: password,
                    password_confirmation: password_confirmation
                }
            })
            return authenticated.value = await authenticate({email: email, password: password})
        } catch (e) {
            if (debug) { console.error(`AuthStore::registerUser`, e) }
            authenticated.value = false
            let err = (e as FetchError).data
            if (err.data != null && err.data.message != null) {
                error.value = err.data.message
            } else {
                error.value = err.message as string
            }
        } finally {
            loading.value = false
        }
        return authenticated.value
    }

    async function authenticate({ email, password }: UserAuthInterface) {
        if (debug) { console.log(`AuthStore::authenticate`, email, password) }
        $reset()
        loading.value = true
        try {
            // This is a hack to make sure users are logged out
            await $sundrafetch("/api/user/logout", { method: "get", redirectIfNotAuthenticated: false })
            const response = await $sundrafetch("/login", { method: "post", body: { email: email, password: password } })
            if (response != null) {
                authenticated.value = true
            }
        } catch (e) {
            console.log("Auth error thrown", e)
            authenticated.value = false
            error.value = (e as FetchError).data.message
        } finally {
            loading.value = false
        }
        return authenticated.value
    }

    async function verifyEmail(id: number, hash: string) {
        if (debug) { console.log(`AuthStore::verifyEmail`, id, hash) }
        loading.value = true
        error.value = null
        try {
            await $sundrafetch("/api/email/verify", { method: "post", body: { id: id, hash: hash } })
            return true
        } catch (e) {
            error.value = (e as FetchError).data.message
        } finally {
            loading.value = false
        }
        return false
    }

    async function forgotPassword(email: string) {
        if (debug) { console.log(`AuthStore::forgotPassword`, email) }
        loading.value = true
        error.value = null
        try {
            await $sundrafetch(`/forgot-password`, { method: "post", body: { email: email } })
            return true
        } catch (e) {
            error.value = (e as FetchError).data.message
        } finally {
            loading.value = false
        }
        return false
    }

    async function resetPassword(token: string, email: string, password: string) {
        if (debug) { console.log(`AuthStore::resetPassword`, token, email, password) }
        loading.value = true
        error.value = null
        try {
            await $sundrafetch("/reset-password", {
                method: "post", body: {
                    token: token,
                    email: email,
                    password: password,
                    password_confirmation: password
                }
            })
            return true
        } catch (e) {
            error.value = (e as FetchError).data.message
        } finally {
            loading.value = false
        }
        return false
    }

    async function browseAs(id: number) {
        loading.value = true
        user.value = null
        billing.value = null
        error.value = null
        try {
            await $sundrafetch("/api/browse-as", { method: "post", body: { id: id } })
            await fetchUser(true)
            authenticated.value = true
        } catch (e) {
            authenticated.value = false
            error.value = (e as FetchError).data.message
        } finally {
            loading.value = false
        }
        return authenticated.value
    }

    async function refreshXsrf() {
        if (debug) { console.log(`AuthStore::refreshXsrf`) }
        await initCsrf()
        return getCookie('XSRF-TOKEN')
    }

    async function logout() {
        $reset()
        await $sundrafetch("/api/user/logout", { method: "get" })
        return await navigateTo('/login')
    }

    async function fetchUser(force: boolean = false) {
        loading.value = true
        try {
            if (force || user.value == null) {
                if (debug) { console.log(`AuthStore::fetchUser`, force, user.value) }
                const response = await $sundrafetch("/api/user", { method: 'GET', redirectIfNotAuthenticated: false })
                user.value = (response as SundraUser).id != null ? (response as SundraUser) : null
                // Default to an active team if no subscription is available
                if (!user.value?.has_subscription && user.value?.has_team && Number(user.value?.teams?.length) > 0) {
                    for (let i = 0; i < user.value.teams!.length; i++) {
                        if (user.value.teams![i].is_active) {
                            setActiveTeam(user.value.teams![i].id)
                            break;
                        }
                    }
                }

            }
        } catch (e) {
            authenticated.value = false
            error.value = (e as FetchError).data.message
        } finally {
            loading.value = false
        }
    }

    async function updateUserInfo(name: string) {
        if (debug) { console.log(`AuthStore::updateUserInfo`, name) }
        error.value = null
        loading.value = true
        try {
            const result = await $sundrafetch("/api/user/settings", {
                method: 'PUT',
                body: {
                    'name': name
                }
            })

            if (user.value != null) {
                user.value.name = name
            }
            toast.add({ severity: 'success', detail: 'User info was successfully updated', group: 'toastAlerts', life: 3000 })

        } catch (e) {
            if (debug) { console.error(`AuthStore::updateUserInfo`, e) }
            toast.add({ severity: 'error', detail: 'An error occurred when trying to update user details', group: 'toastAlerts', life: 3000 })
            error.value = 'An error occurred when trying to update user details'
        } finally {
            loading.value = false
        }
    }

    async function updateUserPassword(old: string, password: string, confirm: string) {
        if (debug) { console.log(`AuthStore::updateUserPassword`, old, password, confirm) }
        error.value = null
        loading.value = true
        try {
            const result = await $sundrafetch("/api/user/settings", {
                method: 'PUT',
                body: {
                    'password_old': old,
                    'password': password,
                    'password_confirmation': confirm
                }
            })
            toast.add({ severity: 'success', detail: 'Password was successfully updated', group: 'toastAlerts', life: 3000 })

        } catch (e) {
            if (debug) { console.error(`AuthStore::updateUserPassword`, e) }
            error.value = 'An error occurred when trying to update user password'
            toast.add({ severity: 'error', detail: error.value, group: 'toastAlerts', life: 3000 })

        } finally {
            loading.value = false
        }
    }

    async function updatePaymentMethod(paymentMethod: string) {
        loading.value = true
        error.value = null
        try {
            const result = await $sundrafetch(`/api/user/billing/payment`, {
                method: 'PUT',
                body: { payment_method: paymentMethod }
            })
            billing.value = null
            await fetchBilling()
            toast.add({ severity: 'success', detail: 'Payment method was successfully updated', group: 'toastAlerts', life: 3000 })
            if (debug) { console.log(`AuthStore::updatePaymentMethod`, result) }
        } catch (e) {
            if (debug) { console.error(`AuthStore::updatePaymentMethod ${paymentMethod}`, e) }
            error.value = (e as FetchError).data.message ?? 'Unable to update payment method. Please refresh your browser and try again.'
        } finally {
            loading.value = false
        }
    }

    async function checkCoupon(coupon: string) {
        try {
            const result = await $sundrafetch(`/api/user/coupon/${coupon}`, { method: 'GET'})
            if (result != undefined) {
                return true
            }
            return false
        } catch (e) {
            if (debug) { console.log(`AuthStore::checkCoupon ${coupon}`, e) }
            error.value = (e as FetchError).data.message ?? 'An error occurred while checking if coupon is valid. Please refresh your browser and try again.'
        }
    }

    async function createSubscription(tier: string, period: string, intent: string, coupon?: string) {
        loading.value = true
        error.value = null
        try {
            const result = await $sundrafetch(`/api/user/subscribe`, {
                method: 'POST',
                body: {
                    type: tier.toLowerCase(),
                    period: period,
                    intent: intent,
                    coupon: coupon,
                    currency: 'usd'
                }
            })
            if (debug) { console.log(`AuthStore::createSubscription ${tier}`, intent, result) }
            user.value = null
            billing.value = null
            await fetchUser(true)
            await fetchBilling()
            return true
        } catch (e) {
            if (debug) { console.log(`AuthStore::createSubscription ${tier}`, intent, e) }
            error.value = (e as FetchError).data.message ?? 'An error occurred while trying to create a subscription. Please refresh your browser and try again.'
        } finally {
            loading.value = false
        }

        return false
    }

    async function uncancelSubscription() {
        loading.value = true
        error.value = null
        try {
            const result = await $sundrafetch(`/api/user/subscription/uncancel`, { method: 'GET' })
            billing.value = null
            await fetchBilling()
            if (debug) { console.log(`AuthStore::uncancelSubscription`, result) }
            return true
        } catch (e) {
            if (debug) { console.error(`AuthStore::uncancelSubscription`, e) }
            error.value = (e as FetchError).data.message ?? 'An error occurred while trying to uncancel your subscription. Please refresh your browser and try again or contact us directly.'
        } finally {
            loading.value = false
        }
        return false
    }

    async function cancelSubscription() {
        loading.value = true
        error.value = null
        try {
            const result = await $sundrafetch(`/api/user/subscription/cancel`, { method: 'GET' })
            billing.value = null
            await fetchBilling()
            if (debug) { console.log(`AuthStore::cancelSubscription`, result) }
            return true
        } catch (e) {
            if (debug) { console.error(`AuthStore::cancelSubscription`, e) }
            error.value = (e as FetchError).data.message ?? 'An error occurred while trying to cancel your subscription. Please refresh your browser and try again or contact us directly.'
        } finally {
            loading.value = false
        }
        return false
    }

    async function changeSubscriptionTier(tier: string, period: string) {
        loading.value = true
        error.value = null
        try {
            tier = tier.toLowerCase()
            const result = await $sundrafetch(`/api/user/subscription/change/${tier}/${period}`, { method: 'PUT' })
            if (debug) { console.log(`AuthStore::changeSubscriptionTier ${tier} ${period}`, result) }
            user.value = null
            billing.value = null
            await fetchUser(true)
            await fetchBilling()
            toast.add({ severity: 'success', detail: 'Subscription tier was successfully changed', group: 'toastAlerts', life: 3000 })
        } catch (e) {
            if (debug) { console.log(`AuthStore::changeSubscriptionTier ${tier} ${period}`, e) }
            error.value = (e as FetchError).data.message ?? 'Unable to change subscription tier. Please refresh your browser and try again'
        } finally {
            loading.value = false
        }
    }

    async function cancelSubscriptionDowngrade() {
        loading.value = true
        error.value = null
        try {
            await $sundrafetch(`/api/user/subscription/change/cancel`, { method: 'PUT' })
            if (debug) { console.log(`AuthStore::cancelSubscriptionDowngrade`) }
            user.value = null
            billing.value = null
            await fetchUser(true)
            await fetchBilling()
            return true
        } catch (e) {
            if (debug) { console.error(`AuthStore::cancelSubscriptionDowngrade`, e) }
            error.value = (e as FetchError).data.message ?? 'Unable to cancel subscription downgrade. Please refresh your browser and try again'
        } finally {
            loading.value = false
        }
        return false
    }

    async function fetchBilling() {
        if (debug) { console.log(`AuthStore::fetchBilling`) }
        loading.value = true;
        billing.value = null
        error.value = null
        try {
            let response = await $sundrafetch(`/api/user/billing`, { method: 'GET' })
            if (response != null) {
                billing.value = (response as ApiResponse).data as SundraBilling
            }
        } catch (e) {
            if (debug) { console.error(`AuthStore::fetchBilling`, e) }
            let err = (e as FetchError).data
            if (err.data != null && err.data.message != null) {
                error.value = err.data.message
            } else {
                error.value = err.message as string
            }
        } finally {
            loading.value = false
        }
    }

    async function fetchStripeIntent() {
        if (debug) { console.log(`AuthStore::fetchStripeIntent`) }
        error.value = null
        loading.value = true;
        try {
            let response = await $sundrafetch("/api/user/stripe/intent")
            if (response != null) {
                return (response as ApiResponse).data as string
            }
        } catch (e) {
            if (debug) { console.error('AuthStore::fetchStripeIntent', e) }
            error.value = (e as FetchError).message as string
        } finally {
            loading.value = false
        }

        return null
    }


    async function createUser({ name, email, ssn, password, price_monthly, price_minutes, hours, space, users, contact }: UserAuthInterface) {
        if (debug) { console.log(`AuthStore::createUser`, name, email, ssn, password,  price_monthly, price_minutes, hours, space, users, contact) }
        loading.value = true
        error.value = null
        try {
            const response = await $sundrafetch("/api/user/create", {
                method: "post",
                body: {
                    contact: contact != '' ? contact : null,
                    name: name,
                    email: email,
                    ssn: ssn,
                    password: password,
                    price_monthly: price_monthly,
                    price_minutes: price_minutes,
                    max_hours: hours,
                    max_space: space,
                    max_users: users
                }
            })

            return (response as ApiResponse)?.data as string

        } catch (e) {
            if (debug) { console.error(`AuthStore::createUser`, e) }
            let err = (e as FetchError).data
            if (err?.data != null && err?.data?.message != null) {
                error.value = err.data.message
            } else {
                error.value = err.message as string
            }
        } finally {
            loading.value = false
        }

        return null
    }

    function $reset() {
        if (debug) { console.log(`AuthStore::$reset`) }
        user.value = null
        billing.value = null
        error.value = null
        authenticated.value = false
    }

    return {
        authenticated, loading, user, error, billing, activeTeam,
        firstName, email,
        authenticate, refreshXsrf, logout, verifyEmail, browseAs, setActiveTeam, clearActiveTeam,
        createUser, registerUser, fetchUser, fetchBilling, fetchStripeIntent,
        updateUserInfo, updateUserPassword, updatePaymentMethod, forgotPassword, resetPassword, checkCoupon,
        cancelSubscription, uncancelSubscription, createSubscription, changeSubscriptionTier, cancelSubscriptionDowngrade,
        $reset
    }
}, { persist: true })