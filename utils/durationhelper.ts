export const toSeconds = (duration: string): number => {
    duration = duration.replace(',','.')
    const [hours, minutes, seconds] = duration.split(':')
    return Number(hours) * 60 * 60 + Number(minutes) * 60 + Number(seconds)
}

export const toTime = (seconds: number, withMilliseconds: boolean = false): string => {
    let date = new Date(0)
    let floor = Math.floor(seconds)
    let count = 19 + (withMilliseconds ? 4 : 0)
    date.setSeconds(floor, floor > 0 ? Number(((seconds % floor) * 1000).toFixed(3)) : Number((seconds * 1000).toFixed(3)))
    try {
        return date.toISOString().substring(11, count)
    } catch (e) {
        console.error('Helpers::durationhelper:toTime', seconds, withMilliseconds, e)
    }
    return ''
}