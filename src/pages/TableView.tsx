import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useApi } from '../api/useApi'
import { TableDetail } from '../components/TableDetail'
import { useAppStore } from '../state/useAppStore'
import type { Table } from '../types'
import { Badge } from '../shared/ui/badge'
import { Panel } from '../shared/ui/panel'

export const TableView = () => {
  const { tableId } = useParams()
  const { t } = useI18n()
  const api = useApi()
  const selectedTable = useAppStore((state) => state.selectedTable)
  const events = useAppStore((state) => state.events)
  const setSelectedTable = useAppStore((state) => state.setSelectedTable)
  const setStatus = useAppStore((state) => state.setStatus)
  const tableEvents = events
    .filter((event) => {
      const payloadTableId =
        typeof event.payload === 'object' && event.payload && 'table-id' in event.payload
          ? (event.payload as { 'table-id'?: string })['table-id']
          : undefined
      return event.table?.id === tableId || payloadTableId === tableId
    })
    .slice(0, 4)
  const formatEvent = (event: typeof events[number]) => {
    if (event.type === 'hand.action') {
      const payload = event.payload as
        | { 'seat-no'?: number; 'action-type'?: string; amount?: number }
        | undefined
      if (!payload) return t('table.event.action')
      const amount = typeof payload.amount === 'number' ? ` ${payload.amount}` : ''
      return t('table.event.seatAction', {
        seat: payload['seat-no'] ?? '?',
        action: payload['action-type'] ?? 'action',
        amount,
      })
    }
    switch (event.type) {
      case 'hand.started':
        return t('table.event.handStarted')
      case 'hand.updated':
        return t('table.event.handUpdated')
      case 'hand.resolved':
        return t('table.event.handResolved')
      case 'table.updated':
        return t('table.event.tableUpdated')
      case 'table.created':
        return t('table.event.tableCreated')
      case 'table.deleted':
        return t('table.event.tableDeleted')
      default:
        return event.type
    }
  }

  useEffect(() => {
    if (!tableId) return
    if (selectedTable?.id === tableId) return

    const load = async () => {
      try {
        const body = await api.request(`/api/tables/${tableId}`) as Table
        setSelectedTable(body)
      } catch (err) {
        setStatus((err as Error).message)
      }
    }

    load()
  }, [api, selectedTable?.id, setSelectedTable, setStatus, tableId])

  return (
    <>
      <Panel className="min-h-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="m-0 text-2xl font-semibold">{t('table.navTitle')}</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{tableId || t('table.loading')}</p>
          </div>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-border-strong)] bg-white/5 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10"
            to="/tables"
          >
            {t('table.backToTables')}
          </Link>
        </div>
      </Panel>
      <TableDetail />
      <Panel className="min-h-0">
        <h2 className="m-0 text-2xl font-semibold">{t('table.recentEvents')}</h2>
        <div className="mt-5 grid gap-3">
          {tableEvents.map((event, idx) => (
            <div key={idx} className="rounded-2xl border border-white/8 bg-black/15 p-4">
              <Badge>{event.type}</Badge>
              <p className="mt-3 text-sm text-[var(--color-foreground)]">{formatEvent(event)}</p>
            </div>
          ))}
          {tableEvents.length === 0 && <p className="text-sm text-[var(--color-muted)]">{t('events.none')}</p>}
        </div>
      </Panel>
    </>
  )
}
