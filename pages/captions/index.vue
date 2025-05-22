<template>
    <!-- EMPTY STATE -->
    <Empty v-if="files == null || files.length == 0"
        @add-new-content="onNewContentClick"
        type="transcriptions"
        title="Nothing here yet"
        description="Now is a great time to upload some of your files!"
        hero="searching"
        imageStyle="height: 400px; margin-bottom: 20px;"
        button="Upload files"
        :is-loading="fileStore.isLoading" />

    <div v-else class="relative flex flex-column gap-2 mx-5 mt-5">
        <div class="flex flex-column flex-grow-1 gap-1 table-text">
            <FilterBar
                ref="filterBar"
                :filtered="filteredFiles"
                :tags="tagStore.tags"
                :items="files" />
            <div class="flex flex-row align-items-center flex-grow-1 border-round-xs gap-2 px-2" style="height: 40px;">
                <div class="w-1 text-center"><b>Type</b></div>
                <div class="w-4"><b>Filename</b></div>
                <div class="w-1 text-center"><b>Status</b></div>
                <div class="w-1 text-center"><b>Language</b></div>
                <div class="w-2 text-center"><b>Filesize</b></div>
                <div class="w-1 text-center"><b>Duration</b></div>
                <div class="w-1 text-center"><b>Date added</b></div>
                <div class="w-1 text-center"><b>Actions</b></div>
            </div>
            <!-- STORE UPLOAD ITEMS -->
            <div v-for="file in filteredFiles" @click="file.status != SundraStatus.Failed ? onRowClick(file) : null" :class="{ failed: file.status == SundraStatus.Failed, 'cursor-pointer': file.status != SundraStatus.Failed }" class="flex flex-row align-items-center flex-grow-1 border-round-xs gap-2 px-2 table-row text-xs">
                <div class="w-1 text-center capitalize"><PrimeBadge :value="file.media" :severity="file.media == SundraMediaType.Audio ? 'secondary' : (file.media == SundraMediaType.Image ? 'info' : 'primary')" /></div>
                <div class="w-4">
                    <div class="flex gap-3">
                        {{ file.name }}
                        <div>
                            <PrimeTag v-for="t in file.tags" :value="t.tag" severity="info" :style="`font-size: .6rem; padding: 2px; margin: 1px; background-color: ${textToColor(t.tag)}`" />
                        </div>
                    </div>
                </div>
                <div class="w-1 text-center capitalize"><PrimeBadge :value="file.status" :severity="renderStatusSeverity(file.status)" /></div>
                <div class="w-1 text-center">{{ getLanguage(file.language ?? 'en-US') }}</div>
                <div class="w-2 text-center">{{ formatsize(file.filesize ?? 0) }}</div>
                <div v-if="file.status == SundraStatus.Processing" class="w-1 text-center">
                    <PrimeProgressBar :showValue="false" :value="file.progress" class="w-full" style="margin-top: 18px;"
                        :pt="{
                            root: { style: { height: '0.9rem' } },
                            value: { style: { background: 'linear-gradient(270deg, #C366FF 0%, #9FF7B5 100%)' } }
                        }" />
                        <span style="font-size: 0.8em;">Preprocessing {{ file.progress }}%</span>
                </div>
                <template v-else>
                    <div v-if="file.media == SundraMediaType.Image" class="w-1 text-center">{{ `${file.image?.height}x${file.image?.width}` }}</div>
                    <template v-else>
                        <div v-if="file.media == SundraMediaType.Video" class="w-1 text-center">{{ file.video?.duration != null ? toTime(Number(file.video?.duration)) : 'Unknown' }}</div>
                        <div v-if="file.media == SundraMediaType.Audio" class="w-1 text-center">{{ file.audio?.duration != null ? toTime(Number(file.audio?.duration)) : 'Unknown' }}</div>
                        <div v-if="file.media == SundraMediaType.Other" class="w-1 text-center">N/A</div>
                    </template>
                </template>
                <div class="w-1 text-center">{{ dayjs(file.created_at).format('D. MMM. YYYY') }}</div>
                <div v-if="file.status == SundraStatus.Completed || file.status == SundraStatus.Failed" class="w-1 text-center">
                    <a @click.stop="onFileActionMenuClick($event, file)" aria-haspopup="true" aria-controls="file_menu" class="cursor-pointer mt-1">
                        <SvgIcon :data-id="file.id" icon="ellipsis" class="inline-block" style="width: 14px;" />
                    </a>
                </div>
                <div v-else class="w-1">&nbsp;</div>
            </div>
        </div>

    </div>

    <!-- MENUS -->
    <PrimeContextMenu ref="fileMenu" id="file_menu" :model="fileMenuItems" :pt="{ root: { style: 'background-color: #EBCCFF;' }, menu: { style: 'background-color: #EBCCFF;' } }" />
    <TagsDialog ref="tagsDialog" @added="onTagAdded" :header="'Tags '+(selectedFile != null ? `for ${selectedFile.name}` : '')" :slug="selectedFile?.slug ?? ''" :selected="selectedFileTags ?? []" />
    <!-- DELETE FILE DIALOG -->
    <PrimeConfirmDialog group="fileDeleteConfirm" class="w-4" style="min-width: 400px;">
        <template #message="slotProps">
            <p class="pl-2" autofocus>
                {{ slotProps.message.message }} will be permanently deleted from your uploads.<br/>
            </p>
        </template>
    </PrimeConfirmDialog>
    <!-- FILE RENAME DIALOG -->
    <PrimeDialog v-model:visible="showRenameDialog" modal header="Rename project" :style="{ width: '25rem' }">
        <span class="p-text-secondary block mb-3">Pick a new name for the project</span>
        <div class="flex align-items-center mb-5">
            <PrimeInputText v-model="selectedFileName" id="name" class="flex-auto" autocomplete="off" size="small" />
        </div>
        <div class="flex justify-content-end gap-2">
            <PrimeButton label="Cancel" text v-primeripple size="small" @click="showRenameDialog = false" class="no-underline hover-purple" style="max-height: 36px;" autofocus />
            <PrimeButton label="Rename" outlined v-primeripple size="small" @click="onRenameFileClick" class="no-underline hover-purple" icon="pi pi-download" style="max-height: 36px;" autofocus />
        </div>
    </PrimeDialog>

