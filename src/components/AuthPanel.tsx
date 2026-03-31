import { useState } from 'react'
import { useI18n } from '@/i18n'
import { useApi } from '../api/useApi'
import { useAppStore } from '@/state/useAppStore'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type AuthResponse = {
  'access-token'?: string
  'refresh-token'?: string
  'user-id'?: string
  role?: string
}

export const AuthPanel = () => {
  const api = useApi()
  const { t } = useI18n()
  const token = useAppStore((state) => state.token)
  const setAuth = useAppStore((state) => state.setAuth)
  const pushToast = useAppStore((state) => state.pushToast)
  const setStatus = useAppStore((state) => state.setStatus)
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('Secret123!')

  const handleLogin = async () => {
    setStatus('')
    try {
      const body = await api.request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      setAuth(body['access-token'] || '', body['refresh-token'] || '', body['user-id'] || '', body.role || '')
      pushToast(t('auth.loginSuccess'), 'success')
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleSignup = async () => {
    setStatus('')
    try {
      await api.request('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      await handleLogin()
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 p-4 pb-0 sm:p-6 sm:pb-0">
        <div>
          <CardTitle className="text-[1.38rem] sm:text-2xl">{t('auth.title')}</CardTitle>
          <CardDescription className="mt-1.5 max-w-md text-sm sm:mt-2">{t('auth.helper')}</CardDescription>
        </div>
        <Badge variant={token ? 'success' : 'neutral'}>
          {token ? t('auth.loggedInAs') : t('auth.login')}
        </Badge>
      </CardHeader>

      <CardContent className="grid gap-3.5 border-t border-[var(--color-border)] p-4 pt-4 sm:gap-4 sm:p-6 sm:pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <strong className="block text-base">{t('auth.login')}</strong>
            <p className="m-0 mt-1 text-sm text-[var(--color-muted)]">`admin@example.com` / `Secret123!`</p>
          </div>
          <Badge>Seeded</Badge>
        </div>
        <div className="grid gap-3 sm:gap-4">
          <div className="grid gap-2">
            <Label>{t('auth.email')}</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>{t('auth.password')}</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
          <Button className="w-full" onClick={handleLogin}>{t('auth.login')}</Button>
          <Button className="w-full" variant="ghost" onClick={handleSignup}>{t('auth.signup')}</Button>
        </div>
      </CardContent>
    </Card>
  )
}
