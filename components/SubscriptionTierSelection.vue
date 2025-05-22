<template>
    <div class="flex flex-column flex-grow-1 justify-content-start gap-2">
        <div v-if="subscription?.trial_end != null && getSubscriptionTrialRunout(subscription.trial_end) > 0"  class="flex flex-grow-1 justify-content-between align-items-center bg-white border-round px-3 mb-2 text-trial">
            <div class="flex align-items-center gap-3">
                <SvgIcon icon="gift" class="ml-2" style="width: 20px;" />
                <h4 class="text-trial">You are still on your {{ getSubscriptionTrialRunout(subscription.trial_end) }} day Free trial to Sundra</h4>
            </div>
            <h4 class="align-self-end text-trial font-medium mr-2">{{ getSubscriptionTrialRunout(subscription.trial_end) }} days left</h4>
        </div>

        <div class="flex flex-column flex-grow-1 justify-content-start align-items-center border-round" style="background: linear-gradient(79deg, #C366FF 9.71%, #9FF7B5 106.38%);">
            <h2 class="text-white pt-4">Choose the plan that's right for you</h2>

            <div class="flex flex-column justify-content-center align-items-center">
                <div class="flex justify-content-center align-items-center">
                    <div class="periods monthly cursor-pointer" :class="{ active: (selectedPeriod == 'monthly') }" @click="selectedPeriod = 'monthly'">Monthly</div>
                    <div class="periods yearly cursor-pointer" :class="{ active: (selectedPeriod == 'yearly') }" @click="selectedPeriod = 'yearly'">Annually</div>
                </div>
            </div>

            <div class="grid mx-4 my-2 pb-4">
                <!-- CREATOR -->
                <!-- div class="col-4 flex">
                    <div class="flex flex-column flex-grow-1 justify-content-start align-items-start align-content-center my-3 py-3 px-3 mx-3 border-round bg-white">
                        <h4 class="text-xl mt-2">{{ availableTiers.creator.name }}</h4>
                        <div class="flex align-items-center gap-2" :class="{ 'mb-2': (selectedPeriod == 'yearly'), 'mb-5': (selectedPeriod == 'monthly') }">
                            <h1 v-if="selectedPeriod == 'yearly'" class="my-0">{{ availableTiers.creator.price.yearly.USD.toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2}) }}</h1>
                            <h1 v-else-if="selectedPeriod == 'monthly'" class="my-0">{{ availableTiers.creator.price.monthly.USD.toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2}) }}</h1>
                            <div class="text-lg text-muted">USD/{{ selectedPeriod == 'yearly' ? 'annually' : selectedPeriod }}</div>
                        </div>
                        <div v-if="selectedPeriod == 'yearly'" class="mb-2 text-xs" style="padding-bottom: 1px;">
                            That's only <b class="text-primary">{{ Math.round(subscriptionTiers.creator.price.yearly.USD / 12).toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2}) }}</b> a month
                        </div>

                        <PrimeButton v-if="currentTier.toLowerCase() != 'creator' || selectedPeriod != currentPeriod"
                            @click="onClickTierButton('Creator')"
                            :label="(currentTier.toLowerCase() == 'creator' && selectedPeriod != currentPeriod ? `Pay ${selectedPeriod}` : `${actionTitle} ${availableTiers.creator.button}`)"
                            :disabled="downgradeTier?.toLowerCase() == 'creator'"
                            v-primeripple
                            class="w-full p-3" />
                        <PrimeButton v-else disabled
                            :label="`Currently on ${currentTier}`"
                            v-primeripple
                            class="w-full p-3"
                            :pt="{ root: { style: { background: '#767676', border: 'solid 1px #767676' } } }" />
                        <div class="text-sm text-muted pt-4 mb-1 px-1">
                            {{ availableTiers.creator.description }}
                        </div>
                        <b class="my-2">{{ availableTiers.creator.tagline }}:</b>
                        <div v-for="item in availableTiers.creator.lines" class="flex column-gap-3 align-items pt-1">
                            <div style="width: 20px;" class="text-primary"><SvgIcon icon="check" class="ml-2"/></div>
                            {{ item.replace('{CURRENCY}', availableTiers.creator.price.per_minute.USD.toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2})) }}
                        </div>
                    </div>
                </div -->
                <!-- PRODUCER -->
                <div class="col-6 flex">
                    <div class="flex flex-column flex-grow-1 justify-content-start align-items-start align-content-center my-3 py-3 px-3 mx-3 border-round bg-white">
                        <h4 class="text-xl mt-2">{{ availableTiers.producer.name }}</h4>
                        <div class="flex align-items-center gap-2" :class="{ 'mb-2': (selectedPeriod == 'yearly'), 'mb-5': (selectedPeriod == 'monthly') }">
                            <h1 v-if="selectedPeriod == 'yearly'" class="my-0">{{ availableTiers.producer.price.yearly.USD.toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2}) }}</h1>
                            <h1 v-else-if="selectedPeriod == 'monthly'" class="my-0">{{ availableTiers.producer.price.monthly.USD.toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2}) }}</h1>
                            <div class="text-lg text-muted">USD/{{ selectedPeriod == 'yearly' ? 'annually' : selectedPeriod }}</div>
                        </div>
                        <div v-if="selectedPeriod == 'yearly'" class="mb-2 text-xs" style="padding-bottom: 1px;">
                            That's only <b class="text-primary">{{ Math.round(subscriptionTiers.producer.price.yearly.USD / 12).toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2}) }}</b> a month
                        </div>
                        <PrimeButton v-if="currentTier.toLowerCase() != 'producer' || selectedPeriod != currentPeriod"
                            @click="onClickTierButton('Producer')"
                            :label="(currentTier.toLowerCase() == 'producer' && selectedPeriod != currentPeriod ? `Pay ${selectedPeriod}` : `${actionTitle} ${availableTiers.producer.button}`)"
                            :disabled="downgradeTier?.toLowerCase() == 'producer'"
                            v-primeripple
                            class="w-full p-3" />
                        <PrimeButton v-else disabled
                            :label="`Currently on ${currentTier}`"
                            v-primeripple
                            class="w-full p-3"
                            :pt="{ root: { style: { background: '#767676', border: 'solid 1px #767676' } } }" />
                        <div class="text-sm text-muted pt-4 mb-1 px-1">
                            {{ availableTiers.producer.description }}
                        </div>
                        <b class="my-2">{{ availableTiers.producer.tagline }}:</b>
                        <div v-for="item in availableTiers.producer.lines" class="flex column-gap-3 align-items pt-1">
                            <div style="width: 20px;" class="text-primary"><SvgIcon icon="check" class="ml-2"/></div>
                            {{ item.replace('{CURRENCY}', availableTiers.producer.price.per_minute.USD.toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2})) }}
                        </div>
                    </div>
                </div>
                <!-- BROADCASTER -->
                <div class="col-6 flex">
                    <div class="flex flex-column flex-grow-1 justify-content-start align-items-start align-content-center my-3 py-3 px-3 mx-3 border-round bg-white">
                        <h4 class="text-xl mt-2">{{ availableTiers.broadcaster.name }}</h4>
                        <div class="flex align-items-center gap-2" :class="{ 'mb-2': (selectedPeriod == 'yearly'), 'mb-5': (selectedPeriod == 'monthly') }">
                            <h1 v-if="selectedPeriod == 'yearly'" class="my-0">{{ availableTiers.broadcaster.price.yearly.USD.toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2}) }}</h1>
                            <h1 v-else-if="selectedPeriod == 'monthly'" class="my-0">{{ availableTiers.broadcaster.price.monthly.USD.toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2}) }}</h1>
                            <div class="text-lg text-muted">USD/{{ selectedPeriod == 'yearly' ? 'annually' : selectedPeriod }}</div>
                        </div>
                        <div v-if="selectedPeriod == 'yearly'" class="mb-2 text-xs" style="padding-bottom: 1px;">
                            That's only <b class="text-primary">{{ Math.round(subscriptionTiers.broadcaster.price.yearly.USD / 12).toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2}) }}</b> a month
                        </div>
                        <PrimeButton v-if="currentTier.toLowerCase() != 'broadcaster' || selectedPeriod != currentPeriod"
                            @click="onClickTierButton('Broadcaster')"
                            :label="(currentTier.toLowerCase() == 'broadcaster' && selectedPeriod != currentPeriod ? `Pay ${selectedPeriod}` : `${actionTitle} ${availableTiers.broadcaster.button}`)"
                            :disabled="currentPeriod == 'yearly' && selectedPeriod == 'monthly' && !isSubscriptionTierLower('broadcaster', currentTier)"
                            v-primeripple
                            class="w-full p-3" />
                        <PrimeButton v-else disabled
                            :label="`Currently on ${currentTier}`"
                            v-primeripple
                            class="w-full p-3"
                            :pt="{ root: { style: { background: '#767676', border: 'solid 1px #767676' } } }" />
                        <div class="text-sm text-muted pt-4 mb-1 px-1">
                            {{ availableTiers.broadcaster.description }}
                        </div>
                        <b class="my-2">{{ availableTiers.broadcaster.tagline }}:</b>
                        <div v-for="item in availableTiers.broadcaster.lines" class="flex column-gap-3 align-items pt-1">
                            <div style="width: 20px;" class="text-primary"><SvgIcon icon="check" class="ml-2"/></div>
                            {{ item.replace('{CURRENCY}', availableTiers.broadcaster.price.per_minute.USD.toLocaleString('en-US', { style: 'currency', currency: 'usd', minimumFractionDigits: 0, maximumFractionDigits: 2})) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import Stripe from 'stripe'
    import subscriptionTiers from '~/assets/data/subscription-tiers.json'
    import { type SundraSubscriptionServiceItem } from '@/types/sundra';
    import { getSubscriptionTrialRunout, isSubscriptionTierLower } from '@/utils/subscriptionhelper'

    interface Props {
        currency?: string,
        currentTier: string,
        currentPeriod: string,
        downgradeTier?: string,
        subscription?: Stripe.Subscription
    }
    const props = withDefaults(defineProps<Props>(), {
        currency: 'usd'
    })
    const emit = defineEmits<{
        (e: 'error', message: string): void
        (e: 'tierSelected', tier: string, period: string): void
    }>()
    const selectedPeriod = ref<string>(props.currentPeriod)
    const actionTitle: string = (props.subscription != null ? 'Change to' : 'Choose')
    const availableTiers = ref<SundraSubscriptionServiceItem>(subscriptionTiers)
    const onClickTierButton = async (tier: string) => {
        emit('tierSelected', tier, selectedPeriod.value)
    }
</script>

<style scoped>

.periods {
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
        background: #9FF7B5;
    }
</style>