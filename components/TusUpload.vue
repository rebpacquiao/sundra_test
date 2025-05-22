<template>
    <div class="flex flex-column relative">
        <DragDrop ref="uppyContainer" v-if="uppy != null"
            :uppy="uppy"
            :props="{
                note: 'or click to browse',
                locale: {
                    strings: {
                        dropHereOr: 'Drag file here'
                    }
                }
            }"
            class="sundra pb-3"/>

        <p v-if="!hasError && error == null" class="footnote text-center">Incomplete uploads are saved for up to <b>24 hours</b>.<br/> The status of your current and previous <b>unfinished</b> uploads will be displayed below.</p>
        <PrimeMessage v-else
            class="w-full mx-auto"
            severity="error"
            :closable="false"
            :pt="{
                icon: { style: 'visibility: hidden;' },
                button: { style: 'visibility: hidden;' },
                wrapper: { style: 'padding: 1rem;' }
            }">
                <span class="text-xs">{{ error }}</span>
        </PrimeMessage>

        <div v-if="showUploadsTable && (uploads.length > 0 || filteredUploads.length > 0)" class="flex flex-wrap justify-content-center align-content-center px-5 pb-4">
            <div class="flex flex-column flex-grow-1 gap-1 table-text">
                <div class="flex flex-row align-items-center flex-grow-1 border-round-xs gap-3 px-2" style="height: 40px;">
                    <div class="w-1 flex justify-content-center"><b>Type</b></div>
                    <div class="w-4"><b>Filename</b></div>
                    <div class="w-2 text-center"><b>Language</b></div>
                    <div class="w-2 text-center"><b>Filesize</b></div>
                    <div class="w-1 text-center"><b>Status</b></div>
                    <div class="w-1 text-center"><b>Date added</b></div>
                    <div class="w-1 text-center"><b>Actions</b></div>
                </div>

                <!-- UPPY UPLOAD ITEMS -->
                <div v-for="(upload, i) in uploads" :key="upload.id" class="flex flex-row align-items-center flex-grow-1 border-round-xs gap-3 px-2 table-row text-xs bg-purple-50">
                    <div class="w-1 capitalize flex justify-content-center"><PrimeBadge :value="renderType(upload.type)" :severity="renderType(upload.type) == 'audio' ? 'secondary' : (renderType(upload.type) == 'image' ? 'info' : 'primary')" /></div>
                    <div class="w-4">{{ upload.name }}</div>
                    <div class="w-2">
                        <div class="p-float-label">
                            <PrimeDropdown v-on:update:model-value="onLanguageSelectChanged($event, (upload as UppyTusFile).tus.uploadUrl)" v-model="selectedLanguage" inputId="video-language" :options="optionsLanguages" optionLabel="label"  placeholder="Select video language" class="w-full text-xs">
                                <template #optiongroup="slotProps">
                                    <div class="flex align-items-center">
                                        {{ slotProps.option.label }}
                                    </div>
                                </template>
                            </PrimeDropdown>
                            <label for="video-language">Select video language</label>
                        </div>
                    </div>
                    <div class="w-2 text-center">{{ formatsize(upload.progress?.bytesUploaded ?? 0, false) }} / {{ formatsize(upload.progress?.bytesTotal ?? 0) }}</div>
                    <div class="w-1 text-center">
                        <PrimeProgressBar :showValue="false" :value="upload.progress?.percentage" class="w-full" style="margin-top: 18px;"
                            :pt="{
                                root: { style: { height: '0.9rem' } },
                                value: { style: { background: 'linear-gradient(270deg, #C366FF 0%, #9FF7B5 100%)' } }
                            }" />
                            <span style="font-size: 0.8em;">Uploading {{ upload.progress?.percentage }}%</span>
                    </div>
                    <div class="w-1">&nbsp;</div>
                    <div class="w-1 text-center"><PrimeButton @click="onRemoveUploadedFileClick(upload.id)" label="Cancel" severity="danger" rounded aria-label="Cancel" size="small" /></div>
                </div>

                <!-- STORE UPLOAD ITEMS -->
                <div v-for="upload in filteredUploads" @click="onUploadRowClick(upload)" class="flex flex-row align-items-center flex-grow-1 border-round-xs gap-3 px-2 table-row text-xs" :class="{ 'cursor-pointer': (upload.status != SundraUploadStatus.Waiting && upload.status != SundraUploadStatus.Processing), 'bg-purple-50': (upload.status == SundraUploadStatus.Waiting || upload.status == SundraUploadStatus.Processing) }">
                    <div class="w-1 capitalize flex justify-content-center"><PrimeBadge :value="upload.media" :severity="upload.media == 'audio' ? 'secondary' : (upload.media == 'image' ? 'info' : 'primary')" /></div>
                    <div class="w-4">{{ upload.filename }}</div>
                    <div class="w-2 text-center">{{ getLanguage(upload.language) }}</div>
                    <div class="w-2 text-center">{{ formatsize(upload.bytes_uploaded, false) }} / {{ formatsize(upload.bytes_total) }}</div>
                    <div v-if="upload.status == SundraUploadStatus.Processing" class="w-1 text-center">
                        <PrimeProgressBar :showValue="false" :value="fileStore.getFile(upload.slug!)?.progress ?? 0" class="w-full" style="margin-top: 18px;"
                            :pt="{
                                root: { style: { height: '0.9rem' } },
                                value: { style: { background: 'linear-gradient(270deg, #C366FF 0%, #9FF7B5 100%)' } }
                            }" />
                            <span style="font-size: 0.8em;">Preprocessing {{ fileStore.getFile(upload.slug!)?.progress ?? 0 }}%</span>
                    </div>
                    <div v-else class="w-1 text-center capitalize"><PrimeBadge :value="upload.status" :severity="renderStatusSeverity(upload.status)" /></div>
                    <div class="w-1 text-center">{{ dayjs(upload.created_at).format('D. MMM. YYYY')  }}</div>
                    <div v-if="upload.status != SundraUploadStatus.Processing" class="w-1 text-center">
                        <a @click.stop="onFileActionMenuClick($event, upload)" aria-haspopup="true" aria-controls="file_menu" class="cursor-pointer mt-1">
                            <SvgIcon :data-id="upload.tus_url" icon="ellipsis" class="inline-block" style="width: 14px;" />
                        </a>
                    </div>
                    <div v-else class="w-1">&nbsp;</div>
                </div>
            </div>
        </div>
    </div>
