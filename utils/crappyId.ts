export const crappyId = (salt?: string):string => {
    const dateStr = Date
        .now()
        .toString(36)

    const randomStr = Math
        .random()
        .toString(36)
        .substring(2, 8)

    return salt+`${dateStr}-${randomStr}`
}