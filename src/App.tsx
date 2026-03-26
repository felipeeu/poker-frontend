import './App.css'
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ApiHeader } from './components/ApiHeader'
import { AuthPanel } from './components/AuthPanel'
import { useApi } from './api/useApi'
import { useTableEvents } from './hooks/useTableEvents'
import { TableView } from './pages/TableView'
import { TablesDashboard } from './pages/TablesDashboard'
import { useAppStore } from './state/useAppStore'
import { useI18n } from './i18n'

function App() {
  useTableEvents()

  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

const AppLayout = () => {
  const api = useApi()
  const location = useLocation()
  const token = useAppStore((state) => state.token)
  const userId = useAppStore((state) => state.userId)
  const role = useAppStore((state) => state.role)
  const setAuth = useAppStore((state) => state.setAuth)
  const isTableRoute = location.pathname.startsWith('/tables/')

  useEffect(() => {
    if (!token || role) return

    let cancelled = false

    api
      .request<{ 'user-id'?: string; role?: string }>('/api/me')
      .then((body) => {
        if (cancelled) return
        setAuth(token, body['user-id'] || userId, body.role || '')
      })
      .catch(() => {
        // Leave existing auth state untouched when role hydration fails.
      })

    return () => {
      cancelled = true
    }
  }, [api, role, setAuth, token, userId])

  return (
    <div className="app">
      <ApiHeader />
      <GlobalStatus />
      <main className={`layout ${isTableRoute ? 'layout--table' : ''}`}>
        {!isTableRoute && <AuthPanel />}
        <Routes>
          <Route path="/" element={<Navigate to="/tables" replace />} />
          <Route path="/tables" element={<TablesDashboard />} />
          <Route path="/tables/:tableId" element={<TableView />} />
          <Route path="*" element={<Navigate to="/tables" replace />} />
        </Routes>
      </main>
    </div>
  )
}

const GlobalStatus = () => {
  const status = useAppStore((state) => state.status)
  const setStatus = useAppStore((state) => state.setStatus)
  const { t } = useI18n()

  if (!status) return null

  return (
    <section className="status-banner" role="status" aria-live="polite">
      <div>
        <strong>{t('status.title')}</strong>
        <p>{status}</p>
      </div>
      <button className="btn btn--ghost btn--small" onClick={() => setStatus('')}>
        {t('status.dismiss')}
      </button>
    </section>
  )
}

export default App
