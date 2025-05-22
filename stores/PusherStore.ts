//import Echo from 'laravel-echo';
import Pusher, { Channel } from "pusher-js";
import { type SundraPollingEvent, SundraQueue, SundraNotificationCategory, SundraNotificationType, SundraAction, SundraStatus, SundraUploadStatus, type SundraUpload } from "@/types/sundra"
import { defineStore } from 'pinia';
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/AuthStore'
import { useVideoStore } from "@/stores/VideoStore"
import { useFileStore } from "@/stores/FileStore"
import { useMinutesStore } from "@/stores/MinutesStore"
import { useNotificationStore } from "@/stores/NotificationStore"

interface PusherSanctumAuth {
    auth: string
}

/**
 * Pusher Channels store
 * Listens to websocket events
 */
export const usePusherStore = defineStore('pusher', () => {
    /* Stores */
    const notificationStore = useNotificationStore()
    const authStore = useAuthStore()
    const fileStore = useFileStore()
    const minutesStore = useMinutesStore()
    const videoStore = useVideoStore()
    const { user } = storeToRefs(authStore)

    /* Pusher setup */
    const isInitialized = ref<boolean>(false)
    const { pusher, debug } = useRuntimeConfig().public;
    const pusherOptions = {
        key: pusher.key,
        cluster: pusher.cluster,
        forceTLS: true,
        disableStats: true,
        authorizer: (channel: any, options: any) => {
            return {
                authorize: async (socketId: string, callback: Function) => {
                    try {
                        const response = await $sundrafetch("/api/broadcasting/auth", {
                            method: "post",
                            body: {
                                socket_id: socketId,
                                channel_name: channel.name
                            }
                        })
                        if (response != null) {
                            sanctumAuth.value = (response as PusherSanctumAuth).auth
                        }
                        callback(false, response)
                    } catch (error) {
                        callback(true, error)
                    }
                }
            };
        }
    }
    Pusher.logToConsole = debug
    const client = new Pusher(pusherOptions.key, pusherOptions)

    /* State */
    const sanctumAuth = ref<string>()

    /* Getters */

    /* Actions */
    function initialize() {
        if (!isInitialized.value && user.value != null) {
            try {
                const channel = client.subscribe(`private-polling.${user.value.id}`)
                channel.bind("pusher:subscription_error", (error: any) => {
                    notificationStore.update(
                        SundraNotificationCategory.Files,
                        "subscription.error",
                        {
                            type: SundraNotificationType.Warning,
                            is_disposable: true,
                            message: 'We were unable to connect to the messaging service. You may need to refresh your browser'
                        }
                    )
                    if (debug) { console.log(error) }
                })
                channel.bind("pusher:subscription_succeeded", () => {
                    $sundrafetch("/api/polling/initiate", { method: "GET" })
                })

                attachPollListeners(channel)
                isInitialized.value = true
            } catch (e) {
                console.log(e)
            }
        }
    }

    function attachPollListeners(channel: Channel) {
        /* FILE POLLING */
        channel.bind('polling.files', function(data: SundraPollingEvent) {
            let upload = null
            switch (data.queue) {
                /* UPLOAD */
                case SundraQueue.Tus:
                    switch (data.action) {
                        case SundraAction.Completed:
                            upload = fileStore.getUploadBySlug(data.slug)
                            notificationStore.update(
                                SundraNotificationCategory.Files,
                                data.slug,
                                {
                                    type: SundraNotificationType.Success,
                                    message: `The file '${upload?.filename}' has successfully been uploaded and is now waiting to be processed.`
                                }
                            )
                            break;

                        case SundraAction.Failed:
                            upload = fileStore.getUpload(data.slug)
                            notificationStore.update(
                                SundraNotificationCategory.Files,
                                data.slug,
                                {
                                    type: SundraNotificationType.Warning,
                                    message: `An error occurred when trying to preprocess the '${upload?.filename}' video.`
                                }
                            )
                            break;
                    }
                    break;

                /* TASKS */
                case SundraQueue.Minutes:
                    pollingMinutesUpdate(data)
                    break;

                /* UPLOAD AND ENCODING */
                case SundraQueue.Upload:
                    pollingUploadUpdate(data)
                    break;

                case SundraQueue.Encoding:
                    pollingEncodingUpdate(data)
                    break;

                case SundraQueue.Export:
                    pollingExportUpdate(data)
                    break;

                /* FILE TRANSCRIPTION */
                case SundraQueue.Transcribe:
                    switch (data.action) {
                        case SundraAction.Dispatched:
                            notificationStore.update(
                                SundraNotificationCategory.Files,
                                data.slug,
                                {
                                    type: SundraNotificationType.Info,
                                    child: 'transcription',
                                    is_disposable: true,
                                    message: 'Preparing to transcribe your video.'
                                }
                            )
                            break;
                        case SundraAction.Started:
                            notificationStore.update(
                                SundraNotificationCategory.Files,
                                data.slug,
                                {
                                    type: SundraNotificationType.Info,
                                    child: 'transcription',
                                    is_disposable: true,
                                    message: 'Started transcribing your video.'
                                }
                            )
                            break;

                        case SundraAction.Completed:
                            //videoStore.loadVideo(data.slug)
                            const file = fileStore.getFile(data.slug)
                            if (file != null) { file.status = SundraStatus.Completed }
                            notificationStore.update(
                                SundraNotificationCategory.Files,
                                data.slug,
                                {
                                    type: SundraNotificationType.Success,
                                    child: 'transcription',
                                    //dispose: true
                                    message: 'Your video transcription is ready.'
                                }
                            )
                            break;

                        case SundraAction.Failed:
                            notificationStore.update(
                                SundraNotificationCategory.Files,
                                data.slug,
                                {
                                    type: SundraNotificationType.Warning,
                                    child: 'transcription',
                                    is_disposable: true,
                                    message: 'An error occurred while attempting to transcribe your video.'
                                }
                            )
                            break;
                    }
                    break;
            }
        })
    }

    async function pollingMinutesUpdate(data: SundraPollingEvent) {
        // Let's refresh our data sets if we notice a dispatch and filestore is empty
        if (data.action == SundraAction.Dispatched && fileStore.files.length == 0) {
            await fileStore.loadFile(data.slug)
        }
        const file = fileStore.getFile(data.slug)
        if (debug) { console.debug('PusherStore:pollingMinutesUpdate', data.slug, file) }
        if (file != null) {
            switch (data.action) {
                case SundraAction.Dispatched:
                    notificationStore.dispatch(
                        SundraNotificationCategory.Files,
                        SundraNotificationType.Info,
                        data.slug,
                        data.child,
                        `AI text for '${file.name}' are being queued up for generation.`
                    )
                    break

                case SundraAction.Started:
                    notificationStore.started(
                        SundraNotificationCategory.Files,
                        data.slug,
                        data.child,
                        `Started working on AI text for '${file.name}'.`
                    )
                    break

                case SundraAction.Completed:
                    await minutesStore.load(data.slug)
                    notificationStore.complete(
                        SundraNotificationCategory.Files,
                        data.slug,
                        data.child,
                        `AI text for '${file.name}' are ready for viewing.`
                    )
                    break

                case SundraAction.Failed:
                    notificationStore.fail(
                        SundraNotificationCategory.Files,
                        data.slug,
                        data.child,
                        `A problem occurred when trying to generate AI text for '${file.name}'.`
                    )
                    break
            }
        }
    }

    async function pollingUploadUpdate(data: SundraPollingEvent) {
        // Let's refresh our data sets if we notice a dispatch
        if (data.action == SundraAction.Dispatched) {
            await fileStore.loadFile(data.slug)
            await fileStore.loadUpload(data.slug)
        }
        // Process payload
        const file = fileStore.getFile(data.slug)
        if (debug) { console.debug('PusherStore:pollingUploadUpdate', data.slug, file) }
        if (file != null) {
            switch (data.action) {
                case SundraAction.Dispatched:
                    notificationStore.dispatch(
                        SundraNotificationCategory.Files,
                        SundraNotificationType.Info,
                        data.slug,
                        data.child,
                        `Your upload '${file.name}' is being queued up for preprocessing.`
                    )
                    break

                case SundraAction.Started:
                    updateFileStore(data.slug, SundraUploadStatus.Processing)
                    notificationStore.started(
                        SundraNotificationCategory.Files,
                        data.slug,
                        data.child,
                        `Your upload '${file.name}' started preprocessing.`
                    )
                    break

                case SundraAction.Progress:
                    if (debug) { console.log(`PusherStore::pollingUploadUpdate:SundraAction.Progress`, data) }
                    if (data.progress != null) {
                        updateFileStore(data.slug, SundraUploadStatus.Processing)
                        file.status = SundraStatus.Processing
                        file.progress = data.progress
                        notificationStore.progress(
                            SundraNotificationCategory.Files,
                            data.slug,
                            data.progress,
                            data.child,
                            `Your upload '${file.name}' is preprocessing.`
                        )
                    } else if (debug) { console.log(`PusherStore::pollingUploadUpdate:debug`, data) }
                    break;

                case SundraAction.Transcribing:
                    updateFileStore(data.slug, SundraUploadStatus.Completed)
                    file.status = SundraStatus.Transcribing
                    file.progress = 100
                    notificationStore.complete(
                        SundraNotificationCategory.Files,
                        data.slug,
                        data.child,
                        `Your upload '${file.name}' just finished preprocessing is now being transcribed.`
                    )
                    break;

                case SundraAction.Completed:
                    updateFileStore(data.slug, SundraUploadStatus.Completed)
                    file.status = SundraStatus.Completed
                    file.progress = 100
                    notificationStore.complete(
                        SundraNotificationCategory.Files,
                        data.slug,
                        data.child,
                        `Your upload '${file.name}' just finished preprocessing and can now be transcribed.`
                    )
                    break;

                case SundraAction.Failed:
                    notificationStore.fail(
                        SundraNotificationCategory.Files,
                        data.slug,
                        data.child,
                        `Something broke while preprocessing your upload '${file.name}'. :S`
                    )
                    break;
            }
        }
    }

    async function pollingEncodingUpdate(data: SundraPollingEvent) {
        const file = videoStore.getVideo(data.slug)
        if (file != null) {
            let doing = 'processing'
            switch (data.action) {
                case SundraAction.Dispatched:
                    notificationStore.dispatch(
                        SundraNotificationCategory.Files,
                        SundraNotificationType.Info,
                        data.slug,
                        data.child,
                        `Your video '${file.name}' is being queued up for ${doing}.`
                    )
                    break

                case SundraAction.Started:
                    notificationStore.started(
                        SundraNotificationCategory.Files,
                        data.slug,
                        data.child,
                        `Your video '${file.name}' started ${doing}.`
                    )
                    break

                case SundraAction.Progress:
                    if (data.progress != null) {
                        file.status = SundraStatus.Processing
                        file.progress = data.progress
                        notificationStore.progress(
                            SundraNotificationCategory.Files,
                            data.slug,
                            data.progress,
                            data.child,
                            `Your video '${file.name}' is ${doing}.`
                        )
                    }
                    break;

                case SundraAction.Completed:
                    await videoStore.loadVideo(data.slug)
                    notificationStore.complete(
                        SundraNotificationCategory.Files,
                        data.slug,
                        data.child,
                        `Your video '${file.name}' just finished ${doing}.`
                    )
                    break;

                case SundraAction.Failed:
                    await videoStore.loadVideo(data.slug)
                    notificationStore.fail(
                        SundraNotificationCategory.Files,
                        data.slug,
                        data.child,
                        `Something broke while ${doing} your video '${file.name}'. :S`
                    )
                    break;
            }
        }
    }

    async function pollingExportUpdate(data: SundraPollingEvent) {
        const file = videoStore.getVideo(data.slug)
        let lang = getLanguage(data.child.replace('lang_', ''))
        console.debug("PusherStore:pollingExportUpdate", { data: data, lang: lang, file: file})
        if (file != null) {
            switch (data.action) {
                case SundraAction.Started:
                    notificationStore.started(
                        SundraNotificationCategory.Files,
                        data.slug,
                        data.child,
                        `Started processing the export for '${file.name}' with ${lang} subtitles.`
                    )
                    videoStore.loadExports(data.slug)
                    break

                case SundraAction.Progress:
                    if (data.progress != null) {
                        file.status = SundraStatus.Processing
                        file.progress = data.progress
                        notificationStore.progress(
                            SundraNotificationCategory.Files,
                            data.slug,
                            data.progress,
                            data.child,
                            `The export for '${file.name}' with ${lang} subtitles is processing.`
                        )
                    }
                    break;

                case SundraAction.Completed:
                    notificationStore.complete(
                        SundraNotificationCategory.Files,
                        data.slug,
                        data.child,
                        `The export for '${file.name}' with ${lang} subtitles is ready for download.`
                    )
                    videoStore.loadExports(data.slug)
                    break;

                case SundraAction.Failed:
                    notificationStore.fail(
                        SundraNotificationCategory.Files,
                        data.slug,
                        data.child,
                        `Something broke while trying to export '${file.name}' with ${lang} subtitles. :S`
                    )
                    videoStore.loadExports(data.slug)
                    break;
            }
        }
    }

    async function updateFileStore(slug: string, status: SundraUploadStatus) {
        const upload = fileStore.getUploadBySlug(slug)
        if (debug) { console.debug('PusherStore:updateFileStore', slug, status, upload) }
        if (
            upload != null && (upload.status == SundraUploadStatus.Waiting ||
            (upload.status == SundraUploadStatus.Processing && status != SundraUploadStatus.Processing))
        ) {
            if (debug) { console.log(`PusherStore::updateFileStore:updateUpload`, slug, status, upload) }
            fileStore.updateUpload(upload.tus_url, { status: status });
        } else if (debug) { console.debug(`PusherStore::updateFileStore:updateUpload:debug`, slug, status, upload) }
    }

    return {
        initialize
    }
})
