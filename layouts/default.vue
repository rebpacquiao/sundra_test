<template>
<div v-if="isGreyedOut" class="grey-out">
    <PrimeProgressSpinner
        strokeWidth="1"
        class="absolute"
        style="width: 25vw; height: 25vw; top: 25%; left: 40%;" />
</div>
<div id="main" class="min-h-screen flex relative md:static">
    <div id="app-sidebar-1" class="surface-section h-screen hidden md:block flex-shrink-0 absolute md:static left-0 top-0 z-1 select-none" style="width: 220px; max-width: 220px;">
        <div class="fixed  top-0 left-0 flex flex-column h-full">
            <div class="flex align-items-center px-5 flex-shrink-0" style="height:60px">
                <a :href="'/dashboard'"><PrimeImage src="/images/sundra-logo.png" alt="Sundra.io" height="30" /></a>
            </div>
            <div class="overflow-y-auto">
                <ul class="list-none p-3 m-0">
                    <li>
                        <ul class="list-none p-0 m-0 overflow-hidden">
                            <li>
                                <NuxtLink to="/dashboard" v-primeripple :class="{ 'router-link-active': isWizard }" class="s-nav flex align-items-center cursor-pointer my-1 p-2 border-round text-700 hover:bg-green-100 transition-duration-150 transition-colors p-ripple no-underline">
                                    <SvgIcon icon="upload" style="width: 24px;" class="mr-3" />
                                    <span class="mb-1">Dashboard</span>
                                </NuxtLink>
                            </li>
                            <li>
                                <NuxtLink to="/captions" v-primeripple class="s-nav flex align-items-center cursor-pointer my-1 p-2 border-round text-700 hover:bg-green-100 transition-duration-150 transition-colors p-ripple no-underline">
                                    <SvgIcon icon="videos" style="width: 24px;" class="mr-3" />
                                    <span class="mb-1">Captions</span>
                                </NuxtLink>
                            </li>
                            <li v-if="authStore.user?.is_admin">
                                <NuxtLink to="/admin" v-primeripple class="s-nav flex align-items-center cursor-pointer my-1 p-2 border-round text-700 hover:bg-green-100 transition-duration-150 transition-colors p-ripple no-underline">
                                    <SvgIcon icon="credit" style="width: 24px;" class="mr-3" />
                                    <span class="mb-1">Admin</span>
                                </NuxtLink>
                            </li>
                        </ul>

                    </li>
                </ul>
            </div>
            <div class="mt-auto border-top-1 surface-border">
                <NuxtLink
                    @click="isAvatarUp = !isAvatarUp"
                    v-primeripple class="no-underline s-nav p-3 mb-0 flex flex-grow-1 align-items-center cursor-pointer text-700 hover:bg-green-100 border-round transition-colors transition-duration-200 p-ripple"
                    v-primestyleclass="{ selector: '@next', enterClass: 'hidden', enterActiveClass: 'slidedown', leaveToClass: 'hidden', leaveActiveClass: 'slideup' }">
                    <PrimeAvatar image="/images/avatars/simple-1.svg" class="mr-3 mb-0 p-0" size="large"  />
                    <div class="s-overflow" style="max-width: 100px;">
                        <span class="pb-0 mb-0">{{ authStore.firstName }}</span><br/>
                        <span class="text-xs text-500">{{ authStore.email }}</span>
                    </div>
                    <i :class="{ 'pi-chevron-up': isAvatarUp, 'pi-chevron-down': !isAvatarUp }" class="pi ml-2"></i>
                </NuxtLink>
                <ul class="list-none p-2 m-0 hidden origin-bottom animation-duration-150">
                    <li>
                        <NuxtLink to="/settings" v-primeripple class="no-underline s-nav flex align-items-center cursor-pointer p-3 text-700 hover:bg-green-100 border-round transition-colors transition-duration-200 p-ripple">
                            <i class="pi pi-cog mr-3"></i>
                            <span>Settings</span>
                        </NuxtLink>
                    </li>
                    <li v-if="(authStore.user?.has_subscription && authStore.user?.has_team) || (!authStore.user?.has_team)">
                        <NuxtLink to="/subscription" v-primeripple class="no-underline s-nav flex align-items-center cursor-pointer p-3 text-700 hover:bg-green-100 border-round transition-colors transition-duration-200 p-ripple">
                            <i class="pi pi-wallet mr-3"></i>
                            <span>Subscription</span>
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink v-primeripple @click="onLogoutClick" class="no-underline s-nav flex align-items-center cursor-pointer p-3 text-700 hover:bg-green-100 border-round transition-colors transition-duration-200 p-ripple">
                            <i class="pi pi-arrow-circle-left mr-3"></i>
                            <span>Log out</span>
                        </NuxtLink>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div id="main_page" class="min-h-screen flex flex-column relative flex-auto border-left-1 surface-border" style="height: 64px;">
        <PrimeToast position="top-center" group="toastAlerts" />
        <PrimeDynamicDialog />

        <NotificationBar v-if="isShowing && notification != null" @close="closeProgressNotification" :closable="!notification?.is_permanent" :type="background" :icon="true" :radius="false" :border="false" :is-raw="true" :message="notification.message" :progress="(!notification.is_completed && notification.progress != null ? notification.progress : null)" position="center" />
        <PageHeader v-if="showHeader" :name="name" :show-stepper="showStepper" :step="step" :editable="isEditable" />
        <div id="main_content" class="flex flex-column flex-auto flex-shrink-1" :style="{ backgroundColor: bgColor.toString() }">
            <slot />
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
    import { useAuthStore } from '@/stores/AuthStore'
    import { usePageStore } from '@/stores/PageStore'
    import { useFileStore } from '@/stores/FileStore'
    import { useVideoStore } from '@/stores/VideoStore'
    import { usePusherStore } from '@/stores/PusherStore'
    import { useNotificationStore } from '@/stores/NotificationStore'
    import { storeToRefs } from 'pinia'

    const { debug } = useRuntimeConfig().public;
    const route = useRoute()
    const authStore = useAuthStore()
    const pageStore = usePageStore()
    //const fileStore = useFileStore()
    const videoStore = useVideoStore()
    const pusherStore = usePusherStore()
    const notificationStore = useNotificationStore()
    const { isShowing, notification, background } = storeToRefs(notificationStore)
    const isAvatarUp = ref<boolean>(true);

    const isWizard = computed(() => route.name?.toString().startsWith('single'))
    const { name, showStepper, step, showHeader, bgColor, isEditable, isGreyedOut } = storeToRefs(pageStore)

    onBeforeMount(() => {
        authStore.fetchUser(true)
        if (authStore.authenticated) {
            pusherStore.initialize()
        }
    })

    onMounted(() => {
        //fileStore.loadUploads()
        //fileStore.loadFiles()
        videoStore.loadVideos()
    })

    const onLogoutClick = async() => {
        pageStore.setGreyedOut(true)
        await authStore.logout()
    }

    function closeProgressNotification() {
        notificationStore.next()
    }
</script>

<style>
.p-toast .p-toast-message .p-toast-message-content .p-toast-detail {
    margin: 0px !important;
}

.p-progress-spinner-svg {
    animation: p-progress-spinner-color 1.5s linear infinite;
}
    @keyframes p-progress-spinner-color {
        100%, 40% {
            stroke: #9FF7B5;
        }
        40% {
            stroke: #EBCCFF
        }
        66% {
            stroke: #9538F6;
        }
        80%, 90% {
            stroke: #9FF7B5;
        }
    }
</style>