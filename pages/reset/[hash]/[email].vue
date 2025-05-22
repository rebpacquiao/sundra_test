<template>
    <div class="surface-card align-self-center p-4 mt-5 border-round" style="background-color: #F9F9F9 !important;">
        <div class="text-center mb-3">
            <div class="auth-header">Reset your password</div>
        </div>
        <div class="text-center mb-5 auth-muted">
            Submit this form to reset your password to a new one
        </div>
        <div class="mb-4">
            <PrimeInputText v-model="password" id="password" type="password" placeholder="Password" class="w-full mb-3" />
            <PrimeInputText v-model="passwordConfirm" id="passwordConfirm" type="password" placeholder="Password (confirm)" class="w-full mb-3" />

            <NotificationBar v-if="hasError" :icon="true" :closable="false" position="start" :type="SundraNotificationType.Error" :message="errorMsg" class="mb-3" />
            <div class="flex justify-content-center w-full">
                <PrimeButton label="Reset" class="w-full" @click="resetPassword" />
            </div>

            <div class="mt-4">
                <NuxtLink to="/login" class="auth-link cursor-pointer">Back to login</NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useAuthStore } from '@/stores/AuthStore'
    import { usePageStore } from '@/stores/PageStore'
    import { useToast } from "primevue/usetoast"
    import { SundraNotificationType } from '@/types/sundra'

    definePageMeta({
        layout: "auth",
        title: 'Reset password'
    })

    const authStore = useAuthStore()
    const pageStore = usePageStore()
    const toast = useToast()

    const route = useRoute()
    const password = ref('')
    const passwordConfirm = ref('')
    const token = route.params.hash as string
    const email = route.params.email as string
    const hasError = ref(false)
    const errorMsg = ref("")

    onMounted(() => pageStore.setGreyedOut(false))

    const resetPassword = async() => {
        hasError.value = false
        if (password.value.length > 5 && password.value == passwordConfirm.value) {
            pageStore.setGreyedOut(true)
            const isSuccess = await authStore.resetPassword(token, email, password.value)
            pageStore.setGreyedOut(false)
            if (!isSuccess) {
                console.error(`Page::/reset/${token}/${email}`, authStore.error)
                errorMsg.value = "Unable to send you your reset your password email."
            } else {
                toast.add({ severity: 'success', detail: 'Your email was successfully reset', group: 'toastAlerts', life: 3000 })
                return await navigateTo('/login')
            }
        } else {
            if (password.value.length <= 5) {
                errorMsg.value = "That there password looks a little short."
            } else {
                errorMsg.value = "Looks like your emails don't match"
            }
            hasError.value = true
        }
    }
</script>

<style scoped>
</style>