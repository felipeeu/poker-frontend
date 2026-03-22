import { useState } from 'react'
import { useApi } from '../api/useApi'
import { useAppStore } from '../state/useAppStore'

export const AuthPanel = () => {
  const api = useApi()
  const token = useAppStore((state) => state.token)
  const userId = useAppStore((state) => state.userId)
  const status = useAppStore((state) => state.status)
  const setAuth = useAppStore((state) => state.setAuth)
  const clearAuth = useAppStore((state) => state.clearAuth)
  const setStatus = useAppStore((state) => state.setStatus)
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('Secret123!')
  const [generatedUser, setGeneratedUser] = useState<{ email: string; password: string } | null>(null)

  const handleLogin = async () => {
    setStatus('')
    try {
      const body = await api.request('/api/auth/login', {
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
      const body = await api.request('/api/auth/login', {
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
      <h2>Auth</h2>
      <div className="field">
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="actions">
        <button className="btn" onClick={handleLogin}>Login</button>
        <button className="btn btn--ghost" onClick={handleSignup}>Signup</button>
        <button className="btn btn--ghost" onClick={handleCreateTestUser}>Create Test User</button>
        <button className="btn btn--ghost" onClick={handleCreateAndLoginTestUser}>
          Create + Login Test User
        </button>
      </div>
      {token && (
        <div className="token">
          <p>Logged in as</p>
          <strong>{userId || 'unknown'}</strong>
          <button className="link" onClick={clearAuth}>Logout</button>
        </div>
      )}
      {generatedUser && (
        <div className="token">
          <p>Test user created</p>
          <strong>{generatedUser.email}</strong>
          <p className="muted">Password: {generatedUser.password}</p>
        </div>
      )}
      {status && <p className="error">{status}</p>}
    </section>
  )
}
