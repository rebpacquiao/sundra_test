<template>
    <div class="flex flex-grow-0 justify-content-center align-content-center align-items-center border-round bg-cover bg-center tiers-box platinum">
        <div class="flex flex-column flex-grow-1 justify-content-center align-content-center align-items-center">
            <div v-if="error == null" class="info p-5 border-round w-7 text-center" style="background-color: #9538F6CC !important;">
                <p class="header">Verifying email</p>
                <p>This will take just a minute</p>
            </div>
            <div v-else class="info p-5 border-round w-7 text-center" style="background-color: #9538F6CC !important;">
                <p class="header">Uh oh...</p>
                <NotificationBar :icon="true" :closable="false" position="center" :type="SundraNotificationType.Error" :message="error" class="mb-3" />
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
    import { useAuthStore } from '@/stores/AuthStore'
    import { usePageStore } from '@/stores/PageStore'
    import { useNotificationStore } from '@/stores/NotificationStore'
    import { SundraNotificationCategory, SundraNotificationType } from '@/types/sundra'

    const notificationStore = useNotificationStore()
    const authStore = useAuthStore()
    const pageStore = usePageStore()
    pageStore.setName('Subscription')
    pageStore.setGreyedOut(true)

    const route = useRoute()
    const [id, hash] = route.params.data
    const error = ref<string|null>(null)

    onMounted(async () => {
        if (id != null && hash != null) {
            //await authStore.fetchUser(true)
            const result = await authStore.verifyEmail(Number(id), hash)
            pageStore.setGreyedOut(false)
            if (!result) {
                error.value = 'An error occurred while trying to validate your email'
            } else {
                notificationStore.dispatch(
                    SundraNotificationCategory.UI,
                    SundraNotificationType.Success,
                    "verify_email",
                    undefined,
                    'Your email was successfully verified'
                )
                return await navigateTo('/dashboard')
            }
        } else {
            error.value = 'Invalid validation url'
            pageStore.setGreyedOut(false)
        }
    })

    definePageMeta({
        layout: "auth",
        title: 'Verify email'
    })
</script>

<style scoped>

.info {
        color: #FFF;
        font-size: 16px;
        font-weight: 500;
    }
        .info > .header {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 30px;
        }
</style>