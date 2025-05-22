<template>
    <PrimeDialog :visible="visible" :header="props.header" :style="{ width: props.width }" :draggable="props.draggable" :closable="false" modal>
        <div class="flex gap-2">
            <PrimeTag @click="onSetActiveClick('captions')" value="Captions" class="cursor-pointer" :class="{ inactive: activeTab != 'captions' }" style="min-width: 100px;" rounded />
            <PrimeTag @click="onSetActiveClick('dialogs')" value="Dialogue lists" class="cursor-pointer" :class="{ inactive: activeTab != 'dialogs' }" style="min-width: 100px;" rounded />
            <PrimeTag v-if="isVideo" @click="onSetActiveClick('video')" value="Video" class="cursor-pointer" :class="{ inactive: activeTab != 'video' }" style="min-width: 100px;" rounded />
        </div>
        <div v-if="activeTab != 'video'" class="flex flex-column">
            <b class="mt-3 mb-2">Languages</b>
            <div class="flex flex-wrap row-gap-2 column-gap-4 align-items-start">

                <div v-for="language in languages" :key="`lang-${language}`" class="flex align-items-start">
                    <PrimeCheckbox v-model="selectedLanguages" :inputId="`lang-${language}`" name="languages" :value="language" :invalid="error != null" />
                    <label for="`lang-${language}`" class="ml-2 text-sm">{{ getLanguage(language) }}</label>
                </div>

            </div>
        </div>
        <!-- Captions -->
        <div class="hidden gap-2 flex-column py-2" :class="{ flex: activeTab == 'captions' }">

            <b class="mt-2">Format</b>
            <PrimeDropdown v-model="selectedCaptionsFormat" inputId="caption-format" :options="optionsCaptionsFormats" optionLabel="label" placeholder="Select captions format" class="text-xs">
                <template #optiongroup="slotProps">
                    <div class="flex align-items-center">
                        {{ slotProps.option.label }}
                    </div>
                </template>
            </PrimeDropdown>

        </div>
        <!-- Dialog lists -->
        <div class="hidden gap-2 flex-column py-2" :class="{ flex: activeTab == 'dialogs' }">

            <b class="mt-2">Type</b>
            <PrimeDropdown v-model="selectedDialogsType" inputId="dialogs-type" :options="optionsDialogsTypes" optionLabel="label" placeholder="Select dialog list type" class="text-xs">
                <template #optiongroup="slotProps">
                    <div class="flex align-items-center">
                        {{ slotProps.option.label }}
                    </div>
                </template>
            </PrimeDropdown>

            <b class="mt-2">Format</b>
            <PrimeDropdown v-model="selectedDialogsFormat" inputId="dialogs-format" :options="optionsDialogsFormats" optionLabel="label" placeholder="Select dialog list format" class="text-xs">
                <template #optiongroup="slotProps">
                    <div class="flex align-items-center">
                        {{ slotProps.option.label }}
                    </div>
                </template>
            </PrimeDropdown>
        </div>
        <!-- Video -->
        <div class="hidden gap-2 flex-column py-2" :class="{ flex: activeTab == 'video' }">

            <PrimeMessage v-if="error != null" :closable="true" severity="error">{{ error }}</PrimeMessage>
            <div v-if="exports.length > 0" class="grid grid-nogutter gap-1 mt-2">
                <div class="col-5"><b>Language</b></div>
                <div class="col-6"><b>Status</b></div>
                <template v-for="item in exports">
                    <div class="col-5 text-sm">{{ getLanguage(item.version_id.replace('lang_', '')) }}</div>
                    <div class="col-5 text-sm">{{ item.status }}</div>
                    <div v-if="item.status == SundraVideoType.Complete" class="col-1"><div class="flex text-primary cursor-pointer" @click="onDownloadExportClick(item.version_id)"><SvgIcon icon="download" style="width: 18px;" /></div></div>
                </template>
            </div>
            <b class="mt-2">Caption language</b>
            <PrimeDropdown v-model="selectedLanguage" inputId="caption-format" :options="optionsLanguages" optionLabel="label" placeholder="Caption language" class="text-xs">
                <template #optiongroup="slotProps">
                    <div class="flex align-items-center">
                        {{ slotProps.option.label }}
                    </div>
                </template>
            </PrimeDropdown>

        </div>
        <template #footer>
            <PrimeButton label="Close" text v-primeripple size="small" @click="hide" class="no-underline hover-purple" style="max-height: 36px;" autofocus />
            <PrimeButton label="Export" outlined v-primeripple size="small" @click="exportData" class="no-underline hover-purple" icon="pi pi-download" style="max-height: 36px;" autofocus />
        </template>
    </PrimeDialog>
</template>

