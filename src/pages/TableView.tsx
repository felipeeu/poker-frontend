import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useApi } from '../api/useApi'
import { TableDetail } from '../components/TableDetail'
import { useAppStore } from '../state/useAppStore'

export const TableView = () => {
  const { tableId } = useParams()
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
      if (!payload) return 'Action'
      const amount = typeof payload.amount === 'number' ? ` ${payload.amount}` : ''
      return `Seat ${payload['seat-no'] ?? '?'} ${payload['action-type'] ?? 'action'}${amount}`
    }
    switch (event.type) {
      case 'hand.started':
        return 'Hand started'
      case 'hand.updated':
        return 'Hand updated'
      case 'hand.resolved':
        return 'Hand resolved'
      case 'table.updated':
        return 'Table updated'
      case 'table.created':
        return 'Table created'
      case 'table.deleted':
        return 'Table deleted'
      default:
        return event.type
    }
  }

  useEffect(() => {
    if (!tableId) return
    if (selectedTable?.id === tableId) return

    const load = async () => {
      try {
        const body = await api.request(`/api/tables/${tableId}`)
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
            <h2>Table</h2>
            <p className="muted">{tableId || 'loading...'}</p>
          </div>
          <Link className="btn btn--ghost" to="/tables">
            Back to tables
          </Link>
        </div>
      </section>
      <TableDetail />
      <section className="panel panel--detail">
        <h2>Recent Events</h2>
        <div className="events">
          {tableEvents.map((event, idx) => (
            <div key={idx} className="event">
              <span className="pill pill--ghost">{event.type}</span>
              <p className="event__summary">{formatEvent(event)}</p>
            </div>
          ))}
          {tableEvents.length === 0 && <p className="muted">No events yet.</p>}
        </div>
      </section>
    </>
  )
}
