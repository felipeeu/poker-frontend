import test from 'node:test'
import assert from 'node:assert/strict'
import { clubsPageModel } from '../.codex-tests/src/lib/clubs-page.js'

test('logged out clubs page uses a back link to tables and shows the login gate', () => {
  const page = clubsPageModel('')
  assert.equal(page.showLoginGate, true)
  assert.equal(page.backHref, '/tables')
})

test('logged in clubs page still keeps a back link to tables', () => {
  const page = clubsPageModel('token')
  assert.equal(page.showLoginGate, false)
  assert.equal(page.backHref, '/tables')
})
