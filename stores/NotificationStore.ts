import { defineStore } from 'pinia'
import { type SundraNotification, SundraNotificationType, SundraNotificationCategory } from '@/types/sundra'

interface UpdatePayload {
    type?: SundraNotificationType,
    child?: string,
    message?: string,
    progress?: number,
    route?: string,
    is_showing?: boolean,
    is_disposable?: boolean,
    is_completed?: boolean,
    is_permanent?: boolean,
    dispose?: boolean
}

/**
 * Notification store
 * Triggers notifications and such
 */
export const useNotificationStore = defineStore('notifications', () => {
    const { debug } = useRuntimeConfig().public

    /* State */
    const isShowing = ref<boolean>(false)
    const notifications = new Map<SundraNotificationCategory, Ref<SundraNotification[]>>()
    const notification = ref<SundraNotification|null>()

    /* Getters */
    const isEmpty = computed<boolean>(() => (notifications.size > 0))
    const background = computed(() => ( notification.value?.is_completed ? SundraNotificationType.Success : notification.value?.type ))

    /* Actions */
    function update(content_type: SundraNotificationCategory, slug: string, data: UpdatePayload) {
        let n = find(content_type, slug, null)//data.child)
        if (n != null) {
            if (data.dispose != null && data.dispose) {
                remove(content_type, slug, data.child)
            } else {
                if (data.type != null) n.type = data.type
                if (data.message != null) n.message = data.message
                if (data.progress != null) n.progress = data.progress
                if (data.route != null) n.route = data.route
                if (data.is_showing != null) n.is_showing = data.is_showing
                if (data.is_completed != null) n.is_completed = data.is_completed
                if (data.is_disposable != null) n.is_disposable = data.is_disposable
                if (data.is_permanent != null) n.is_permanent = data.is_permanent
            }
        } else if (data.dispose == null || !data.dispose) {
            n = create(content_type, slug, data)
            display(content_type, slug, null)//data.child)
        }
    }

    function disposable(type: SundraNotificationType, message: string, slug?: string, child?: string) {
        update(
            SundraNotificationCategory.UI,
            (slug != null ? slug : "NotificationStore::disposable:"+crappyId()),
            {
                child: child,
                type: type,
                is_disposable: true,
                is_showing: true,
                message: message
            }
        )
    }

    function create(content_type: SundraNotificationCategory, slug: string, data: UpdatePayload): SundraNotification {
        const n = {
            slug: slug,
            ...data
        } as SundraNotification;

        if (!notifications.has(content_type)) {
            notifications.set(content_type, ref([ n ]))
        } else {
            notifications.get(content_type)!.value.push(n)
        }
        return n
    }

    function remove(content_type: SundraNotificationCategory, slug?: string, child?: string) {
        if (slug != null) {
            const n = notifications.get(content_type)
            if (debug) console.log(`NotificationStore::remove::${content_type}::${slug}`+(child != null ? `.${child}` : ''))
            if (n != null) {
                n.value = n.value.filter(item => (item.slug != slug && (child == null || item.child == child)))
                displayFirst()
            }
            isShowing.value = !(isShowing.value && n?.value.length == 0)
        } else {
            notifications.delete(content_type)
            displayFirst()
        }
    }

    function show(content_type: SundraNotificationCategory, slug: string, child?: string) {
        const n = find(content_type, slug, child)
        if (n != null) {
            n.is_showing = true
            display(content_type, slug, child)
        }
    }

    function next(content_type: SundraNotificationCategory|null = null, slug: string|null = null, child?: string) {
        if (content_type != null && slug != null) {
            if (debug) console.log(`NotificationStore::next::${content_type}::${slug}`+(child != null ? `.${child}` : ''))
            const n = find(content_type, slug, child)
            if (n != null) {
                if (n.is_disposable) {
                    remove(content_type, slug, child)
                } else {
                    n.is_showing = false
                }
            }
        } else if (notification.value != null) {
            notification.value.is_showing = false
        }
        displayFirst()
    }

    function hide() {
        if (debug) console.log(`NotificationStore::hide::all`)
        isShowing.value = false
    }

    function dispatch(content_type: SundraNotificationCategory, type: SundraNotificationType, slug: string, child?: string, message?: string, isPermanent: boolean = false) {
        let n = find(content_type, slug, child)
        if (n != null) return;

        update(content_type, slug, {
            child: child,
            type: type,
            message: message,
            is_permanent: isPermanent
        })
        display(content_type, slug)//, child)
    }

    function started(content_type: SundraNotificationCategory, slug: string, child?: string, message?: string) {
        update(content_type, slug, {
            child: child,
            type: SundraNotificationType.Info,
            message: message
        })
        display(content_type, slug)//, child)
    }

    function progress(content_type: SundraNotificationCategory, slug: string, progress: number, child?: string, message?: string) {
        update(content_type, slug, {
            child: child,
            type: SundraNotificationType.Info,
            progress: progress,
            message: message
        })
    }

    function fail(content_type: SundraNotificationCategory, slug: string, child: string|null = null, message?: string) {
        update(content_type, slug, {
            child: child != null ? child : undefined,
            type: SundraNotificationType.Warning,
            message: message,
            is_showing: true,
            is_completed: true
        })
        display(content_type, slug)//, child)
    }

    function complete(content_type: SundraNotificationCategory, slug: string, child: string|null = null, message?: string) {
        update(content_type, slug, {
            child: child != null ? child : undefined,
            type: SundraNotificationType.Success,
            message: message,
            is_showing: true,
            is_completed: true
        })
        display(content_type, slug)//, child)
    }

    function display(content_type: SundraNotificationCategory, slug: string, child: string|null = null) {
        notification.value = find(content_type, slug, child)
        if (notification.value != null) {
            if (debug) console.log("NotificationStore::display::found", notification.value)
            notification.value.is_showing = true
            isShowing.value = true
        }
    }

    function displayFirst() {
        notification.value = null
        notifications.forEach(items => {
            items.value.forEach(item => {
                if (item.is_showing && notification.value == null) {
                    if (debug) console.log("NotificationStore::displayFirst::found", item)
                    notification.value = item
                    isShowing.value = true
                }
            })
        })
    }

    function find(content_type: SundraNotificationCategory, slug: string, child: string|null = null): SundraNotification|undefined {
        return notifications.get(content_type)?.value.find(n => {
            if (n.slug == slug && (child == null || n.child == child )) return true
        })
    }

    return {
        isShowing, notifications, notification,
        isEmpty, background,
        update, disposable, dispatch, started, progress, fail, complete, find, remove, show, hide, next, display, displayFirst
    }
})