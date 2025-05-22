<template>
    <i v-html="svg" />
</template>

<script lang="ts" setup>
    const props = defineProps({
        icon: {
            type: String,
            required: true,
        }
    })

    const modules = import.meta.glob('../../assets/icons/**/*.svg', {
        as: 'raw',
        eager: true,
    })
    const svg = computed(() => {
        return modules['../../assets/icons/' + props.icon + '.svg'] ?? modules['../../assets/icons/close.svg']
    })
</script>