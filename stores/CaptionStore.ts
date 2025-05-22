import srtParser2 from 'srt-parser-2'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/AuthStore'
import type { SundraTranslation, SundraSubtitle, SundraTranscription, ParsedSrtFormat } from '~/types/sundra'

interface ApiResponse {
    status: string,
    data?: SundraTranscription|SundraTranslation[]
}

export enum CaptionEditAction {
    Edit    = 'edit',
    Add     = 'add',
    Merge   = 'merge',
    Delete  = 'delete',
    Extend  = 'extend',
    Shift   = 'shift'
}

export const useCaptionStore = defineStore('caption', () => {
    const { debug } = useRuntimeConfig().public
    const srtParser = new srtParser2()
    const isLoading = ref<boolean>(false)
    const transcription = ref<SundraTranscription>()
    const translations = ref<SundraTranslation[]>([])
    const currentCaption = ref<ParsedSrtFormat[]>([])
    const currentLanguage = ref<string|null>()
    const authStore = useAuthStore()

    //#region Load Actions
    async function load(slug: string) {
        isLoading.value = true
        try {
            const response = await $sundrafetch(`/api/files/captions/${slug}`, { method: 'GET', activeTeam: authStore.activeTeam?.id })
            if (response != null) {
                transcription.value = ((response as ApiResponse).data as SundraTranscription)
                open(transcription.value.language)
                await loadTranslations(slug)
                return true
            }
        } catch (error) {
            if (debug) { console.error('CaptionStore::load', slug, error) }
            throw error
        } finally {
            isLoading.value = false
        }
        return false
    }

    function close(): void {
        transcription.value = undefined
        currentCaption.value.splice(0)
        translations.value.splice(0)
        currentLanguage.value = null
    }

    async function loadTranslations(slug: string) {
        isLoading.value = true
        try {
            const response = await $sundrafetch(`/api/files/captions/${slug}/translations`, { method: 'GET', activeTeam: authStore.activeTeam?.id })
            if (response != null) {
                translations.value.splice(0)
                translations.value.push(...((response as ApiResponse).data as SundraTranslation[]))
                return true
            }
        } catch (error) {
            if (debug) { console.error('CaptionStore::loadTranslations', slug, error) }
            throw error
        } finally {
            isLoading.value = false
        }
        return false
    }
    //#endregion

    //#region Caption selection
    function open(language: string) {
        try {
            let f = find(language)
            if (f != null && f.subtitle != null) {
                if (currentLanguage.value != null) { update(currentLanguage.value) }
                currentCaption.value.splice(0)
                currentLanguage.value = language
                currentCaption.value.push(...srtParser.fromSrt(f.subtitle))
                return true
            }
        } catch (error) {
            if (debug) { console.error(error) }
            throw error
        }
        return false
    }

    function find(language: string): SundraTranscription|SundraTranslation|null {
        if (transcription.value?.language == language) {
            return transcription.value
        } else {
            let f = translations.value.find(i => i.language == language)
            if (f != null) {
                return f
            }
        }
        return null
    }
    //#endregion

    //#region Editing methods
    async function add(slug: string, language: string, line: SundraSubtitle) {
        try {
            if (language != currentLanguage.value) { open(language) }
            if (line.id > 0) {
                currentCaption.value.splice(line.id, 0, {
                    id: line.id.toString(),
                    startTime: line.start!,
                    startSeconds: srtParser.timestampToSeconds(line.start!),
                    endTime: line.end!,
                    endSeconds: srtParser.timestampToSeconds(line.end!),
                    text: line.text ?? ''
                })
                //fixCaptionOrder()
                save(slug, CaptionEditAction.Add, language, line)
            }
        } catch (error) {
            throw error
        }
    }

    async function edit(slug: string, language: string, line: SundraSubtitle) {
        try {
            if (language != currentLanguage.value) { open(language) }
            if (line.id > 0) {
                if (line.start != null) {
                    currentCaption.value[line.id - 1].startTime = line.start
                    currentCaption.value[line.id - 1].startSeconds = srtParser.timestampToSeconds(line.start)
                }
                if (line.end != null) {
                    currentCaption.value[line.id - 1].endTime = line.end
                    currentCaption.value[line.id - 1].endSeconds = srtParser.timestampToSeconds(line.end)
                }
                if (line.text != null) {
                    currentCaption.value[line.id - 1].text = line.text
                }
            }
            save(slug, CaptionEditAction.Edit, language, line)
        } catch (error) {
            throw error
        }
    }

    async function merge(slug: string, language: string, line: SundraSubtitle) {
        isLoading.value = true
        try {
            if (language != currentLanguage.value) { open(language) }
            if (line.id > -1) {
                let from = currentCaption.value[line.id - 1]
                let to = currentCaption.value[Number(line.text) - 1]
                // MERGE UP
                if (line.id > Number(line.text)) {
                    currentCaption.value.splice(Number(line.text) - 1, 2, {
                        id: line.text!,
                        startTime: to.startTime,
                        startSeconds: to.startSeconds,
                        endTime: from.endTime,
                        endSeconds: from.endSeconds,
                        text: `${to.text} ${from.text}`
                    })
                // MERGE DOWN
                } else {
                    currentCaption.value.splice(line.id - 1, 2, {
                        id: line.id.toString(),
                        startTime: from.startTime,
                        startSeconds: from.startSeconds,
                        endTime: to.endTime,
                        endSeconds: to.endSeconds,
                        text: `${from.text} ${to.text}`
                    })
                }
                //fixCaptionOrder()
                save(slug, CaptionEditAction.Merge, language, line)
            }
        } catch (error) {
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function remove(slug: string, language: string, line: SundraSubtitle) {
        isLoading.value = true
        try {
            if (language != currentLanguage.value) { open(language) }
            currentCaption.value.splice(line.id - 1, 1)
            //fixCaptionOrder()
            save(slug, CaptionEditAction.Delete, language, line)
        } catch (error) {
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function extend(slug: string, language: string, line: SundraSubtitle) {
        try {
            if (language != currentLanguage.value) { open(language) }
            let count = currentCaption.value.length
            let float = Number(line.text) / 1000
            for (let i = 0; i < count; i++) {
                // Negative check
                if (currentCaption.value[i].startSeconds >= currentCaption.value[i].endSeconds + float) {
                    currentCaption.value[i].endSeconds = currentCaption.value[i].startSeconds + 0.1

                // Positive check
                } else if (count > i+1 && currentCaption.value[i+1].startSeconds <= currentCaption.value[i].endSeconds + float) {
                    currentCaption.value[i].endSeconds = currentCaption.value[i+1].startSeconds - 0.1

                // Float
                } else {
                    currentCaption.value[i].endSeconds += float
                }
                currentCaption.value[i].endTime = toTime(currentCaption.value[i].endSeconds, true)
            }
            save(slug, CaptionEditAction.Extend, language, line)
        } catch (error) {
            throw error
        }
    }

    async function shift(slug: string, language: string, line: SundraSubtitle) {
        try {
            if (language != currentLanguage.value) { open(language) }
            currentCaption.value.forEach(c => {
                c.startSeconds += Number(line.text) / 1000
                c.startTime = toTime(c.startSeconds, true)
                c.endSeconds += Number(line.text) / 1000
                c.endTime = toTime(c.endSeconds, true)
            })
            save(slug, CaptionEditAction.Shift, language, line)
        } catch (error) {
            throw error
        }
    }

    async function fixCaptionOrder() {
        let i = 0
        let length = currentCaption.value.length
        for (i = 0; i < length; i++) {
            currentCaption.value[i].id = String(i + 1)
        }
    }
    //#endregion

    function renderAsTranscript() {
        if (currentCaption.value != null) {
            let t = currentCaption.value
                .map(c => c.text)
                .map(l => l.toLowerCase())
                .join(' ')
                .replaceAll(/(.)\.(.)/g,'$1.<br>\n')
                .replaceAll(/(.)\?(.)/g,'$1?<br>\n')

            return t.split('\n').map(line => line.charAt(0).toUpperCase() + line.slice(1)).join('\n')
        }
        return ''
    }

    async function translate(slug: string, language: string) {
        try {
            isLoading.value = true
            const response = await $sundrafetch(`/api/files/captions/${slug}/translate`, {
                method: "post",
                body: { language: language },
                activeTeam: authStore.activeTeam?.id
            })
            translations.value.push((response as ApiResponse).data as SundraTranslation)
            open(language)
        } catch (error) {
            if (debug) { console.error('CaptionStore::save', slug, language, error) }
            throw error
        } finally {
            isLoading.value = false
        }
    }

    function update(language: string) {
        if (transcription.value?.language == language) {
            let parsed = srtParser.toSrt(currentCaption.value)
            transcription.value.subtitle = srtParser.toSrt(currentCaption.value)
        } else {
            const i = translations.value.findIndex(i => i.language == language)
            if (i >= 0) {
                let parsed = srtParser.toSrt(currentCaption.value)
                translations.value[i].subtitle = srtParser.toSrt(currentCaption.value)
            }
        }
    }

    async function save(slug: string, action: CaptionEditAction, language: string, line: SundraSubtitle) {
        try {
            isLoading.value = true
            const response = await $sundrafetch(`/api/files/captions/${slug}`, {
                method: "post",
                body: {
                    action: action,
                    language: language,
                    line: line.id,
                    start: line.start,
                    end: line.end,
                    content: line.text,
                    issued: Date.now()
                },
                activeTeam: authStore.activeTeam?.id
            })
            if (response != null) {
                return ((response as ApiResponse).status == 'Success')
            }
        } catch (error) {
            // TODO: Display error
            if (debug) { console.error('CaptionStore::save', slug, action, language, line, error) }
            throw error
        } finally {
            isLoading.value = false
        }
        return false
    }


    async function deleteTranslation(translation: SundraTranslation) {
        isLoading.value = true
        try {
            await $sundrafetch(`/api/files/captions/${translation.id}/translations`, { method: 'DELETE', activeTeam: authStore.activeTeam?.id })
            const i = translations.value.findIndex(i => i.id === translation.id)
            if (i > -1) { translations.value.splice(i, 1) }
        } catch (error) {
            if (debug) { console.log(error) }
            throw error
        } finally {
            isLoading.value = false
        }
    }

    return {
        transcription, translations, isLoading, currentCaption, currentLanguage,
        translate, deleteTranslation, renderAsTranscript, load, open, close, add, edit, merge, remove, shift, extend
    }
})