<!-- MENUS -->
    <PrimeContextMenu ref="fileMenu" id="file_menu" :model="fileMenuItems" :pt="{ root: { style: 'background-color: #EBCCFF;' }, menu: { style: 'background-color: #EBCCFF;' } }" />
    <!-- DELETE FILE DIALOG -->
    <PrimeConfirmDialog group="fileDeleteConfirm" class="w-4" style="min-width: 400px;">
        <template #message="slotProps">
            <p class="pl-2" autofocus>
                {{ slotProps.message.message }} will be permanently deleted from your uploads.<br/>
            </p>
        </template>
    </PrimeConfirmDialog>
</template>

<script lang="ts" setup>
    import transcriptionLanguages from '~/assets/data/languages.transcription.json'
    import transcriptionGroupedLanguages from '~/assets/data/languages.grouped.transcription.json'
    import { DragDrop } from '@uppy/vue'
    import { SundraUploadStatus, SundraCache, type SundraUpload } from '~/types/sundra'
    import { useFileStore } from '@/stores/FileStore'
    import { useUppyStore, type UppyTusFile } from '@/stores/UppyStore'
    import ContextMenu from 'primevue/contextmenu'
    import type { MenuItem, MenuItemCommandEvent } from 'primevue/menuitem'
    import { getLanguage } from '@/utils/languagehelper'
    import { formatsize } from '@/utils/formatsize'

    const { debug } = useRuntimeConfig().public
    const props = defineProps({
        showUploadsTable: {
            type: Boolean,
            default: true
        }
    })

    interface SelectedLanguage {
        label: string,
        value: string
    }

    const dayjs = useDayjs()
    const uppyStore = useUppyStore()
    const { uppy, uploads } = storeToRefs(uppyStore)
    const uppyContainer = ref<InstanceType<typeof DragDrop>>(null)
    const fileStore = useFileStore()
    const { hasError, error } = storeToRefs(fileStore)
    onMounted(async () => {
        uppyStore.create('is-IS')
        await fileStore.loadUploads(SundraCache.Keep)
    })

    const selectedLanguage = ref<SelectedLanguage>({ label: "Icelandic", value: "is-IS"})
    const optionsLanguages = ref(transcriptionLanguages);
    // Prepare menu commands for language changes
    transcriptionGroupedLanguages.forEach(i => {
        const callback = async (event: MenuItemCommandEvent) => {
            if (selectedFile.value != null) {
                await fileStore.updateUpload(selectedFile.value.tus_url, { language: event.item.value })
                selectedFile.value = null
            }
        }
        (i as MenuItem).command = callback
        i.items?.forEach(j => {
            (j as MenuItem).command = callback
        })
    })

    const selectedFile = ref<SundraUpload|null>()
    const fileMenu = ref<InstanceType<typeof ContextMenu> | null>(null)
    const fileMenuItems = ref([
        {
            label: 'Change language',
            icon: 's-icon si-edit',
            visible: true,
            disabled: false,
            items: transcriptionGroupedLanguages
        },
        {
            label: 'Delete',
            icon: 's-icon si-trash',
            visible: true,
            disabled: false,
            command: (event: MenuItemCommandEvent) => {
                if (selectedFile.value != null) {
                    onShowFileDeleteConfirm(selectedFile.value)
                    selectedFile.value = null
                }
            }
        }
    ])

    /* EVENTS */
    const onLanguageSelectChanged = async (data: { label: string, value: string }, tus: string) => {
        await fileStore.updateUpload(tus, { language: data.value })
    }
    const onUploadRowClick = async (file: SundraUpload) => {
        if (file.status != SundraUploadStatus.Waiting && file.status != SundraUploadStatus.Completed) {
            const el = document.querySelector(".uppy-DragDrop-input")
            if (el != null) {
                (el as HTMLButtonElement).click()
            }
        } else { return await navigateTo('/captions', { external: true }) }
    }
    const onRemoveUploadedFileClick = (id: string) => {
        uppyStore.remove(id)
    }

    const confirm = useConfirm()
    const onShowFileDeleteConfirm = async (file: SundraUpload) => {
        confirm.require({
            group: 'fileDeleteConfirm',
            message: `The upload '${file.filename}'`,
            header: 'Are you sure?',
            acceptLabel: 'Delete',
            acceptClass: 'p-button-danger p-button-sm w-3 p-2',
            rejectLabel: 'Cancel',
            rejectClass: 'p-button-sm w-3 max-h-3rem p-2 p-button-outlined',
            accept: async () => {
                await fileStore.deleteUpload(file.id)
            }
        })
    }
    const onFileActionMenuClick = (event: MouseEvent, data: SundraUpload) => {
        selectedFile.value = data
        fileMenu.value?.toggle(event)
    }

    /* HELPERS */
    const isFileUploading = (file: SundraUpload): boolean => {
        let isUploading = false
        uploads.value.forEach(i => {
            if ((i as UppyTusFile).tus?.uploadUrl == file.tus_url) {
                isUploading = true
            }
        })
        return isUploading
    }

    const renderStatusSeverity = (status: SundraUploadStatus): string => {
        switch (status) {
            case SundraUploadStatus.Uploading:
                return 'primary'
            case SundraUploadStatus.Incomplete:
                return 'warning'
            case SundraUploadStatus.Failed:
                return 'danger'
            case SundraUploadStatus.Cancelled:
                return 'secondary'
            case SundraUploadStatus.Waiting:
            case SundraUploadStatus.Processing:
            default:
                return 'success'
        }
    }

    const renderType = (type: string|undefined): string => {
        if (type == undefined) { return 'video' }
        return type.split('/')[0].toLowerCase()
    }

    /* WATCHERS */
    const uploadStatusValues = new Map<SundraUploadStatus, number>([
        [SundraUploadStatus.Completed,  0],
        [SundraUploadStatus.Incomplete, 1],
        [SundraUploadStatus.Uploading,  2],
        [SundraUploadStatus.Failed,     3],
        [SundraUploadStatus.Processing, 4],
        [SundraUploadStatus.Waiting,    5]
    ])
    const { uploads: storeUploads } = storeToRefs(fileStore)
    const filteredUploads = ref<SundraUpload[]>([])
    const filterUploads = (items: SundraUpload[]|null) => {
        if (items != null) {
            filteredUploads.value = items.filter(item => {
                if ((item.status == SundraUploadStatus.Uploading || item.status == SundraUploadStatus.Failed ||
                    item.status == SundraUploadStatus.Incomplete || item.status == SundraUploadStatus.Waiting ||
                    item.status == SundraUploadStatus.Processing || item.status == SundraUploadStatus.Completed || item.is_displayed)
                    && !isFileUploading(item)) {
                        return item
                }
            })
        }
        filteredUploads.value.sort((a, b) => {
            if (uploadStatusValues.get(a.status)! > uploadStatusValues.get(b.status)!) { return 1 }
            else if (uploadStatusValues.get(a.status)! < uploadStatusValues.get(b.status)!) { return -1 }
            else { return 0 }
        }).reverse()

        if (debug) { console.log(`TusUpload:filterUploads`, filteredUploads.value) }
    }
    watch(storeUploads, filterUploads, { deep: true, immediate: true })
</script>

<style scoped>
.failed {
    background: #FFBDD4 !important;
}

:deep(.p-dropdown .p-inputtext) {
    margin-top: 5px !important;
    margin-bottom: -5px !important;
}

.table-text {
    color: #222;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 18px; /* 128.571% */
}

.table-row {
    height: 80px;
    background-color: #fff;
}
.table-row:hover {
    background-color: #E7E7E7;
}
</style>