import { useState } from 'react'
import { useI18n } from '../i18n'
import { useApi } from '../api/useApi'
import { useAppStore } from '../state/useAppStore'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { ConfirmDialog } from '../components/ui/confirm-dialog'
import { Input } from '../components/ui/input'
import { Panel } from '../components/ui/panel'

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
  const refreshToken = useAppStore((state) => state.refreshToken)
  const userId = useAppStore((state) => state.userId)
  const setAuth = useAppStore((state) => state.setAuth)
  const clearAuth = useAppStore((state) => state.clearAuth)
  const pushToast = useAppStore((state) => state.pushToast)
  const setStatus = useAppStore((state) => state.setStatus)
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('Secret123!')
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

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

  const handleLogout = async () => {
    setStatus('')
    let revoked = false
    try {
      if (refreshToken) {
        await api.request('/api/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ 'refresh-token': refreshToken }),
        })
      }
      revoked = true
    } catch (err) {
      setStatus((err as Error).message)
    } finally {
      clearAuth()
      if (revoked || !refreshToken) {
        pushToast(t('auth.logoutSuccess'), 'success')
      }
    }
  }

  const handleRequestLogout = () => {
    setIsLogoutDialogOpen(true)
  }

  return (
    <Panel className="h-fit">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="m-0 text-2xl font-semibold">{t('auth.title')}</h2>
          <p className="mb-0 mt-2 max-w-md text-sm text-[var(--color-muted)]">{t('auth.helper')}</p>
        </div>
        <Badge variant={token ? 'success' : 'neutral'}>
          {token ? t('auth.loggedInAs') : t('auth.login')}
        </Badge>
      </div>

      <div className="mt-6 grid gap-4 border-t border-[var(--color-border)] pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <strong className="block text-base">{t('auth.login')}</strong>
            <p className="m-0 mt-1 text-sm text-[var(--color-muted)]">`admin@example.com` / `Secret123!`</p>
          </div>
          <Badge>Seeded</Badge>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">{t('auth.email')}</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">{t('auth.password')}</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button className="w-full" onClick={handleLogin}>{t('auth.login')}</Button>
          <Button className="w-full" variant="ghost" onClick={handleSignup}>{t('auth.signup')}</Button>
        </div>
      </div>

      {token && (
        <div className="mt-5 border-t border-[var(--color-border)] pt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="m-0 text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">{t('auth.loggedInAs')}</p>
              <strong className="mt-2 block text-sm">{userId || t('auth.unknown')}</strong>
            </div>
            <Badge variant="success">Live session</Badge>
          </div>
          <Button className="mt-4 w-full sm:w-auto" variant="ghost" size="sm" onClick={handleRequestLogout}>
            {t('auth.logout')}
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        title={t('auth.confirmLogoutTitle')}
        description={t('auth.confirmLogoutDescription')}
        cancelLabel={t('dialog.cancel')}
        confirmLabel={t('dialog.confirm')}
        onConfirm={handleLogout}
      />
    </Panel>
  )
}
