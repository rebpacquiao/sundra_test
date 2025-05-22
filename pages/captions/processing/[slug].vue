<template>
    <div id="processing_body" class="flex flex-column justify-content-start align-items-center gap-2 mt-5 pt-5 ml-5 h-full">
        <div v-if="uploadState == SundraUploadStatus.Uploading" class="page-header">Your file is uploading</div>
        <div v-else class="page-header">Your file is processing now</div>
        <div v-if="!didUploadFail" class="page-header-muted">This page will refresh automatically once the processing has finished.</div>
        <div v-else class="page-header-muted failed">An error occurred while uploading your file.</div>

        <RadialProgress v-if="mainVideo?.status != SundraStatus.Completed"
            :diameter="180"
            :strokeWidth="14"
            :innerStrokeWidth="14"
            :completed-steps="!isProcessing ? uppyStore.totalProgress : mainVideo?.progress"
            :total-steps="100"
            :startColor="(!didUploadFail && mainVideo?.status != SundraStatus.Failed) ? '#9FF7B5' : '#DD155D'"
            :stopColor="(!didUploadFail && mainVideo?.status != SundraStatus.Failed) ? '#C366FF' : '#DD155D'"
            :innerStrokeColor="(!didUploadFail && mainVideo?.status != SundraStatus.Failed) ? '#E7E7E7' : '#DD155D'"
            class="block my-5">
                <template v-if="!isProcessing">
                    <div v-if="uploadState != SundraUploadStatus.Failed" class="text-processing">{{ uppyStore.totalProgress }}%</div>
                    <div v-else-if="didUploadFail" class="text-processing-small text-center">Upload<br/>failed</div>
                    <div v-else class="text-processing-small text-center">Upload<br/>completed</div>
                </template>
                <template v-else-if="isProcessing && mainVideo != null">
                    <div v-if="mainVideo.status == SundraStatus.Processing" class="text-processing">{{ mainVideo.progress }}%</div>
                    <div v-else-if="mainVideo.status == SundraStatus.Waiting" class="text-processing-small text-center">Waiting to start</div>
                    <div v-else-if="mainVideo.status == SundraStatus.Failed" class="text-processing-small text-center">Upload<br/>failed</div>
                    <div v-else class="text-processing-small text-center">Waiting on Transcription</div>
                </template>
                <div v-else class="text-processing-small text-center">Waiting on Transcription</div>
        </RadialProgress>
        <template v-else>
            <PrimeProgressSpinner style="width: 180px; height: 180px; margin-top: 40px;" strokeWidth="4" animationDuration="2s" />
            <div class="text-processing-small text-center relative" style="top: -120px; left: 0px;">Waiting on<br/> Transcription</div>
        </template>
        <div class="flex flex-column justify-content-start align-items-start gap-5">
            <div class="flex flex-row">
                <SvgIcon icon="file" class="mr-1" style="width: 20px; margin-left: 5px;" />
                <span class="header-file">{{ mainVideo?.title }} ({{ formatsize(Number(mainVideo?.filesize)) }})</span>
            </div>
            <div class="align-self-center text-muted text-center mt-3">
                You can now safely leave this page.<br/>
                We will inform you when we finish processing your video
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import Color from 'color'
    import RadialProgress from "vue3-radial-progress";
    import { usePageStore } from '@/stores/PageStore'
    import { useUppyStore } from '@/stores/UppyStore'
    import { useVideoStore } from '@/stores/VideoStore'
    import { formatsize } from '@/utils/formatsize'
    import { storeToRefs } from 'pinia'
    import { SundraStatus, SundraUploadStatus } from '@/types/sundra'

    definePageMeta({
        title: 'Processing & Transcribing',
        layout: 'fullpage'
    })

    /* PARAMS */
    const { debug } = useRuntimeConfig().public;
    const route = useRoute()
    const slug: string = route.params.slug as string

    /* STORES */
    const uppyStore = useUppyStore()
    const { uploadState } = storeToRefs(uppyStore)
    const pageStore = usePageStore()
    pageStore.setName('Uploading file')
    pageStore.setShowHeader(true)
    pageStore.setBgColor(Color('#F9F9F9'))
    pageStore.setShowClose(true)
    pageStore.setCloseClickCallback(async () => {
        return await navigateTo('/captions')
    })
    const videoStore = useVideoStore()
    await videoStore.loadVideo(slug)
    const { currentFile: mainVideo } = storeToRefs(videoStore)

    onMounted(async () => {
        pageStore.setGreyedOut(false)
        if (mainVideo.value == null) {
            return await navigateTo('/captions/upload')
        }
    })

    /* PAGE ITEMS AND WATCHERS */
    const didUploadFail = computed(() => {
        return mainVideo.value?.status == 'failed'
            || mainVideo.value?.status == 'abandoned'
    })

    const isProcessing = computed(() => {
        if ((uploadState.value != SundraUploadStatus.Uploading && !didUploadFail.value) || (mainVideo.value != null && mainVideo.value.status != SundraStatus.Uploading)) {
            return true
        }
        return false
    })

    watch(mainVideo, (newMainVideo) => {
        if (debug) {
            console.log(`Page::/captions/processing/${slug}: Watch on mainVideo triggered`, {
                old: mainVideo.value,
                new: newMainVideo,
                state: uploadState
            })
        }
        if (newMainVideo != null && !newMainVideo?.has_ongoing && newMainVideo?.has_transcription) { return navigateTo(`/captions/${mainVideo.value?.slug}`) }
    })
    watch(uploadState, (newUploadState) => {
        if (debug) {
            console.log(`Page::/captions/processing/${slug}: Watch on uploadState triggered`, {
                old: uploadState.value,
                new: newUploadState,
                video: mainVideo.value
            })
        }
        if (uploadState.value != SundraUploadStatus.Uploading || newUploadState == SundraUploadStatus.Completed) {
            pageStore.setName('Processing file')
        }
    }, { immediate: true })
</script>

<style>
.p-progress-spinner-svg {
    animation: p-progress-spinner-color 1.5s linear infinite !important;
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

<style scoped>
.page-header {
    color: #000;
    text-align: center;
    font-family: Lato;
    font-size: 22px;
    font-style: normal;
    font-weight: 500;
}

.page-header-muted {
    color: #141414;
    text-align: center;
    font-family: Inter;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
}

.text-processing {
    color: #000;
    text-align: center;
    font-family: Lato;
    font-size: 40px;
    font-style: normal;
    font-weight: 600;
}

.text-processing-small {
    color: #000;
    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
}

.text-processing-list {
    color: #22031F;
    font-family: Lato;
    font-size: 14px;
    font-style: normal;
}
.text-processing-percent {
    font-size: 14px;
}

.finished {
    color: #9538F6;
}
.failed {
    color: #DD155D;
}
</style>
