<template>
    <div class="flex flex-row h-full xl:w-9 l:w-full">
        <!-- SUBNAV -->
        <div class="bg-surface w-14rem pl-4 pt-4 pr-2 text-700" style="background-color: #F9F9F9;">

            <b><i class="pi pi-receipt mr-2" style="font-size: 0.9rem" />Users</b>
            <ul class="m-0 mb-2" style="list-style: circle;">
                <li class="mt-2" style="list-style: disc;"><NuxtLink to="/admin/users/create" class="text-700 no-underline" style="font-size: 0.9rem;">Create</NuxtLink></li>
            </ul>
        </div>
        <!-- /SUBNAV -->
        <form class="flex flex-grow-1 align-items-start justify-content-start mx-4 mt-4 px-2 gap-5" @submit.prevent="submitForm">

            <div class="flex-auto">
                <div class="flex gap-4">
                    <div class="flex-grow-1">
                        <label for="name" class="block font-normal text-900 mb-2">Buyer (Company name)</label>
                        <PrimeInputText id="name" type="text" v-model="formData.name" @change="v$.name.$touch" class="w-full" />
                    </div>
                    <div class="flex-grow-1">
                        <label for="ssn" class="block font-normal text-900 mb-2">SSN (Kennitala)</label>
                        <PrimeInputText id="ssn" type="text" v-model="formData.ssn" class="w-5" />
                    </div>
                </div>
                <div class="flex gap-4 mt-4">
                    <div class="flex-grow-1">
                        <label for="email" class="block font-normal text-900 mb-2">Email</label>
                        <PrimeInputText id="email" type="text" v-model="formData.email" @change="v$.email.$touch" class="w-full" />
                    </div>
                    <div class="flex-grow-1">
                        <label for="password" class="block font-normal text-900 mb-2">Password</label>
                        <PrimePassword id="password" type="text" v-model="formData.password" @change="v$.password.$touch" class="w-5" />
                    </div>
                </div>
                <PrimeDivider class="w-9" />
                <div class="flex gap-4">
                    <div>
                        <label for="monthly" class="block font-normal text-900 mb-2">Monthly subscription (ISK)</label>
                        <PrimeInputText id="monthly" type="text" v-model="formData.pMonthly" @change="v$.pMonthly.$touch" class="w-full" />
                    </div>
                    <div>
                        <label for="minutes" class="block font-normal text-900 mb-2">Price per extra hour (ISK)</label>
                        <PrimeInputText id="minutes" type="text" v-model="formData.pMinutes" @change="v$.pMinutes.$touch" class="w-full" />
                    </div>
                </div>
                <div class="flex gap-4 mt-4">
                    <div>
                        <label for="hours" class="block font-normal text-900 mb-2">Included hours</label>
                        <PrimeInputText id="hours" type="text" v-model="formData.fHours" @change="v$.fHours.$touch" class="w-full" />
                    </div>
                    <div>
                        <label for="gb" class="block font-normal text-900 mb-2">Storage (GB)    </label>
                        <PrimeInputText id="gb" type="text" v-model="formData.fSpace" @change="v$.fSpace.$touch" class="w-full" />
                    </div>
                    <div class="flex-grow-1">
                        <label for="users" class="block font-normal text-900 mb-2">Users (#)</label>
                        <PrimeInputText id="users" type="text" v-model="formData.users" @change="v$.users.$touch" class="w-3" />
                    </div>
                </div>
                <PrimeDivider class="w-9" />
                <div class="w-9">
                    <PrimeMessage v-for="error of v$.$errors" :key="error.$uid" :closable="true" severity="error">{{ error.$message }}</PrimeMessage>
                    <PrimeButton label="Create" class="w-auto" type="submit" style="float: right;" />
                </div>
            </div>

        </form >
    </div>
</template>

<script lang="ts" setup>
    import Color from 'color'
    import { usePageStore } from '@/stores/PageStore'
    import { useAuthStore } from '@/stores/AuthStore'
    import { useToast } from "primevue/usetoast"
    import { useVuelidate } from '@vuelidate/core';
    import { required, minLength, helpers } from '@vuelidate/validators';

    const toast = useToast()
    const authStore = useAuthStore()
    const pageStore = usePageStore()
    pageStore.setName('Admin - Create user')
    pageStore.setShowHeader(true)
    pageStore.setBgColor(Color('#FFF'))
    pageStore.setShowClose(true)
    pageStore.setCloseClickCallback(async () => {
        return await navigateTo('/captions')
    })

    definePageMeta({
        title: 'Admin - Create user',
        layout: 'fullpage'
    })

    const formData = reactive({
        name: '',           ssn: '',
        email: '',          password: '',
        pMonthly: '49900',  pMinutes: '6600',
        fHours: '20',       fSpace: '500',
        users: '3',         contact: ''
    })

    const rules = computed(() => {
        return {
            name: { required: helpers.withMessage('The name field is required', required), },
            email: { required: helpers.withMessage('The email field is required', required), },
            password: {
                required: helpers.withMessage('The password field is required', required),
                minLength: minLength(8),
            },
            pMonthly: { required: helpers.withMessage('The monthly price is required', required), },
            pMinutes: { required: helpers.withMessage('The price per minute is required', required), },
            fHours: { required: helpers.withMessage('The number of free hours is required', required), },
            fSpace: { required: helpers.withMessage('The free disk space amount is required', required), },
            users: { required: helpers.withMessage('The amount of users is required', required), }
        }
    })
    const v$ = useVuelidate(rules, formData)

    const submitForm = async () => {
        v$.value.$validate()
        if (!v$.value.$error) {
            const response = await authStore.createUser({
                name: formData.name,
                email: formData.email,
                ssn: formData.ssn,
                password: formData.password,
                price_monthly: Number(formData.pMonthly),
                price_minutes: Number(formData.pMinutes),
                hours: Number(formData.fHours),
                space: Number(formData.fSpace),
                users: Number(formData.users),
                contact: formData.contact
            })
            if (response != null) {
                toast.add({ severity: 'success', detail: `User successfully created. Don't forget the password: '${formData.password}'`, group: 'toastAlerts', life: 3000 })
                formData.name = ''
                formData.email = ''
                formData.ssn = ''
                formData.password = ''
            } else {
                toast.add({ severity: 'error', detail: `An error occurred while trying to create a user: ${authStore.error}`, group: 'toastAlerts', life: 3000 })
            }
        }
    }
</script>

<style>

</style>