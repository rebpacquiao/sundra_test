export function capitalizeFirstLetter(s: string|undefined): string {
    if (s == undefined) return ''
    return s.charAt(0).toUpperCase() + s.slice(1);
}