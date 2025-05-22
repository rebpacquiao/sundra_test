<script setup lang="ts">
    import { useAuthStore } from '@/stores/AuthStore'
    const route = useRoute()
    const id = ref<number>(Number(route.params.uid))

    const authStore = useAuthStore()
    const result = await authStore.browseAs(id.value)
    if (result) {
        await navigateTo('/dashboard')
    }
</script>