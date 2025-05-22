<template>
    <PrimeSelectButton
        :id="name"
        :options="options"
        :optionLabel="optionLabel"
        :aria-describedby="`${name}-error`"
        class="s-selectButton"
        v-model="value"
        v-bind="$attrs" />
    <small :id="`${name}-error`" class="p-error pl-2 ml-1">{{ errorMessage }}</small>
</template>

<script setup lang="ts">
    import { useField } from 'vee-validate';

    const props = defineProps({
        name: {
            type: String,
            required: true
        },
        optionLabel: {
            type: String,
            required: true
        },
        options: {
            type: Array,
            required: true
        },
        minWidth: {
            type: Number,
            default: 0
        }
    });

    const { errorMessage, value } = useField(toRef(props, 'name'))
    defineExpose({ errorMessage, value })
</script>

<style>
.s-selectButton > * {
    font-size: 14px;
    padding: 0.4em 0.5em;
    min-width: v-bind(minWidth+'px');
}
</style>