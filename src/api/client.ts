export type ApiClient = {
  request: <T = unknown>(path: string, options?: RequestInit) => Promise<T>
}

export const createApiClient = (apiBase: string, token: string): ApiClient => ({
  async request<T = unknown>(path: string, options: RequestInit = {}) {
    const res = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        'content-type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    })
    const text = await res.text()
    let body: unknown = null
    if (text) {
      try {
        body = JSON.parse(text) as unknown
      } catch {
        body = text
      }
    }
    const errorMessage =
      typeof body === 'object' && body && 'error' in body
        ? (body as { error?: string }).error
        : undefined
    if (!res.ok) throw new Error(errorMessage || res.statusText)
    return body as T
  },
})
