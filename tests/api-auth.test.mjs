import test from 'node:test'
import assert from 'node:assert/strict'
import {
  shouldAttemptTokenRefresh,
  shouldClearAuthForPath,
} from '../.codex-tests/src/lib/api-auth.js'

test('401 on a normal authenticated request should trigger token refresh', () => {
  assert.equal(
    shouldAttemptTokenRefresh({
      status: 401,
      path: '/api/tables',
      token: 'token',
    }),
    true,
  )
})

test('login and refresh endpoints should not recursively trigger token refresh', () => {
  assert.equal(
    shouldAttemptTokenRefresh({
      status: 401,
      path: '/api/auth/login',
      token: 'token',
    }),
    false,
  )
  assert.equal(
    shouldAttemptTokenRefresh({
      status: 401,
      path: '/api/auth/refresh',
      token: 'token',
    }),
    false,
  )
})

test('requests without a token should not trigger token refresh', () => {
  assert.equal(
    shouldAttemptTokenRefresh({
      status: 401,
      path: '/api/tables',
      token: '',
    }),
    false,
  )
})

test('/api/me 401 should clear auth, but other endpoints should not', () => {
  assert.equal(shouldClearAuthForPath(401, '/api/me'), true)
  assert.equal(shouldClearAuthForPath(401, '/api/tables'), false)
  assert.equal(shouldClearAuthForPath(200, '/api/me'), false)
})
