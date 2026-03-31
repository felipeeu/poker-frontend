import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../api/useApi'
import { useAppStore } from '../state/useAppStore'
import type { Table } from '../types'
import { filterTablesByClub, scopedSelectedTableName } from '../lib/clubs-view'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { ButtonLink } from '../components/ui/button-link'
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
  const selectedClub = useAppStore((state) => state.selectedClub)
  const token = useAppStore((state) => state.token)
  const setTables = useAppStore((state) => state.setTables)
  const updateTable = useAppStore((state) => state.updateTable)
  const setSelectedTable = useAppStore((state) => state.setSelectedTable)
  const setSelectedClub = useAppStore((state) => state.setSelectedClub)
  const pushToast = useAppStore((state) => state.pushToast)
  const setStatus = useAppStore((state) => state.setStatus)
  const [newTableId, setNewTableId] = useState('table-1')
  const [newTableName, setNewTableName] = useState('Main Table')
  const navigate = useNavigate()
  const selectedClubId = selectedClub?.id
  const selectedClubName = selectedClub?.name || selectedClub?.id || t('clubs.allTables')
  const visibleTables = filterTablesByClub(tables, selectedClubId)
  const tableCount = visibleTables.length
  const selectedTableName = scopedSelectedTableName(selectedTable, visibleTables)

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
        ...(selectedClubId ? { 'club-id': selectedClubId } : {}),
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
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={loadTables}>{t('tables.refresh')}</Button>
          <ButtonLink size="sm" variant="ghost" to="/clubs">{t('clubs.manage')}</ButtonLink>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant={selectedClubId ? 'accent' : 'neutral'}>{selectedClubName}</Badge>
        {selectedClubId ? (
          <Button size="sm" variant="ghost" onClick={() => setSelectedClub(null)}>
            {t('clubs.allTables')}
          </Button>
        ) : null}
      </div>
      <div className="mb-6 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b border-[var(--color-border)] pb-4 text-sm text-[var(--color-muted)]">
        <span>{t('tables.countLabel')}: <strong className="text-[var(--color-foreground)]">{tableCount}</strong></span>
        <span>{t('tables.selectedLabel')}: <strong className="text-[var(--color-foreground)]">{selectedTableName}</strong></span>
      </div>
      <div className="mb-6 border-b border-[var(--color-border)] pb-6">
        <p className="mb-4 text-sm text-[var(--color-muted)]">
          {selectedClubId ? t('clubs.tables') : t('clubs.publicTables')}
        </p>
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
        {visibleTables.map((table) => (
          <li key={table.id} className="list-none">
            <button
              className={
                selectedTable?.id === table.id
                  ? 'flex w-full items-center justify-between gap-3 rounded-[16px] border border-[var(--color-border-strong)] bg-white/4 p-4 text-left'
                  : 'flex w-full items-center justify-between gap-3 rounded-[16px] border border-[var(--color-border)] p-4 text-left transition-colors hover:bg-white/3'
              }
              onClick={() => loadTable(table.id)}
            >
              <div>
                <strong className="block text-sm sm:text-base">{table.name || table.id}</strong>
                <span className="text-sm text-[var(--color-muted)]">{table.id}</span>
              </div>
              <div className="flex items-center gap-2">
                {(table['club-id'] ?? table.club_id) ? <Badge>{t('clubs.private')}</Badge> : null}
                <Badge>{table.status || t('tables.unknown')}</Badge>
              </div>
            </button>
          </li>
        ))}
      </ul>
      {visibleTables.length === 0 && (
        <p className="mt-5 rounded-[16px] border border-dashed border-[var(--color-border)] px-4 py-5 text-sm text-[var(--color-muted)]">
          {t(token ? 'tables.empty' : 'tables.emptyLoggedOut')}
        </p>
      )}
    </Panel>
  )
}
