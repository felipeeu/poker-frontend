import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../api/useApi'
import { useAppStore } from '../state/useAppStore'
import type { Table } from '../types'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Panel } from '../components/ui/panel'

type TablesResponse = {
  tables: Table[]
}

export const TablesPanel = () => {
  const api = useApi()
  const { t } = useI18n()
  const tables = useAppStore((state) => state.tables)
  const selectedTable = useAppStore((state) => state.selectedTable)
  const token = useAppStore((state) => state.token)
  const setTables = useAppStore((state) => state.setTables)
  const updateTable = useAppStore((state) => state.updateTable)
  const setSelectedTable = useAppStore((state) => state.setSelectedTable)
  const pushToast = useAppStore((state) => state.pushToast)
  const setStatus = useAppStore((state) => state.setStatus)
  const [newTableId, setNewTableId] = useState('table-1')
  const [newTableName, setNewTableName] = useState('Main Table')
  const navigate = useNavigate()
  const tableCount = tables.length
  const selectedTableName = selectedTable?.name || selectedTable?.id || '—'

  const loadTables = async () => {
    try {
      const body = await api.request<TablesResponse>('/api/tables')
      setTables(body.tables || [])
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const loadTable = async (id: string) => {
    try {
      const body = await api.request(`/api/tables/${id}`) as Table
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
      const table = await api.request<Table>('/api/tables', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      updateTable(table)
      setSelectedTable(table)
      pushToast(t('tables.createSuccess', { table: table.name || table.id }), 'success')
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
    <Panel className="h-fit">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="m-0 text-2xl font-semibold">{t('tables.title')}</h2>
        <Button size="sm" onClick={loadTables}>{t('tables.refresh')}</Button>
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
          <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">{t('tables.countLabel')}</span>
          <strong className="mt-2 block text-3xl">{tableCount}</strong>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
          <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">{t('tables.selectedLabel')}</span>
          <strong className="mt-2 block text-lg">{selectedTableName}</strong>
        </div>
      </div>
      <div className="mb-6 rounded-[24px] border border-[var(--color-border)] bg-[rgba(16,29,21,0.66)] p-5">
        <p className="mb-4 text-sm text-[var(--color-muted)]">{t('tables.helper')}</p>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">{t('tables.tableId')}</label>
            <Input value={newTableId} onChange={(e) => setNewTableId(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">{t('tables.name')}</label>
            <Input value={newTableName} onChange={(e) => setNewTableName(e.target.value)} />
          </div>
        </div>
        <Button className="mt-4" onClick={handleCreateTable} disabled={!token}>{t('tables.create')}</Button>
      </div>
      <ul className="grid gap-3 p-0">
        {tables.map((table) => (
          <li key={table.id} className="list-none">
            <button
              className={
                selectedTable?.id === table.id
                  ? 'flex w-full items-center justify-between gap-3 rounded-2xl border border-[color-mix(in_oklab,var(--color-accent)_35%,transparent)] bg-[color-mix(in_oklab,var(--color-accent)_12%,transparent)] p-4 text-left shadow-[0_10px_30px_rgba(3,10,7,0.24)]'
                  : 'flex w-full items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/5 p-4 text-left transition-colors hover:bg-white/8'
              }
              onClick={() => loadTable(table.id)}
            >
              <div>
                <strong className="block text-sm sm:text-base">{table.name || table.id}</strong>
                <span className="text-sm text-[var(--color-muted)]">{table.id}</span>
              </div>
              <Badge>{table.status || t('tables.unknown')}</Badge>
            </button>
          </li>
        ))}
      </ul>
      {tables.length === 0 && (
        <p className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/4 px-4 py-5 text-sm text-[var(--color-muted)]">
          {t(token ? 'tables.empty' : 'tables.emptyLoggedOut')}
        </p>
      )}
    </Panel>
  )
}
