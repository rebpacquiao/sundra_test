<template>
    <div class="surface-card align-self-center p-4 mt-5 border-round max-w-26rem" style="background-color: #F9F9F9 !important;">
        <div class="text-center mb-3">
            <div class="auth-header">Sign up!</div>
        </div>
        <div class="text-center mb-4 auth-subheader">
            <span>It's quick and easy</span>
        </div>

        <div class="flex flex-column justify-content-center flex-grow-1 text-center auth-muted large mb-5">
            <PrimeProgressBar :showValue="false" :value="50" class="mb-3"
                            :pt="{
                                root: { style: { height: '0.8rem' } },
                                value: { style: { background: 'linear-gradient(270deg, #C366FF 0%, #9FF7B5 100%)' } }
                            }" />
            <span>Create account - Step 1 of 2</span>
        </div>

        <div class="mb-4">
            <PrimeInputText v-model="name" id="name" type="text" placeholder="Name" class="w-full mb-3" />
            <PrimeInputText v-model="email" id="email" type="text" placeholder="Email" class="w-full mb-3" />
            <PrimeInputText v-model="password" id="password" type="password" placeholder="Password" class="w-full mb-3" />

            <p class="auth-muted text-justify mb-5">
                By creating an account, you agree to our <a href="https://www.sundra.io/terms-of-service" target="_blank">Terms of Service</a> and confirm that you have read and acknowledge our <a href="https://www.sundra.io/privacy" target="_blank">Privacy Policy</a>.<br/>
                <br/>
                Sundra may contact you about product and service updates but you may unsubscribe from these communications at any time.
            </p>
            <NotificationBar v-if="hasError" :icon="true" :closable="false" position="start" :type="SundraNotificationType.Error" :message="errorMsg" class="mb-3" />
            <div class="flex justify-content-center w-full">
                <PrimeButton label="Continue" class="w-full" @click="registerForm" />
            </div>
        </div>
        <div class="auth-muted large">
            <span>You already have an account?</span>&nbsp;
            <NuxtLink to="/login" class="auth-link cursor-pointer">Log in</NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useAuthStore } from '@/stores/AuthStore'
    import { SundraNotificationType } from '@/types/sundra'

    definePageMeta({
        layout: "auth",
        title: 'Register'
    })

    const route = useRoute()
    const authStore = useAuthStore()
    const email = ref('')
    const password = ref('')
    const name = ref('')
    const hasError = ref(false)
    const errorMsg = ref("")

    const selectedTier = ref<string|null>()
    if (route.query.tier != null && ['creator','producer','broadcaster','personal','business','enterprise'].includes(route.query.tier as string)) {
        selectedTier.value = route.query.tier as string
    }

    const registerForm = async() => {
        hasError.value = false
        if (name.value.length > 3 && email.value.length > 3 &&
            password.value.length > 7) {
            const isAuthenticated = await authStore.registerUser({
                name: name.value,
                email: email.value,
                password: password.value,
                password_confirmation: password.value
            })
            if (isAuthenticated) {
                await authStore.fetchUser(true)
                return await navigateTo(`/onboarding/billing?currency=usd`+(selectedTier.value != null ? `&tier=${selectedTier.value}` : ''))
            } else {
                errorMsg.value = (authStore.error != null ? authStore.error : "Unable to register user with this email & password.")
                hasError.value = true
            }
        } else {
            if (name.value.length <= 3) {
                errorMsg.value = "Please fill in the 'name' field."
            } else if (email.value.length <= 3) {
                errorMsg.value = "You have to fill in the 'email' field."
            } else if (password.value.length <= 7) {
                errorMsg.value = "Password is has to be at least 8 characters."
            }
            hasError.value = true
        }
    }
</script>

<style scoped>
a {
    color: #9538F6;
}
a:hover {
    text-decoration: none;
}
</style>