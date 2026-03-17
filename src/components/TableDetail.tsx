import { useMemo, useState } from 'react'
import { useApi } from '../api/useApi'
import { Card } from './Card'
import { useAppStore } from '../state/useAppStore'
import type { CurrentHand, Seat } from '../types'

export const TableDetail = () => {
  const api = useApi()
  const selectedTable = useAppStore((state) => state.selectedTable)
  const token = useAppStore((state) => state.token)
  const updateTable = useAppStore((state) => state.updateTable)
  const setSelectedTable = useAppStore((state) => state.setSelectedTable)
  const setStatus = useAppStore((state) => state.setStatus)
  const mergeSelectedTable = useAppStore((state) => state.mergeSelectedTable)
  const [seatNo, setSeatNo] = useState(1)
  const [seatStack, setSeatStack] = useState(1000)
  const [buyInAmount, setBuyInAmount] = useState(500)
  const [dealerSeat, setDealerSeat] = useState(1)
  const [actionSeat, setActionSeat] = useState(1)
  const [actionAmount, setActionAmount] = useState(20)
  const [boardText, setBoardText] = useState('')
  const [holeText, setHoleText] = useState('')

  const currentHand = useMemo(() => {
    if (!selectedTable) return null
    return (selectedTable['current-hand'] || selectedTable.current_hand) as CurrentHand | null
  }, [selectedTable])

  const actorSeatNo = currentHand?.['actor-seat'] as number | undefined
  const legalActions = currentHand?.['legal-actions'] as Record<string, string[]> | undefined
  const legalForSeat = legalActions ? legalActions[String(actionSeat)] || legalActions[actionSeat] : undefined
  const board = currentHand?.board as string[] | undefined
  const holeCards = currentHand?.['hole-cards'] as Record<string, string[]> | undefined
  const seatHoleCards = holeCards ? holeCards[String(actionSeat)] || holeCards[actionSeat] : undefined


  const displaySeats = useMemo(() => {
    const seats = selectedTable?.seats ?? []
    return [...seats].sort((a, b) => {
      const aNo = a['seat-no'] ?? a['seat_no'] ?? 0
      const bNo = b['seat-no'] ?? b['seat_no'] ?? 0
      return aNo - bNo
    })
  }, [selectedTable])

  const handleJoinSeat = async () => {
    if (!selectedTable) return
    setStatus('')
    try {
      const table = await api.request(`/api/tables/${selectedTable.id}/join`, {
        method: 'POST',
        body: JSON.stringify({ 'seat-no': seatNo, stack: seatStack }),
      })
      updateTable(table)
      setSelectedTable(table)
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleBuyIn = async () => {
    if (!selectedTable) return
    setStatus('')
    try {
      const table = await api.request(`/api/tables/${selectedTable.id}/buy-in`, {
        method: 'POST',
        body: JSON.stringify({ 'seat-no': seatNo, amount: buyInAmount }),
      })
      updateTable(table)
      setSelectedTable(table)
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleSitOut = async () => {
    if (!selectedTable) return
    setStatus('')
    try {
      const table = await api.request(`/api/tables/${selectedTable.id}/sit-out`, {
        method: 'POST',
        body: JSON.stringify({ 'seat-no': seatNo }),
      })
      updateTable(table)
      setSelectedTable(table)
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleSitIn = async () => {
    if (!selectedTable) return
    setStatus('')
    try {
      const table = await api.request(`/api/tables/${selectedTable.id}/sit-in`, {
        method: 'POST',
        body: JSON.stringify({ 'seat-no': seatNo }),
      })
      updateTable(table)
      setSelectedTable(table)
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleLeaveSeat = async () => {
    if (!selectedTable) return
    setStatus('')
    try {
      const table = await api.request(`/api/tables/${selectedTable.id}/leave`, {
        method: 'POST',
        body: JSON.stringify({ 'seat-no': seatNo }),
      })
      updateTable(table)
      setSelectedTable(table)
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleOpenTable = async () => {
    if (!selectedTable) return
    setStatus('')
    try {
      const table = await api.request(`/api/tables/${selectedTable.id}/open`, {
        method: 'POST',
      })
      updateTable(table)
      setSelectedTable(table)
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleCloseTable = async () => {
    if (!selectedTable) return
    setStatus('')
    try {
      const table = await api.request(`/api/tables/${selectedTable.id}/close`, {
        method: 'POST',
      })
      updateTable(table)
      setSelectedTable(table)
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleTimeout = async () => {
    if (!selectedTable) return
    setStatus('')
    try {
      const hand = await api.request(`/api/tables/${selectedTable.id}/timeout`, {
        method: 'POST',
        body: JSON.stringify({ 'seat-no': actionSeat }),
      })
      mergeSelectedTable((prev) => (prev ? { ...prev, 'current-hand': hand } : prev))
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleStartHand = async () => {
    if (!selectedTable) return
    setStatus('')
    try {
      const hand = await api.request(`/api/tables/${selectedTable.id}/hands/start`, {
        method: 'POST',
        body: JSON.stringify({ 'dealer-seat': dealerSeat }),
      })
      mergeSelectedTable((prev) => (prev ? { ...prev, 'current-hand': hand } : prev))
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleResolve = async () => {
    if (!selectedTable) return
    setStatus('')
    try {
      const hand = await api.request(`/api/tables/${selectedTable.id}/hands/resolve`, {
        method: 'POST',
      })
      mergeSelectedTable((prev) => (prev ? { ...prev, 'current-hand': hand } : prev))
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleSetCards = async () => {
    if (!selectedTable) return
    setStatus('')
    try {
      const board = boardText
        .split(/[,\s]+/)
        .map((entry) => entry.trim())
        .filter(Boolean)
      const holes = holeText
        .split(/[,\s]+/)
        .map((entry) => entry.trim())
        .filter(Boolean)

      const payload: Record<string, unknown> = {}
      if (board.length > 0) payload.board = board
      if (holes.length > 0) payload['hole-cards'] = { [String(actionSeat)]: holes }

      const hand = await api.request(`/api/tables/${selectedTable.id}/hands/cards`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      mergeSelectedTable((prev) => (prev ? { ...prev, 'current-hand': hand } : prev))
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
      const hand = await api.request(`/api/tables/${selectedTable.id}/actions`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      mergeSelectedTable((prev) => (prev ? { ...prev, 'current-hand': hand } : prev))
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  if (!selectedTable) {
    return (
      <section className="panel panel--detail">
        <h2>Table Detail</h2>
        <p className="muted">Select a table to see details.</p>
      </section>
    )
  }

  return (
    <section className="panel panel--detail">
      <h2>Table Detail</h2>
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

        <SeatLayout seats={displaySeats} actorSeatNo={actorSeatNo} />

        <div className="cards-panel">
          <div className="cards-panel__row">
            <div className="cards-panel__head">
              <h3>Board</h3>
              <span className="muted">{board?.length || 0} / 5</span>
            </div>
            <div className="card-row">
              {(board && board.length > 0 ? board : Array.from({ length: 5 }).map(() => undefined)).map(
                (card, idx) => (
                  <Card key={`board-${idx}`} value={card} faceDown={!card} />
                ),
              )}
            </div>
          </div>

          <div className="cards-panel__row">
            <div className="cards-panel__head">
              <h3>Hole Cards (Seat {actionSeat})</h3>
              <span className="muted">{seatHoleCards?.length || 0} / 2</span>
            </div>
            <div className="card-row">
              {(seatHoleCards && seatHoleCards.length > 0
                ? seatHoleCards
                : Array.from({ length: 2 }).map(() => undefined)
              ).map((card, idx) => (
                <Card key={`hole-${idx}`} value={card} faceDown={!card} />
              ))}
            </div>
          </div>
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
            <button className="btn btn--ghost btn--small" onClick={handleLeaveSeat} disabled={!token}>Leave Seat</button>
            <button className="btn btn--ghost btn--small" onClick={handleSitOut} disabled={!token}>Sit Out</button>
            <button className="btn btn--ghost btn--small" onClick={handleSitIn} disabled={!token}>Sit In</button>
          </div>
        </div>

        <div className="seat-actions">
          <h3>Table Controls</h3>
          <div className="actions">
            <button className="btn btn--small" onClick={handleOpenTable} disabled={!token}>Open Table</button>
            <button className="btn btn--ghost btn--small" onClick={handleCloseTable} disabled={!token}>Close Table</button>
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
            <button className="btn btn--ghost btn--small" onClick={handleTimeout} disabled={!token}>Timeout</button>
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
            <label>Board Cards</label>
            <input
              placeholder="Ah Kd 7c 2s 9h"
              value={boardText}
              onChange={(e) => setBoardText(e.target.value)}
            />
            <label>Hole Cards (Seat)</label>
            <input
              placeholder="Qs Jd"
              value={holeText}
              onChange={(e) => setHoleText(e.target.value)}
            />
          </div>
          <div className="actions">
            <button className="btn btn--small" onClick={() => submitAction('check')} disabled={!token || (legalForSeat ? !legalForSeat.includes('check') : false)}>Check</button>
            <button className="btn btn--small" onClick={() => submitAction('call')} disabled={!token || (legalForSeat ? !legalForSeat.includes('call') : false)}>Call</button>
            <button className="btn btn--small" onClick={() => submitAction('fold')} disabled={!token || (legalForSeat ? !legalForSeat.includes('fold') : false)}>Fold</button>
            <button className="btn btn--ghost btn--small" onClick={() => submitAction('bet')} disabled={!token || (legalForSeat ? !legalForSeat.includes('bet') : false)}>Bet</button>
            <button className="btn btn--ghost btn--small" onClick={() => submitAction('raise')} disabled={!token || (legalForSeat ? !legalForSeat.includes('raise') : false)}>Raise</button>
            <button className="btn btn--ghost btn--small" onClick={() => submitAction('all-in')} disabled={!token || (legalForSeat ? !legalForSeat.includes('all-in') : false)}>All-in</button>
            <button className="btn btn--ghost btn--small" onClick={handleSetCards} disabled={!token}>Set Cards</button>
          </div>
          {legalForSeat && (
            <p className="muted">Legal actions: {legalForSeat.join(', ')}</p>
          )}
        </div>

        <pre>{JSON.stringify(selectedTable, null, 2)}</pre>
      </div>
    </section>
  )
}

const SeatLayout = ({ seats, actorSeatNo }: { seats: Seat[]; actorSeatNo?: number }) => (
  <div className="seat-layout">
    {seats.length === 0 && <p className="muted">No seats yet.</p>}
    {seats.map((seat) => {
      const seatNo = seat['seat-no'] ?? seat.seat_no ?? 0
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
)
