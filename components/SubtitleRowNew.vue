<template>
<!-- EDIT -->
    <div v-on-click-outside="onSave" class="flex align-items-start column-gap-2 px-2 py-3 border-round-sm subtitle-row selected relative" style="min-height: 80px;">
        <!-- SAVING -->
        <div v-if="showSavingRow" class="flex flex-column justify-content-center align-items-center gap-2 subtitle-row overlay">
            <span class="text-sm">Adding the new line</span>
            <PrimeProgressBar mode="indeterminate" class="w-30rem"
                :pt="{ root: { style: { height: '0.8rem' } } }" />
        </div>

        <!-- ACTIONS -->
        <div class="m-0 p-0">
            <a href="#" @click.stop="onDeleteClick()" v-primetooltip.top="'Cancel'" class="border-1 flex bg-white text-primary justify-content-center align-items-center absolute" style="border-radius: 50%; width: 18px; height: 18px; top: 10px; right: 10px;"><SvgIcon icon="trash" style="width: 10px; margin-bottom: 3px;" /></a>
        </div>

        <div class="border-round-2xl p-2 text-white font-semibold" style="background-color: #2DE6FF;">P1</div>
        <form class="flex flex-column flex-grow-1 justify-content-center gap-1">
            <div class="flex justify-content-between">
                <div class="flex align-content-center gap-1 text-xs text-700">
                    <PrimeInputMask @change="onStartChange" @keyup="onStartChange" v-model="startTime" mask="99:99:99?,999" class="py-0 px-1 text-xs w-6rem" :class="{ required: startTime.length == 0 }" />
                    -->
                    <PrimeInputMask @change="onEndChange" @keyup="onEndChange" v-model="endTime" mask="99:99:99?,999" class="py-0 px-1 text-xs w-6rem" :class="{ required: endTime.length == 0 }" />
                </div>
            </div>

            <PrimeTextarea ref="textarea" @keyup.enter.stop="onSave" v-model="text" :auto-resize="true" rows="2" class="p-1 mr-2 text-xs" :class="{ required: text.length == 0 }" v-focus required />
        </form>
    </div>
</template>

<script lang="ts" setup>
    import { vOnClickOutside } from '@vueuse/components'

    const { debug } = useRuntimeConfig().public
    const props = defineProps<{
        startTime?: string,
        endTime?: string
    }>()

    const textarea = ref<InstanceType<typeof HTMLTextAreaElement> | null>(null)
    const showSavingRow = ref<boolean>(false)
    const startTime = ref<string>(props.startTime ?? '')
    const endTime = ref<string>(props.endTime ?? '')
    const text = ref<string>('')
    const emit = defineEmits<{
        (e: 'save', start: string, end: string, text: string): void
        (e: 'cancel'): void
    }>()

    const onSave = () => {
        if (startTime.value != '' && endTime.value != '' && text.value != '') {
            showSavingRow.value = true
            emit('save', startTime.value, endTime.value, text.value)
        }
    }
    const onDeleteClick = () => {
        emit('cancel')
    }

    const onStartChange = (e: Event) => {
        if (props.startTime != null && toSeconds(props.startTime) > toSeconds(startTime.value)) {
            startTime.value = props.startTime
        }
    }
    const onEndChange = (e: Event) => {
        if (props.endTime != null && toSeconds(props.endTime) < toSeconds(endTime.value)) {
            endTime.value = props.endTime
        }
    }

    const failed = () => {
        showSavingRow.value = false
    }

    const vFocus = {
        mounted: (el: HTMLElement) => {
            el.focus()
        }
    }

    onMounted(() => showSavingRow.value = false)
    defineExpose({ failed })
</script>

<style scoped>
    .required {
        border: 1px solid #dd155d !important;
    }

    .subtitle-row.selected {
        border: 1px solid #9538F6;
        background-color: #9538F632;
    }

    .subtitle-row.confirmation {
        border: 1px solid #9538F6;
        background-color: #E0689032;
    }

    .subtitle-row.overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: #E06890cc;
        z-index:9999;
    }
</style>