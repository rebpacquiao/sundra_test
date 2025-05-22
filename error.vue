<template>
    <NuxtLayout name="404">
        <div class="relative flex flex-grow-1 border-1 justify-content-center align-items-center">
            <Empty
                @click="navigateTo('/dashboard')"
                class="w-6 cursor-pointer"
                type="404"
                hero="404" />
        </div>
    </NuxtLayout>
</template>

<script>
</script>

<style scoped>
.button {
    padding: 4px 6px;
    margin: 10px 0px;
    background: black;
    color: white;
}
</style>