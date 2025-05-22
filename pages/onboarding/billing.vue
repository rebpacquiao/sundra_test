<template>
    <div class="grid grid-nogutter">
        <div class="col-12 md:px-2 lg:px-0 lg:col-offset-2 lg:col-4 flex justify-content-end">
            <div class="surface-card p-4 border-round border-noround-right w-full" style="background-color: #F9F9F9 !important;">
                <div class="text-center mb-3">
                    <div class="auth-header">Choose your ideal plan</div>
                </div>

                <div class="flex flex-column justify-content-center flex-grow-1 text-center auth-muted large mb-3">
                    <PrimeProgressBar :showValue="false" :value="100" class="mb-3"
                                    :pt="{
                                        root: { style: { height: '0.8rem' } },
                                        value: { style: { background: 'linear-gradient(270deg, #C366FF 0%, #9FF7B5 100%)' } }
                                    }" />
                    <span>Payment details - Step 2 of 2</span>
                </div>


                <div class="flex flex-column justify-content-center align-items-center mb-3">
                    <div class="flex justify-content-center align-items-center gap-2 text-sm">
                        <b class="font-medium">Monthly</b>
                        <PrimeInputSwitch v-model="selectedPeriod" true-value="yearly" false-value="monthly"  />
                        <b class="font-medium">Annually</b>
                        <PrimeTag severity="success" value="Save 20%"
                            :pt="{
                                root: { style: { 'padding': '2px 3px' } },
                                value: { style: { 'font-weight': '500', color: '#22031F' } }
                            }" />
                    </div>
                </div>

                <div class="flex flex-row justify-content-center">
                    <div class="flex flex-column justify-content-center align-items-center">
                        <div class="flex justify-content-center align-items-center">
                            <!-- div class="tiers free cursor-pointer" :class="{ active: (selectedTier == 'creator') }" @click="selectedTier = 'creator'">Creator</div -->
                            <div class="tiers free cursor-pointer" :class="{ active: (selectedTier == 'producer') }" @click="selectedTier = 'producer'">Producer</div>
                            <div class="tiers platinum cursor-pointer" :class="{ active: (selectedTier == 'broadcaster') }" @click="selectedTier = 'broadcaster'">Broadcaster</div>
                        </div>
                    </div>
                </div>

                <div class="mb-2">
                    <div ref="paymentModalContent" id="paymentModalContent" class="py-3" style="min-height: 300px;">
                        <div id="updatePaymentSkeleton" class="flex justify-content-between align-content-center">
                            <div class="flex flex-column w-full gap-2">
                                <div class="flex align-content-center">
                                    <PrimeSkeleton height="3rem" borderRadius="16px" />
                                </div>
                                <div class="flex align-content-center gap-2">
                                    <PrimeSkeleton height="3rem" borderRadius="16px" />
                                    <PrimeSkeleton height="3rem" borderRadius="16px" />
                                </div>
                                <div class="flex align-content-center gap-2">
                                    <PrimeSkeleton height="3rem" borderRadius="16px" />
                                </div>
                                <div class="flex align-content-center">
                                    <PrimeSkeleton height="3rem" borderRadius="16px" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-content-end mb-2">
                        <a @click="onCouponClick" href="#" class="text-primary text-sm">
                            <template v-if="coupon != null && coupon.length > 0"><b>Coupon code:</b> {{ coupon }}</template>
                            <template v-else>I have a coupon</template>
                        </a>
                    </div>
                    <NotificationBar v-if="error != null" :icon="true" :closable="false" position="center" :type="SundraNotificationType.Error" :message="error" class="mb-3" />
                    <div class="flex justify-content-center w-full">
                        <PrimeButton label="Sign up" class="w-full" @click="onClickPaymentSave" />
                    </div>
                </div>
                <div class="auth-muted text-center">
                    <span>You can cancel, upgrade or downgrade your plan at any time.</span>&nbsp;
                </div>
            </div>
        </div>
        <div class="hidden lg:col-6 lg:flex justify-content-start">
            <div class="flex align-items-center border-round border-noround-left bg-cover bg-center tiers-box" :class="selectedTier">

                <!-- CREATOR -->
                <div v-if="selectedTier == 'creator'" class="flex flex-column flex-grow-1 justify-content-start align-items-center">
                    <div class="tiers-info p-5 border-round w-7" style="background-color: #9538F6CC !important;">
                        <p class="header">Creator plan</p>
                        <div class="flex justify-content-start align-items-center" :class="{ 'mb-1': (selectedPeriod == 'yearly'), 'mb-4': (selectedPeriod == 'monthly') }">
                            <span v-if="selectedPeriod == 'yearly'" class="tiers-cost">{{ subscriptionTiers.creator.price.yearly.USD.toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2}) }}</span>
                            <span v-else-if="selectedPeriod == 'monthly'" class="tiers-cost">{{ subscriptionTiers.creator.price.monthly.USD.toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2}) }}</span>
                            {{ selectedPeriod == 'yearly' ? 'annually' : selectedPeriod }}
                        </div>
                        <div v-if="selectedPeriod == 'yearly'" class="mb-2 text-xs">
                            That's only <b class="text-mint">{{ Math.round(subscriptionTiers.creator.price.yearly.USD / 12).toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2}) }}</b> a month
                        </div>
                        <div v-for="item in subscriptionTiers.creator.lines" class="flex align-items-center pt-3 gap-2">
                            <SvgIcon icon="checkbox-broken" style="margin-top: 4px; width: 20px; color: #9FF7B5;" />
                            {{ item.replace('{CURRENCY}', subscriptionTiers.creator.price.per_minute.USD.toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2})) }}
                        </div>
                    </div>
                </div>
                <!-- PRODUCER -->
                <div v-else-if="selectedTier == 'producer'" class="flex flex-column flex-grow-1 justify-content-start align-items-center">
                    <div class="tiers-info p-5 border-round w-7" style="background-color: #9538F6CC !important;">
                        <p class="header">Producer plan</p>
                        <div class="flex justify-content-start align-items-center" :class="{ 'mb-1': (selectedPeriod == 'yearly'), 'mb-4': (selectedPeriod == 'monthly') }">
                            <span v-if="selectedPeriod == 'yearly'" class="tiers-cost">{{ subscriptionTiers.producer.price.yearly.USD.toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2}) }}</span>
                            <span v-else-if="selectedPeriod == 'monthly'" class="tiers-cost">{{ subscriptionTiers.producer.price.monthly.USD.toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2}) }}</span>
                            {{ selectedPeriod == 'yearly' ? 'annually' : selectedPeriod }}
                        </div>
                        <div v-if="selectedPeriod == 'yearly'" class="mb-2 text-xs">
                            That's only <b class="text-mint">{{ Math.round(subscriptionTiers.producer.price.yearly.USD / 12).toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2}) }}</b> a month
                        </div>
                        <div v-for="item in subscriptionTiers.producer.lines" class="flex align-items-center pt-3 gap-2">
                            <SvgIcon icon="checkbox-broken" style="margin-top: 4px; width: 20px; color: #9FF7B5;" />
                            {{ item.replace('{CURRENCY}', subscriptionTiers.producer.price.per_minute.USD.toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2})) }}
                        </div>
                    </div>
                </div>

                <!-- ENTERPRISE -->
                <div v-else-if="selectedTier == 'broadcaster'" class="flex flex-column flex-grow-1 justify-content-start align-items-center">
                    <div class="tiers-info p-5 border-round w-7" style="background-color: #9538F6CC !important;">
                        <p class="header">Broadcaster plan</p>
                        <div class="flex justify-content-start align-items-center" :class="{ 'mb-1': (selectedPeriod == 'yearly'), 'mb-4': (selectedPeriod == 'monthly') }">
                            <span v-if="selectedPeriod == 'yearly'" class="tiers-cost">{{ subscriptionTiers.broadcaster.price.yearly.USD.toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2}) }}</span>
                            <span v-else-if="selectedPeriod == 'monthly'" class="tiers-cost">{{ subscriptionTiers.broadcaster.price.monthly.USD.toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2}) }}</span>
                            {{ selectedPeriod == 'yearly' ? 'annually' : selectedPeriod }}
                        </div>
                        <div v-if="selectedPeriod == 'yearly'" class="mb-2 text-xs">
                            That's only <b class="text-mint">{{ Math.round(subscriptionTiers.broadcaster.price.yearly.USD / 12).toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2}) }}</b> a month
                        </div>
                        <div v-for="item in subscriptionTiers.broadcaster.lines" class="flex align-items-center pt-3 gap-2">
                            <SvgIcon icon="checkbox-broken" style="margin-top: 4px; width: 20px; color: #9FF7B5;" />
                            {{ item.replace('{CURRENCY}', subscriptionTiers.broadcaster.price.per_minute.USD.toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2})) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <PrimeOverlayPanel ref="couponOverlay">
        <div class="flex flex-column gap-2 w-20rem">
            <span class="text-sm text-900 block">Type in your coupon code</span>
            <PrimeInputText v-model="coupon" class="w-20rem" size="small" />
            <NotificationBar v-if="!isCouponValid" :icon="true" :closable="false" position="start" :type="SundraNotificationType.Error" message="That coupon wasn't valid :(" />
            <div class="flex gap-2 justify-content-end">
                <PrimeButton label="Save" size="small" severity="success" @click="onCouponAddClick" />
                <PrimeButton v-if="coupon != null && coupon.length > 0" label="Clear" size="small" severity="danger" @click="onCouponClearClick" />
                <PrimeButton v-else label="Cancel" size="small" severity="danger" @click="couponOverlay?.hide()" />
            </div>
        </div>
    </PrimeOverlayPanel>
