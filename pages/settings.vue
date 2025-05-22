<template>
    <form class="p-5 flex-auto xl:ml-5" @submit.prevent="submitForm">
        <div class="flex gap-5 flex-column-reverse md:flex-row xl:w-6">
            <div class="flex-auto p-fluid">
                <div class="mb-4">
                    <label for="name" class="block font-normal text-900 mb-2">Name</label>
                    <PrimeInputText id="name" type="text" v-model="formData.name" @change="v$.name.$touch" />
                </div>
                <PrimeDivider />
                <div class="mb-4">
                    <label for="password_old" class="block font-normal text-900 mb-2">Password (old)</label>
                    <PrimePassword id="password_old" type="text" v-model="formData.passwordOld" @change="v$.passwordOld.$touch" />
                </div>
                <div class="mb-4">
                    <label for="password" class="block font-normal text-900 mb-2">Password (new)</label>
                    <PrimePassword id="password" type="text" v-model="formData.password" @change="v$.password.$touch" />
                </div>
                <div class="mb-4">
                    <label for="password_confirmation" class="block font-normal text-900 mb-2">Password (confirm)</label>
                    <PrimePassword id="password_confirmation" type="text" v-model="formData.passwordConfirmation" @change="v$.passwordConfirmation.$touch" />
                </div>
                <div>
                    <PrimeMessage v-for="error of v$.$errors" :key="error.$uid" :closable="true" severity="error">{{ error.$message }}</PrimeMessage>
                    <PrimeButton label="Update" class="w-auto mt-3" type="submit" />
                </div>
            </div>
            <!-- div class="flex flex-column align-items-center flex-or">
                <span class="font-normal text-900 mb-2">Profile Picture</span>
                <img src="images/blocks/avatars/circle-big/avatar-f-2.png" class="h-10rem w-10rem"/>
                <PrimeButton type="button" icon="pi pi-pencil" class="p-button-rounded -mt-4"></PrimeButton>
            </div -->
        </div>
    </form>
</template>

<script setup lang="ts">
    import { usePageStore } from '@/stores/PageStore'
    import { useAuthStore } from '@/stores/AuthStore'
    import { useVuelidate } from '@vuelidate/core';
    import { required, sameAs, requiredIf, minLength, helpers } from '@vuelidate/validators';

    const pageStore = usePageStore()
    pageStore.setName('Settings')

    const authStore = useAuthStore()
    /** FORM VALIDATION */
    const formData = reactive({
        name: authStore.user?.name,
        password: '',
        passwordConfirmation: '',
        passwordOld: ''
    })
    const rules = computed(() => {
        return {
            name: {
                required: helpers.withMessage('The name field is required', required),
            },
            passwordOld: {
                required: helpers.withMessage('The old password field is required', requiredIf((formData.password.length > 0))),
            },
            password: {
                required: helpers.withMessage('The password field is required', requiredIf((formData.passwordOld.length > 0))),
                minLength: minLength(8),
            },
            passwordConfirmation: {
                required: helpers.withMessage('The password confirmation field is required', requiredIf((formData.password.length > 0))),
                sameAs: helpers.withMessage("Passwords don't match", sameAs(formData.password)),
            },
        }
    })
    const v$ = useVuelidate(rules, formData)
    const submitForm = () => {
        v$.value.$validate()
        if (!v$.value.$error) {
            if (formData.name !== undefined && formData.name.length > 0) {
                authStore.updateUserInfo(formData.name)
            }

            if (formData.password.length > 0) {
                authStore.updateUserPassword(formData.passwordOld, formData.password, formData.passwordConfirmation)
            }
        }
    }

    definePageMeta({
        title: 'Settings'
    })
</script>

<style scoped>

</style>