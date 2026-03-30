import type { Club, Table } from '../types'

export const selectedClubRoleForUser = (club: Club | null, userId: string) => {
  if (!club || !userId) return null
  const member = club.members?.find((item) => (item['user-id'] ?? item.user_id) === userId)
  return member?.role ?? null
}

export const nextSelectedClub = (clubs: Club[], currentId?: string | null) =>
  clubs.find((club) => club.id === currentId) ?? clubs[0] ?? null

export const filterTablesByClub = (tables: Table[], selectedClubId?: string | null) =>
  selectedClubId
    ? tables.filter((table) => (table['club-id'] ?? table.club_id) === selectedClubId)
    : tables

export const scopedSelectedTableName = (selectedTable: Table | null, visibleTables: Table[]) => {
  if (!selectedTable) return '—'
  const visible = visibleTables.find((table) => table.id === selectedTable.id)
  return visible?.name || visible?.id || '—'
}
