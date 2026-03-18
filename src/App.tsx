import './App.css'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ApiHeader } from './components/ApiHeader'
import { AuthPanel } from './components/AuthPanel'
import { useTableEvents } from './hooks/useTableEvents'
import { TableView } from './pages/TableView'
import { TablesDashboard } from './pages/TablesDashboard'

function App() {
  useTableEvents()

  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

const AppLayout = () => {
  const location = useLocation()
  const isTableRoute = location.pathname.startsWith('/tables/')

  return (
    <div className="app">
      {!isTableRoute && <ApiHeader />}
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

export default App
