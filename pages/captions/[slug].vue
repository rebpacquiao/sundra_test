<template>

    <Empty v-if="transcription == null"
        @add-new-content="onNewContentClick"
        type="transcriptions"
        title="No transcript yet"
        description="We're probably still working on it (or something went wrong)"
        hero="maintenance"
        imageStyle="height: 400px; margin-bottom: 20px;"
        button="Go back to list"
        :is-loading="isLoading" />

    <div v-else class="flex flex-row h-full">
        <!-- SUBNAV -->
        <div class="bg-surface w-14rem pl-4 pt-4 pr-2 text-700" style="background-color: #F9F9F9; min-width: 230px;">

            <b><i class="pi pi-tablet mr-2" style="font-size: 0.9rem" />Captions</b>
            <ul class="m-0 mb-3 p-0" style="list-style: none;">
                <li class="mt-1 py-1 nav-item"><a href="#" @click="onChangeLanguageClick(transcription.language)" class="text-700 no-underline" style="font-size: 0.9rem;">{{ getLanguage(transcription.language) }} <span style="font-size: 0.8rem;">(Source)</span></a></li>
                <li v-for="translation in translations" class="py-1 nav-item hover-parent">
                    <div class="flex justify-content-between">
                        <a href="#" @click="onChangeLanguageClick(translation.language)" class="text-700 no-underline" style="font-size: 0.9rem;">{{ getLanguage(translation.language) }}</a>
                        <a @click.stop="onNavMenuClick($event, translation)" aria-haspopup="true" aria-controls="action_menu" class="cursor-pointer text-primary pr-1 hover-item">
                            <SvgIcon icon="ellipsis" class="inline-block" style="width: 14px;" />
                        </a>
                    </div>
                </li>
            </ul>

            <b><i class="pi pi-receipt mr-2" style="font-size: 0.9rem" />Transcripts</b>
            <ul class="m-0 mb-3 p-0" style="list-style: none;">
                <li class="mt-1 py-1 nav-item"><a href="#" @click="onChangeTranscriptClick(transcription.language)" class="text-700 no-underline" style="font-size: 0.9rem;">{{ getLanguage(transcription.language) }} <span style="font-size: 0.8rem;">(Source)</span></a></li>
                <li v-for="translation in translations" class="py-1 nav-item hover-parent">
                    <div class="flex justify-content-between">
                        <a href="#" @click="onChangeTranscriptClick(translation.language)" class="text-700 no-underline" style="font-size: 0.9rem;">{{ getLanguage(translation.language) }}</a>
                    </div>
                </li>
            </ul>

            <template v-if="meetingMinutes.length > 0">
                <b><i class="pi pi-database mr-2" style="font-size: 0.9rem" />AI text</b>
                <ul class="m-0 mb-2 p-0" style="list-style: none;">
                    <li v-for="(minute, index) in meetingMinutes" :class="{ 'mt-1': (index == 0), 'mt-0': (index > 0) }" class="mt-1 py-1 nav-item hover-parent">
                        <div class="flex justify-content-between">
                            <a v-if="minute.type == SundraMinuteType.Minutes" href="#" @click="onChangeMinutesClick(minute)" class="text-700 no-underline" style="font-size: 0.9rem;">Meeting minutes - {{ getLanguage(minute.language) }}</a>
                            <a v-else-if="minute.type == SundraMinuteType.Short" href="#" @click="onChangeMinutesClick(minute)" class="text-700 no-underline" style="font-size: 0.9rem;">Short description - {{ getLanguage(minute.language) }}</a>
                            <a v-else-if="minute.type == SundraMinuteType.Long" href="#" @click="onChangeMinutesClick(minute)" class="text-700 no-underline" style="font-size: 0.9rem;">Long description - {{ getLanguage(minute.language) }}</a>
                            <a @click.stop="onNavMenuClick($event, minute)" aria-haspopup="true" aria-controls="action_menu" class="cursor-pointer text-primary pr-1 hover-item">
                                <SvgIcon icon="ellipsis" class="inline-block" style="width: 14px;" />
                            </a>
                        </div>
                    </li>
                </ul>
            </template>

            <PrimeButton
                    @click="onShowTranslationClick"
                    icon="pi pi-language"
                    size="small"
                    label="Translate"
                    v-primeripple
                    class="align-self-center no-underline hover-gray w-full mt-5 mb-2"
                    style="max-height: 30px; max-width: 90%;" />

            <PrimeButton
                    @click="onShowMinutesClick"
                    icon="pi pi-briefcase"
                    size="small"
                    label="AI text"
                    v-primeripple
                    class="align-self-center no-underline hover-gray w-full mb-2"
                    style="max-height: 30px; max-width: 90%;" />

            <PrimeButton
                    @click="onShowExportClick"
                    icon="pi pi-download"
                    size="small"
                    label="Export"
                    v-primeripple
                    class="no-underline hover-purple w-full"
                    style="max-height: 30px; max-width: 90%;" />
        </div>
        <!-- /SUBNAV -->
        <div class="flex flex-grow-1 align-items-start justify-content-start mx-4 mt-4 px-2 gap-5">

            <!-- CAPTIONS -->
            <div v-if="activeView == 'caption'" class="flex flex-column gap-2 flex-grow-1 h-full" style="max-width: 50%; min-width: 500px;">
                <div class="flex justify-content-between align-items-center">
                    <div class="flex justify-content-between align-items-center gap-2">
                        <span class="subtitle-text">{{ getLanguage(currentLanguage ?? 'en') }} <span v-if="currentLanguage == transcription.language">(Source)</span></span>
                        <a v-if="translations.length > 0" @click.stop="onTranslationMenuClick"  aria-haspopup="true" aria-controls="translation_menu" class="cursor-pointer text-xs text-primary">
                            change
                        </a>
                    </div>
                    <a @click.stop="onActionMenuClick" aria-haspopup="true" aria-controls="action_menu" class="flex cursor-pointer mt-2 text-primary">
                        <div class="text-sm">Actions</div> <SvgIcon icon="ellipsis" class="inline-block" style="width: 14px;" />
                    </a>
                </div>
                <div class="border-top-1 border-400 pt-3">
                    <div class="flex flex-column text-transcription gap-2" style="overflow-y: scroll; height: 82vh;">
                        <template v-for="(line, i) in currentCaption">
                            <SubtitleRow
                                @selected="onSelectLineClick"
                                @unselected="onUnselectLineClick"
                                @add-line="onAddLineClick"
                                @play="onPlayClick"
                                :slug="slug"
                                :language="currentLanguage ?? 'en-US'"
                                :line="line"
                                :index="i"
                                :is-last="currentCaption.length == (i - 1)"
                                :is-first="i == 0"
                                :is-selected="line == currentlySelectedLine && currentRowAction != EditorRowAction.Add"
                                :is-highlighted="(line.startSeconds < currentTime && currentTime < line.endSeconds)"
                                :can-add-new="line.endSeconds != getNextLine(i)?.startSeconds" />

                            <SubtitleRowNew v-if="currentlySelectedLine == line && currentRowAction == EditorRowAction.Add"
                                @save="onAddLineSave"
                                @cancel="onAddlineCancelClick"
                                :start-time="line.endTime"
                                :end-time="getNextLine(i)?.startTime" />
                        </template>
                    </div>
                </div>
            </div>
            <!-- TRANSCRIPT -->
            <div v-if="activeView == 'transcript'" class="flex flex-column gap-2 flex-grow-1 h-full" style="max-width: 50%; min-width: 500px;">
                <div class="flex justify-content-between align-items-center">
                    <div class="flex justify-content-between align-items-center gap-2">
                        <span class="subtitle-text">{{ getLanguage(currentLanguage ?? 'en') }}</span>
                    </div>
                    <a @click.stop="onActionMenuClick" aria-haspopup="true" aria-controls="action_menu" class="flex cursor-pointer mt-2 text-primary">
                        <div class="text-sm">Actions</div> <SvgIcon icon="ellipsis" class="inline-block" style="width: 14px;" />
                    </a>
                </div>
                <div class="border-top-1 border-400 pt-3">
                    <div class="flex flex-column text-transcription text-sm pr-3" style="overflow-y: scroll; height: 82vh; line-height: 1.8rem;">
                        <p v-html="captionStore.renderAsTranscript()" />
                    </div>
                </div>
            </div>
            <!-- AI TEXT -->
            <div v-if="activeView == 'minute'" class="flex flex-column gap-2 flex-grow-1 h-full" style="max-width: 50%; min-width: 500px;">
                <div class="flex justify-content-between align-items-center">
                    <div class="flex justify-content-between align-items-center gap-2">
                        <span class="subtitle-text">{{ getLanguage(currentMeetingMinute?.language ?? 'en') }}</span>
                    </div>
                    <a @click.stop="onActionMenuClick" aria-haspopup="true" aria-controls="action_menu" class="flex cursor-pointer mt-2 text-primary">
                        <div class="text-sm">Actions</div> <SvgIcon icon="ellipsis" class="inline-block" style="width: 14px;" />
                    </a>
                </div>
                <div class="border-top-1 border-400 pt-3">
                    <div class="flex flex-column text-transcription text-sm pr-3" style="overflow-y: scroll; height: 82vh;">
                        <VueShowdown v-if="currentMeetingMinute?.type == SundraMinuteType.Minutes" :markdown="currentMeetingMinute?.content" />
                        <p v-else style="line-height: 1.8rem;">
                            {{ currentMeetingMinute?.content }}
                        </p>
                    </div>
                </div>
            </div>

            <div class="flex flex-column gap-2 pt-5 flex-grow-1" style="margin-top: 2px;">
                <div class="relative">
                    <VideoJS
                        ref="videoJs"
                        :debug="debug"
                        :slug="slug"
                        :show-range-marker="false"
                        :autoplay="false"
                        :controls="true"
                        :dynamic="false"
                        :poster="`${backendUrl}/api/thumbnail/original/${slug}/cache`"
                        v-on:loaded="onLoaded"
                        type="streaming" />

                    <SubtitleOverlay v-if="currentCaption.length > 0" ref="subtitleOverlay" bottom="5%" height="50px" :show-stroke="false" color="#fff" :show-background="true" background="#000" :subtitles="currentCaption" :current-time="currentTime ?? 0" />
                </div>
            </div>
        </div>
    </div>

    <ExportDialog ref="exportDialog" v-on:on-add-export-video="onAddExportVideo" v-on:on-start-export-video="onStartExportVideo" :slug="slug" v-model:visible="showExportDialog" :languages="[transcription?.language ?? 'en-US', ...translations.map(t => t.language)]" :is-video="mainVideo?.media == SundraMediaType.Video" :exports="exports" />
    <TranslationDialog ref="translationDialog" v-on:on-add-translation="onAddTranslation" :slug="slug" :language="transcription?.language ?? 'en'" :translations="translations" v-model:visible="showTranslationDialog" />
    <AiTextDialog ref="aiTextDialog" v-on:on-generate-text="onAddAiText" :slug="slug" :name="mainVideo?.name ?? ''" :language="mainVideo?.language ?? 'en-US'" :translations="translations" v-model:visible="showAiTextDialog" />
    <TimingDelayDialog ref="timingDialog" v-on:on-change-timing="onChangeTiming" :slug="slug" v-model:visible="showtimingDialog" />
    <PrimeContextMenu ref="translationMenu" id="translation_menu" :model="translationMenuItems" :pt="{ root: { style: 'background-color: #EBCCFF;' }, menu: { style: 'background-color: #EBCCFF;' } }" />
    <PrimeContextMenu ref="actionMenu" id="action_menu" :model="actionMenuItems" :pt="{ root: { style: 'background-color: #EBCCFF;' }, menu: { style: 'background-color: #EBCCFF;' } }" />
    <PrimeContextMenu ref="navMenu" id="nav_menu" :model="navMenuItems" :pt="{ root: { style: 'background-color: #EBCCFF;' }, menu: { style: 'background-color: #EBCCFF;' } }" />
    <!-- DELETE DIALOG -->
    <PrimeConfirmDialog group="deleteConfirm" class="w-4" style="min-width: 400px;">
        <template #message="slotProps">
            <p class="pl-2" autofocus>
                {{ slotProps.message.message }} will be permanently deleted.<br/>
            </p>
        </template>
    </PrimeConfirmDialog>
