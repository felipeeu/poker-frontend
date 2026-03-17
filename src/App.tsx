import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

type Seat = {
  'seat-no'?: number
  'seat_no'?: number
  user_id?: string | null
  'user-id'?: string | null
  stack?: number
  sitting_out?: boolean
  'sitting-out?'?: boolean
}

type Table = {
  id: string
  name?: string
  status?: string
  seats?: Seat[]
  current_hand?: unknown
  'current-hand'?: unknown
}

type ApiEvent = {
  type: string
  table?: Table
  payload?: unknown
}

const DEFAULT_API = 'http://localhost:8080'

function App() {
  const [apiBase, setApiBase] = useState(DEFAULT_API)
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('Secret123!')
  const [token, setToken] = useState(() => localStorage.getItem('poker_token') || '')
  const [userId, setUserId] = useState(() => localStorage.getItem('poker_user_id') || '')
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [status, setStatus] = useState<string>('')
  const [wsStatus, setWsStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [newTableId, setNewTableId] = useState('table-1')
  const [newTableName, setNewTableName] = useState('Main Table')
  const [seatNo, setSeatNo] = useState(1)
  const [seatStack, setSeatStack] = useState(1000)
  const [buyInAmount, setBuyInAmount] = useState(500)
  const [dealerSeat, setDealerSeat] = useState(1)
  const [actionSeat, setActionSeat] = useState(1)
  const [actionAmount, setActionAmount] = useState(20)
  const wsRef = useRef<WebSocket | null>(null)

  const currentHand = useMemo(() => {
    if (!selectedTable) return null
    return (selectedTable['current-hand'] || selectedTable.current_hand) as any
  }, [selectedTable])

  const actorSeatNo = currentHand?.['actor-seat'] as number | undefined
  const legalActions = currentHand?.['legal-actions'] as Record<string, string[]> | undefined
  const legalForSeat = legalActions ? legalActions[String(actionSeat)] || legalActions[actionSeat] : undefined

  const displaySeats = useMemo(() => {
    const seats = selectedTable?.seats ?? []
    return [...seats].sort((a, b) => {
      const aNo = a['seat-no'] ?? a['seat_no'] ?? 0
      const bNo = b['seat-no'] ?? b['seat_no'] ?? 0
      return aNo - bNo
    })
  }, [selectedTable])

  useEffect(() => {
    localStorage.setItem('poker_token', token)
    localStorage.setItem('poker_user_id', userId)
  }, [token, userId])

  const authHeaders = useMemo(() => {
    if (!token) return {}
    return { Authorization: `Bearer ${token}` }
  }, [token])

  const apiFetch = async (path: string, options: RequestInit = {}) => {
    const res = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        'content-type': 'application/json',
        ...authHeaders,
        ...(options.headers || {}),
      },
    })
    const text = await res.text()
    let body: any = null
    if (text) {
      try {
        body = JSON.parse(text)
      } catch {
        body = text
      }
    }
    if (!res.ok) throw new Error(body?.error || res.statusText)
    return body
  }

  const loadTables = async () => {
    try {
      const body = await apiFetch('/api/tables')
      setTables(body.tables || [])
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const loadTable = async (id: string) => {
    try {
      const body = await apiFetch(`/api/tables/${id}`)
      setSelectedTable(body)
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleLogin = async () => {
    setStatus('')
    try {
      const body = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      setToken(body['access-token'] || '')
      setUserId(body['user-id'] || '')
      await loadTables()
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleSignup = async () => {
    setStatus('')
    try {
      await apiFetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      await handleLogin()
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleLogout = () => {
    setToken('')
    setUserId('')
    setSelectedTable(null)
  }

  const handleCreateTable = async () => {
    setStatus('')
    try {
      const payload = {
        id: newTableId.trim(),
        name: newTableName.trim(),
      }
      const table = await apiFetch('/api/tables', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      updateTableInList(table)
      setSelectedTable(table)
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleJoinSeat = async () => {
    if (!selectedTable) return
    setStatus('')
    try {
      const table = await apiFetch(`/api/tables/${selectedTable.id}/join`, {
        method: 'POST',
        body: JSON.stringify({ 'seat-no': seatNo, stack: seatStack }),
      })
      updateTableInList(table)
      setSelectedTable(table)
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleBuyIn = async () => {
    if (!selectedTable) return
    setStatus('')
    try {
      const table = await apiFetch(`/api/tables/${selectedTable.id}/buy-in`, {
        method: 'POST',
        body: JSON.stringify({ 'seat-no': seatNo, amount: buyInAmount }),
      })
      updateTableInList(table)
      setSelectedTable(table)
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleStartHand = async () => {
    if (!selectedTable) return
    setStatus('')
    try {
      const hand = await apiFetch(`/api/tables/${selectedTable.id}/hands/start`, {
        method: 'POST',
        body: JSON.stringify({ 'dealer-seat': dealerSeat }),
      })
      setSelectedTable((prev) => (prev ? { ...prev, 'current-hand': hand } : prev))
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleResolve = async () => {
    if (!selectedTable) return
    setStatus('')
    try {
      const hand = await apiFetch(`/api/tables/${selectedTable.id}/hands/resolve`, {
        method: 'POST',
      })
      setSelectedTable((prev) => (prev ? { ...prev, 'current-hand': hand } : prev))
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const submitAction = async (type: string) => {
    if (!selectedTable) return
    setStatus('')
    try {
      const payload: Record<string, unknown> = {
        'seat-no': actionSeat,
        type,
      }
      if (type === 'bet' || type === 'raise' || type === 'all-in') {
        payload.amount = actionAmount
      }
      const hand = await apiFetch(`/api/tables/${selectedTable.id}/actions`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setSelectedTable((prev) => (prev ? { ...prev, 'current-hand': hand } : prev))
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const updateTableInList = (table: Table) => {
    setTables((prev) => {
      const idx = prev.findIndex((t) => t.id === table.id)
      if (idx === -1) return [table, ...prev]
      const next = [...prev]
      next[idx] = { ...prev[idx], ...table }
      return next
    })
  }

  useEffect(() => {
    loadTables()
  }, [token])

  useEffect(() => {
    if (!apiBase) return
    if (wsRef.current) wsRef.current.close()
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
        if (data.table) updateTableInList(data.table)
        setEvents((prev) => [data, ...prev].slice(0, 20))
        if (data.table) {
          setSelectedTable((prev) =>
            prev && data.table?.id === prev.id ? { ...prev, ...data.table } : prev
          )
        }
      } catch (_) {
        // ignore
      }
    }
    return () => ws.close()
  }, [apiBase])

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <p className="eyebrow">Poker Backend</p>
          <h1>Live Table Console</h1>
          <p className="subhead">Login, browse tables, and watch live updates from the backend.</p>
        </div>
        <div className="api-input">
          <label>API Base</label>
          <input value={apiBase} onChange={(e) => setApiBase(e.target.value)} />
          <span className={`ws-badge ws-badge--${wsStatus}`}>{wsStatus}</span>
        </div>
      </header>

      <main className="layout">
        <section className="panel">
          <h2>Auth</h2>
          <div className="field">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="actions">
            <button className="btn" onClick={handleLogin}>Login</button>
            <button className="btn btn--ghost" onClick={handleSignup}>Signup</button>
          </div>
          {token && (
            <div className="token">
              <p>Logged in as</p>
              <strong>{userId || 'unknown'}</strong>
              <button className="link" onClick={handleLogout}>Logout</button>
            </div>
          )}
          {status && <p className="error">{status}</p>}

          <div className="divider" />

          <div className="panel__header">
            <h2>Tables</h2>
            <button className="btn btn--small" onClick={loadTables}>Refresh</button>
          </div>
          <div className="create-table">
            <div className="field">
              <label>Table ID</label>
              <input value={newTableId} onChange={(e) => setNewTableId(e.target.value)} />
            </div>
            <div className="field">
              <label>Name</label>
              <input value={newTableName} onChange={(e) => setNewTableName(e.target.value)} />
            </div>
            <button className="btn" onClick={handleCreateTable} disabled={!token}>Create Table</button>
          </div>
          <ul className="table-list">
            {tables.map((table) => (
              <li key={table.id}>
                <button
                  className={`table-card ${selectedTable?.id === table.id ? 'is-active' : ''}`}
                  onClick={() => loadTable(table.id)}
                >
                  <div>
                    <strong>{table.name || table.id}</strong>
                    <span className="muted">{table.id}</span>
                  </div>
                  <span className="pill">{table.status || 'unknown'}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel panel--detail">
          <h2>Table Detail</h2>
          {selectedTable ? (
            <div className="table-detail">
              <div className="detail-row">
                <span>ID</span>
                <strong>{selectedTable.id}</strong>
              </div>
              <div className="detail-row">
                <span>Status</span>
                <strong>{selectedTable.status || 'unknown'}</strong>
              </div>
              <div className="detail-row">
                <span>Seats</span>
                <strong>{selectedTable.seats?.length || 0}</strong>
              </div>
              <div className="seat-layout">
                {displaySeats.length === 0 && <p className="muted">No seats yet.</p>}
                {displaySeats.map((seat) => {
                  const seatNo = seat['seat-no'] ?? seat['seat_no'] ?? 0
                  const user = seat['user-id'] ?? seat.user_id ?? 'empty'
                  const stack = seat.stack ?? 0
                  const sittingOut = Boolean(seat['sitting-out?'] ?? seat.sitting_out)
                  const isActor = actorSeatNo === seatNo
                  return (
                    <div
                      key={seatNo}
                      className={`seat-card ${isActor ? 'is-actor' : ''} ${sittingOut ? 'is-sitting-out' : ''}`}
                    >
                      <div className="seat-card__head">
                        <span>Seat {seatNo}</span>
                        {isActor && <span className="pill">Acting</span>}
                      </div>
                      <strong>{user}</strong>
                      <span className="muted">Stack: {stack}</span>
                      {sittingOut && <span className="pill pill--ghost">Sitting out</span>}
                    </div>
                  )
                })}
              </div>
              <div className="seat-actions">
                <h3>Seat Actions</h3>
                <div className="seat-grid">
                  <label>Seat No</label>
                  <input
                    type="number"
                    min={1}
                    value={seatNo}
                    onChange={(e) => setSeatNo(Number(e.target.value))}
                  />
                  <label>Stack</label>
                  <input
                    type="number"
                    min={0}
                    value={seatStack}
                    onChange={(e) => setSeatStack(Number(e.target.value))}
                  />
                  <label>Buy-in</label>
                  <input
                    type="number"
                    min={0}
                    value={buyInAmount}
                    onChange={(e) => setBuyInAmount(Number(e.target.value))}
                  />
                </div>
                <div className="actions">
                  <button className="btn btn--small" onClick={handleJoinSeat} disabled={!token}>Join Seat</button>
                  <button className="btn btn--ghost btn--small" onClick={handleBuyIn} disabled={!token}>Buy In</button>
                </div>
              </div>
              <div className="seat-actions">
                <h3>Hand Controls</h3>
                <div className="seat-grid">
                  <label>Dealer Seat</label>
                  <input
                    type="number"
                    min={1}
                    value={dealerSeat}
                    onChange={(e) => setDealerSeat(Number(e.target.value))}
                  />
                </div>
                <div className="actions">
                  <button className="btn btn--small" onClick={handleStartHand} disabled={!token}>Start Hand</button>
                  <button className="btn btn--ghost btn--small" onClick={handleResolve} disabled={!token}>Resolve Showdown</button>
                </div>
              </div>
              <div className="seat-actions">
                <h3>Player Actions</h3>
                <div className="seat-grid">
                  <label>Seat No</label>
                  <input
                    type="number"
                    min={1}
                    value={actionSeat}
                    onChange={(e) => setActionSeat(Number(e.target.value))}
                  />
                  <label>Amount</label>
                  <input
                    type="number"
                    min={0}
                    value={actionAmount}
                    onChange={(e) => setActionAmount(Number(e.target.value))}
                  />
                </div>
                <div className="actions">
                  <button className="btn btn--small" onClick={() => submitAction('check')} disabled={!token || (legalForSeat ? !legalForSeat.includes('check') : false)}>Check</button>
                  <button className="btn btn--small" onClick={() => submitAction('call')} disabled={!token || (legalForSeat ? !legalForSeat.includes('call') : false)}>Call</button>
                  <button className="btn btn--small" onClick={() => submitAction('fold')} disabled={!token || (legalForSeat ? !legalForSeat.includes('fold') : false)}>Fold</button>
                  <button className="btn btn--ghost btn--small" onClick={() => submitAction('bet')} disabled={!token || (legalForSeat ? !legalForSeat.includes('bet') : false)}>Bet</button>
                  <button className="btn btn--ghost btn--small" onClick={() => submitAction('raise')} disabled={!token || (legalForSeat ? !legalForSeat.includes('raise') : false)}>Raise</button>
                  <button className="btn btn--ghost btn--small" onClick={() => submitAction('all-in')} disabled={!token || (legalForSeat ? !legalForSeat.includes('all-in') : false)}>All-in</button>
                </div>
                {legalForSeat && (
                  <p className="muted">Legal actions: {legalForSeat.join(', ')}</p>
                )}
              </div>
              <pre>{JSON.stringify(selectedTable, null, 2)}</pre>
            </div>
          ) : (
            <p className="muted">Select a table to see details.</p>
          )}

          <div className="divider" />

          <h2>Live Events</h2>
          <div className="events">
            {events.length === 0 && <p className="muted">No events yet.</p>}
            {events.map((event, idx) => (
              <div key={idx} className="event">
                <span className="pill pill--ghost">{event.type}</span>
                <pre>{JSON.stringify(event.table ?? event.payload ?? event, null, 2)}</pre>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
