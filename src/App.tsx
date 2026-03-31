import './App.css'
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ApiHeader } from './components/ApiHeader'
import { useApi } from './api/useApi'
import { useTableEvents } from './hooks/useTableEvents'
import { AuthPage } from './pages/AuthPage'
import { ClubsPage } from './pages/ClubsPage'
import { TableView } from './pages/TableView'
import { TablesDashboard } from './pages/TablesDashboard'
import { useAppStore } from './state/useAppStore'
import { ToastViewport } from '@/components/ui/toast'

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
  const refreshToken = useAppStore((state) => state.refreshToken)
  const userId = useAppStore((state) => state.userId)
  const role = useAppStore((state) => state.role)
  const setAuth = useAppStore((state) => state.setAuth)
  const isTableRoute = location.pathname.startsWith('/tables/')
  const isClubRoute = location.pathname === '/clubs'
  const isAuthRoute = location.pathname === '/auth'

  useEffect(() => {
    if (!token || role) return

    let cancelled = false

    api
      .request<{ 'user-id'?: string; role?: string }>('/api/me')
      .then((body) => {
        if (cancelled) return
        setAuth(token, refreshToken, body['user-id'] || userId, body.role || '')
      })
      .catch(() => {
        // Leave existing auth state untouched when role hydration fails.
      })

    return () => {
      cancelled = true
    }
  }, [api, refreshToken, role, setAuth, token, userId])

  return (
    <div className="min-h-screen px-3 py-2.5 text-[var(--color-foreground)] sm:px-6 sm:py-6 lg:px-14 lg:py-12">
      <ToastViewport />
      <StatusToastBridge />
      <div className={isTableRoute ? 'hidden min-[1025px]:block' : ''}>
        <ApiHeader compactOnTableRoute={isTableRoute} />
      </div>
      <main
        className={
          isTableRoute
            ? 'grid grid-cols-1 gap-4 sm:gap-6'
            : isClubRoute
              ? 'grid grid-cols-1 gap-4 sm:gap-6'
            : isAuthRoute
              ? 'grid grid-cols-1 gap-4 sm:gap-6'
              : 'grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]'
        }
      >
        <Routes>
          <Route path="/" element={<Navigate to={token ? '/tables' : '/auth'} replace />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/tables"
            element={(
              <ProtectedRoute token={token}>
                <TablesDashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/clubs"
            element={(
              <ProtectedRoute token={token}>
                <ClubsPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/tables/:tableId"
            element={(
              <ProtectedRoute token={token}>
                <TableView />
              </ProtectedRoute>
            )}
          />
          <Route path="*" element={<Navigate to={token ? '/tables' : '/auth'} replace />} />
        </Routes>
      </main>
    </div>
  )
}

type ProtectedRouteProps = {
  token: string
  children: ReactNode
}

const ProtectedRoute = ({ token, children }: ProtectedRouteProps) => {
  if (!token) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

const StatusToastBridge = () => {
  const status = useAppStore((state) => state.status)
  const pushToast = useAppStore((state) => state.pushToast)
  const setStatus = useAppStore((state) => state.setStatus)

  useEffect(() => {
    if (!status) return
    pushToast(status.message, status.tone)
    setStatus('')
  }, [pushToast, setStatus, status])

  return null
}

export default App
