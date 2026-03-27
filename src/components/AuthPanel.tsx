import { useState } from 'react'
import { useI18n } from '../i18n'
import { useApi } from '../api/useApi'
import { useAppStore } from '../state/useAppStore'
import { Button } from '../shared/ui/button'
import { ConfirmDialog } from '../shared/ui/confirm-dialog'
import { Input } from '../shared/ui/input'
import { Panel } from '../shared/ui/panel'

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
  const status = useAppStore((state) => state.status)
  const setAuth = useAppStore((state) => state.setAuth)
  const clearAuth = useAppStore((state) => state.clearAuth)
  const setStatus = useAppStore((state) => state.setStatus)
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('Secret123!')
  const [generatedUser, setGeneratedUser] = useState<{ email: string; password: string } | null>(null)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  const handleUseGeneratedUser = () => {
    if (!generatedUser) return
    setEmail(generatedUser.email)
    setPassword(generatedUser.password)
    setStatus(t('auth.credentialsLoaded'))
  }

  const handleLogin = async () => {
    setStatus('')
    try {
      const body = await api.request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      setAuth(body['access-token'] || '', body['refresh-token'] || '', body['user-id'] || '', body.role || '')
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

  const handleCreateTestUser = async () => {
    setStatus('')
    const nextEmail = `player+${Date.now()}@example.com`
    const nextPassword = 'Secret123!'
    try {
      await api.request('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email: nextEmail, password: nextPassword }),
      })
      setGeneratedUser({ email: nextEmail, password: nextPassword })
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleCreateAndLoginTestUser = async () => {
    setStatus('')
    const nextEmail = `player+${Date.now()}@example.com`
    const nextPassword = 'Secret123!'
    try {
      await api.request('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email: nextEmail, password: nextPassword }),
      })
      const body = await api.request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: nextEmail, password: nextPassword }),
      })
      setAuth(body['access-token'] || '', body['refresh-token'] || '', body['user-id'] || '', body.role || '')
      setGeneratedUser({ email: nextEmail, password: nextPassword })
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleLogout = async () => {
    setStatus('')
    try {
      if (refreshToken) {
        await api.request('/api/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ 'refresh-token': refreshToken }),
        })
      }
    } catch (err) {
      setStatus((err as Error).message)
    } finally {
      clearAuth()
    }
  }

  const handleRequestLogout = () => {
    setIsLogoutDialogOpen(true)
  }

  return (
    <Panel className="h-fit">
      <h2 className="m-0 text-2xl font-semibold">{t('auth.title')}</h2>
      <p className="mb-5 mt-2 text-sm text-[var(--color-muted)]">{t('auth.helper')}</p>
      <div className="mb-4 grid gap-2">
        <label className="text-sm font-medium">{t('auth.email')}</label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="mb-5 grid gap-2">
        <label className="text-sm font-medium">{t('auth.password')}</label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleLogin}>{t('auth.login')}</Button>
        <Button variant="ghost" onClick={handleSignup}>{t('auth.signup')}</Button>
        <Button variant="ghost" onClick={handleCreateTestUser}>{t('auth.createTestUser')}</Button>
        <Button variant="ghost" onClick={handleCreateAndLoginTestUser}>
          {t('auth.createAndLoginTestUser')}
        </Button>
      </div>
      {token && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="m-0 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">{t('auth.loggedInAs')}</p>
          <strong className="mt-2 block text-sm">{userId || t('auth.unknown')}</strong>
          <Button className="mt-4" variant="ghost" size="sm" onClick={handleRequestLogout}>{t('auth.logout')}</Button>
        </div>
      )}
      {generatedUser && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="m-0 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">{t('auth.testUserCreated')}</p>
          <strong className="mt-2 block text-sm">{generatedUser.email}</strong>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{t('auth.password')}: {generatedUser.password}</p>
          <Button className="mt-4" variant="ghost" size="sm" onClick={handleUseGeneratedUser}>
            {t('auth.useGeneratedUser')}
          </Button>
        </div>
      )}
      {status && <p className="mt-4 text-sm text-rose-200">{status}</p>}
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
