import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useApi } from '../api/useApi'
import { TableDetail } from '../components/TableDetail'
import { useAppStore } from '../state/useAppStore'
import type { Table } from '../types'
import { Badge } from '../components/ui/badge'
import { ButtonLink } from '../components/ui/button-link'
import { Panel } from '../components/ui/panel'

export const TableView = () => {
  const { tableId } = useParams()
  const { t } = useI18n()
  const api = useApi()
  const token = useAppStore((state) => state.token)
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
    if (!token && tableId) {
      setStatus(t('detail.loginRequired'), 'info')
    }
  }, [setStatus, t, tableId, token])

  useEffect(() => {
    if (!token) return
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
  }, [api, selectedTable?.id, setSelectedTable, setStatus, tableId, token])

  if (!token) {
    return <Navigate to="/tables" replace />
  }

  return (
    <>
      <Panel className="min-h-0 p-3 sm:p-6 max-[1024px]:rounded-none max-[1024px]:border-x-0 max-[1024px]:border-t-0 max-[1024px]:bg-transparent max-[1024px]:px-0 max-[1024px]:py-1 max-[1024px]:shadow-none max-[1024px]:backdrop-blur-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="m-0 text-[12px] font-semibold sm:text-2xl">{t('table.navTitle')}</h2>
            <p className="mt-0 text-[9px] text-[var(--color-muted)] sm:mt-1 sm:text-sm">{tableId || t('table.loading')}</p>
          </div>
          <ButtonLink className="min-h-6 rounded-md px-2 py-0.5 text-[9px] sm:min-h-11 sm:px-4 sm:py-2.5 sm:text-sm" variant="ghost" to="/tables">
            {t('table.backToTables')}
          </ButtonLink>
        </div>
      </Panel>
      <TableDetail />
      <Panel className="hidden min-h-0 min-[1025px]:block">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="m-0 text-2xl font-semibold">{t('table.recentEvents')}</h2>
            {tableEvents.length > 0 ? (
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {t('table.recentEventsCount', { count: tableEvents.length })}
              </p>
            ) : null}
          </div>
          {tableEvents.length > 0 ? <Badge variant="accent">{tableEvents[0]?.type}</Badge> : null}
        </div>
        <div className="mt-5 grid gap-3">
          {tableEvents.map((event, idx) => (
            <div key={idx} className="rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.12))] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge>{event.type}</Badge>
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  #{String(idx + 1).padStart(2, '0')}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--color-foreground)]">{formatEvent(event)}</p>
            </div>
          ))}
          {tableEvents.length === 0 && <p className="text-sm text-[var(--color-muted)]">{t('events.none')}</p>}
        </div>
      </Panel>
      <details className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 shadow-[var(--shadow-panel)] backdrop-blur-md min-[1025px]:hidden">
        <summary className="cursor-pointer text-sm font-semibold marker:text-[var(--color-muted)]">
          {t('table.recentEvents')}
        </summary>
        <div className="mt-4 grid gap-3">
          {tableEvents.length > 0 ? <Badge variant="accent">{tableEvents[0]?.type}</Badge> : null}
          {tableEvents.map((event, idx) => (
            <div key={idx} className="rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.12))] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge>{event.type}</Badge>
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  #{String(idx + 1).padStart(2, '0')}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--color-foreground)]">{formatEvent(event)}</p>
            </div>
          ))}
          {tableEvents.length === 0 ? <p className="text-sm text-[var(--color-muted)]">{t('events.none')}</p> : null}
        </div>
      </details>
    </>
  )
}
