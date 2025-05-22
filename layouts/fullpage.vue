<template>
    <div class="h-full v-full flex flex-column">
        <PrimeToast position="top-center" group="toastAlerts" />
        <PrimeDynamicDialog />

        <NotificationBar v-if="isShowing && notification != null" @close="closeProgressNotification" :closable="!notification?.is_permanent" :type="background" :icon="true" :radius="false" :border="false" :is-raw="true" :message="notification.message" :progress="(!notification.is_completed && notification.progress != null ? notification.progress : null)" position="center" />
        <PageHeader v-if="showHeader" :name="name" :fullpage="true" :show-stepper="showStepper" :show-close="showClose" :step="step" :editable="isEditable" />
        <div id="main_content" class="flex flex-column flex-grow-1" :style="{ backgroundColor: bgColor.toString() }">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useAuthStore } from '@/stores/AuthStore'
    import { usePageStore } from '@/stores/PageStore'
    import { usePusherStore } from '@/stores/PusherStore'
    import { useNotificationStore } from '@/stores/NotificationStore'
    import { storeToRefs } from 'pinia'

    const { debug } = useRuntimeConfig().public;
    const authStore = useAuthStore()
    const pageStore = usePageStore()
    const pusherStore = usePusherStore()
    const notificationStore = useNotificationStore()
    const { isShowing, notification, background } = storeToRefs(notificationStore)
    const { name, showStepper, showClose, step, showHeader, bgColor, isEditable } = storeToRefs(pageStore)

    //onNuxtReady()
    onBeforeMount(async () => {
        authStore.fetchUser(true)
        if (authStore.authenticated) {
            pusherStore.initialize()
        }
    })

    function closeProgressNotification() {
        notificationStore.next()
    }
</script>

<style scoped>
body {
    margin: 0px;
    padding: 0px;
}
</style>