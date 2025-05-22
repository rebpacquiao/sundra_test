<template>
    <PrimeDialog :visible="visible" :header="props.header" :style="{ width: props.width }" :draggable="props.draggable" :closable="false" modal>
        <!-- Captions -->
        <div class="gap-3 flex flex-column">
            <div class="text-sm text-600 mb-1">You can generate a number of different versions of text from your captions.</div>
            <b>Generate from:</b>
            <PrimeDropdown v-model="selected" inputId="item-select" :options="options" optionLabel="label" placeholder="Select source" class="text-xs">
                <template #optiongroup="slotProps">
                    <div class="flex align-items-center">
                        {{ slotProps.option.label }}
                    </div>
                </template>
            </PrimeDropdown>

            <div class="flex justify-content-center">
                <PrimeSelectButton v-model="textTypes" :options="typeOptions" optionLabel="name" multiple aria-labelledby="multiple" />
            </div>
        </div>

        <template #footer>
            <PrimeButton label="Cancel" text v-primeripple size="small" @click="hide" class="no-underline hover-purple" style="max-height: 36px;" autofocus />
            <PrimeButton label="Generate" outlined v-primeripple size="small" @click="onGenerateMinutes" class="no-underline hover-purple" icon="pi pi-briefcase" style="max-height: 36px;" autofocus />
        </template>
    </PrimeDialog>
</template>

<script lang="ts" setup>
    import type { SundraTranslation } from '@/types/sundra';
    import { getLanguage } from '~/utils/languagehelper'

    const { debug, backendUrl } = useRuntimeConfig().public
    const visible = defineModel("visible", { type: Boolean })
    const props = defineProps({
        slug: {
            type: String,
            required: true
        },
        header: {
            type: String,
            default: 'Generate AI text'
        },
        width: {
            type: String,
            default: '25rem'
        },
        translations: {
            type: Array<SundraTranslation>,
            default: []
        },
        language: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        draggable: {
            type: Boolean,
            default: false
        }
    })


    interface SelectedItem {
        label: string,
        value: string
    }

    const textTypes = ref<SelectedItem[]>([])
    const typeOptions = ref([
        { name: 'Meeting minutes', value: 'minutes' },
        { name: 'Short description', value: 'short' },
        { name: 'Long description', value: 'long' }
    ])

    const selected = ref<SelectedItem>({ label: `Caption: ${props.name}`, value: props.language})
    const options = computed(() => {
        let items: SelectedItem[] = [{
            label: `Caption: ${props.name}`,
            value: props.language,
        }]
        props.translations.forEach(i => {
            items.push({
                label: `Caption: ${getLanguage(i.language)} translation`,
                value: i.language
            })
        })
        return items
    })

    const emit = defineEmits<{ (e: 'onGenerateText', language: string, types: string[]): void }>()
    const onGenerateMinutes = async () => {
        emit('onGenerateText', selected.value.value, textTypes.value.map(i => i.value))
        hide()
    }

    const hide = () => { visible.value = false }
</script>

<style scoped>
.inactive {
    background-color: #ccc;
}


:deep(.p-selectbutton.p-button-group.p-component > div.p-button.p-component) {
    font-size: 0.8rem;
    font-weight: normal;
    padding: 8px !important;
}
</style>