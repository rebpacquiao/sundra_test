import { defineStore } from 'pinia'

/**
 * Error log Store
 * Sends logs of frontend errors to API for storage in DB
 */
export const useErrorStore = defineStore('errors', () => {

    /* Actions */
    async function log(error: string, className?: string, method?: string, line?: number) {
        try {
            const response = await $sundrafetch("/api/error/log", {
                method: "post",
                body: {
                    error: error,
                    class: className,
                    method: method,
                    line: line
                }
            })
        } catch (error) {
            console.log(error)
        }
    }

    return {
        log
    }
})
