import { useEffect, useState } from 'react'
import { useI18n } from '@/i18n'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../api/useApi'
import { useAppStore } from '@/state/useAppStore'
import type { Table } from '../types'
import { filterTablesByClub, scopedSelectedTableName } from '../lib/clubs-view'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'

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
    <Card className="h-fit">
      <CardContent className="p-3.5 sm:p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <h2 className="m-0 text-[1.38rem] font-semibold leading-none sm:text-[1.65rem]">{t('tables.title')}</h2>
          <div className="flex flex-wrap items-center gap-2">
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
        <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b border-[var(--color-border)] pb-3.5 text-sm text-[var(--color-muted)] sm:mb-5 sm:gap-x-5 sm:pb-4">
          <span>{t('tables.countLabel')}: <strong className="text-[var(--color-foreground)]">{tableCount}</strong></span>
          <span>{t('tables.selectedLabel')}: <strong className="text-[var(--color-foreground)]">{selectedTableName}</strong></span>
        </div>
        <div className="mb-4 border-b border-[var(--color-border)] pb-4 sm:mb-5 sm:pb-5">
          <p className="mb-3 text-sm text-[var(--color-muted)] sm:mb-4">
            {selectedClubId ? t('clubs.tables') : t('clubs.publicTables')}
          </p>
          <div className="grid gap-3 sm:gap-4">
            <div className="grid gap-2">
              <Label>{t('tables.tableId')}</Label>
              <Input value={newTableId} onChange={(e) => setNewTableId(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>{t('tables.name')}</Label>
              <Input value={newTableName} onChange={(e) => setNewTableName(e.target.value)} />
            </div>
          </div>
          <Button className="mt-3 sm:mt-4" onClick={handleCreateTable} disabled={!token}>{t('tables.create')}</Button>
        </div>
        <ul className="grid gap-2.5 p-0 sm:gap-3">
          {visibleTables.map((table) => (
            <li key={table.id} className="list-none">
              <button
                className={
                  selectedTable?.id === table.id
                    ? 'flex w-full items-center justify-between gap-3 rounded-[16px] border border-[var(--color-border-strong)] bg-white/4 p-3 sm:p-4 text-left'
                    : 'flex w-full items-center justify-between gap-3 rounded-[16px] border border-[var(--color-border)] p-3 sm:p-4 text-left transition-colors hover:bg-white/3'
                }
                onClick={() => loadTable(table.id)}
              >
                <div className="min-w-0">
                  <strong className="block text-sm sm:text-base">{table.name || table.id}</strong>
                  <span className="text-sm text-[var(--color-muted)]">{table.id}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {(table['club-id'] ?? table.club_id) ? <Badge>{t('clubs.private')}</Badge> : null}
                  <Badge>{table.status || t('tables.unknown')}</Badge>
                </div>
              </button>
            </li>
          ))}
        </ul>
        {visibleTables.length === 0 && (
          <Alert tone="muted" className="mt-4 px-3.5 py-4 sm:mt-5 sm:px-4 sm:py-5">
            {t(token ? 'tables.empty' : 'tables.emptyLoggedOut')}
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
