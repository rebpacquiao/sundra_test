<template>
    <div class="flex mb-2 gap-2">
        <div class="flex flex-grow-1">
            <PrimeIconField iconPosition="left" class="flex flex-grow-1">
                <PrimeInputIcon class="pi pi-search" :class="{ 'text-primary': (searchText.length > 0) }" />
                <PrimeInputText @keyup="onFilterChange" type="search" v-model="searchText" placeholder="Search files" class="flex-grow-1" size="small" style="max-width: 600px;" />
            </PrimeIconField>
        </div>

        <div v-if="tags.length > 0" class="flex flex-grow gap-2">
            <PrimeMultiSelect
                @change="onFilterChange"
                v-model="selectedTags"
                display="comma"
                :maxSelectedLabels="3"
                :options="tagOptions"
                optionLabel="name"
                placeholder="Select tags" />
            <PrimeDropdown
                @change="onFilterChange"
                v-model="selectedSort"
                :options="sortOptions"
                optionLabel="name"
                placeholder="Sort by" />
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { type SundraTag, type SundraFile } from '@/types/sundra'

    interface FilterItem { tags?: SundraTag[] }
    interface SelectOption { name: string, value: string, count?: number }

    const { debug } = useRuntimeConfig().public
    const filtered = defineModel<FilterItem[]>('filtered', { required: true })
    const props = defineProps({
        tags: {
            type: Array<SundraTag>,
            required: true
        },
        items: {
            type: Array<SundraFile>,
            required: true
        },
    })

    const searchText = ref<string>('')
    const selectedTags = ref<SelectOption[]>()
    const tagOptions = ref<SelectOption[]>([])
    watch(props.tags, (newTags) => {
        if (debug) { console.log("FilterBar::watch:tags", props.tags, tagOptions.value) }
        let noneCount = 0
        tagOptions.value = []
        if (newTags != null) {
            newTags?.forEach(tag => { tagOptions.value.push({ name: tag.tag, value: tag.slug, count: Number(tag.tagged_files) }) })
        }
        props.items.forEach(item => { if (item.tags == null || item.tags.length == 0) { noneCount++ } })
        tagOptions.value.push({ name: 'No tags', value: 'none', count: noneCount })
    }, { deep: true, immediate: true })

    const selectedSort = ref({ name: 'Newest first', value: 'created_at,desc'})
    const sortOptions = ref([
        { name: "Newest first", value: 'created_at,desc' },
        { name: "Oldest first", value: 'created_at,asc' },
        { name: "Name A-Z", value: 'name,asc' },
        { name: "Name Z-A", value: 'name,desc' },
        { name: "Longest first", value: 'duration,desc' },
        { name: "Shortest first", value: 'duration,asc' }
    ])

    const onFilterChange = () => {
        let results: any[] = []
        // Tags
        console.log('tags', selectedTags.value)
        if (selectedTags.value != null && (selectedTags.value as []).length > 0) {

            let found = props.items.filter((item) => (
                item.tags?.some(t => ((selectedTags.value as SelectOption[]).some(f => f.value == t.slug )))
            ))

            console.log('found', found)
            if (found != null) { results = found }
        } else { results = props.items }

        // Text
        if (searchText.value.trim().length > 0) {
            results = results.filter((item) => {
                if (item.description?.toLocaleLowerCase().includes(searchText.value.trim().toLocaleLowerCase()) ||
                    item.name?.toLocaleLowerCase().includes(searchText.value.trim().toLocaleLowerCase()) ||
                    item.title?.toLocaleLowerCase().includes(searchText.value.trim().toLocaleLowerCase()) ||
                    item.filename?.toLocaleLowerCase().includes(searchText.value.trim().toLocaleLowerCase())) {
                    return item
                }
            })
        }
        // Sort
        let [sortType, sortDirection] = (selectedSort.value != null && selectedSort.value.value != null && selectedSort.value.value != ''
                                            ? (selectedSort.value?.value as string).split(',')
                                            : ['created_at', 'asc'])
        results.sort((a, b) => {
            switch (sortType) {
                case "created_at":
                    if (a.created_at != null && b.created_at != null) {
                        let aDate = new Date(a.created_at)
                        let bDate = new Date(b.created_at)
                        if (sortDirection == 'asc') {
                            if (aDate > bDate) { return 1 }
                            else if (aDate < bDate) { return -1 }
                        } else {
                            if (aDate < bDate) { return 1 }
                            else if (aDate > bDate) { return -1 }
                        }
                    }
                    return 0

                case "name":
                    if (a.title != null && b.title != null) {
                        if (sortDirection == 'asc') { return a.title.localeCompare(b.title) }
                        else { return -(a.title.localeCompare(b.title)) }
                    }
                    return 0

                case "duration":
                    const aL = Number(a.audio?.duration ?? a.video?.duration)
                    const bL = Number(b.audio?.duration ?? b.video?.duration)
                    if (sortDirection == 'asc') {
                        if (aL > bL) { return 1 }
                        else if (aL < bL) { return -1 }
                    } else {
                        if (aL < bL) { return 1 }
                        else if (aL > bL) { return -1 }
                    }
                    return 0
            }
            return 0
        })

        filtered.value.splice(0)
        filtered.value.push(...results)
    }

    const refresh = () => { onFilterChange() }
    onMounted(() => refresh())

    defineExpose({ refresh })
</script>

<style>

</style>