<script lang="ts" setup>
    import { getLanguage } from '@/utils/languagehelper'
    import { SundraVideoType, type ApiError, type SundraVideo } from '~/types/sundra'

    const { debug, backendUrl } = useRuntimeConfig().public
    const visible = defineModel("visible", { type: Boolean })
    const props = defineProps({
        slug: {
            type: String,
            required: true
        },
        languages: {
            type: Array<string>,
            required: true
        },
        exports: {
            type: Array<SundraVideo>,
            default: []
        },
        header: {
            type: String,
            default: 'Exports'
        },
        width: {
            type: String,
            default: '25rem'
        },
        draggable: {
            type: Boolean,
            default: false
        },
        isVideo: {
            type: Boolean,
            default: true
        }
    })

    // Error
    const error = ref<string|null>(null)

    // SelectionItem
    interface SelectionItem {
        label: string,
        value: string
    }
    const selectedLanguages = ref<string[]>()

    // Captions
    const selectedCaptionsFormat = ref<SelectionItem>({ label: "SubRip titles (.srt)", value: "srt" })
    const optionsCaptionsFormats = ref([
        { "label": "SubRip titles (.srt)", "value": "srt" },
        { "label": "Video Text Tracks (.vtt)", "value": "vtt" },
        { "label": "Text file (.txt)", "value": "txt" }
    ])
    // Dialog lists
    const selectedDialogsType = ref<SelectionItem>({ label: "Standard", value: "standard" })
    const optionsDialogsTypes = ref([{ "label": "Standard", "value": "standard" }])
    const selectedDialogsFormat = ref<SelectionItem>({ label: "Comma Separated (.csv)", value: "csv" })
    const optionsDialogsFormats = ref([{ "label": "Comma Separated (.csv)", "value": "csv" }])
    // Video
    const optionsLanguages = computed<SelectionItem[]>(() => {
        let opts: SelectionItem[] = []
        props.languages.forEach((i) => { opts.push({ "label": getLanguage(i), value: i }) })
        return opts
    })
    const selectedLanguage = ref<SelectionItem>({ label: getLanguage(props.languages[0]), value: props.languages[0]})

    const activeTab: Ref<'captions'|'dialogs'|'video'> = ref('captions')
    const onSetActiveClick = (tab: 'captions'|'video'|'dialogs') => {
        error.value = null
        activeTab.value = tab
    }
    const exportData = async () => {
        error.value = null
        switch (activeTab.value) {
            case "dialogs":
                return exportDialogs()

            case "video":
                return exportVideo()

            case "captions":
            default:
                return exportCaptions()
        }
    }

    const exportDialogs = async () => {
        if (selectedLanguages.value != null) {
            hide()
            return await navigateTo(
                `${backendUrl}/api/download/dialog/${selectedDialogsType.value.value}/${selectedDialogsFormat.value.value}/${props.slug}/`+selectedLanguages.value.join(','),
                { external: true }
            )
        } else {
            error.value = "No languages selected"
        }
    }

    const exportVideo = async () => {
        try {
            if (selectedLanguage.value?.value != null) {
                emit('onStartExportVideo', props.slug, selectedLanguage.value.value)
                const response = await $sundrafetch(`/api/video/export/${props.slug}`, {
                    method: "post",
                    body: { language: selectedLanguage.value.value }
                })
                if ((response as ApiError).status.toLowerCase() != 'error') {
                    emit('onAddExportVideo', props.slug, selectedLanguage.value.value)
                    hide()
                } else {
                    error.value = (response as ApiError).message ?? 'An error occurred while trying to generate the video'
                }
            } else {
                error.value = "No languages selected"
            }
        } catch (e) {
            error.value = (e as Error).message
        }
    }

    const exportCaptions = async () => {
        if (selectedLanguages.value != null) {
            hide()
            return await navigateTo(
                `${backendUrl}/api/download/transcript/${selectedCaptionsFormat.value.value}/${props.slug}/`+selectedLanguages.value.join(','),
                { external: true }
            )
        } else {
            error.value = "No languages selected"
        }
    }

    const onDownloadExportClick = async(versionId: string) => {
        hide()
        return await navigateTo(
            `${backendUrl}/api/download/export/${props.slug}/${versionId}`,
            { external: true }
        )
    }

    const hide = () => {
        visible.value = false
        error.value = null
    }

    const emit = defineEmits<{
        (e: 'onAddExportVideo', slug: string, language: string): void,
        (e: 'onStartExportVideo', slug: string, language: string): void,
    }>()

</script>

<style scoped>
.inactive {
    background-color: #ccc;
}

div.loading {
    background-color:#00000080;
    width:100%;
    height:100%;
    z-index:9999;
    top:0;
    left:0;
    position:fixed;
}
</style>