import { useAppStore } from '../state/useAppStore'
import { shouldAttemptTokenRefresh, shouldClearAuthForPath } from '../lib/api-auth'

export type ApiClient = {
  request: <T = unknown>(path: string, options?: RequestInit) => Promise<T>
}

type ApiErrorBody = {
  error?: string
}

type AuthResponse = {
  'access-token'?: string
  'refresh-token'?: string
  'user-id'?: string
  role?: string
}

class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

let refreshPromise: Promise<string | null> | null = null

const parseBody = async (res: Response) => {
  const text = await res.text()
  if (!text) return null

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

const getErrorMessage = (body: unknown, fallback: string) =>
  typeof body === 'object' && body && 'error' in body
    ? ((body as ApiErrorBody).error || fallback)
    : fallback

const refreshAccessToken = async (apiBase: string) => {
  const { refreshToken, clearAuth, setAuth } = useAppStore.getState()
  if (!refreshToken) {
    clearAuth()
    return null
  }

  const res = await fetch(`${apiBase}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ 'refresh-token': refreshToken }),
  })
  const body = await parseBody(res)

  if (!res.ok) {
    clearAuth()
    throw new ApiError(res.status, getErrorMessage(body, res.statusText))
  }

  const auth = body as AuthResponse | null
  const nextAccessToken = auth?.['access-token'] || ''
  const nextRefreshToken = auth?.['refresh-token'] || ''
  const nextUserId = auth?.['user-id'] || ''
  const nextRole = auth?.role || ''

  if (!nextAccessToken || !nextRefreshToken || !nextUserId) {
    clearAuth()
    return null
  }

  setAuth(nextAccessToken, nextRefreshToken, nextUserId, nextRole)
  return nextAccessToken
}

const getRefreshedToken = async (apiBase: string) => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken(apiBase).finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

export const createApiClient = (apiBase: string): ApiClient => ({
  async request<T = unknown>(path: string, options: RequestInit = {}) {
    const makeRequest = async (token: string) => {
      const res = await fetch(`${apiBase}${path}`, {
        ...options,
        headers: {
          'content-type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
      })
      const body = await parseBody(res)

      return { res, body }
    }

    const { token, clearAuth } = useAppStore.getState()
    let { res, body } = await makeRequest(token)

    if (shouldAttemptTokenRefresh({ status: res.status, path, token })) {
      try {
        const nextToken = await getRefreshedToken(apiBase)
        if (nextToken) {
          ;({ res, body } = await makeRequest(nextToken))
        }
      } catch {
        // Auth state is already cleared during failed refresh.
      }
    }

    if (shouldClearAuthForPath(res.status, path)) {
      clearAuth()
    }

    if (!res.ok) {
      throw new ApiError(res.status, getErrorMessage(body, res.statusText))
    }

    return body as T
  },
})
