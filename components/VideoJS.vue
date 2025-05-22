<template>
    <div v-if="hasError">
        <h1>No video found</h1>
    </div>
    <div v-else>
        <video ref="playerEl" class="video-js" autofocus :poster="poster"></video>
    </div>
</template>

<script lang="ts" setup>
    import 'video.js/dist/video-js.css'
    import videojs from 'video.js'
    import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions'
    import type Player from 'video.js/dist/types/player'

    interface ApiResponse {
        status: string,
        data: DataResponse
    }
    interface DataResponse {
        url: string,
        type: 'stream'|'original'
    }

    interface Props {
        debug?: boolean,
        slug?: string,
        type?: string,
        autoplay?: boolean,
        controls?: boolean,
        dynamic?: boolean,
        showRangeMarker?: boolean
        rangeStart?: number,
        rangeEnd?: number,
        poster?: string
    }
    const props = withDefaults(defineProps<Props>(), {
        debug: false,
        autoplay: false,
        controls: false,
        dynamic: true,
        showRangeMarker: false,
        poster: '/images/tier-box-free.png'
    })

    const emit = defineEmits<{
        (e: 'startChanged', time: number): void
        (e: 'endChanged', time: number): void
        (e: 'loaded'): void
    }>()

    const { backendUrl, streamingUrl } = useRuntimeConfig().public;
    const hasError = ref<boolean>(false)
    let data: Props = props;
    if (props.dynamic) {
        try {
            const dialogRef = inject<Ref<DynamicDialogInstance>>("dialogRef")
            if (dialogRef?.value != null) {
                data = dialogRef?.value.data
            }
        } catch (e) {
            console.log('No dialog reference found')
        }
    }

    let videoUrl = null;
    let videoType = 'video/mp4'
    try {
        let response = await $sundrafetch(`/api/stream/${data.slug}`, { method: 'GET' })
        videoUrl = (response as ApiResponse).data.url
        if ((response as ApiResponse).data.type == 'stream') { videoType = 'application/x-mpegURL' }
    } catch (error) {
        if (data.debug) { console.log(error) }
    }

    const playerEl = ref<HTMLVideoElement|null>(null)
    const player = ref<Player>()
    const currentTime = ref<number>(0)
    onMounted(() => {
        if (data.debug) { console.log(`VideoJS::onMounted`, videoUrl, data) }
        if (videoUrl != null) {
            if (playerEl.value != null) {
                hasError.value = false

                videojs.time.setFormatTime((seconds: number, guide: number) => {
                    return seconds != null && seconds > 0 ? toTime(seconds, true) : '00:00:00.000'
                })
                player.value = videojs(playerEl.value, {
                    autoplay: (data.autoplay !== undefined ? data.autoplay : true),
                    controls: (data.controls !== undefined ? data.controls : false),
                    fluid: true,
                    controlBar: {
                        volumePanel: { inline: false },
                    },
                    sources: [
                        {
                            src: videoUrl,
                            type: videoType
                        }
                    ]
                }, function onPlayerReady() {
                    emit("loaded")
                })

                if (player.value != null) {
                    player.value.on('timeupdate', function() {
                        currentTime.value = player.value?.currentTime() ?? 0
                    })
                }
            }
        } else {
            hasError.value = true
        }
    })

    onBeforeUnmount(() => {
        if (player.value != null) {
            player.value.dispose()
        }
    })

    defineExpose({ player, playerEl, currentTime })
</script>