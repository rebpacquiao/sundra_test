import type { SundraOptions } from '@/utils/$sundrafetch'

// could not import these types from ofetch, so copied them here
interface ResponseMap {
    blob: Blob;
    text: string;
    arrayBuffer: ArrayBuffer;
}
type ResponseType = keyof ResponseMap | "json";
// end of copied types

export async function useSundraFetch<T, R extends ResponseType = "json">(url: string,
    {
        redirectIfNotAuthenticated = true,
        redirectIfNotVerified = true,
        ...options
    }: SundraOptions<R> = {}) {
    return useAsyncData(url, () => $sundrafetch(url, options))
}
