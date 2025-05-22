<template>
    <!-- EDIT -->
    <div v-if="isSelected" v-on-click-outside="onUnselectLineClick" class="flex align-items-start column-gap-2 px-2 py-3 border-round-sm subtitle-row selected relative" style="min-height: 80px;">
        <!-- CONFIRM ACTION -->
        <div v-if="showConfirmationRow" class="flex flex-column justify-content-center align-items-center gap-2 subtitle-row overlay">
            <template v-if="captionStore.isLoading">
                <span class="text-sm">Working on it</span>
                <PrimeProgressBar mode="indeterminate" class="w-30rem"
                    :pt="{ root: { style: { height: '0.8rem' } } }" />
            </template>
            <template v-else>
                <span class="text-sm">You sure you want to {{ currentRowAction.toString().toLowerCase() }} this line?</span>
                <div class="flex justify-content-center align-items-center gap-2">
                    <PrimeButton @click="onRowActionCancelClick" size="small" label="Cancel" severity="info" v-primeripple style="max-height: 30px; max-width: 120px;" />
                    <PrimeButton @click="onRowActionConfirmClick" icon="pi pi-times" size="small" :label="currentRowAction.toString()" severity="danger" v-primeripple style="max-height: 30px; max-width: 120px;" />
                </div>
            </template>
        </div>

        <!-- ACTIONS -->
        <div class="m-0 p-0">
            <a v-if="!isFirst" href="#" @click.stop="onMergeLinesClick(index, RowDirection.Up)" v-primetooltip.top="'Merge up'" class="border-1 flex bg-white text-primary justify-content-center align-items-center absolute" style="border-radius: 50%; width: 18px; height: 18px; top: -5px; right: 45%;"><SvgIcon icon="arrow-up" style="width: 14px; margin-top: 1px;" /></a>
            <a href="#" @click.stop="onPlayClick(line.startSeconds)" v-primetooltip.top="'Play this line'" class="border-1 flex bg-white text-primary justify-content-center align-items-center absolute" style="border-radius: 50%; width: 18px; height: 18px; top: 10px; right: 54px;"><SvgIcon icon="play-sm" style="width: 12px; margin-bottom: 1px;" /></a>
            <a href="#" @click.stop="canAddNew ? onAddLineClick(index) : null" v-primetooltip.top="canAddNew ? 'New line' : 'Start time is too close'" class="border-1 flex bg-white text-primary justify-content-center align-items-center absolute" :class="{ disabled: !canAddNew }" style="border-radius: 50%; width: 18px; height: 18px; top: 10px; right: 32px;"><SvgIcon icon="cross" style="width: 12px; margin-bottom: 1px;" /></a>
            <a href="#" @click.stop="onDeleteClick(index)" v-primetooltip.top="'Delete line'" class="border-1 flex bg-white text-primary justify-content-center align-items-center absolute" style="border-radius: 50%; width: 18px; height: 18px; top: 10px; right: 10px;"><SvgIcon icon="trash" style="width: 10px; margin-bottom: 3px;" /></a>
            <a v-if="!isLast" href="#" @click.stop="onMergeLinesClick(index, RowDirection.Down)" v-primetooltip.top="'Merge down'" class="border-1 flex bg-white text-primary justify-content-center align-items-center absolute" style="border-radius: 50%; width: 18px; height: 18px; bottom: -5px; right: 45%;"><SvgIcon icon="arrow-down" style="width: 14px; margin-top: 2px;" /></a>
        </div>

        <div class="border-round-2xl p-2 text-white font-semibold" style="background-color: #2DE6FF;">P1</div>
        <form class="flex flex-column flex-grow-1 justify-content-center gap-1">
            <div class="flex justify-content-between">
                <div class="flex align-content-center gap-1 text-xs text-700">
                    <PrimeInputMask v-model="line.startTime" mask="99:99:99?,999" class="py-0 px-1 text-xs w-6rem" />
                    -->
                    <PrimeInputMask v-model="line.endTime" mask="99:99:99?,999" class="py-0 px-1 text-xs w-6rem" />
                </div>
            </div>

            <PrimeTextarea v-model="line.text" :auto-resize="true" rows="2" class="p-1 mr-2 text-xs" />
        </form>
    </div>

    <!-- DISPLAY -->
    <div v-else @click.stop="onSelectLineClick(index)" class="flex align-items-start column-gap-2 px-2 py-3 border-round-sm subtitle-row hover-parent relative" style="min-height: 80px;">
        <!-- ACTIONS -->
        <div class="m-0 p-0 hover-child">
            <a v-if="!isFirst" href="#" @click.stop="onMergeLinesClick(index, RowDirection.Up)" v-primetooltip.top="'Merge up'" class="border-1 flex bg-white text-primary justify-content-center align-items-center absolute" style="border-radius: 50%; width: 18px; height: 18px; top: -5px; right: 45%;"><SvgIcon icon="arrow-up" style="width: 14px; margin-top: 1px;" /></a>
            <a href="#" @click.stop="onPlayClick(line.startSeconds)" v-primetooltip.top="'Play this line'" class="border-1 flex bg-white text-primary justify-content-center align-items-center absolute" style="border-radius: 50%; width: 18px; height: 18px; top: 10px; right: 54px;"><SvgIcon icon="play-sm" style="width: 12px; margin-bottom: 1px;" /></a>
            <a href="#" @click.stop="canAddNew ? onAddLineClick(index) : null" v-primetooltip.top="canAddNew ? 'New line' : 'Start time is too close'" class="border-1 flex bg-white text-primary justify-content-center align-items-center absolute" :class="{ disabled: !canAddNew }" style="border-radius: 50%; width: 18px; height: 18px; top: 10px; right: 32px;"><SvgIcon icon="cross" style="width: 12px; margin-bottom: 1px;" /></a>
            <a href="#" @click.stop="onDeleteClick(index)" v-primetooltip.top="'Delete line'" class="border-1 flex bg-white text-primary justify-content-center align-items-center absolute" style="border-radius: 50%; width: 18px; height: 18px; top: 10px; right: 10px;"><SvgIcon icon="trash" style="width: 10px; margin-bottom: 3px;" /></a>
            <a v-if="!isLast" href="#" @click.stop="onMergeLinesClick(index, RowDirection.Down)" v-primetooltip.top="'Merge down'" class="border-1 flex bg-white text-primary justify-content-center align-items-center absolute" style="border-radius: 50%; width: 18px; height: 18px; bottom: -5px; right: 45%;"><SvgIcon icon="arrow-down" style="width: 14px; margin-top: 2px;" /></a>
        </div>

        <div class="border-round-2xl p-2 text-white font-semibold" style="background-color: #2DE6FF;">P1</div>
        <div class="flex flex-column flex-grow-1 justify-content-center">
            <div class="flex justify-content-between">
                <span class="text-xs text-700"><span class="text-muted">{{ index+1 }}.</span> {{ line.startTime }} --> {{ line.endTime }}</span>
            </div>
            <span style="white-space: pre-line;" class="text-sm cursor-pointer"><span class="px-1 border-round-sm" :class="{ 'highlighted': isHighlighted }">{{ line.text }}</span></span>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { useCaptionStore } from '@/stores/CaptionStore'
    import { vOnClickOutside } from '@vueuse/components'
    import { type ParsedSrtFormat, EditorRowAction } from '@/types/sundra'

    enum RowDirection {
        Up,
        Down
    }

    const { debug } = useRuntimeConfig().public
    const props = withDefaults(defineProps<{
        slug: string,
        language?: string,
        line: ParsedSrtFormat,
        index: number,
        isHighlighted: boolean,
        isSelected: boolean,
        isFirst: boolean,
        isLast: boolean,
        canAddNew: boolean
    }>(), {
        isHighlighted: false,
        isSelected: false,
        isFirst: false,
        isLast: false,
        canAddNew: true
    })

    const captionStore = useCaptionStore()
    const showConfirmationRow = ref<boolean>(false)
    const currentRowDirection = ref<RowDirection>(RowDirection.Up)
    const currentRowAction = ref<EditorRowAction>(EditorRowAction.Delete)
    const emit = defineEmits<{
        (e: 'play', time: number): void,
        (e: 'add-line', index: number): void,
        (e: 'selected', index: number): void,
        (e: 'unselected'): void,
        (e: 'changed'): void
    }>()

    const onSelectLineClick = (index: number) => {
        emit('selected', index)
        showConfirmationRow.value = false
    }
    const onUnselectLineClick = () => {
        emit('unselected')
        showConfirmationRow.value = false
    }

    const onRowActionConfirmClick = async () => {
        switch (currentRowAction.value) {
            case EditorRowAction.Delete:
                onDeleteConfirmClick()
                break
            case EditorRowAction.Merge:
                onMergeLinesConfirmClick()
                break
        }
    }
    const onRowActionCancelClick = () => {
        showConfirmationRow.value = false
    }

    const onPlayClick = (time: number) => {
        emit('play', time)
    }

    const onAddLineClick = (index: number) => {
        currentRowAction.value = EditorRowAction.Add
        emit('add-line', index)
        showConfirmationRow.value = false
    }

    const onDeleteClick = (index: number) => {
        currentRowAction.value = EditorRowAction.Delete
        emit('selected', index)
        showConfirmationRow.value = true
    }
    const onDeleteConfirmClick = async () => {
        if (props.language != null) {
            try {
                captionStore.remove(props.slug, props.language, {
                    id: (props.index + 1),
                    start: props.line.startTime,
                    end: props.line.endTime,
                    text: props.line.text
                })
                emit('changed')
            } catch (error) {
                if (debug) { console.error(`SubtitleRow::onDeleteConfirmClick`, props.line, error) }
            } finally {
                showConfirmationRow.value = false
            }
        }
    }

    const onMergeLinesClick = (from: number, direction: RowDirection) => {
        currentRowAction.value = EditorRowAction.Merge
        currentRowDirection.value = direction
        emit('selected', from)
        showConfirmationRow.value = true
    }
    const onMergeLinesConfirmClick = async () => {
        if (props.language != null) {
            try {
                captionStore.merge(
                    props.slug,
                    props.language, {
                        id: (props.index + 1),
                        start: props.line.startTime,
                        end: props.line.endTime,
                        text: currentRowDirection.value == RowDirection.Up
                                ? props.index.toString()
                                : (props.index + 2).toString()
                    }
                )
                emit('changed')
            } catch (error) {
                if (debug) { console.error(`SubtitleRow::onMergeLinesConfirmClick`, props.line, error) }
            } finally {
                showConfirmationRow.value = false
            }
        }
    }
</script>

<style scoped>
.subtitle-row {
    border: 1px solid transparent;
}
.subtitle-row:hover {
    background-color: #9538F632;
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


.hover-child {
    visibility: hidden;
    display: flex !important;
}

.hover-parent {
    &:hover {
        .hover-child { visibility: visible !important; }
    }
}

.disabled {
    background-color: #ddd !important;
    cursor: not-allowed;
}

.highlighted {
    background-color: #9FF7B5;
}
</style>