</template>

<script setup lang="ts">
    import { type Stripe, type StripeElements, loadStripe } from '@stripe/stripe-js'
    import { SundraNotificationType } from '@/types/sundra'
    import { useAuthStore } from '@/stores/AuthStore'
    import { usePageStore } from '@/stores/PageStore'
    import subscriptionTiers from '~/assets/data/subscription-tiers.json'
    import Color from 'color'
    import type OverlayPanel from 'primevue/overlaypanel'

    const route = useRoute()
    const { debug, frontendUrl, stripe_api } = useRuntimeConfig().public;
    const paymentElements = ref<StripeElements|null>(null)
    const stripeJs: Stripe|null = await loadStripe(stripe_api.key)
    const error = ref<string|null>(null)
    const authStore = useAuthStore()
    const { user } = storeToRefs(authStore)
    const pageStore = usePageStore()
    pageStore.setName('Subscription')
    pageStore.setBgColor(Color('#FFFFFF'))
    const paymentModalContent = ref<HTMLDivElement>()
    const couponOverlay = ref<OverlayPanel>()
    const coupon = ref<string>()
    const isCouponValid = ref<boolean>(true)

    const selectedTier = ref<string>('producer')
    const selectedPeriod = ref<string>('monthly')
    onMounted(async () => {
        if (debug) { console.log(`Page::/onboarding/billing::onMounted`) }
        pageStore.setGreyedOut(false)
        if (authStore.authenticated) {
            if (user.value?.has_subscription && route.query.tier != null &&
                ['creator','producer','broadcaster', 'personal','business','enterprise'].includes(route.query.tier as string)
            ) { selectedTier.value = route.query.tier as string }

            if (stripeJs != null) {
                const intent = await authStore.fetchStripeIntent()
                if (intent != null && paymentModalContent.value != null) {
                    const options = {
                        clientSecret: intent,
                        billingDetails: 'auto',
                        allow_promotion_codes: true,
                        defaultValues: {
                            billingDetails: {
                                name: user.value?.name,
                                email: user.value?.email
                            }
                        },
                        //theme: 'flat',
                        appearance: {
                            variables: {
                                colorPrimary: '#C366FF',
                                colorBackground: '#fff',
                                //colorText: '#22031F',
                                colorDanger: '#DD155D',
                                colorIconTabSelected: '#fff',
                                spacingUnit: '2px',
                                borderRadius: '4px',
                            },
                            rules: {
                                '.Error': {
                                    fontSize: '10px'
                                }
                            }
                        }
                    }
                    paymentElements.value = stripeJs.elements(options)
                    const paymentElement = paymentElements.value.create('payment')
                    paymentElement.mount((paymentModalContent.value as HTMLElement))
                }
            }
        }
    })

    const onCouponClick = (event: MouseEvent) => {
        couponOverlay.value?.toggle(event)
    }
    const onCouponClearClick = () => {
        coupon.value = undefined
        isCouponValid.value = true
        couponOverlay.value?.hide()
    }
    const onCouponAddClick = async () => {
        isCouponValid.value = true
        if (coupon.value != null) {
            const doesExist = await authStore.checkCoupon(coupon.value)
            if (!doesExist) {
                coupon.value = undefined
                isCouponValid.value = false
            } else {
                couponOverlay.value?.hide()
            }
        } else {
            couponOverlay.value?.hide()
        }
    }

    const onClickPaymentSave = async () => {
        if (debug) { console.log(`Page::/subscription::onClickPaymentSave`) }
        pageStore.setGreyedOut(true)
        const currentIntent = await authStore.fetchStripeIntent()

        if (stripeJs != null && currentIntent != null && paymentElements.value != null) {
            const { setupIntent, error: stripeError } = await stripeJs.confirmSetup({
                elements: paymentElements.value,
                redirect: 'if_required',
                confirmParams: {
                    return_url: `${frontendUrl}/onboarding/billing`,
                }
            })
            if (stripeError) {
                error.value = stripeError.message as string
            } else if (setupIntent?.payment_method != null) {
                if (debug) { console.log(`Page::/onboarding/billing::onClickPaymentSave`) }
                const result = await authStore.createSubscription(selectedTier.value, selectedPeriod.value, setupIntent.payment_method.toString(), coupon.value)
                if (result) {
                    pageStore.setGreyedOut(false)
                    return await navigateTo('/dashboard')
                }
            } else {
                error.value = "An error occurred when verifying payment method. Please refresh and try again."
            }
        }
        pageStore.setGreyedOut(false)
    }

    definePageMeta({
        layout: "auth",
        title: 'Register'
    })
