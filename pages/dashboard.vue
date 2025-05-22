<template>
    <div class="relative flex flex-column gap-2 mx-5">
        <div class="block flex justify-content-center">
            <div class="text-center">
                <h3 class="s-header">Start captioning</h3>
                <p class="mt-0 mb-2 p-0 line-height-3 mx-auto">Upload a video and have Sundra transcribe it.</p>
            </div>
        </div>

        <TusUpload :show-uploads-table="true" />
    </div>

</template>

<script setup lang="ts">
    import { SundraNotificationCategory, SundraNotificationType } from '@/types/sundra'
    import { useNotificationStore } from '@/stores/NotificationStore'
    import { usePageStore } from '@/stores/PageStore'
    import { useAuthStore } from '@/stores/AuthStore'
    import Color from 'color'

    /* STORES */
    const { debug } = useRuntimeConfig().public;
    const authStore = useAuthStore()
    const pageStore = usePageStore()
    pageStore.setGreyedOut(true)
    pageStore.setName('Uploads')
    pageStore.setBgColor(Color('#F9F9F9'))
    const notificationStore = useNotificationStore()
    onMounted(() => {
        pageStore.setGreyedOut(false)
    })

    // TODO: Fix this (package these into the upload store object)
    const hasTierOverage = ref<boolean>(false)
    if (Number(authStore.user?.usage.storage_current) > (Number(authStore.user?.usage.storage_allowed))) {
        hasTierOverage.value = true
        notificationStore.dispatch(
            SundraNotificationCategory.Subscriptions,
            SundraNotificationType.Error,
            "storage_allowed",
            undefined,
            `Your ${authStore.user!.tier} subscription tier is over the maximum allowed storage. Remove videos or <a href="/subscription?tab=pricing">upgrade your plan</a>`
        )
    }

    definePageMeta({
        title: 'Uploads'
    })
</script>

<style scoped>
.uploading-container {
    outline: 1px dashed #d3dbe3;
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 100%;
    font-size: 14px;
    color: #22031F;
    background-color: #fff;
}
.uploading-container.error {
    outline: 1px dashed #DD155D;
}
.upload-name-input {
    border: none;
    padding: 10px;
    margin-top: 2px;
    background: none;
    transition: none;
    font-weight: 600;
    font-size: 18px;
    color: #22031F;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
.upload-name-input.p-inputtext:enabled:focus{
    border: none !important;
    box-shadow: none !important;
}
.upload-name-input:hover {
    background-color: #EBCCFF;
}

.action-icon {
    color: #6B6B6B;
}
.action-icon:hover {
    color: #9538F6;
}

:deep(.uppy-DragDrop-container) {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 100%;
    font-size: 14px;
    color: #22031F;
    background-color: #fff;
    cursor: pointer;
}
:deep(.uppy-DragDrop-container::-moz-focus-inner) {
    border: 0;
}
:deep(.uppy-DragDrop-container):focus,
:deep(.uppy-DragDrop-container):focus {
    outline: 1px dashed #9538F6;
}
:deep(.uppy-DragDrop-inner) {
    margin: 0;
    padding: 60px 20px;
    line-height: 16px;
    text-align: center;
}
:deep(div.uppy-DragDrop-inner) svg {
    visibility: hidden !important;
}
:deep(.sundra div.uppy-DragDrop-inner)::before {
    content: none;
    color: #22031F;
}
:deep(.uppy-DragDrop-arrow) {
    display: none;
}
:deep(.uppy-DragDrop--isDragDropSupported) {
    border: 1px dashed #d3dbe3;
}
:deep(.uppy-DragDrop--isDraggingOver) {
    border: 1px dashed #9538F6;
}
:deep(.uppy-DragDrop--isDraggingOver .uppy-DragDrop-arrow) {
    fill: #939393;
}
:deep(.uppy-DragDrop-label) {
    display: block;
    margin-top: 5px;
}
:deep(.uppy-DragDrop-browse) {
    color: #9538F6;
    cursor: pointer;
}
:deep(.uppy-DragDrop-note) {
    font-size: 14px;
    color: #22031F;
}
:deep(.p-button.p-button-sm .p-button-icon) {
    filter: invert(25%) sepia(77%) saturate(4506%) hue-rotate(262deg) brightness(101%) contrast(93%);
}
</style>