export const ObjectPick = < T extends object, K extends keyof T >(
    obj: T,
    ...keys: K[]
): Pick< T, K > =>
    keys.reduce< any >( ( r, key ) => {
        r[ key ] = obj[ key ];
        return r;
    }, {} );