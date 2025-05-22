import transcriptionLanguages from '@/assets/data/languages.transcription.json'
import translationLanguages from '@/assets/data/languages.translation.json'

export const getLanguage = (iso: string): string => {
    let found = transcriptionLanguages.find(i => i.value == iso)
    if (found != null) { return found.label }
    found = translationLanguages.find(i => i.value == iso)
    if (found != null) { return found.label }
    return 'Unknown'
}