<template>
    <PrimeDialog :visible="visible" :header="props.header" :style="{ width: props.width }" :draggable="props.draggable" :closable="false" modal>
        <!-- Captions -->
        <div class="gap-3 flex flex-column" style="min-height: 100px;">
            <div class="text-sm text-600 mb-1">You can have your subtitles translated from <b class="text-primary">{{ getLanguage(props.language) }}</b> to any of the available options below.</div>
            <b>Available languages</b>
            <PrimeDropdown v-model="selectedLanguage" inputId="language-select" :options="optionsLanguages" optionLabel="label" placeholder="Select language" class="text-xs">
                <template #optiongroup="slotProps">
                    <div class="flex align-items-center">
                        {{ slotProps.option.label }}
                    </div>
                </template>
            </PrimeDropdown>
        </div>

        <template #footer>
            <PrimeButton label="Cancel" text v-primeripple size="small" @click="hide" class="no-underline hover-purple" style="max-height: 36px;" autofocus />
            <PrimeButton label="Translate" outlined v-primeripple size="small" @click="onTranslateClick" class="no-underline hover-purple" icon="pi pi-language" style="max-height: 36px;" autofocus />
        </template>
    </PrimeDialog>
</template>

<script lang="ts" setup>
    import translationLanguages from '~/assets/data/languages.translation.json'
    import type { SundraTranslation } from '@/types/sundra';
    import { getLanguage } from '~/utils/languagehelper'

    const { debug, backendUrl } = useRuntimeConfig().public
    const visible = defineModel("visible", { type: Boolean })
    const props = defineProps({
        slug: {
            type: String,
            required: true
        },
        language: {
            type: String,
            required: true
        },
        translations: {
            type: Array<SundraTranslation>,
            default: []
        },
        header: {
            type: String,
            default: 'Add translation'
        },
        width: {
            type: String,
            default: '25rem'
        },
        draggable: {
            type: Boolean,
            default: false
        }
    })

    interface SelectedLanguage {
        label: string,
        value: string
    }

    const selectedLanguage = ref<SelectedLanguage>({ label: "Icelandic", value: "is"})
    const optionsLanguages = computed(() => {
        return translationLanguages.filter((i) => {
            return (
                i.value != props.language &&
                i.value != props.language.substring(0, 2) &&
                props.translations.find((f) => f.language.toLowerCase() == i.value.toLowerCase()) == null
                //props.translations.filter(f => f.language.toLowerCase() != i.value.toLowerCase()).length > 0
            )
        })
    })

    const emit = defineEmits<{ (e: 'onAddTranslation', language: string): void }>()
    const onTranslateClick = async () => {
        emit('onAddTranslation', selectedLanguage.value.value)
        hide()
    }

    const hide = () => { visible.value = false }
</script>

<style scoped>
.inactive {
    background-color: #ccc;
}
</style>