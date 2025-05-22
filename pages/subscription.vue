<template>
    <div class="flex flex-column gap-4 m-5" style="max-width: 1200px;">
        <div class="flex flex-grow-1 justify-content-between align-items-center">
            <PrimeTabMenu v-model:activeIndex="tabActive" :model="tabItems" />
        </div>
        <!-- OVERVIEW -->
        <template v-if="tabActive == 0">
            <div class="flex flex-column flex-grow-1 justify-content-start bg-white border-round p-4 pb-5 gap-2 ml-2">
                <NotificationBar v-if="Boolean(billing?.subscription?.cancel_at_period_end)" :icon="true" :type="SundraNotificationType.Warning" :message="`You've cancelled your subscription and it will run out on ${dayjs(Number(billing?.subscription?.current_period_end) * 1000).format('DD.MM.YYYY')}. Hit the 'Restore subscription' link on the right to cancel your cancel`" class="mb-2" />
                <NotificationBar v-if="user?.has_subscription && overage != null" :icon="true" :type="SundraNotificationType.Info" :message="overage" class="mb-2" />
                <div class="flex flex-grow-0 justify-content-between align-items-center">
                    <h4 class="m-0 p-0">Current plan</h4>
                    <template v-if="user != null && user.tier != SundraTier.Personal">
                        <a v-if="Boolean(billing?.subscription?.cancel_at_period_end)" @click="onUncancelSubscriptionClick" class="text-link align-self-start cursor-pointer">Restore subscription</a>
                        <a v-else @click="onCancelSubscriptionClick" class="text-link align-self-start cursor-pointer">Cancel</a>
                    </template>
                </div>
                <!-- CURRENT PLAN -->
                <div class="flex align-items-center gap-4">
                    <PrimeSkeleton v-if="authStore.loading || billing?.subscription == null" height="8rem" width="10rem"></PrimeSkeleton>
                    <div v-else :class="{ 'active text-subscription': (!user?.on_trial) }" class="flex flex-column justify-content-start align-content-center align-items-center border-1 surface-border border-round py-3 subscription" style="height: 122px;">
                        <div class="flex flex-column flex-grow-1 justify-content-center align-items-center gap-2">
                            <SvgIcon v-if="user?.has_incomplete_payment != true" icon="user-add" style="width: 36px;" />
                            <h2 class="m-0 p-0">{{ (user?.has_incomplete_payment != true ? subscriptionName : 'Pending') }}</h2>
                        </div>
                    </div>
                    <div class="flex flex-column flex-grow-1 justify-content-start align-content-start align-items-start text-table">
                        <h6 class="subheader">Includes</h6>
                        <template v-if="user == null || user.usage == null || billing == null">
                            <div class="grid w-full align-items-center">
                                <div class="col-8"><PrimeSkeleton height="1em" width="w-full" borderRadius="8px" /></div>
                                <div class="col-offset-1 col-3"><PrimeSkeleton height="1em" width="w-full" borderRadius="8px" /></div>
                            </div>
                            <div class="grid w-full align-items-center">
                                <div class="col-8"><PrimeSkeleton height="1em" width="w-full" borderRadius="8px" /></div>
                                <div class="col-offset-1 col-3"><PrimeSkeleton height="1em" width="w-full" borderRadius="8px" /></div>
                            </div>
                            <div class="grid w-full align-items-center">
                                <div class="col-8"><PrimeSkeleton height="1em" width="w-full" borderRadius="8px" /></div>
                                <div class="col-offset-1 col-3"><PrimeSkeleton height="1em" width="w-full" borderRadius="8px" /></div>
                            </div>
                        </template>
                        <template v-else>

                            <!-- TEXT.SUNDRA -->
                            <div class="grid w-full align-items-center">
                                <div class="col-2"><b>Min per month</b></div>
                                <div class="col-4">
                                    <PrimeProgressBar :showValue="false"  :value="(durationUsedFree / (Number(user.usage?.duration_allowed) / 60)) * 100" class="w-full" :pt="{ root: { style: { height: '0.7rem' } }, value: { style: { background: '#9538f6' } } }" />
                                </div>
                                <div class="col-2 text-muted">{{ (durationUsedFree).toFixed(0) }} / {{ (Number(user.usage?.duration_allowed) / 60).toFixed(0) }} min used</div>
                                <div class="col-1">&nbsp;</div>
                                <div class="col-2 text-muted">Extra minutes used</div>
                                <div class="col-1">{{ Math.max(0, Number(durationUsedCost)) }}</div>
                            </div>
                            <div class="grid w-full align-items-center">
                                <div class="col-2"><b>Storage</b></div>
                                <div class="col-4">
                                    <PrimeProgressBar :showValue="false" :value="(Number(user.usage?.storage_current) / Number(user.usage?.storage_allowed)) * 100" class="w-full" :pt="{ root: { style: { height: '0.7rem' } }, value: { style: { background: ((Number(user.usage?.storage_current) > Number(user.usage?.storage_allowed)) ? '#DD155D' : '#9538f6') } } }" />
                                </div>
                                <div class="col-2 text-muted" :class="{ 'text-danger': (Number(user.usage?.storage_current) > Number(user.usage?.storage_allowed)) }">{{ formatsize(Number(user.usage?.storage_current)) }} / {{ formatsize(Number(user.usage?.storage_allowed)) }} used</div>
                                <div class="col-1">&nbsp;</div>
                                <div class="col-2 text-muted">{{ (!authStore.loading && billing != null && subscriptionName != SundraTier.Corporate ? 'Next payment' : '&nbsp;') }}</div>
                                <div class="col-1">{{ (!authStore.loading && billing != null && subscriptionName != SundraTier.Corporate ? Intl.NumberFormat('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 2, maximumFractionDigits: 2}).format(Math.max(0, Number(nextPayment))) : '&nbsp;') }}</div>
                            </div>
                            <div class="grid w-full align-items-center">
                                <div class="col-9">&nbsp;</div>
                                <div class="col-2 text-muted">Next payment date</div>
                                <div class="col-1">{{ (billing?.subscription?.current_period_end != null ? dayjs(Number(billing?.subscription?.current_period_end) * 1000).format('DD.MM.YYYY') : 'Checking') }}</div>
                            </div>

                        </template>
                    </div>
                </div>

            </div>

            <!-- BILLING INFORMATION -->
            <!-- div class="flex flex-column flex-grow-1 justify-content-start bg-white border-round p-4 pb-5 gap-2 ml-2">
                <div class="flex flex-grow-0 justify-content-between align-items-center">
                    <h4 class="m-0 p-0">Billing information</h4>
                    <a @click="null" class="text-link align-self-start cursor-pointer">Update billing information</a>
                </div>
            </div -->

            <!-- PAYMENT DETAILS -->
            <template v-if="subscriptionName != SundraTier.Corporate">
                <div v-if="authStore.loading" class="flex flex-column flex-grow-1 justify-content-start bg-white border-round p-4 pb-5 gap-2 ml-2">
                    <div class="flex flex-grow-0 justify-content-between align-items-center">
                        <PrimeSkeleton height="1.8rem" width="10rem" borderRadius="8px" />
                        <PrimeSkeleton height="1rem" width="8rem" borderRadius="4px" />
                    </div>
                    <div class="flex align-items-center gap-3">
                        <SvgIcon icon="credit" style="width: 24px;" /><PrimeSkeleton class="mb-1" height="1rem" width="8rem" borderRadius="4px" />
                    </div>
                </div>
                <div v-else-if="billing?.payment?.default != null" class="flex flex-column flex-grow-1 justify-content-start bg-white border-round p-4 pb-5 gap-2 ml-2">
                    <NotificationBar v-if="error != null" :icon="true" :type="SundraNotificationType.Error" :message="error" class="mb-3" />
                    <div class="flex flex-grow-0 justify-content-between align-items-center">
                        <h4 class="m-0 p-0">Payment details</h4>
                        <a @click="showPaymentDialog = true" class="text-link align-self-start cursor-pointer">Update payment details</a>
                    </div>
                    <div class="flex align-items-center gap-3 text-table">
                        <SvgIcon v-if="billing.payment.default?.type == 'card'" icon="credit" style="width: 24px;" /><span class="mb-1">**** **** **** {{ (billing.payment.default.card != null ? billing.payment.default.card?.last4 : '****') }}</span>
                    </div>
                </div>
                <div v-else class="flex flex-column flex-grow-1 justify-content-start bg-white border-round p-4 pb-5 gap-2 ml-2">
                    <NotificationBar v-if="error != null" :icon="true" :type="SundraNotificationType.Error" :message="error" class="mb-3" />
                    <div class="flex flex-grow-0 justify-content-between align-items-center">
                        <h4 class="m-0 p-0">Payment details</h4>
                    </div>
                    <div class="flex align-items-center justify-content-center gap-3 text-table">
                        <span class="mb-1">
                            <a @click="showPaymentDialog = true" class="text-link align-self-start cursor-pointer">
                                No payment details available, please enter them now.
                            </a>
                        </span>
                    </div>
                </div>
            </template>
        </template>

        <!-- PRICING -->
        <template v-if="tabActive == 1">
            <NotificationBar v-if="billing?.next_tier != null" position="center" :is-raw="true" :icon="true" :button="true" :button-callback="onCancelDowngradeClick" button-label="Cancel downgrade" :type="SundraNotificationType.Warning" :message="`Your subscription will be downgraded to <b>${billing.next_tier}</b> on ${dayjs(Number(billing?.subscription?.current_period_end) * 1000).format('DD.MM.YYYY')}.`" />
            <NotificationBar v-if="Boolean(billing?.subscription?.cancel_at_period_end)" :icon="true" :type="SundraNotificationType.Warning" :message="`You've cancelled your subscription and it will run out on ${dayjs(Number(billing?.subscription?.current_period_end) * 1000).format('DD.MM.YYYY')}. Hit the 'Restore subscription' link on the right to cancel your cancel`" />
            <NotificationBar v-if="error != null" :icon="true" :type="SundraNotificationType.Error" :message="error" />
            <SubscriptionTierSelection :current-tier="subscriptionName" :current-period="user?.payment_period ?? 'monthly'" :downgrade-tier="billing?.next_tier != null ? billing.next_tier : undefined" :subscription="billing?.subscription" @tier-selected="onSubscriptionTierSelected" @error="onSubscriptionError" class="w-full h-full" />
        </template>

        <!-- INVOICES -->
        <template v-if="tabActive == 2">
            <!-- EMPTY STATE -->
            <Empty v-if="billing?.invoices.length == 0"
                type="videos"
                title="No invoices yet"
                description="You haven't been charged anything yet so there are no invoices to display."
                hero="maintenance"
                imageStyle="height: 400px; margin-bottom: 20px;"
                :is-loading="authStore.loading" />

            <div v-else-if="billing != null && Number(billing?.invoices.length) > 0" class="flex flex-column flex-grow-1 justify-content-start p-4 pb-5 gap-2 ml-2">
                <div class="grid grid-nogutter text-muted px-4">
                    <div class="col-2">Invoice ID</div>
                    <div class="col-4">Description</div>
                    <div class="col-2">Date</div>
                    <div class="col-1">Total</div>
                    <div class="col-2">Status</div>
                    <div class="col-1 align-self-end">Actions</div>
                </div>
                <div v-for="invoice of billing.invoices" class="grid grid-nogutter bg-white border-1 surface-border border-round text-table px-4 pt-4 pb-3">
                    <div class="col-2 text-table-large">#{{ invoice.number }}</div>
                    <div class="col-4">{{ Number(invoice.lines?.data?.length) > 0 ? invoice.lines.data[invoice.lines.data.length - 1].description : '' }}</div>
                    <div class="col-2">{{ dayjs(invoice.created * 1000).format('D. MMM. YYYY') }}</div>
                    <div class="col-1" v-if="invoice.currency == 'isk'">{{ (invoice.total / 100).toLocaleString('en-US', { maximumFractionDigits: 0}) }} kr.</div>
                    <div class="col-1" v-else>{{ (invoice.total / 100).toLocaleString('en-US', { style: 'currency', currency: invoice.currency ?? 'USD', minimumFractionDigits: 2, maximumFractionDigits: (invoice.currency != 'isk' ? 2 : 0)}) }}</div>
                    <div class="col-2">{{ capitalizeFirstLetter(invoice.status ?? 'Pending') }}</div>
                    <div class="col-1 align-self-end">
                        <a :href="(invoice.invoice_pdf as string)" class="text-link">
                            <div class="flex gap-1"><SvgIcon icon="download" style="width: 18px;" /> PDF</div>
                        </a>
                    </div>
                </div>
            </div>
        </template>
    </div>

    <PrimeDialog v-model:visible="showPaymentDialog" modal header="Your payment information" class="w-4" style="min-width: 400px;" :draggable="false" @show="onShowPaymentDialog" @hide="onHidePaymentDialog">
        <div ref="paymentModalContent" id="paymentModalContent" style="min-height: 200px;">
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
                        <PrimeSkeleton height="3rem" borderRadius="16px" />
                    </div>
                    <div class="flex align-content-center">
                        <PrimeSkeleton height="2rem" borderRadius="16px" />
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <div class="flex justify-content-end align-content-center">
                <PrimeButton
                    @click="showPaymentDialog = false"
                    :disabled="isSaving"
                    label="Cancel"
                    v-primeripple
                    size="small"
                    style="min-width: 100px;"
                    class="w-3 max-h-3rem p-2 p-button-outlined" />
                <PrimeButton
                    @click="onClickPaymentSave"
                    :disabled="isSaving"
                    :label="isSaving ? 'Saving' : 'Save'"
                    v-primeripple
                    size="small"
                    style="min-width: 100px;"
                    class="w-3 p-2" />
            </div>
        </template>
    </PrimeDialog>

    <!-- CHANGE SUBSCRIPTION DIALOG -->
    <PrimeConfirmDialog group="changeSubscriptionConfirm" class="w-4" style="min-width: 400px;">
        <template #message="slotProps">
            <p class="pl-2" autofocus>

                <p v-if="user?.tier == selectedTier && user?.payment_period != selectedPeriod">You are changing your payment period from <b>{{ user?.payment_period }}</b> to <b>{{ selectedPeriod }}</b></p>
                <p v-else>You are {{ (slotProps.message.acceptLabel?.toLowerCase() == 'upgrade' ? 'upgrading' : 'downgrading') }} your subscription to the <b>{{ capitalizeFirstLetter(slotProps.message.message) }}</b> tier.</p>

                <p v-if="user?.on_trial">Your trial will instantly expire and your account moved to a full version of the new subscription tier & payment period.</p>

                <p v-if="slotProps.message.acceptLabel == 'Upgrade' && (user?.payment_period != selectedPeriod || isSubscriptionTierLower(user.tier, selectedTier))">
                    Your account will be instantly upgraded and the difference will be charged to the card on file.
                </p>
                <p v-else>
                    <template v-if="!user?.on_trial">Your account will be changed on <b>{{ dayjs(Number(billing?.subscription?.current_period_end) * 1000).format('DD.MM.YYYY') }}</b>, until then you'll stay on the current tier.</template>
                    <p>Note that if you are currently over any of the <b>{{ capitalizeFirstLetter(slotProps.message.message) }}</b> tier limits when the change happens you might be unable to upload new content until you resolve those issues.</p>
                </p>

            </p>
        </template>
    </PrimeConfirmDialog>
</template>

<script setup lang="ts">
    import { formatsize } from '@/utils/formatsize'
    import { capitalizeFirstLetter } from '@/utils/capitalizeFirst'
    import { usePageStore } from '@/stores/PageStore'
    import { useAuthStore } from '@/stores/AuthStore'
    import { useNotificationStore } from '@/stores/NotificationStore'
    import { storeToRefs } from 'pinia'
    import { getOverageNotification, isSubscriptionTierLower } from '@/utils/subscriptionhelper'
    import { type StripePaymentElement, type StripeElements, loadStripe } from '@stripe/stripe-js'
    import { useConfirm } from "primevue/useconfirm"
    import { useToast } from "primevue/usetoast"
    import { SundraNotificationCategory, SundraNotificationType, SundraPaymentPeriod, SundraTier, type SundraSubscriptionConfigItem } from '@/types/sundra'
    import Color from 'color'
    import subscriptionTiers from '~/assets/data/subscription-tiers.json'

    const { debug, frontendUrl, stripe_api } = useRuntimeConfig().public;
    const authStore = useAuthStore()
    authStore.fetchBilling()
    const stripeJs = await loadStripe(stripe_api.key)
    const dayjs = useDayjs()
    const confirm = useConfirm()
    const { user, billing, error } = storeToRefs(authStore)
    const notificationStore = useNotificationStore()
    const pageStore = usePageStore()
    pageStore.setName('Subscription')
    pageStore.setBgColor(Color('#F9F9F9'))
    pageStore.setGreyedOut(true)
    onBeforeMount(() => {
        pageStore.setGreyedOut(false)
    })

    const nextPayment = computed(() => {
        return (Number(durationUsedCost.value) * Number((currentTierData.value as SundraSubscriptionConfigItem)?.price.per_minute.USD ?? 0)).toFixed(2)
    })
    const currentTierData = computed(() => {
        switch (user.value?.tier) {
            case SundraTier.Creator:
                return subscriptionTiers.creator
            case SundraTier.Producer:
                return subscriptionTiers.producer
            case SundraTier.Broadcaster:
                return subscriptionTiers.broadcaster

            // Legacy
            case SundraTier.Personal:
                return subscriptionTiers.personal
            case SundraTier.Business:
                return subscriptionTiers.business
            case SundraTier.Enterprise:
                return subscriptionTiers.enterprise
        }
    })
    const durationUsedCost = computed(() => {
        switch (subscriptionName.value) {
            // Legacy
            case "Personal":
                if (Number(user.value?.usage.duration_current) >= Number(user.value?.usage.duration_allowed)) {
                    return ((Number(user.value?.usage.duration_period) / 60) - Number(user.value?.coupon?.amount ?? 0)).toFixed(0)
                }

            case "Creator":
            case "Producer":
            case "Broadcaster":
            // Legacy
            case "Business":
            case "Enterprise":
                if (Number(user.value?.usage.duration_period) >= Number(user.value?.usage.duration_allowed)) {
                    return ((Number(user.value?.usage.duration_period) - Number(user.value?.usage.duration_allowed)) / 60).toFixed(0)
                }
        }
        return 0
    })
    const durationUsedFree = computed(() => {
        switch (subscriptionName.value) {
            // Legacy
            case "Personal":
                return Math.min(Number(user.value?.usage.duration_current) / 60, 30)

            case "Creator":
            case "Producer":
            case "Broadcaster":
            // Legacy
            case "Business":
            case "Enterprise":
                if (user.value != null) {
                    return Number(Math.min(user.value.usage.duration_period / 60, (user.value.usage.duration_allowed / 60)))
                }
        }
        return 0
    })

    watch(user, (newUser) => { selectedPeriod.value = newUser?.payment_period ?? SundraPaymentPeriod.Monthly })
    // Trigger subscription notifications if needed
    watchEffect(() => {
        if (user.value != null) {
            if (user.value?.has_incomplete_payment) {
                notificationStore.dispatch(
                    SundraNotificationCategory.Subscriptions,
                    SundraNotificationType.Error,
                    "incomplete_payment",
                    undefined,
                    `We were unable to charge your card for your subscription, renew by <a href='/subscription?tab=pricing'>selecting a tier</a> and inputting a valid card.`,
                    true
                )
            } else if (!user.value.has_subscription) {
                notificationStore.dispatch(
                    SundraNotificationCategory.Subscriptions,
                    SundraNotificationType.Error,
                    "incomplete_payment",
                    undefined,
                    `Your account does not seem to have a subscription. Start your new subscription by <a href='/subscription?tab=pricing'>selecting a tier</a> and inputting a valid card.`,
                    true
                )
            }
        }
    })

    /* PAGE */
    const route = useRoute()
    const toast = useToast()
    const selectedTier = ref<string>('Creator')
    const selectedPeriod = ref<string>('monthly')
    const paymentElement = ref<StripePaymentElement|null>(null)
    const paymentElements = ref<StripeElements|null>(null)
    const paymentModalContent = ref<HTMLDivElement>()
    const showPaymentDialog = ref<boolean>(false)
    const isSaving = ref<boolean>(false)

    const overage = computed(() => (user.value != null && user.value?.has_incomplete_payment != true ? getOverageNotification(user.value, true) : null))
    const subscriptionName = computed(() => {
        return getSubscriptionName(billing.value?.subscription?.items?.data[0]?.plan?.product?.toString())
    })
    const tabActive = ref<number>(user.value?.has_subscription ? 0 : 1)
    const tabItems = computed(() => [
        { label: 'Overview' },
        { label: 'Pricing', visible: !authStore.loading && billing.value != null && subscriptionName.value != SundraTier.Corporate },
        { label: 'Invoices', visible: !authStore.loading && billing.value != null && subscriptionName.value != SundraTier.Corporate}
    ])
    if (route.query.tab != null) {
        switch ((route.query.tab as string).toLowerCase()) {
            case 'overview': tabActive.value = 0; break;
            case 'pricing': tabActive.value = 1; break;
            case 'invoices': tabActive.value = 2; break;
        }
    }

    if (stripeJs != null && route.query.setup_intent != null && route.query.setup_intent_client_secret != null) {
        stripeJs.retrieveSetupIntent(route.query.setup_intent_client_secret as string).then(({setupIntent}) => {
            switch (setupIntent?.status) {
                case 'succeeded':
                    toast.add({ severity: 'success', detail: "Payment details updated", group: 'toastAlerts', life: 3000})
                    break;

                case 'requires_payment_method':
                    error.value = 'Failed to process payment details. Please try another payment method.'
                    break;
            }
        })
    }

    const getTimeUsed = (seconds: number) => {
        let formatted: string = ''
        let days = Math.floor(seconds / 86400)
        seconds -= (days * 86400)
        let hours = Math.floor(seconds / 3600)
        seconds -= (hours * 3600)
        let minutes = Math.floor(seconds / 60)

        if (days > 0) { formatted += `${days}d ` }
        if (hours > 0) { formatted += `${hours}h `}
        if (minutes > 0) { formatted += `${minutes}m` }

        return formatted
    }

    /* EVENTS */
    const currentIntent = ref<string|null>(null)
    const onShowPaymentDialog = async () => {
        if (debug) { console.log(`Page::/subscription::onShowPaymentDialog`) }
        if (stripeJs != null) {
            currentIntent.value = await authStore.fetchStripeIntent()
            if (currentIntent.value != null && paymentModalContent.value != null) {
                const options = {
                    clientSecret: currentIntent.value,
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
                paymentElement.value = paymentElements.value?.create('payment')
                paymentElement.value.mount((paymentModalContent.value as HTMLElement))
            }
        }
    }
    const onHidePaymentDialog = () => {
        if (debug) { console.log(`Page::/subscription::onHidePaymentDialog`) }
        paymentElement.value?.unmount()
        paymentElement.value?.destroy()
    }

    const onClickPaymentSave = async () => {
        if (debug) { console.log(`Page::/subscription::onClickPaymentSave`) }
        if (stripeJs != null && currentIntent.value != null && paymentElements.value != null) {
            pageStore.setGreyedOut(true)
            const { setupIntent, error: stripeError } = await stripeJs.confirmSetup({
                elements: paymentElements.value,
                redirect: 'if_required',
                confirmParams: {
                    return_url: `${frontendUrl}/subscription`+(!user.value?.has_subscription ? '?tab=pricing' : ''),
                }
            })
            if (stripeError) {
                error.value = stripeError.message as string

            } else if (setupIntent?.payment_method != null) {
                if (!user.value?.has_subscription) {
                    if (debug) { console.log(`Page::/subscription::onClickPaymentSave - Creating a new subscription`) }
                    const result = await authStore.createSubscription(selectedTier.value, selectedPeriod.value, setupIntent.payment_method.toString())
                    if (result) {
                        toast.add({ severity: 'success', detail: "You've successfully subscribed to Sundra!", group: 'toastAlerts', life: 3000})
                    }
                } else {
                    if (debug) { console.log(`Page::/subscription::onClickPaymentSave - Updating default payment method`) }
                    await authStore.updatePaymentMethod(setupIntent.payment_method.toString())
                }
                // Clear all subscription notifications
                notificationStore.remove(SundraNotificationCategory.Subscriptions)
            } else {
                error.value = "An error occurred when verifying payment method. Please refresh and try again."
            }
            showPaymentDialog.value = false;
            pageStore.setGreyedOut(false)
        }
    }

    const onSubscriptionTierSelected = async (tier: string, period: string) => {
        if (debug) { console.log(`Page::/subscription::onSubscriptionTierSelected`, tier) }
        selectedTier.value = tier
        selectedPeriod.value = period
        if (user.value != null && user.value.has_subscription) {
            const action = (isSubscriptionTierLower(user.value.tier, tier) ? 'Upgrade' : 'Downgrade')
            confirm.require({
                group: 'changeSubscriptionConfirm',
                message: tier,
                header: `${action} subscription to ${capitalizeFirstLetter(tier)}?`,
                acceptLabel: action,
                acceptClass: 'p-button-danger p-button-sm w-3 p-2',
                rejectLabel: 'Cancel',
                rejectClass: 'p-button-sm w-3 max-h-3rem p-2 p-button-outlined',
                accept: async () => {
                    pageStore.setGreyedOut(true)
                    await authStore.changeSubscriptionTier(tier, selectedPeriod.value)
                    pageStore.setGreyedOut(false)
                }
            })
        } else {
            showPaymentDialog.value = true
        }
    }

    const onCancelDowngradeClick = async() => {
        if (debug) { console.log(`Page::/subscription::onCancelDowngradeClick`) }
        pageStore.setGreyedOut(true)
        const success = await authStore.cancelSubscriptionDowngrade()
        pageStore.setGreyedOut(false)
        if (success) {
            toast.add({ severity: 'success', detail: "Your subscription downgrade has been cancelled!", group: 'toastAlerts', life: 3000})
        }
    }

    const onUncancelSubscriptionClick = async () => {
        pageStore.setGreyedOut(true)
        const success = await authStore.uncancelSubscription()
        pageStore.setGreyedOut(false)
        if (success) {
            toast.add({ severity: 'success', detail: "Your subscription has been restored!", group: 'toastAlerts', life: 3000})
        }
    }

    const onCancelSubscriptionClick = async () => {
        pageStore.setGreyedOut(true)
        const success = await authStore.cancelSubscription()
        pageStore.setGreyedOut(false)
        if (success) {
            toast.add({ severity: 'success', detail: "Your subscription has been cancelled", group: 'toastAlerts', life: 3000})
        }
    }

    const onSubscriptionError = (message: string) => {
        error.value = message
    }
</script>

<style scoped>
h4 {
    color: #000;
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 28px; /* 175% */
    letter-spacing: 0.1px;
    margin: 0px;
    padding: 0px;
}

.text-subscription {
    color: #fff !important;
}

.text-link {
    color: #9538F6;
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    line-height: 16px; /* 133.333% */
}

.subscription.active {
    color: #fff;
    background: linear-gradient(58deg, #C366FF 36.9%, #9FF7B5 101.53%) !important;
}

.subscription {
    background: #fff !important;
    min-width: 160px;
    font-size: 0.8rem;
}

.text-table-large {
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
}
.text-table {
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    line-height: 14px; /* 116.667% */
}

h6.subheader {
    margin: 0px;
    padding: 0px;
    color: var(--grey-medium, #6B6B6B);
    font-feature-settings: 'clig' off, 'liga' off;
    font-family: Lato;
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 28px; /* 200% */
    letter-spacing: 0.1px;
}

:deep(.p-tabmenu .p-tabmenu-nav) {
    background-color: #F9F9F9;
    border: none;
}

:deep(.p-highlight > .p-menuitem-link) {
    background-color: #9FF7B5 !important;
}
:deep(.p-menuitem-link:hover) {
    background-color: #0000004d !important;
}

:deep(.p-tabmenu .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link) {
    border: none;
    border-width: 0 0 0 0;
    border-color: transparent transparent transparent transparent;
    padding: 0.5rem 1rem;
    font-weight: 500;
    margin: 0 0 0 10px;
    color: #000;
    font-variant-numeric: lining-nums tabular-nums;
    font-feature-settings: 'clig' off, 'liga' off;
    font-family: Lato;
    font-size: 12px;
    font-style: normal;
    font-weight: 700;
    line-height: 14px; /* 116.667% */
}

:deep(.p-tabmenu .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link) {
    color: #000000;
    background-color: #DDD;
    border-radius: 15px;
    text-decoration: none;
}
</style>