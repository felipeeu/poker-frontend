type RequestAuthPolicyInput = {
  status: number
  path: string
  token: string
}

export const shouldAttemptTokenRefresh = ({
  status,
  path,
  token,
}: RequestAuthPolicyInput) =>
  status === 401 &&
  Boolean(token) &&
  path !== '/api/auth/login' &&
  path !== '/api/auth/refresh'

export const shouldClearAuthForPath = (status: number, path: string) =>
  status === 401 && path === '/api/me'
