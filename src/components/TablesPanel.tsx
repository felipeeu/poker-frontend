import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../api/useApi'
import { useAppStore } from '../state/useAppStore'

export const TablesPanel = () => {
  const api = useApi()
  const tables = useAppStore((state) => state.tables)
  const selectedTable = useAppStore((state) => state.selectedTable)
  const token = useAppStore((state) => state.token)
  const setTables = useAppStore((state) => state.setTables)
  const updateTable = useAppStore((state) => state.updateTable)
  const setSelectedTable = useAppStore((state) => state.setSelectedTable)
  const setStatus = useAppStore((state) => state.setStatus)
  const [newTableId, setNewTableId] = useState('table-1')
  const [newTableName, setNewTableName] = useState('Main Table')
  const navigate = useNavigate()

  const loadTables = async () => {
    try {
      const body = await api.request('/api/tables')
      setTables(body.tables || [])
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const loadTable = async (id: string) => {
    try {
      const body = await api.request(`/api/tables/${id}`)
      setSelectedTable(body)
      navigate(`/tables/${id}`)
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleCreateTable = async () => {
    setStatus('')
    try {
      const payload = {
        id: newTableId.trim(),
        name: newTableName.trim(),
      }
      const table = await api.request('/api/tables', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      updateTable(table)
      setSelectedTable(table)
      navigate(`/tables/${table.id}`)
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  useEffect(() => {
    loadTables()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <section className="panel">
      <div className="panel__header">
        <h2>Tables</h2>
        <button className="btn btn--small" onClick={loadTables}>Refresh</button>
      </div>
      <div className="create-table">
        <div className="field">
          <label>Table ID</label>
          <input value={newTableId} onChange={(e) => setNewTableId(e.target.value)} />
        </div>
        <div className="field">
          <label>Name</label>
          <input value={newTableName} onChange={(e) => setNewTableName(e.target.value)} />
        </div>
        <button className="btn" onClick={handleCreateTable} disabled={!token}>Create Table</button>
      </div>
      <ul className="table-list">
        {tables.map((table) => (
          <li key={table.id}>
            <button
              className={`table-card ${selectedTable?.id === table.id ? 'is-active' : ''}`}
              onClick={() => loadTable(table.id)}
            >
              <div>
                <strong>{table.name || table.id}</strong>
                <span className="muted">{table.id}</span>
              </div>
              <span className="pill">{table.status || 'unknown'}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
