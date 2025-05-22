<template>
    <div class="flex flex-column align-items-center my-4">
        <div v-if="title != null" class="text-center">
            <template v-if="isLoading">
                <h3 class="text-xl">Loading</h3>
                <p style="line-height: 1.5em;">Content is being fetched and loaded</p>
            </template>
            <template v-else>
                <h3 v-html="title" class="text-xl"></h3>
                <p v-html="description" style="line-height: 1.5em;"></p>
            </template>
        </div>
        <img v-if="isLoading" :src="`/images/hero/maintenance.svg`" :style="imageStyle ?? 'height: 400px; margin-bottom: 20px;'" />
        <img v-else :src="`/images/hero/${hero}.svg`" :style="imageStyle ?? 'height: 400px; margin-bottom: 20px;'" />
        <PrimeButton
            v-if="!isLoading && button != null"
            @click="$emit('addNewContent', type)"
            :label="button"
            v-primeripple
            class="my-auto"
            style="min-width: 245px;" />
    </div>
</template>

<script setup lang="ts">
    interface Props {
        type: string,
        hero: string,
        title?: string|null,
        description?: string|null,
        button?: string,
        imageStyle?: string,
        isLoading: boolean
    }

    const props = withDefaults(defineProps<Props>(), {
        hero: 'searching',
        isLoading: true
    })
</script>

<style scoped>

</style>