import type { CurrentHand, Table } from '../types'

const tableHand = (table: Table | null | undefined) =>
  ((table?.['current-hand'] ?? table?.current_hand) as CurrentHand | null | undefined) ?? null

const withTableHand = (table: Table, hand: CurrentHand | null) => ({
  ...table,
  'current-hand': hand ?? undefined,
  current_hand: hand ?? undefined,
})

export const shouldRefetchSelectedTable = (
  selectedTableId: string | undefined,
  eventTableId: string | undefined,
) => Boolean(selectedTableId && eventTableId && selectedTableId === eventTableId)

export const mergeSelectedTableEvent = (
  previousTable: Table | null,
  eventTable?: Table | null,
) => {
  if (!previousTable || !eventTable || eventTable.id !== previousTable.id) return previousTable

  const previousHand = tableHand(previousTable)
  const eventHand = tableHand(eventTable)

  if (!previousHand || !eventHand) {
    return { ...previousTable, ...eventTable }
  }

  // Public websocket snapshots may omit private fields like legal-actions and
  // hole-cards. Merge hand payloads so those fields survive a refetch fallback.
  return withTableHand(
    { ...previousTable, ...eventTable },
    { ...previousHand, ...eventHand },
  )
}