</template>

<script setup lang="ts">
    import { formatsize } from '@/utils/formatsize'
    import { toTime } from '@/utils/durationhelper'
    import { getLanguage } from '@/utils/languagehelper'
    import { textToColor } from '@/utils/highlight'
    import { usePageStore } from '@/stores/PageStore'
    import { useFileStore } from '@/stores/FileStore'
    import { SundraCache, SundraMediaType, SundraStatus, type SundraFile, type SundraTag } from '~/types/sundra'
    import Color from 'color'
    import ContextMenu from 'primevue/contextmenu'
    import type { MenuItemCommandEvent } from 'primevue/menuitem'
    import type { TagsDialog, FilterBar } from '~/.nuxt/components'
    /* STORES */
    const { backendUrl, debug } = useRuntimeConfig().public;
    const dayjs = useDayjs()
    const pageStore = usePageStore()
    pageStore.setGreyedOut(true)
    pageStore.setName('Files')
    pageStore.setBgColor(Color('#F9F9F9'))
    const tagStore = useTagStore()
    const fileStore = useFileStore()
    const { files } = storeToRefs(fileStore)
    const filteredFiles = ref<SundraFile[]>([])
    const filterBar = ref<InstanceType<typeof FilterBar> | null>(null)

    onBeforeMount(async () => {
        if (debug) { console.log(`Page::/captions:onBeforeMount`) }
        tagStore.load()
        fileStore.loadFiles(SundraCache.Reload)
    })

    onMounted(() => {
        pageStore.setGreyedOut(false)
    })

    const isSelectedCompleted = computed(() => selectedFile.value?.status == SundraStatus.Completed)

    const showRenameDialog = ref<boolean>(false)
    const selectedFile = ref<SundraFile|null>()
    const selectedFileName = ref<string|null>()
    const selectedFileTags = computed(() => selectedFile.value?.tags?.map(i => i.slug))
    const fileMenu = ref<InstanceType<typeof ContextMenu> | null>(null)
    const fileMenuItems = ref([
        {
            label: 'Rename',
            icon: 's-icon si-edit',
            visible: isSelectedCompleted,
            disabled: false,
            command: (event: MenuItemCommandEvent) => {
                if (selectedFile.value != null) {
                    showRenameDialog.value = true
                }
            }
        },
        {
            label: 'Tags',
            icon: 's-icon si-design',
            visible: isSelectedCompleted,
            disabled: false,
            command: (event: MenuItemCommandEvent) => {
                if (selectedFile.value != null) {
                    if (debug) console.log(`Page::/captions::menuTagEdit`, selectedFile.value)
                    tagsDialog.value?.show();
                }
            }
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
                    selectedFileName.value = null
                }
            }
        }
    ])


    /* EVENTS */
    const confirm = useConfirm()
    const tagsDialog = ref<InstanceType<typeof TagsDialog> | null>(null)
    const onShowFileDeleteConfirm = async (file: SundraFile) => {
        confirm.require({
            group: 'fileDeleteConfirm',
            message: `The file '${file.filename}'`,
            header: 'Are you sure?',
            acceptLabel: 'Delete',
            acceptClass: 'p-button-danger p-button-sm w-3 p-2',
            rejectLabel: 'Cancel',
            rejectClass: 'p-button-sm w-3 max-h-3rem p-2 p-button-outlined',
            accept: async () => {
                await fileStore.deleteFile(file.id)
            }
        })
    }
    const onFileActionMenuClick = (event: MouseEvent, file: SundraFile) => {
        selectedFile.value = file
        selectedFileName.value = file.name
        fileMenu.value?.toggle(event)
    }

    const onRenameFileClick = async () => {
        if (selectedFile.value != null && selectedFileName.value != null) {
            await fileStore.updateFile(selectedFile.value.slug, { name: selectedFileName.value })
            selectedFile.value = null
            selectedFileName.value = null
        }
        showRenameDialog.value = false
    }

    const onTagAdded = (slug: string, tags: SundraTag[]) => {
        const f = files.value.find(f => f.slug == slug)
        if (debug) { console.log(`Page::/captions::onTagAdded::${slug}`, f, tags) }
        if (f != null) {
            if (f.tags == null) { f.tags = [] }
            else if (tags.length > 0) { f.tags?.splice(0) }
            f.tags?.push(...tags)
        }
        filterBar.value?.refresh()
    }

    /* HELPERS */
    const renderStatusSeverity = (status: SundraStatus): string => {
        switch (status) {
            case SundraStatus.Uploading:
                return 'warning'
            case SundraStatus.Transcribing:
            case SundraStatus.Processing:
                return 'info'
            case SundraStatus.Failed:
                return 'danger'
            case SundraStatus.Waiting:
                return 'success'
            case SundraStatus.Completed:
            default:
                return 'primary'
        }
    }

    const onNewContentClick = async (event: PointerEvent) => {
        return await navigateTo('/upload')
    }

    const onDownloadSrtClick = async (slug: string) => {
        // TODO: Refactor this
        return await navigateTo(`${backendUrl}/api/download/transcript/srt/${slug}`, { external: true })
    }
    const onRowClick = (file: SundraFile) => {
        pageStore.setGreyedOut(true)
        if (file.has_ongoing) {
            return navigateTo(`/captions/processing/${file.slug}`)
        } else {
            return navigateTo(`/captions/${file.slug}`)
        }
    }
    definePageMeta({
        title: 'Files'
    })
</script>

<style scoped>
.failed {
    background: #FFBDD4 !important;
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