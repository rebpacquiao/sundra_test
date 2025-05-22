export function highlight(haystack: string, needle: string): string {
    return haystack.replace(new RegExp(needle.trim(), 'gi'), `<mark>$&</mark>`)
}

export function findStringInstances(haystack: string, needle: string): number[] {
    if (needle.length == 0) { return [] }
    haystack = haystack.toLowerCase()
    needle = needle.toLowerCase()

    let si = 0, i, indices = []
    while ((i = haystack.indexOf(needle, si)) > -1) {
        indices.push(i)
        si = i + needle.length
    }
    return indices;
}

export function textToColor(str: string): string {
    let hash = 0;
    str.split('').forEach(char => {
        hash = char.charCodeAt(0) + ((hash << 5) - hash)
    })
    let colour = '#'
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff
        colour += value.toString(16).padStart(2, '0')
    }
    return colour
}