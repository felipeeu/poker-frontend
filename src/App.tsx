import './App.css'
import { ApiHeader } from './components/ApiHeader'
import { AuthPanel } from './components/AuthPanel'
import { TablesPanel } from './components/TablesPanel'
import { TableDetail } from './components/TableDetail'
import { EventsPanel } from './components/EventsPanel'
import { useTableEvents } from './hooks/useTableEvents'

function App() {
  useTableEvents()

  return (
    <div className="app">
      <ApiHeader />
      <main className="layout">
        <AuthPanel />
        <TablesPanel />
        <TableDetail />
        <EventsPanel />
      </main>
    </div>
  )
}

export default App
