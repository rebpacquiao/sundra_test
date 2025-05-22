<template>
    <PrimeMultiSelect
        :id="name"
        :options="options"
        :aria-describedby="`${name}-error`"
        :placeholder="placeholder"
        :optionLabel="optionLabel"
        :optionValue="optionValue"
        inputClass="text-overflow-ellipsis"
        v-model="value"
        v-bind="$attrs"
        class="w-full">
        <template #value="slotProps">
            <slot name="value" v-bind="slotProps"></slot>
        </template>
        <template #chip="slotProps">
            <slot name="chip" v-bind="slotProps"></slot>
        </template>
        <template #option="slotProps">
            <slot name="option" v-bind="slotProps"></slot>
        </template>
    </PrimeMultiSelect>

    <small :id="`${name}-error`" class="p-error pl-2 ml-1">{{ errorMessage }}</small>
</template>

<script setup lang="ts">
    import { useField } from 'vee-validate';

    const props = defineProps({
        name: {
            type: String,
            required: true,
        },
        options: {
            type: Array,
            required: true,
        },
        placeholder: {
            type: String,
            required: false
        },
        optionLabel: {
            type: String,
            default: "name"
        },
        optionValue: {
            type: String,
            default: "value"
        },
        default: {}
    });

    const { errorMessage, value } = useField(toRef(props, 'name'));
    if (props.default != undefined) {
        value.value = props.default
    }

    defineExpose({ errorMessage, value })
</script>

<style scoped>
</style>