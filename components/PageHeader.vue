<template>
    <div :class="{ 'justify-content-center': showStepper, 'justify-content-between': !showStepper }" class="flex align-items-center align-content-center border-bottom-1 surface-border relative md:static" style="height: 60px;">
        <template v-if="!fullpage">
            <div v-if="showStepper" class="flex justify-content-between">
                <div class="flex align-items-center">
                    <PrimeBadge value="1" :class="{ active: (step == 1), spent: (step > 1)}" class="s-nav" />
                    <h4 :class="{ active: (step == 1)}" class="s-nav ml-2">Video recording</h4>
                    <hr noshade class="mx-4 s-nav" style="background-color: #D9D9D9; width: 30px;" size="1" />
                    <PrimeBadge value="2" :class="{ active: (step == 2), spent: (step > 2)}" class="s-nav" />
                    <h4 :class="{ active:(step == 2)}" class="s-nav ml-2">Video details</h4>
                    <hr noshade class="mx-4 s-nav" size="1" />
                    <PrimeBadge value="3" :class="{ active: (step == 3)}" class="s-nav" />
                    <h4 :class="{ active:(step == 3)}" class="s-nav ml-2">Design</h4>
                </div>
            </div>
            <div v-else class="flex flex-grow-1 align-items-center">
                <div class="flex align-items-center gap-3 lg:pl-6 md:pl-4 pl-2">
                    <VeeInputText v-if="editable" name="name" label="Name" type="text" :has-label="false" :default="name" class="header-input" />
                    <h3 v-else class="s-nav">{{ name }} </h3>
                    <SvgIcon v-if="icon != null" @click="iconClickCallback" :icon="icon" class="mt-1" style="width: 20px;" />
                </div>
            </div>
            <a v-primeripple class="cursor-pointer block md:hidden text-700 mr-3 mt-1 p-ripple" style="margin-left: auto;"
                v-primestyleclass="{ selector: '#app-sidebar-1', enterClass: 'hidden', enterActiveClass: 'fadeinleft', leaveToClass: 'hidden', leaveActiveClass: 'fadeoutleft', hideOnOutsideClick: true }">
                <i class="pi pi-bars text-4xl"></i>
            </a>
        </template>
        <template v-else>
            <div class="ml-4"><a @click="closeClickCallback"><PrimeImage src="/images/sundra-logo.png" alt="Sundra.io" height="30" class="cursor-pointer" /></a></div>
            <h3 class="s-nav mr-5 pr-5">{{ name }}</h3>
            <SvgIcon @click="closeClickCallback" icon="close" class="mt-1 mr-3 cursor-pointer" :class="{ hidden: !showClose }" style="width: 24px;" />
        </template>
    </div>
</template>

<script setup lang="ts">
    import { usePageStore } from '@/stores/PageStore'
    import { storeToRefs } from 'pinia'

    const pageStore = usePageStore()
    const { icon, iconClickCallback, closeClickCallback } = storeToRefs(pageStore)

    interface Props {
        name: string,
        showStepper: boolean,
        showClose?: boolean,
        fullpage?: boolean,
        step: number,
        editable: boolean
    }
    const props = withDefaults(defineProps<Props>(), {
        name: 'Dashboard',
        showStepper: false,
        showClose: true,
        fullpage: false,
        step: 0,
        button: null,
        editable: false
    })
</script>

<style>
.header-input {
    border  : none;
    padding : 0 10px;
    margin  : 0;
    background: none;
    transition: none;
    font-style: normal;
    font-weight: 500;
    font-size: 20px;
    color: #22031F;
    text-transform: capitalize;
}
.header-input.p-inputtext:enabled:focus{
    border: none !important;
    box-shadow: none !important;
}

.s-nav.p-badge {
    display: block;
    text-align: center;
}
.s-nav.p-badge.active {
    background-color: #9FF7B5;
}
.s-nav.p-badge.spent {
    color: #fff;
    background-color: #D9D9D9;
}

</style>