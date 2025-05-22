import { defineStore } from 'pinia';
import Color from 'color';

/**
 * Page Store
 * Holds various data for the rendered page, mostly
 * the current page name displayed in the breadcrumb
 * area or alternatively diplays the stepper instead
 */
export const usePageStore = defineStore('page', () => {
    const { debug } = useRuntimeConfig().public;
    /* State */
    const name = ref<string>('')
    const icon = ref<string|undefined|null>(null)
    const iconClickCallback = ref()
    const closeClickCallback = ref()
    const bgColor = ref<Color>(Color("#ffffff"))
    const showStepper = ref<boolean>(false)
    const showClose = ref<boolean>(true)
    const step = ref<number>(0)
    const isEditable = ref<boolean>(false)
    const isGreyedOut = ref<boolean>(false)
    const headerInputValue = ref<string|null>(null)
    const showHeader = ref<boolean>(true)
    const getHeaderInputValue = computed(() => headerInputValue.value)

    /* Actions */
    function setStep(currentStep: number) {
        name.value = ''
        step.value = Math.min(currentStep, 3)
        showStepper.value = true
    }

    function setName(pageName: string, pageIcon?: string) {
        name.value = pageName
        step.value = 0
        showStepper.value = false
        icon.value = null
        iconClickCallback.value = null
        if (pageIcon != null) {
            icon.value = pageIcon
        }
    }

    function setBgColor(color: Color) {
        bgColor.value = color
    }

    function setShowHeader(flag: boolean) {
        showHeader.value = flag
    }

    function setShowClose(flag: boolean) {
        showClose.value = flag
    }

    function setEditable(flag: boolean) {
        isEditable.value = flag
    }

    function setGreyedOut(flag: boolean) {
        if (debug) { console.log(`PageStore::setGreyedOut`, flag) }
        isGreyedOut.value = flag
    }

    function setHeaderInputValue(value: string) {
        headerInputValue.value = value
    }

    function setIcon(value: string) {
        icon.value = value
    }
    function setIconCallback(callback: () => void) {
        iconClickCallback.value = callback
    }

    function setCloseClickCallback(callback: () => void) {
        closeClickCallback.value = callback
    }

    return {
        name, icon, iconClickCallback, closeClickCallback, bgColor, isEditable, isGreyedOut,
        showStepper, showClose, showHeader, step, getHeaderInputValue,
        setName, setBgColor, setStep, setShowHeader, setShowClose, setEditable, setGreyedOut,
        setHeaderInputValue, setIcon, setIconCallback, setCloseClickCallback
    }
})
