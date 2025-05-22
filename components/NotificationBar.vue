<template>
    <div class="flex flex-row flex-grow-1 align-items-center gap-2 s-notification px-2" :class="[`justify-content-${position}`, type, {border: border}, {radius: radius}]">
        <div class="flex flex-grow-1 align-items-center gap-2" :class="[`justify-content-${position}`]">
            <SvgIcon v-if="icon != null" :icon="i" :class="[type]" style="width: 20px; margin-top: 4px;" />
            <span v-if="isRaw" v-html="message"></span>
            <span v-else>{{ message }}</span>
            <span v-if="progress != null">{{ progress }}% completed.</span>
        </div>
        <div v-if="button && buttonCallback != null && buttonLabel != null" class="cursor-pointer"><a @click="buttonCallback">{{ buttonLabel }}</a></div>
        <div v-if="closable" class="flex cursor-pointer"><SvgIcon @click="$emit('close')" icon="close" style="width: 20px;"/></div>
    </div>
</template>

<script setup lang="ts">
    import { SundraNotificationType } from '@/types/sundra';

    interface Props {
        message: string,
        progress?: number|null,
        type?: SundraNotificationType|null,
        position?: 'start'|'center'|'end',
        icon?: boolean,
        border?: boolean,
        radius?: boolean,
        closable?: boolean,
        isRaw?: boolean,
        button?: boolean,
        buttonCallback?: (() => any)|null,
        buttonLabel?: string,
    }
    const props = withDefaults(defineProps<Props>(), {
        progress: null,
        type: null,
        position: 'start',
        icon: false,
        border: true,
        radius: true,
        closable: false,
        isRaw: false,
        button: false,
        buttonCallback: null
    })
    const emit = defineEmits<{
        (e: 'close'): void
    }>()

    const i = computed(() => {
        switch (props.type) {
            case 'success': return 'checkbox'
            case 'warning': return 'warning'
            case 'info':
            case 'error':
            default:
                return 'error'
        }
    })
</script>

<style scoped>
div.s-notification {
    height: 40px;
    max-height: 40px;
    background: #E7E7E7;
    color: #131313;
    font-family: 'Lato';
    font-size: 14px;
}
    div.s-notification.border {
        border: 1.5px solid #C2C2C2;
    }
    div.s-notification.radius {
        border-radius: 4px;
    }

    div.s-notification i.success {
        color: #61C47E;
    }
    div.s-notification.success {
        background: #DBFEE8;
    }
        div.s-notification.success.border {
            border: 1.5px solid #61C47E;
        }
    div.s-notification i.info {
        color: #81C1FF;
    }
    div.s-notification.info {
        background: #DCECFF;
    }
        div.s-notification.info.border {
            border: 1.5px solid #81C1FF;
        }
    div.s-notification i.warning {
        color: #F9D247;
    }
    div.s-notification.warning {
        background: #FFF9D2;
    }
        div.s-notification.warning.border {
            border: 1.5px solid #F9D247;
        }
    div.s-notification i.error {
        color: #E06890;
    }
    div.s-notification.error {
        background: #FFBDD4;
    }
        div.s-notification.error.border {
            border: 1.5px solid #E06890;
        }
</style>

<style>
div.s-notification a {
    color: #131313;
    text-decoration: underline;
}
</style>