import test from 'node:test'
import assert from 'node:assert/strict'
import {
  mergeSelectedTableEvent,
  shouldRefetchSelectedTable,
} from '../.codex-tests/src/lib/table-events.js'

test('selected table websocket updates trigger authenticated refetch only for the active table', () => {
  assert.equal(shouldRefetchSelectedTable('table-1', 'table-1'), true)
  assert.equal(shouldRefetchSelectedTable('table-1', 'table-2'), false)
  assert.equal(shouldRefetchSelectedTable(undefined, 'table-1'), false)
})

test('fallback selected-table merge preserves private hand fields from the previous table view', () => {
  const previousTable = {
    id: 'table-1',
    name: 'Main',
    'current-hand': {
      status: 'in-progress',
      'actor-seat': 2,
      'legal-actions': { '2': ['call', 'fold'] },
      'hole-cards': { '2': ['AS', 'KH'] },
    },
  }
  const eventTable = {
    id: 'table-1',
    status: 'in-hand',
    'current-hand': {
      status: 'in-progress',
      'actor-seat': 3,
      board: ['7C', '7H', 'KC'],
    },
  }

  const merged = mergeSelectedTableEvent(previousTable, eventTable)

  assert.deepEqual(merged['current-hand']['legal-actions'], { '2': ['call', 'fold'] })
  assert.deepEqual(merged['current-hand']['hole-cards'], { '2': ['AS', 'KH'] })
  assert.equal(merged['current-hand']['actor-seat'], 3)
  assert.deepEqual(merged['current-hand'].board, ['7C', '7H', 'KC'])
})

test('selected-table merge ignores websocket events for other tables', () => {
  const previousTable = { id: 'table-1', name: 'Main' }
  const eventTable = { id: 'table-2', name: 'Other' }

  assert.equal(mergeSelectedTableEvent(previousTable, eventTable), previousTable)
})
