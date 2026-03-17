import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useApi } from '../api/useApi'
import { EventsPanel } from '../components/EventsPanel'
import { TableDetail } from '../components/TableDetail'
import { TablesPanel } from '../components/TablesPanel'
import { useAppStore } from '../state/useAppStore'

export const TablesDashboard = () => {
  const { tableId } = useParams()
  const api = useApi()
  const selectedTable = useAppStore((state) => state.selectedTable)
  const setSelectedTable = useAppStore((state) => state.setSelectedTable)
  const setStatus = useAppStore((state) => state.setStatus)

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
      <TablesPanel />
      <TableDetail />
      <EventsPanel />
    </>
  )
}
