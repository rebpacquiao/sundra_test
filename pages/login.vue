<template>
    <div class="surface-card align-self-center p-4 mt-5 border-round" style="background-color: #F9F9F9 !important;">
        <div class="text-center mb-3">
            <div class="auth-header">Sign into your account!</div>
        </div>
        <div class="mb-4">
            <PrimeInputText v-model="email" id="email" type="text" placeholder="Email" class="w-full mb-3" />
            <PrimeInputText @keyup.enter="loginForm" v-model="password" id="password" type="password" placeholder="Password" class="w-full mb-3" />

            <div class="flex align-items-center justify-content-between mb-4">
                <div class="flex align-items-center auth-muted">
                    <PrimeCheckbox id="rememberme" :binary="true" v-model="remember" class="mr-2" size="small" />
                    <label for="rememberme">Remember me</label>
                </div>
            </div>

            <NotificationBar v-if="hasError" :icon="true" :closable="false" position="start" :type="SundraNotificationType.Error" :message="errorMsg" class="mb-3" />
            <div class="flex justify-content-center w-full">
                <PrimeButton label="Sign In" class="w-full" @click="loginForm" />
            </div>

            <div class="mt-4">
                <NuxtLink to="/reset/password" class="auth-link cursor-pointer">Forgot your password?</NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useAuthStore } from '@/stores/AuthStore'
    import { usePageStore } from '@/stores/PageStore'
    import { SundraNotificationType } from '@/types/sundra'

    definePageMeta({
        layout: "auth",
        title: 'Login'
    })

    const authStore = useAuthStore()
    const pageStore = usePageStore()

    const email = ref('')
    const password = ref('')
    const remember = ref(true)
    const hasError = ref(false)
    const errorMsg = ref("")

    onMounted(() => pageStore.setGreyedOut(false))

    const loginForm = async() => {
        hasError.value = false
        if (email.value.length > 3 && password.value.length > 7) {
            pageStore.setGreyedOut(true)
            const isAuthenticated = await authStore.authenticate({ 'email': email.value, 'password': password.value })
            pageStore.setGreyedOut(false)
            if (isAuthenticated) {
                await authStore.fetchUser(true)
                return await navigateTo("/dashboard")
            } else {
                errorMsg.value = "These credentials do not match our records."
                hasError.value = true
            }
        } else {
            if (email.value.length <= 3) {
                errorMsg.value = "Email is invalid. Please try again."
            } else if (password.value.length <= 7) {
                errorMsg.value = "Password is invalid. Please try again."
            } else {
                errorMsg.value = "Email or password is invalid. Please try again."
            }
            hasError.value = true
        }
    }
</script>

<style scoped>
</style>