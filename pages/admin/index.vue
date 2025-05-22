<template>
    <div class="flex flex-row h-full">
        <!-- SUBNAV -->
        <div class="bg-surface w-14rem pl-4 pt-4 pr-2 text-700" style="background-color: #F9F9F9;">

            <b><i class="pi pi-receipt mr-2" style="font-size: 0.9rem" />Users</b>
            <ul class="m-0 mb-2" style="list-style: circle;">
                <li class="mt-2"><NuxtLink to="/admin/users/create" class="text-700 no-underline" style="font-size: 0.9rem;">Create</NuxtLink></li>
            </ul>
        </div>
        <!-- /SUBNAV -->
        <div class="flex flex-grow-1 align-items-start justify-content-start mx-4 mt-4 px-2 gap-5">

        </div>
    </div>
</template>

<script lang="ts" setup>
    import Color from 'color'
    import { usePageStore } from '@/stores/PageStore'

    const pageStore = usePageStore()
    pageStore.setName('Admin')
    pageStore.setShowHeader(true)
    pageStore.setBgColor(Color('#FFF'))
    pageStore.setShowClose(true)
    pageStore.setCloseClickCallback(async () => {
        return await navigateTo('/captions')
    })

    definePageMeta({
        title: 'Admin',
        layout: 'fullpage'
    })
</script>

<style>

</style>