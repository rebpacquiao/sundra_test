<template>
    <div v-if="isDisplayingText"
        style="white-space: pre-line;"
        class="absolute text text-center"
        :class="{
            hidden: !showing, 'text-stroke': showStroke,
            top: (top != null), bottom: (bottom != null),
            left: (left != null), right: (right != null)
        }">
        <div :class="{ background: showBackground }">{{ text }}</div>
    </div>
</template>

<script lang="ts" setup>
    import { type ParsedSrtFormat } from '@/types/sundra'

    const { debug } = useRuntimeConfig().public
    const props = defineProps({
        subtitles: {
            type: Array<ParsedSrtFormat>,
            required: true
        },
        currentTime: {
            type: Number,
            required: true
        },
        showing: {
            type: Boolean,
            default: true
        },
        font: {
            type: String,
            default: 'Roboto'
        },
        size: {
            type: String,
            default: '18px'
        },
        weight: {
            type: String,
            default: '800'
        },
        color: {
            type: String,
            default: '#fff'
        },
        stroke: {
            type: String,
            default: '#000'
        },
        showStroke: {
            type: Boolean,
            default: true
        },
        background: {
            type: String,
            default: '#000'
        },
        showBackground: {
            type: Boolean,
            default: false
        },
        top: {
            type: String,
            default: null
        },
        bottom: {
            type: String,
            default: null
        },
        left: {
            type: String,
            default: null
        },
        right: {
            type: String,
            default: null
        },
        height: {
            type: String,
            default: '100px'
        },
        width: {
            type: String,
            default: '100%'
        }
    })

    const isDisplayingText = ref<boolean>(false)
    const text = ref<string>()
    const update = (time: number) => {
        const found = props.subtitles.find((i) => i.startSeconds <= time && i.endSeconds >= time)
        if (found != null) {
            isDisplayingText.value = true
            text.value = found.text
        } else {
            text.value = ''
            isDisplayingText.value = false
        }
    }
    watch(() => props.currentTime, (n) => update(n))

    defineExpose({ update })
</script>

<style scoped>
    div.text {
        font-family: v-bind('props.font');
        font-size: v-bind('props.size');
        font-weight: v-bind('props.weight');
        color: v-bind('props.color');
        height: v-bind('props.height');
        width: v-bind('props.width');
    }

    div.top {
        top: v-bind('props.top');
    }
    div.bottom {
        bottom: v-bind('props.bottom');
    }
    div.left {
        left: v-bind('props.left');
    }
    div.right {
        right: v-bind('props.right');
    }

    div.background {
        display: inline-block;
        padding: 2px 5px;
        background-color: v-bind('props.background');
    }

    div.text-stroke {
        -webkit-text-stroke-width: 1px;
        -webkit-text-stroke-color: v-bind('props.stroke');
    }
</style>