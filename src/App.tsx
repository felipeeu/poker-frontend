import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ApiHeader } from './components/ApiHeader'
import { AuthPanel } from './components/AuthPanel'
import { useTableEvents } from './hooks/useTableEvents'
import { TablesDashboard } from './pages/TablesDashboard'

function App() {
  useTableEvents()

  return (
    <BrowserRouter>
      <div className="app">
        <ApiHeader />
        <main className="layout">
          <AuthPanel />
          <Routes>
            <Route path="/" element={<Navigate to="/tables" replace />} />
            <Route path="/tables" element={<TablesDashboard />} />
            <Route path="/tables/:tableId" element={<TablesDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
