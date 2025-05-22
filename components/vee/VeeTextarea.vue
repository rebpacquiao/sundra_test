<template>
    <span class="p-float-label">
        <PrimeTextarea
            :id="name"
            :rows="rows"
            :cols="cols"
            :aria-describedby="`${name}-error`"
            :class="{ 'p-invalid': errorMessage }"
            v-model="value"
            v-bind="$attrs"
            class="w-full" />
            <label :for="name">{{ label }}</label>
    </span>
    <small :id="`${name}-error`" class="p-error pl-2 ml-1">{{ errorMessage }}</small>
</template>

<script setup lang="ts">
    import { useField } from 'vee-validate';

    const props = defineProps({
        name: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            required: true,
        },
        rows: {
            type: String,
            default: '4',
        },
        cols: {
            type: String,
            default: '4',
        },
    });

    const { errorMessage, value } = useField<string>(toRef(props, 'name'));
    defineExpose({ errorMessage, value })
</script>

<style scoped>
</style>