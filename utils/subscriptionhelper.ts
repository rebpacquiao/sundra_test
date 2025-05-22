import { type SundraUser } from "@/types/sundra"

export const getSubscriptionTierRank = (tier: string): number => {
    switch (tier.toLowerCase()) {
        case 'creator':
        case 'personal':
            return 0

        case 'producer':
        case 'business':
            return 1

        case 'broadcaster':
        case 'enterprise':
            return 2
    }
    return -1
}

export const isSubscriptionTierLower = (tier: string, newTier: string): boolean => {
    return getSubscriptionTierRank(tier) < getSubscriptionTierRank(newTier)
}

export const getSubscriptionSubtitle = (subscription: any, isTrial: boolean = true) => {
    if (isTrial && subscription?.trial_end != null) {
        return getSubscriptionTrialRunout(subscription.trial_end) + ' days'
    } else if (subscription?.plan != null) {
        return '$' + (Number(subscription.plan?.amount) / 100).toFixed(0) +`/${subscription.plan.interval}`
    }
    return ''
}

export const getSubscriptionTrialRunout = (trial_end: number|null): number => {
    if (trial_end != null) {
        const now = Date.now()
        return Number(((((trial_end * 1000) - now) / 1000) / 86400).toFixed(0))
    }
    return 14 // Shouldn't get to here
}

export const isSubscriptionLegacy = (id: string|undefined) => {
    const { stripe_api } = useRuntimeConfig().public;
    switch (id) {
        case stripe_api.plans.personal:
        case stripe_api.plans.business:
        case stripe_api.plans.enterprise:
        case "Personal":
        case "Business":
        case "Enterprise":
            return true
    }
    return false
}

export const getSubscriptionName = (prod_id: string|undefined) => {
    const { stripe_api } = useRuntimeConfig().public;
    if (prod_id != null) {
        switch (prod_id) {
            case stripe_api.plans.creator:
                return "Creator"
            case stripe_api.plans.producer:
                return "Producer"
            case stripe_api.plans.broadcaster:
                return "Broadcaster"
            case stripe_api.plans.corporate:
                return "Corporate"
            // Legacy
            case stripe_api.plans.personal:
                return "Personal"
            case stripe_api.plans.business:
                return "Business"
            case stripe_api.plans.enterprise:
                return "Enterprise"
        }
    }
    return "None"
}

// TODO: Refactore so we can change color as well, this is a pretty shitty way to do this
export const getOverageNotification = (user: SundraUser, doNear: boolean = true): string|null => {
    if (user != null && user.tier != null) {
        if (doNear && Number(user.usage.storage_current) > (Number(user.usage.storage_allowed) * 0.9)) {
            return `Your ${user.tier} subscription tier is over the maximum allowed storage. Remove videos or upgrade your plan`
        } else if (Number(user.usage.storage_current) > (Number(user.usage.storage_allowed))) {
            return `Your ${user.tier} subscription tier is reaching the maximum allowed storage. You can upgrade your plan to get more storage`
        }
}
    return null
}
