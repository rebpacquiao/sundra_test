<template>
    <PrimeDialog :visible="visible" :header="props.header" :style="{ width: props.width }" :draggable="props.draggable" :closable="false" modal>
        <div class="flex gap-2">
            <PrimeTag @click="onSetActiveClick('extend')" value="Extend" class="cursor-pointer" :class="{ inactive: activeTab != 'extend' }" style="min-width: 100px;" rounded />
            <PrimeTag @click="onSetActiveClick('shift')" value="Shift" class="cursor-pointer" :class="{ inactive: activeTab != 'shift' }" style="min-width: 100px;" rounded />
        </div>
        <!-- FLOAT -->
        <div class="hidden gap-2 flex-column py-2 mt-2" :class="{ flex: activeTab == 'extend' }" style="min-height: 100px;">
            <div class="text-sm mb-4">This will extend the end time for every line. </div>
            <div class="flex align-items-center justify-content-center gap-2 p-fluid">
                <div class="flex-none text-sm">Extend the time by</div>
                <PrimeInputNumber v-model="milliseconds" locale="en-US" :maxFractionDigits="0" :allowEmpty="false" style="width: 100px;" />
                <div class="text-sm">milliseconds</div>
            </div>
        </div>
        <!-- SHIFT -->
        <div class="hidden gap-2 flex-column py-2 mt-2" :class="{ flex: activeTab == 'shift' }" style="min-height: 100px;">
            <div class="text-sm mb-4">This will shift the timing for every line in this captions box. </div>
            <div class="flex align-items-center justify-content-center gap-2 p-fluid">
                <div class="flex-none text-sm">Shift the time by</div>
                <PrimeInputNumber v-model="milliseconds" locale="en-US" :maxFractionDigits="0" :allowEmpty="false" style="width: 100px;" />
                <div class="text-sm">milliseconds</div>
            </div>
        </div>

        <template #footer>
            <PrimeButton label="Cancel" text v-primeripple size="small" @click="hide" class="no-underline hover-purple" style="max-height: 36px;" autofocus />
            <PrimeButton label="Change" outlined v-primeripple size="small" @click="onChangeClick" class="no-underline hover-purple" icon="pi pi-exclamation-circle" style="max-height: 36px;" autofocus />
        </template>
    </PrimeDialog>
</template>

<script lang="ts" setup>
    const { debug } = useRuntimeConfig().public

    const milliseconds = ref<number>(0.0)
    const visible = defineModel("visible", { type: Boolean })
    const props = defineProps({
        slug: {
            type: String,
            required: true
        },
        header: {
            type: String,
            default: 'Change timing'
        },
        width: {
            type: String,
            default: '25rem'
        },
        draggable: {
            type: Boolean,
            default: false
        }
    })

    const emit = defineEmits<{
        (e: 'onChangeTiming', action: 'extend'|'shift', ms: number): void
    }>()

    const activeTab: Ref<'extend'|'shift'> = ref('extend')
    const onSetActiveClick = (tab: 'extend'|'shift') => { activeTab.value = tab }
    const onChangeClick = async () => {
        if (milliseconds.value != 0) {
            emit('onChangeTiming', activeTab.value, milliseconds.value)
        }
        hide()
    }
    const hide = () => { visible.value = false }
</script>

<style scoped>
.inactive {
    background-color: #ccc;
}
</style>