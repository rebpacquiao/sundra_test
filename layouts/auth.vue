<template>
    <div v-if="isGreyedOut" class="grey-out">
        <PrimeProgressSpinner
            strokeWidth="1"
            class="absolute"
            style="width: 25vw; height: 25vw; top: 25%; left: 40%;" />
    </div>
    <PrimeToast position="top-center" group="toastAlerts" />
    <div class="h-full gap-2 flex flex-column flex-grow-1 justify-content-start bg-no-repeat bg-cover" style="background: linear-gradient(317deg, #9538F6 12.6%, #C366FF 68.96%, #9FF7B5 94.01%);">
        <a href="/"><img src="/images/sundra-logo.png" alt="Sundra.io" class="m-4" style="max-height: 45px;" /></a>
        <slot />
    </div>
</template>

<script setup lang="ts">
    import { usePageStore } from '@/stores/PageStore'
    import { storeToRefs } from 'pinia'

    const pageStore = usePageStore()
    const { isGreyedOut } = storeToRefs(pageStore)
</script>

<style>
.auth-link {
    color: #9538F6;
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
}
.auth-link:hover {
    text-decoration: none;
}

.auth-header {
    color: #000;
    text-align: center;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
}
.auth-subheader {
    color: #474747;
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
}
.auth-muted {
    color: #474747;
    font-size: 12px;
    font-style: normal;
}
.auth-muted.large {
    font-size: 14px;
}

.p-progress-spinner-svg {
    animation: p-progress-spinner-color 1.5s linear infinite;
}
    @keyframes p-progress-spinner-color {
        100%, 40% {
            stroke: #9FF7B5;
        }
        40% {
            stroke: #EBCCFF
        }
        66% {
            stroke: #9538F6;
        }
        80%, 90% {
            stroke: #9FF7B5;
        }
    }
</style>