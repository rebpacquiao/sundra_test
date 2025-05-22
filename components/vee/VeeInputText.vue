<template>
    <span :class="{ 'p-float-label': hasLabel }">
        <PrimeInputText
            :id="name"
            :aria-describedby="`${name}-error`"
            :class="{ 'p-invalid': errorMessage }"
            :type="type"
            v-bind="$attrs"
            v-model="value"
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
        type: {
            type: String,
            default: 'text',
        },
        hasLabel: {
            type: Boolean,
            default: true
        },
        default: {
            type: String
        }
    });

    const { errorMessage, setValue, value } = useField<string>(toRef(props, 'name'));
    if (props.default != null) {
        value.value = props.default
    }
    defineExpose({ errorMessage, setValue, value })
</script>

<style scoped>
</style>