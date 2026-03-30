import test from 'node:test'
import assert from 'node:assert/strict'
import {
  isSeatInCurrentHand,
  resolveEffectiveSeatNo,
  syncedSeatNo,
} from '../.codex-tests/src/lib/table-seat.js'

test('owned seat overrides manual and fallback seat selection', () => {
  assert.equal(resolveEffectiveSeatNo({ mySeatNo: 3, seatNo: 4, firstOpenSeatNo: 1 }), 3)
})

test('first open seat is only the initial default when no seat is selected', () => {
  assert.equal(resolveEffectiveSeatNo({ seatNo: 0, firstOpenSeatNo: 4 }), 4)
  assert.equal(resolveEffectiveSeatNo({ seatNo: 2, firstOpenSeatNo: 4 }), 2)
})

test('seat sync adopts owned seat or first open seat only when needed', () => {
  assert.equal(syncedSeatNo({ mySeatNo: 5, seatNo: 2, firstOpenSeatNo: 1 }), 5)
  assert.equal(syncedSeatNo({ seatNo: 0, firstOpenSeatNo: 4 }), 4)
  assert.equal(syncedSeatNo({ seatNo: 2, firstOpenSeatNo: 4 }), null)
})

test('leave restrictions only consider whether my seat is still in the current hand', () => {
  assert.equal(
    isSeatInCurrentHand(2, [
      { 'seat-no': 1, 'in-hand?': true },
      { 'seat-no': 2, 'in-hand?': true },
    ]),
    true,
  )
  assert.equal(
    isSeatInCurrentHand(2, [
      { 'seat-no': 1, 'in-hand?': true },
      { 'seat-no': 2, 'in-hand?': false },
    ]),
    false,
  )
})