</script>

<style scoped>
.periods,
.tiers {
    color: #474747;
    font-size: 12px;
    font-weight: 600;
    font-style: normal;
    padding: 8px 25px;
    border-top: 1px solid #E7E7E7;
    border-bottom: 1px solid #E7E7E7;
    border-right: 1px solid #E7E7E7;
}
    .periods.monthly {
        border: 1px solid #E7E7E7;
        border-radius: 15px 0px 0px 15px;
    }
    .periods.yearly {
        border-radius: 0px 15px 15px 0px;
    }
    .periods.active {
        background: #EBCCFF;
    }

    .tiers.free {
        border: 1px solid #E7E7E7;
        border-radius: 15px 0px 0px 15px;
    }
    .tiers.platinum {
        border-radius: 0px 15px 15px 0px;
    }
    .tiers.active {
        background: #9FF7B5;
    }
    .tiers.disabled {
        color: #AAA;
        background: #E7E7E7;
    }

    .tiers-box {
        min-width: 500px;
    }
        .tiers-box.free,
        .tiers-box.personal{
            background: url('/images/tier-box-free.png');
        }
        .tiers-box.creator {
            background: url('/images/tier-box-creator.png');
        }
        .tiers-box.silver {
            background: url('/images/tier-box-silver.png');
        }
        .tiers-box.gold,
        .tiers-box.business {
            background: url('/images/tier-box-gold.png');
        }
        .tiers-box.producer {
            background: url('/images/tier-box-producer.png');
        }
        .tiers-box.platinum,
        .tiers-box.enterprise {
            background: url('/images/tier-box-platinum.png');
        }
        .tiers-box.broadcaster {
            background: url('/images/tier-box-broadcaster.png');
        }


    .tiers-info {
        color: #FFF;
        font-size: 16px;
        font-weight: 500;
    }
        .tiers-info > .header {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 30px;
        }
        .tiers-info > .header:first-letter {
            text-transform: uppercase;
        }
    .tiers-cost {
        color: #9FF7B5;
        font-size: 35px;
        font-weight: 700;
        margin-right: 5px;
    }

</style>