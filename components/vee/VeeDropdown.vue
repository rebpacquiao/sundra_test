<template>
    <span :class="{ 'p-float-label': hasLabel }">
        <PrimeDropdown
            :id="name"
            :label="label"
            :options="options"
            :aria-describedby="`${name}-error`"
            :placeholder="placeholder"
            :optionLabel="optionLabel"
            :optionValue="optionValue"
            :class="{ 'no-float': !hasLabel }"
            inputClass="text-overflow-ellipsis"
            v-model="value"
            v-bind="$attrs"
            class="w-full" />
            <label v-if="hasLabel" :for="name">{{ label }}</label>
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
        hasLabel: {
            type: Boolean,
            default: true
        },
        default: {}
    });

    const { errorMessage, value } = useField(toRef(props, 'name'));
    if (props.default != undefined) {
        value.value = props.default
    }

    const prepend = ref(props.label);

    defineExpose({ errorMessage, value })
</script>

<style scoped>
.no-float:deep(.p-inputtext) {
    margin-top: 0px !important;
    margin-bottom: 0px !important;
}
/*
.no-float::v-deep .p-inputtext::before {
    content: "Sort by: "
}
*/
</style>