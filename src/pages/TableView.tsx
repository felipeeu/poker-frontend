import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useApi } from '../api/useApi'
import { TableDetail } from '../components/TableDetail'
import { useAppStore } from '../state/useAppStore'
import type { Table } from '../types'

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
    .slice(0, 5)
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
      <section className="panel panel--detail table-view__nav">
        <div className="table-view__nav-row">
          <div>
            <h2>{t('table.navTitle')}</h2>
            <p className="muted">{tableId || t('table.loading')}</p>
          </div>
          <Link className="btn btn--ghost" to="/tables">
            {t('table.backToTables')}
          </Link>
        </div>
      </section>
      <TableDetail />
      <section className="panel panel--detail">
        <h2>{t('table.recentEvents')}</h2>
        <div className="events">
          {tableEvents.map((event, idx) => (
            <div key={idx} className="event">
              <span className="pill pill--ghost">{event.type}</span>
              <p className="event__summary">{formatEvent(event)}</p>
            </div>
          ))}
          {tableEvents.length === 0 && <p className="muted">{t('events.none')}</p>}
        </div>
      </section>
    </>
  )
}