</template>

<script setup lang="ts">
    import '@uppy/core/dist/style.min.css'
    import Color from 'color'
    import ContextMenu from 'primevue/contextmenu'
    import { usePageStore } from '@/stores/PageStore'
    import { useVideoStore } from '@/stores/VideoStore'
    import { useCaptionStore } from '@/stores/CaptionStore'
    import { useMinutesStore } from '@/stores/MinutesStore'
    import { type ParsedSrtFormat, type SundraMeetingMinute, type SundraTranscription, type SundraTranslation, EditorRowAction, SundraMediaType, SundraMinuteType } from '@/types/sundra'
    import { getLanguage } from '@/utils/languagehelper'
    import { storeToRefs } from 'pinia'
    import type { MenuItem, MenuItemCommandEvent } from 'primevue/menuitem'
    import type VideoJS from '~/components/VideoJS.vue'
    import type SubtitleOverlay from '~/components/SubtitleOverlay.vue'
    import { VueShowdown } from 'vue-showdown'
    import { saveAs } from 'file-saver'
    import docx, { type DocxOptions } from "remark-docx"
    import markdown from "remark-parse"
    import { unified } from "unified"

    definePageMeta({
        title: 'Subtitles',
        layout: 'fullpage'
    })


    /* PARAMS */
    const { backendUrl, debug } = useRuntimeConfig().public;
    const route = useRoute()
    const slug: string = route.params.slug as string

    /* STORES */
    const videoStore = useVideoStore()
    const { currentFile: mainVideo, isLoading: isVideosLoading } = storeToRefs(videoStore)
    const exports = computed(() => {
        if (mainVideo.value != null && mainVideo.value.exports != null) {
            return mainVideo.value.exports
        }
        return []
    })
    const pageStore = usePageStore()
    const captionStore = useCaptionStore()
    const minutesStore = useMinutesStore()
    const { transcription, translations, currentCaption, currentLanguage, isLoading: isCaptionsLoading } = storeToRefs(captionStore)
    const { meetingMinutes, currentMeetingMinute } = storeToRefs(minutesStore)
    const showExportDialog = ref(false)
    const showtimingDialog = ref(false)
    const showTranslationDialog = ref(false)
    const showAiTextDialog = ref(false)

    const currentlySelectedLineIndex = ref<number>(-1)
    const currentlySelectedLine = ref<ParsedSrtFormat|null>(null)
    const originalSelectedLine = ref<ParsedSrtFormat|null>(null)
    const currentRowAction = ref<EditorRowAction>(EditorRowAction.None)

    const subtitleOverlay = ref<InstanceType<typeof SubtitleOverlay> | null>(null)
    const videoJs = ref<InstanceType<typeof VideoJS>>()
    const currentTime = computed(() => {
        if (videoJs.value != null) {
            return videoJs.value.currentTime
        }
        return 0
    })
    const activeView = ref<'caption'|'transcript'|'minute'>('caption')

    const isLoading = computed(() => isCaptionsLoading.value || isVideosLoading.value)

    // Translation menu
    const translationMenu = ref<InstanceType<typeof ContextMenu> | null>(null)
    const translationMenuItems = computed(() => {
        const items: MenuItem[] = [{
            label: getLanguage(transcription.value?.language ?? 'en') + ' (Source)',
            visible: true,
            disabled: false,
            command: (event: MenuItemCommandEvent) => {
                if (transcription.value != null) {
                    onChangeLanguageClick(transcription.value.language)
                }
            }
        }]
        translations.value.forEach((i) => {
            items.push({
                label: getLanguage(i.language),
                visible: true,
                disabled: false,
                command: (event: MenuItemCommandEvent) => {
                    onChangeLanguageClick(i.language)
                }
            })
        })
        return items
    })
    const onTranslationMenuClick = (event: MouseEvent) => {
        translationMenu.value?.toggle(event)
    }
    const onChangeLanguageClick = async (language: string) => {
        if (debug) { console.log(`Page::/captions/${slug}:onChangeLanguageClick`, language) }
        activeView.value = 'caption'
        captionStore.open(language)
    }
    const onChangeTranscriptClick = async (language: string) => {
        if (debug) { console.log(`Page::/captions/${slug}:onChangeTranscriptClick`, language) }
        activeView.value = 'transcript'
        captionStore.open(language)
    }
    const onChangeMinutesClick = async (minute: SundraMeetingMinute) => {
        if (debug) { console.log(`Page::/captions/${slug}:onChangeMinutesClick`, minute) }

        activeView.value = 'minute'
        minutesStore.open(minute)
    }

    // Nav menu
    const currentNavItem = ref<SundraMeetingMinute|SundraTranscription|SundraTranslation>()
    const navMenu = ref<InstanceType<typeof ContextMenu> | null>(null)
    const navMenuItems = computed(() => [
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            visible: true,
            disabled: false,
            command: (event: MenuItemCommandEvent) => {
                if (currentNavItem.value != null) {
                    onShowDeleteConfirm(currentNavItem.value)
                }
            }
        }
    ])
    const onNavMenuClick = (event: MouseEvent, item: SundraMeetingMinute|SundraTranscription|SundraTranslation) => {
        currentNavItem.value = item
        navMenu.value?.toggle(event)
    }

    const confirm = useConfirm()
    const onShowDeleteConfirm = async (item: SundraMeetingMinute|SundraTranscription|SundraTranslation) => {
        if (debug) { console.log(`Showing nav delete confirm dialog`, item) }
        const type = getItemType(item)
        const message = type == 'minute'
            ? `Meeting minute`
            : (type != null
                ? (type.charAt(0).toUpperCase() + type.slice(1))
                : 'Item'
            )
        confirm.require({
            group: 'deleteConfirm',
            message: message,
            header: 'Are you sure?',
            acceptLabel: 'Delete',
            acceptClass: 'p-button-danger p-button-sm w-3 p-2',
            rejectLabel: 'Cancel',
            rejectClass: 'p-button-sm w-3 max-h-3rem p-2 p-button-outlined',
            accept: async () => {
                switch (type) {
                    case 'minute':
                        minutesStore.deleteMinutes(item as SundraMeetingMinute)
                        break

                    case 'translation':
                        captionStore.deleteTranslation(item as SundraTranslation)
                        break

                    case 'transcription':
                        console.log('Transcription '+item)
                        break
                }
            }
        })
        currentNavItem.value = undefined
    }
    const getItemType = (item: SundraMeetingMinute|SundraTranscription|SundraTranslation): null|'minute'|'transcription'|'translation' => {
        if ((item as SundraMeetingMinute).type != null) {
            return 'minute'
        } else if ((item as SundraTranslation).service != null) {
            return 'translation'
        } else if ((item as SundraTranscription).job_id) {
            return 'transcription'
        }
        return null
    }

    // Action menu
    const actionMenu = ref<InstanceType<typeof ContextMenu> | null>(null)
    const actionMenuItems = computed(() => [
        {
            label: 'Add translation',
            icon: 'pi pi-language',
            visible: (activeView.value == 'caption'),
            disabled: (activeView.value != 'caption'),
            command: (event: MenuItemCommandEvent) => {
                onShowTranslationClick()
            }
        },
        {
            label: 'Edit timing',
            icon: 'pi pi-exclamation-circle',
            visible: (activeView.value == 'caption'),
            disabled: (activeView.value != 'caption'),
            command: (event: MenuItemCommandEvent) => {
                onShowTimingClick()
            }
        },
        {
            label: 'Download',
            icon: 'pi pi-download',
            visible: true,
            disabled: false,
            command: (event: MenuItemCommandEvent) => {
                if (activeView.value == 'caption' && currentLanguage.value != null) {
                    onDownloadSrtClick(slug, currentLanguage.value)
                } else if (activeView.value == 'transcript' && currentLanguage.value != null) {
                    onDownloadTranscriptClick(slug)
                } else if (activeView.value == 'minute' && currentMeetingMinute.value != null) {
                    onDownloadMinutesClick(slug, currentMeetingMinute.value)
                }
            }
        }
    ])
    const onActionMenuClick = (event: MouseEvent) => {
        actionMenu.value?.toggle(event)
    }
    // Action menu handlers
    const onShowTranslationClick = async () => {
        showTranslationDialog.value = true
        if (debug) { console.log(`Showing translation click`, showTranslationDialog.value) }
    }
    const onShowMinutesClick = async () => {
        showAiTextDialog.value = true
        if (debug) { console.log(`Showing generate ai text click`, showAiTextDialog.value) }
    }
    const onShowExportClick = async () => {
        showExportDialog.value = true
        if (debug) { console.log(`Showing export click`, showExportDialog.value) }
    }
    const onShowTimingClick = async () => {
        showtimingDialog.value = true
        if (debug) { console.log(`Showing timing window click`, showtimingDialog.value) }
    }

    const onNewContentClick = async (event: PointerEvent) => {
        return await navigateTo(`/captions`)
    }
    const onDownloadSrtClick = async (slug: string, language: string) => {
        return await navigateTo(`${backendUrl}/api/download/transcript/srt/${slug}/${language}`, { external: true })
    }
    const onDownloadTranscriptClick = async (slug: string) => {
        if (currentCaption.value != null) {
            const processor = unified().use(markdown).use(docx, { output: "blob" } as DocxOptions);
            const doc = await processor.process(captionStore.renderAsTranscript())
            const blob = await doc.result
            saveAs(blob as Blob, `Transcript_${mainVideo.value?.name}_${currentLanguage}.docx`)
        }
        //return await navigateTo(`${backendUrl}/api/download/minutes/${slug}/${minutes.id}`, { external: true })
    }
    const onDownloadMinutesClick = async (slug: string, minutes: SundraMeetingMinute) => {
        if (minutes.content != null) {
            const processor = unified().use(markdown).use(docx, { output: "blob" } as DocxOptions);
            const doc = await processor.process(minutes.content)
            const blob = await doc.result
            saveAs(blob as Blob, `Minutes_${mainVideo.value?.name}_${minutes.language}.docx`)
        }
        //return await navigateTo(`${backendUrl}/api/download/minutes/${slug}/${minutes.id}`, { external: true })
    }
    const onAddTranslation = async (language: string) => {
        try {
            const success = await captionStore.translate(slug, language)
            onChangeLanguageClick(language)
        } catch (error) {
            if (debug) { console.error(`Page::/captions/${slug}:onAddTranslation`, language, error) }
        }
    }
    const onAddAiText = async (language: string, types: string[]) => {
        try {
            if (debug) { console.log(`Page::/captions/${slug}:onAddAiText`, language, types) }
            const success = await minutesStore.generateAiText(slug, language, types)
            if (success) {

            } else {

            }
        } catch (error) {
            if (debug) { console.error(`Page::/captions/${slug}:onAddAiText`, language, error) }
        }
    }

    const onPlayClick = (time: number) => {
        videoJs.value?.player?.currentTime(time)
        videoJs.value?.player?.play()
    }

    const onAddLineClick = async (index: number) => {
        if (debug) { console.log(`Page::/captions/${slug}:onAddLineClick`, index) }
        currentlySelectedLineIndex.value = index
        currentlySelectedLine.value = currentCaption.value[index]
        originalSelectedLine.value = {...currentCaption.value[index]}
        currentRowAction.value = EditorRowAction.Add
    }
    const onAddlineCancelClick = () => {
        currentRowAction.value = EditorRowAction.None
    }
    const onAddLineSave = async (start: string, end: string, text: string) => {
        if (currentLanguage.value != null && currentlySelectedLine.value != null) {
            captionStore.add(
                slug,
                currentLanguage.value,
                {
                    id: currentlySelectedLineIndex.value + 1,
                    start: start,
                    end: end,
                    text: text
                }
            )
            originalSelectedLine.value = null
            currentlySelectedLine.value = null
            currentlySelectedLineIndex.value = -1
            currentRowAction.value = EditorRowAction.None
        }
    }

    const onSelectLineClick = async (index: number) => {
        if (debug) { console.log(`Page::/captions/${slug}:onSelectLineClick`, index) }
        currentRowAction.value = EditorRowAction.None
        currentlySelectedLineIndex.value = index
        currentlySelectedLine.value = currentCaption.value[index]
        originalSelectedLine.value = {...currentCaption.value[index]}
    }

    const onUnselectLineClick = async () => {
        if (debug) { console.log(`Page::/captions/${slug}:onUnselectLineClick`, currentlySelectedLineIndex.value, currentlySelectedLine.value, originalSelectedLine.value) }
        if (currentlySelectedLine.value != null && hasLineChanged()) {
            let previous = getPreviousLine(currentlySelectedLineIndex.value)
            let next = getNextLine(currentlySelectedLineIndex.value)
            currentlySelectedLine.value.startTime = toTime(toSeconds(currentlySelectedLine.value.startTime), true).replace('.',',');
            currentlySelectedLine.value.endTime = toTime(toSeconds(currentlySelectedLine.value.endTime), true).replace('.',',');
            if (toSeconds(currentlySelectedLine.value.startTime) > toSeconds(currentlySelectedLine.value.endTime)) { currentlySelectedLine.value.endTime = toTime(toSeconds(currentlySelectedLine.value.startTime) + 0.1, true).replace('.',',').replace('.',',') }
            if (previous != null && toSeconds(currentlySelectedLine.value.startTime) < previous.endSeconds) { currentlySelectedLine.value.startTime = previous.endTime.replace('.',',') }
            if (next != null && toSeconds(currentlySelectedLine.value.endTime) > next.startSeconds) { currentlySelectedLine.value.endTime = next.startTime.replace('.',',') }
            captionStore.edit(slug, currentLanguage.value ?? 'en', {
                id: currentlySelectedLineIndex.value + 1,
                start: currentlySelectedLine.value.startTime,
                end: currentlySelectedLine.value.endTime,
                text: currentlySelectedLine.value.text
            })
            if (subtitleOverlay.value != null) {
                subtitleOverlay.value.update(currentTime.value)
            }
        }
        originalSelectedLine.value = null
        currentlySelectedLine.value = null
        currentlySelectedLineIndex.value = -1
        currentRowAction.value = EditorRowAction.None
    }

    const onChangeTiming = async (action: 'extend'|'shift', ms: number) => {
        if (debug) { console.log(`Page::/captions/${slug}:onChangeTiming`, action, ms) }
        if (currentLanguage.value != null) {
            if (action == 'extend') {
                captionStore.extend(slug, currentLanguage.value, {
                    id: 0, start: '00:00:00,000', end: toTime(ms / 1000, true).replace('.',','), text: ms.toString()
                })
            } else if (action == 'shift') {
                captionStore.shift(slug, currentLanguage.value, {
                    id: 0, start: '00:00:00,000', end: toTime(ms / 1000, true).replace('.',','), text: ms.toString()
                })
            }
        }
    }

    const onStartExportVideo = async (slug: string) => {
        pageStore.setGreyedOut(true)
    }
    const onAddExportVideo = async (slug: string) => {
        pageStore.setGreyedOut(false)
    }

    const getNextLine = (index: number) => {
        if (currentCaption.value.length > 0 && index < currentCaption.value.length - 1) {
            return currentCaption.value[index+1]
        }
        return null
    }
    const getPreviousLine = (index: number) => {
        if (currentCaption.value.length > 0 && index > 0) {
            return currentCaption.value[index-1]
        }
        return null
    }

    const hasLineChanged = () => {
        if (originalSelectedLine.value != null && currentlySelectedLine.value != null) {
            if (originalSelectedLine.value.startTime != currentlySelectedLine.value.startTime) { return true }
            if (originalSelectedLine.value.endTime != currentlySelectedLine.value.endTime) { return true }
            if (originalSelectedLine.value.text != currentlySelectedLine.value.text) { return true }
        }
        return false
    }

    const onLoaded = () => {
        currentRowAction.value = EditorRowAction.None
        if (currentCaption.value.length > 0) {
            currentlySelectedLineIndex.value = 0
            currentlySelectedLine.value = currentCaption.value[0]
            originalSelectedLine.value = {...currentCaption.value[0]}
            onUnselectLineClick()
        }
    }

    onBeforeMount(async () => {
        if (debug) { console.log(`Page::/captions/${slug}:onBeforeMount`) }
        pageStore.setGreyedOut(true)
        minutesStore.clear()
        await videoStore.loadVideo(slug)
        if (mainVideo.value == null) {
            return await navigateTo('/captions')
        } else if (mainVideo.value.has_ongoing) {
            return await navigateTo(`/captions/processing/${slug}`)
        }
        pageStore.setName(mainVideo.value?.name ?? '')
        pageStore.setShowHeader(true)
        pageStore.setBgColor(Color('#FFF'))
        pageStore.setShowClose(true)
        pageStore.setCloseClickCallback(async () => {
            return await navigateTo('/captions')
        })
        await captionStore.load(slug)
        minutesStore.load(slug)
    })

    onMounted(async () => {
        if (debug) { console.log(`Page::/captions/${slug}:onMounted`) }
        pageStore.setGreyedOut(false)
    })

    onUnmounted(() => {
        if (debug) { console.log(`Page::/captions/${slug}:onUnmounted`) }
        captionStore.close()
    })
</script>

<style scoped>
.subtitle-text {
    color: #565656;
    font-size: 16px;
}

.nav-item:hover {
    border-radius: 0.25em;
    background-color: #E7E7E7;
}

.hover-item {
    display: none;
    margin-bottom: -3px;
}

.hover-parent:hover .hover-item {
    display: block;
}
</style>