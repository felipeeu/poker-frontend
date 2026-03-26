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
import { Button } from './shared/ui/button'
import { Panel } from './shared/ui/panel'

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
    <div className="min-h-screen px-5 py-8 text-[var(--color-foreground)] sm:px-8 lg:px-14 lg:py-12">
      <ApiHeader />
      <GlobalStatus />
      <main
        className={
          isTableRoute
            ? 'grid grid-cols-1 gap-6'
            : 'grid grid-cols-1 gap-6 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)_minmax(300px,360px)]'
        }
      >
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
    <Panel
      className="mb-5 flex flex-col gap-4 border-sky-300/25 bg-[linear-gradient(135deg,rgba(96,165,250,0.16),rgba(15,23,42,0.78))] sm:flex-row sm:items-center sm:justify-between"
      role="status"
      aria-live="polite"
    >
      <div>
        <strong className="block text-sm font-semibold uppercase tracking-[0.18em] text-sky-100">
          {t('status.title')}
        </strong>
        <p className="m-0 text-sm text-[var(--color-foreground)]">{status}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={() => setStatus('')}>
        {t('status.dismiss')}
      </Button>
    </Panel>
  )
}

export default App
