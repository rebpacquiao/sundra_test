<template>
    <div class="surface-card align-self-center p-4 mt-5 border-round" style="background-color: #F9F9F9 !important;">
        <div class="text-center mb-3">
            <div class="auth-header">Forgot your password?</div>
        </div>
        <div class="text-center mb-3 auth-muted">
            Type in the email you used to create your account and hit the reset button
        </div>
        <div v-if="!isSuccess" class="mb-4">
            <PrimeInputText v-model="email" id="email" type="text" placeholder="Email" class="w-full mb-3" />

            <NotificationBar v-if="hasError" :icon="true" :closable="false" position="start" :type="SundraNotificationType.Error" :message="errorMsg" class="mb-3" />
            <div class="flex justify-content-center w-full">
                <PrimeButton label="Reset password" class="w-full" @click="forgotForm" />
            </div>

            <div class="mt-4">
                <NuxtLink to="/login" class="auth-link cursor-pointer">Nah, I remember it now.</NuxtLink>
            </div>
        </div>
        <div v-else class="mb-2">
            <div class="auth-header mt-5">We sent you an email!</div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useAuthStore } from '@/stores/AuthStore'
    import { usePageStore } from '@/stores/PageStore'
    import { SundraNotificationType } from '@/types/sundra'

    definePageMeta({
        layout: "auth",
        title: 'Forgot password'
    })

    const authStore = useAuthStore()
    const pageStore = usePageStore()

    const isSuccess = ref<boolean>(false)
    const email = ref('')
    const hasError = ref(false)
    const errorMsg = ref("")

    onMounted(() => pageStore.setGreyedOut(false))
    const forgotForm = async() => {
        hasError.value = false
        if (email.value.length) {
            pageStore.setGreyedOut(true)
            isSuccess.value = await authStore.forgotPassword(email.value)
            pageStore.setGreyedOut(false)
            if (!isSuccess.value) {
                console.error(`Page::/forgot/password ${email}`, authStore.error)
                errorMsg.value = "Unable to send you your reset your password email."
            }
        } else {
            if (email.value.length <= 3) {
                errorMsg.value = "There is something off about that there email."
            }
            hasError.value = true
        }
    }
</script>

<style scoped>
.auth-header {
    color: #000;
    text-align: center;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
}

.auth-muted {
    color: #474747;
    font-size: 12px;
    font-style: normal;
}
</style>