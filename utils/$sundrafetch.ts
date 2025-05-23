import { $fetch, type FetchOptions, FetchError } from "ofetch"

const CSRF_COOKIE = "XSRF-TOKEN"
const CSRF_HEADER = "X-XSRF-TOKEN"

// could not import these types from ofetch, so copied them here
interface ResponseMap {
  blob: Blob,
  text: string,
  arrayBuffer: ArrayBuffer
}
type ResponseType = keyof ResponseMap | "json"
// end of copied types

export type SundraOptions<R extends ResponseType> = FetchOptions<R> & {
  redirectIfNotAuthenticated?: boolean,
  redirectIfNotVerified?: boolean,
  throwErrorOn404?: boolean,
  activeTeam?: number
}

export async function $sundrafetch<T, R extends ResponseType = "json">(
    path: RequestInfo,
    {
      redirectIfNotAuthenticated = true,
      redirectIfNotVerified = true,
      throwErrorOn404 = false,
      ...options
    }: SundraOptions<R> = {}
  ) {
    const { debug, backendUrl, frontendUrl } = useRuntimeConfig().public
    let token = useCookie(CSRF_COOKIE).value

    // on client initiate a csrf request and get it from the cookie set by laravel
    if (
      (token == null || token === undefined) &&
      process.client && ["post", "delete", "put", "patch"].includes(options?.method?.toLowerCase() ?? "")
    ) {
      await initCsrf();
      // cannot use nuxt composables such as useCookie after an async operation:
      // https://github.com/nuxt/framework/issues/5238
      token = getCookie(CSRF_COOKIE)
    }

    let headers: any = {
      accept: "application/json",
      ...options?.headers,
      ...(token && { [CSRF_HEADER]: token }),
    }
    if (options?.activeTeam != null) {
      headers = {
        ...headers,
        'X-Active-Team': options.activeTeam
      }
    }

    if (import.meta.server) {
      headers = {
        ...headers,
        ...useRequestHeaders(["cookie"]),
        referer: frontendUrl,
      }
    }

    try {
      return await $fetch<T, R>(path, {
        baseURL: backendUrl,
        ...options,
        headers,
        credentials: "include",
      })
    } catch (error) {
      if (!(error instanceof FetchError)) throw error

      // when any of the following redirects occur and the final throw is not caught then nuxt SSR will log the following error:
      // [unhandledRejection] Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
      const status = error.response?.status ?? -1


      if (redirectIfNotAuthenticated && [401, 419].includes(status)) {
        console.error("Not authenticated. Login page redirect.")
        return await navigateTo("/login")
      }


      if (redirectIfNotVerified && [409].includes(status)) {
        console.error("Verify email redirect")
      }

      if ([500].includes(status)) {
        console.error("[Sundra Error]", error.data?.message, error.data)
      }

      if (throwErrorOn404 && [404].includes(status)) { throw error }
    }
}

export async function initCsrf() {
  const { backendUrl } = useRuntimeConfig().public;

  await $fetch("/sanctum/csrf-cookie", {
    baseURL: backendUrl,
    credentials: "include",
  })
}


// https://github.com/axios/axios/blob/bdf493cf8b84eb3e3440e72d5725ba0f138e0451/lib/helpers/cookies.js
export function getCookie(name: string) {
  const match = document.cookie.match(
    new RegExp("(^|;\\s*)(" + name + ")=([^;]*)")
  )
  return match ? decodeURIComponent(match[3]) : null
}
