<template>
    <span class="p-float-label">
        <PrimeCalendar
            :id="name"
            :aria-describedby="`${name}-error`"
            :class="{ 'p-invalid': errorMessage }"
            v-model="value"
            v-bind="$attrs" />
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
    });

    const { errorMessage, value } = useField<Date | Date[]>(toRef(props, 'name'));
    defineExpose({ errorMessage, value })
</script>

<style scoped>
</style>