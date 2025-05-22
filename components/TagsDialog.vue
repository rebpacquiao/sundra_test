<template>
    <PrimeDialog v-model:visible="isShowing" modal :header="props.header" class="w-3" style="min-width: 200px;" :draggable="false">
        <form class="flex flex-column justify-content-center align-content-start gap-2">
            <div class="flex flex-column flex-wrap justify-content-between align-content-start align-items-stretch row-gap-3 column-gap-6" :style="{ maxHeight: maxHeight + 'px' }">
                <div v-for="tag of tagStore.tags" :key="tag.id" class="flex-grow-0 align-items-center gap-2">
                    <PrimeCheckbox v-model="values" :inputId="`tag_${tag.slug}`" name="tags" :value="tag.slug" />
                    <label :for="`tag_${tag.slug}`" class="ml-3">{{ tag.tag }}</label>
                </div>

            </div>
            <PrimeInplace :closable="true" class="mt-3" :pt="{ display: { class: ['hover:bg-white', 'pl-0'] }, closeButton: { root: { class: 'p-button-sm p-button-link', style: 'max-height: 32px;' } } }">
                <template #display>
                    <span v-if="tagStore.tags.length == 0" class="text-muted">Create and manage tags to organise your projects.</span><br/>
                    <PrimeButton size="small" label="+ New tag" class="pl-0" link />
                </template>
                <template #content>
                    <PrimeInputText v-model="newTagValue" size="small" style="max-height: 32px;" autofocus />
                    <PrimeButton @click="onCreateTagClick" size="small" label="+ Create" class="mx-3 font-bold" style="max-height: 32px;" link />
                </template>
                <template #closeicon>
                    <span style="color: #767676;" class="font-bold">Cancel</span>
                </template>
            </PrimeInplace>
        </form>
        <template #footer>
            <div class="flex justify-content-end align-content-center gap-2">
                <PrimeButton
                    @click="isShowing = false"
                    :disabled="isSaving"
                    label="Cancel"
                    v-primeripple
                    size="small"
                    class="w-5rem max-h-3rem p-2 p-button-outlined" />
                <PrimeButton
                    @click="onAddTagsClick"
                    :disabled="isSaving"
                    :label="isSaving ? 'Saving' : 'Save'"
                    v-primeripple
                    size="small"
                    class="w-5rem p-2" />
            </div>
        </template>
    </PrimeDialog>
</template>

<script setup lang="ts">
    import { useTagStore } from '@/stores/TagStore'
    import { useToast } from "primevue/usetoast"
    import { type SundraTag } from '@/types/sundra'

    const { debug } = useRuntimeConfig().public
    const toast = useToast()
    const isSaving = ref<boolean>(false)
    const isShowing = ref<boolean>(false)
    const values = ref<string[]>([])
    const newTagValue = ref<string>()
    const tagStore = useTagStore()

    interface Props {
        slug: string,
        header: string,
        selected: string[],
        maxHeight?: number
    }
    const props = withDefaults(defineProps<Props>(), { maxHeight: 400 })
    const emit = defineEmits<{
        (e: 'created', slug: string): void
        (e: 'added', slug: string, tags: SundraTag[]): void
    }>()

    const onCreateTagClick = async () => {
        if (debug) { console.log(`TagsDialog::onCreateTagClick`, newTagValue.value) }
        if (newTagValue.value != null && newTagValue.value.length > 0) {
            let tag = await tagStore.create(newTagValue.value)
            if (tag != null) {
                newTagValue.value = undefined
                values.value.push(tag.slug)
                emit('created', tag.slug)
            } else {
                toast.add({ severity: 'error', detail: `An error occurred while trying to create the '${newTagValue.value}' tag`, group: 'toastAlerts', life: 3000 })
            }
        }
    }

    const onAddTagsClick = async () => {
        if (debug) { console.log(`TagsDialog::onAddTagsClick`, props.slug, values.value) }
        if (newTagValue.value != null) { await onCreateTagClick() }
        let success = await tagStore.add(props.slug, values.value)
        if (success != null && success != false) {
            isShowing.value = false
            emit('added', props.slug, success as SundraTag[])
        } else if (success == false) {
            toast.add({ severity: 'error', detail: 'No new tags were added to the file', group: 'toastAlerts', life: 3000 })
        }
    }

    function show(): void {
        isShowing.value = true
    }

    function hide(): void {
        isShowing.value = false
    }

    watch(props, (newProp) => {
        values.value.splice(0)
        values.value.push(...newProp.selected)
    }, { deep: true, immediate: true })

    defineExpose({ values, show, hide })
</script>

<style scoped>
.text-muted {
    color: #29153699;
    font-size: 12px;
    font-weight: 400;
}
</style>