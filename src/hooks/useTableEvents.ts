import { useEffect, useRef } from 'react'
import { createApiClient } from '../api/client'
import { useAppStore } from '../state/useAppStore'
import type { ApiEvent, Table } from '../types'

export const useTableEvents = () => {
  const apiBase = useAppStore((state) => state.apiBase)
  const updateTable = useAppStore((state) => state.updateTable)
  const appendEvent = useAppStore((state) => state.appendEvent)
  const mergeSelectedTable = useAppStore((state) => state.mergeSelectedTable)
  const setWsStatus = useAppStore((state) => state.setWsStatus)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!apiBase) return
    if (wsRef.current) wsRef.current.close()

    const api = createApiClient(apiBase)
    const wsUrl = apiBase.replace('http', 'ws') + '/ws'
    setWsStatus('connecting')
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => setWsStatus('connected')
    ws.onclose = () => setWsStatus('disconnected')
    ws.onerror = () => setWsStatus('disconnected')
    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data) as ApiEvent
        if (data.table) updateTable(data.table)
        appendEvent(data)
        if (data.table) {
          const selectedTableId = useAppStore.getState().selectedTable?.id
          if (selectedTableId && data.table.id === selectedTableId) {
            api.request<Table>(`/api/tables/${data.table.id}`)
              .then((table) => {
                mergeSelectedTable((prev) =>
                  prev && table.id === prev.id ? table : prev,
                )
              })
              .catch(() => {
                mergeSelectedTable((prev) =>
                  prev && data.table?.id === prev.id ? { ...prev, ...data.table } : prev,
                )
              })
          } else {
            mergeSelectedTable((prev) =>
              prev && data.table?.id === prev.id ? { ...prev, ...data.table } : prev,
            )
          }
        }
      } catch {
        // ignore bad payloads
      }
    }

    return () => ws.close()
  }, [apiBase, updateTable, appendEvent, mergeSelectedTable, setWsStatus])
}
