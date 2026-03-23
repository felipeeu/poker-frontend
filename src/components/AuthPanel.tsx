import { useState } from 'react'
import { useI18n } from '../i18n'
import { useApi } from '../api/useApi'
import { useAppStore } from '../state/useAppStore'

type AuthResponse = {
  'access-token'?: string
  'user-id'?: string
}

export const AuthPanel = () => {
  const api = useApi()
  const { t } = useI18n()
  const token = useAppStore((state) => state.token)
  const userId = useAppStore((state) => state.userId)
  const status = useAppStore((state) => state.status)
  const setAuth = useAppStore((state) => state.setAuth)
  const clearAuth = useAppStore((state) => state.clearAuth)
  const setStatus = useAppStore((state) => state.setStatus)
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('Secret123!')
  const [generatedUser, setGeneratedUser] = useState<{ email: string; password: string } | null>(null)

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
      setAuth(body['access-token'] || '', body['user-id'] || '')
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
      setAuth(body['access-token'] || '', body['user-id'] || '')
      setGeneratedUser({ email: nextEmail, password: nextPassword })
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  return (
    <section className="panel">
      <h2>{t('auth.title')}</h2>
      <p className="panel__hint">{t('auth.helper')}</p>
      <div className="field">
        <label>{t('auth.email')}</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label>{t('auth.password')}</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="actions">
        <button className="btn" onClick={handleLogin}>{t('auth.login')}</button>
        <button className="btn btn--ghost" onClick={handleSignup}>{t('auth.signup')}</button>
        <button className="btn btn--ghost" onClick={handleCreateTestUser}>{t('auth.createTestUser')}</button>
        <button className="btn btn--ghost" onClick={handleCreateAndLoginTestUser}>
          {t('auth.createAndLoginTestUser')}
        </button>
      </div>
      {token && (
        <div className="token">
          <p>{t('auth.loggedInAs')}</p>
          <strong>{userId || t('auth.unknown')}</strong>
          <button className="link" onClick={clearAuth}>{t('auth.logout')}</button>
        </div>
      )}
      {generatedUser && (
        <div className="token">
          <p>{t('auth.testUserCreated')}</p>
          <strong>{generatedUser.email}</strong>
          <p className="muted">{t('auth.password')}: {generatedUser.password}</p>
          <button className="btn btn--ghost btn--small" onClick={handleUseGeneratedUser}>
            {t('auth.useGeneratedUser')}
          </button>
        </div>
      )}
      {status && <p className="error">{status}</p>}
    </section>
  )
}
