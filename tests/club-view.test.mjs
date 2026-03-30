import test from 'node:test'
import assert from 'node:assert/strict'
import {
  filterTablesByClub,
  scopedSelectedTableName,
  selectedClubRoleForUser,
} from '../.codex-tests/src/lib/clubs-view.js'

test('filterTablesByClub returns only tables from the selected club', () => {
  const tables = [
    { id: 't1', name: 'Public' },
    { id: 't2', name: 'Club A', 'club-id': 'club-a' },
    { id: 't3', name: 'Club B', club_id: 'club-b' },
  ]

  assert.deepEqual(
    filterTablesByClub(tables, 'club-a').map((table) => table.id),
    ['t2'],
  )
  assert.deepEqual(
    filterTablesByClub(tables, null).map((table) => table.id),
    ['t1', 't2', 't3'],
  )
})

test('scopedSelectedTableName hides a selected table outside the current scope', () => {
  const selectedTable = { id: 't3', name: 'Club B', club_id: 'club-b' }
  const visibleTables = [{ id: 't2', name: 'Club A', 'club-id': 'club-a' }]

  assert.equal(scopedSelectedTableName(selectedTable, visibleTables), '—')
})

test('selectedClubRoleForUser returns null when the user is not a club member', () => {
  const club = {
    id: 'club-a',
    members: [{ 'user-id': 'u1', role: 'owner' }],
  }

  assert.equal(selectedClubRoleForUser(club, 'u9'), null)
  assert.equal(selectedClubRoleForUser(club, 'u1'), 'owner')
})
