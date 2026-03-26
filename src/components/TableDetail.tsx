import { useMemo, useState } from 'react'
import { useI18n } from '../i18n'
import { useApi } from '../api/useApi'
import { Card } from './Card'
import { useAppStore } from '../state/useAppStore'
import type { CurrentHand, Seat, Table } from '../types'

export const TableDetail = () => {
  const api = useApi()
  const { t } = useI18n()
  const selectedTable = useAppStore((state) => state.selectedTable)
  const token = useAppStore((state) => state.token)
  const userId = useAppStore((state) => state.userId)
  const role = useAppStore((state) => state.role)
  const updateTable = useAppStore((state) => state.updateTable)
  const setSelectedTable = useAppStore((state) => state.setSelectedTable)
  const setStatus = useAppStore((state) => state.setStatus)
  const mergeSelectedTable = useAppStore((state) => state.mergeSelectedTable)
  const [seatNo, setSeatNo] = useState(1)
  const [seatStack, setSeatStack] = useState(1000)
  const [buyInAmount, setBuyInAmount] = useState(500)
  const [dealerSeat, setDealerSeat] = useState(1)
  const [actionAmount, setActionAmount] = useState(20)
  const [boardText, setBoardText] = useState('')
  const [holeText, setHoleText] = useState('')

  const currentHand = useMemo(() => {
    if (!selectedTable) return null
    return (selectedTable['current-hand'] || selectedTable.current_hand) as CurrentHand | null
  }, [selectedTable])

  const actorSeatNo = currentHand?.['actor-seat'] as number | undefined
  const legalActions = currentHand?.['legal-actions'] as Record<string, string[]> | undefined
  const board = currentHand?.board as string[] | undefined
  const holeCards = currentHand?.['hole-cards'] as Record<string, string[]> | undefined
  const pot = currentHand?.pot as number | undefined
  const sidePots = currentHand?.['side-pots'] as Array<{
    amount: number
    'eligible-seat-nos': number[]
  }> | undefined
  const street = (currentHand?.street as string | undefined) ?? 'waiting'
  const handStatus = (currentHand?.status as string | undefined) ?? 'idle'
  const handDealerSeat = currentHand?.['dealer-seat'] as number | undefined
  const smallBlindSeat = currentHand?.['small-blind-seat'] as number | undefined
  const bigBlindSeat = currentHand?.['big-blind-seat'] as number | undefined

  const ownedSeats = useMemo(() => {
    const seats = selectedTable?.seats ?? []
    return seats.filter((seat) => {
      const seatUser = seat['user-id'] ?? seat.user_id
      return seatUser && seatUser === userId
    })
  }, [selectedTable, userId])

  const mySeatNo = ownedSeats.length === 1 ? ownedSeats[0]['seat-no'] ?? ownedSeats[0].seat_no : undefined
  const legalForSeat =
    mySeatNo != null && legalActions
      ? legalActions[String(mySeatNo)] || legalActions[mySeatNo]
      : undefined
  const seatHoleCards = holeCards
    ? holeCards[String(mySeatNo ?? '')] || holeCards[mySeatNo as number]
    : undefined
  const canBet = Boolean(legalForSeat?.includes('bet'))
  const canRaise = Boolean(legalForSeat?.includes('raise'))
  const canAllIn = Boolean(legalForSeat?.includes('all-in'))
  const isAdmin = role === 'admin'
  const isMyTurn = Boolean(mySeatNo != null && actorSeatNo === mySeatNo)
  const hasSeatConflict = ownedSeats.length > 1
  const tableStatus = (selectedTable?.status ?? '').toLowerCase()
  const finishedHandStatuses = ['complete', 'finished', 'resolved']
  const isTableOpen = ['open', 'opened', 'active', 'running', 'waiting'].includes(tableStatus)
  const isHandFinished = finishedHandStatuses.includes(handStatus)
  const hasHandInProgress = currentHand != null && !['idle', 'waiting', ...finishedHandStatuses].includes(handStatus)
  const openTableDisabled = !token || !selectedTable || isTableOpen || hasHandInProgress
  const openTableDisabledReason = (() => {
    switch (true) {
      case !token:
        return t('detail.loginRequired')
      case !selectedTable:
        return t('detail.selectTableFirst')
      case isTableOpen:
        return t('detail.tableAlreadyOpen')
      case hasHandInProgress:
        return t('detail.cannotOpenDuringHand')
      default:
        return t('detail.openTable')
    }
  })()

  const displaySeats = useMemo(() => {
    const seats = selectedTable?.seats ?? []
    return [...seats].sort((a, b) => {
      const aNo = a['seat-no'] ?? a['seat_no'] ?? 0
      const bNo = b['seat-no'] ?? b['seat_no'] ?? 0
      return aNo - bNo
    })
  }, [selectedTable])
  const activeSeats = displaySeats.filter((seat) => {
    const seatUserId = seat['user-id'] ?? seat.user_id
    const seatStack = seat.stack ?? 0
    const sittingOut = Boolean(seat['sitting-out?'] ?? seat.sitting_out)
    return Boolean(seatUserId) && !sittingOut && seatStack > 0
  })
  const activeSeatCount = activeSeats.length
  const selectedSeat = displaySeats.find((seat) => (seat['seat-no'] ?? seat.seat_no) === seatNo)
  const selectedSeatUserId = selectedSeat?.['user-id'] ?? selectedSeat?.user_id ?? ''
  const isSeatOccupied = Boolean(selectedSeatUserId)
  const hasOwnedSeat = ownedSeats.length > 0
  const hasValidSeatNo = Number.isFinite(seatNo) && seatNo > 0
  const hasValidSeatStack = Number.isFinite(seatStack) && seatStack > 0
  const joinSeatDisabled =
    !token ||
    !selectedTable ||
    !isTableOpen ||
    hasHandInProgress ||
    isSeatOccupied ||
    hasOwnedSeat ||
    !hasValidSeatNo ||
    !hasValidSeatStack
  const joinSeatDisabledReason = (() => {
    switch (true) {
      case !token:
        return t('detail.loginRequired')
      case !selectedTable:
        return t('detail.selectTableFirst')
      case !isTableOpen:
        return t('detail.tableMustBeOpen')
      case hasHandInProgress:
        return t('detail.cannotJoinDuringHand')
      case isSeatOccupied:
        return t('detail.selectedSeatOccupied')
      case hasOwnedSeat:
        return t('detail.alreadySeated')
      case !hasValidSeatNo:
        return t('detail.validSeatNumber')
      case !hasValidSeatStack:
        return t('detail.validStack')
      default:
        return t('detail.joinSeat')
    }
  })()
  const canRemovePlayer = Boolean(token && selectedTable && selectedSeatUserId)
  const nextStepMessage = (() => {
    if (!token) return t('detail.loginToControlTable')
    if (!isTableOpen) return t('detail.tableClosedHint')
    if (isHandFinished) {
      if (activeSeatCount < 2) return t('detail.handCompleteNeedPlayers')
      return t('detail.handCompleteReadyNext')
    }
    if (!currentHand) {
      if (activeSeatCount < 2) return t('detail.needTwoActivePlayers')
      return t('detail.readyToStartHand')
    }
    if (handStatus === 'showdown') return t('detail.readyToResolveShowdown')
    if (isMyTurn) return t('detail.yourTurnToAct')
    if (actorSeatNo != null) return t('detail.waitingForActorSeat', { seat: actorSeatNo })
    return t('detail.handInProgressHint')
  })()
  const actionMessage = (() => {
    if (!token) return t('detail.loginRequired')
    if (hasSeatConflict) return t('detail.seatConflict')
    if (mySeatNo == null) return t('detail.joinToPlay')
    if (!currentHand) return t('detail.startHandToReceiveActions')
    if (isHandFinished) return t('detail.handAlreadyFinished')
    if (handStatus === 'showdown') return t('detail.waitingForShowdownResolution')
    if (!isMyTurn) return t('detail.waitingForActorSeat', { seat: actorSeatNo ?? '-' })
    if (!legalForSeat || legalForSeat.length === 0) return t('detail.noLegalActionsYet')
    return t('detail.chooseActionPrompt')
  })()

  const handleJoinSeat = async () => {
    if (!selectedTable) return
    setStatus('')
    try {
      const table = await api.request(`/api/tables/${selectedTable.id}/join`, {
        method: 'POST',
        body: JSON.stringify({ 'seat-no': seatNo, stack: seatStack }),
      })
      updateTable(table as Table)
      setSelectedTable(table as Table)
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
      updateTable(table as Table)
      setSelectedTable(table as Table)
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
      updateTable(table as Table)
      setSelectedTable(table as Table)
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
      updateTable(table as Table)
      setSelectedTable(table as Table)
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
      updateTable(table as Table)
      setSelectedTable(table as Table)
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleRemovePlayer = async () => {
    if (!selectedTable || !selectedSeatUserId) return
    const confirmed = window.confirm(t('detail.confirmRemovePlayer', { user: selectedSeatUserId, seat: seatNo }))
    if (!confirmed) return

    setStatus('')
    try {
      const table = await api.request(`/api/tables/${selectedTable.id}/leave`, {
        method: 'POST',
        body: JSON.stringify({ 'seat-no': seatNo }),
      })
      updateTable(table as Table)
      setSelectedTable(table as Table)
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
      updateTable(table as Table)
      setSelectedTable(table as Table)
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
      updateTable(table as Table)
      setSelectedTable(table as Table)
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
        body: JSON.stringify({ 'seat-no': mySeatNo ?? seatNo }),
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

  const handleNextHand = async () => {
    if (!selectedTable) return
    setStatus('')
    try {
      const hand = await api.request(`/api/tables/${selectedTable.id}/hands/next`, {
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
      if (holes.length > 0) payload['hole-cards'] = { [String(seatNo)]: holes }

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
    if (mySeatNo == null) {
      setStatus(t('detail.notSeated'))
      return
    }
    setStatus('')
    try {
      const payload: Record<string, unknown> = {
        'seat-no': mySeatNo,
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
        <h2>{t('detail.title')}</h2>
        <p className="muted">{t('detail.empty')}</p>
      </section>
    )
  }

  return (
    <section className="panel panel--detail panel--table">
      <h2>{t('detail.title')}</h2>
      <div className="table-detail">
        <div className="table-arena">
          <div className="table-guidance">
            <div className="table-guidance__card">
              <strong>{t('detail.nextStepTitle')}</strong>
              <p>{nextStepMessage}</p>
            </div>
            <div className="table-guidance__card table-guidance__card--subtle">
              <strong>{t('detail.activePlayersLabel')}</strong>
              <p>{t('detail.activePlayersValue', { count: activeSeatCount })}</p>
            </div>
          </div>
          <div className="table-status">
            <div className="pill">{t('detail.status', { status: selectedTable.status || t('tables.unknown') })}</div>
            <div className="pill pill--ghost">{t('detail.hand', { status: handStatus })}</div>
            <div className="pill pill--ghost">{t('detail.street', { street })}</div>
            <div className="pill pill--ghost">{t('detail.pot', { pot: typeof pot === 'number' ? pot : 0 })}</div>
            {isHandFinished && <div className="pill pill--accent">{t('detail.gameFinished')}</div>}
          </div>
          <div className="table-meta">
            <div className="detail-row">
              <span>{t('detail.id')}</span>
              <strong>{selectedTable.id}</strong>
            </div>
            <div className="detail-row">
              <span>{t('detail.handLabel')}</span>
              <strong>{handStatus}</strong>
            </div>
            <div className="detail-row">
              <span>{t('detail.streetLabel')}</span>
              <strong>{street}</strong>
            </div>
            <div className="detail-row">
              <span>{t('detail.actorSeat')}</span>
              <strong>{actorSeatNo ?? '-'}</strong>
            </div>
            <div className="detail-row">
              <span>{t('detail.seats')}</span>
              <strong>{selectedTable.seats?.length || 0}</strong>
            </div>
          </div>
          <div className="table-felt">
            <div className="table-felt__rail" />
            <SeatLayout
              seats={displaySeats}
              actorSeatNo={actorSeatNo}
              dealerSeat={handDealerSeat}
              smallBlindSeat={smallBlindSeat}
              bigBlindSeat={bigBlindSeat}
            />
            <div className="table-center">
              <div className="cards-panel">
                <div className="cards-panel__row">
                  <div className="cards-panel__head">
                    <h3>{t('detail.board')}</h3>
                    <span className="muted">{board?.length || 0} / 5</span>
                  </div>
                  <div className="card-row">
                    {(board && board.length > 0 ? board : Array.from({ length: 5 }).map(() => undefined)).map(
                      (card, idx) => (
                        <Card key={`board-${idx}`} value={card} faceDown={!card} />
                      ),
                    )}
                  </div>
                  <div className="cards-panel__meta">
                    <div className="detail-row">
                      <span>{t('detail.potLabel')}</span>
                      <strong>{typeof pot === 'number' ? pot : 0}</strong>
                    </div>
                    {sidePots && sidePots.length > 0 && (
                      <div className="detail-row detail-row--stack">
                        <span>{t('detail.sidePots')}</span>
                        <div className="stack">
                          {sidePots.map((side, idx) => (
                            <div key={`side-pot-${idx}`} className="pill pill--ghost">
                              {t('detail.sidePotSeats', {
                                index: idx + 1,
                                amount: side.amount,
                                seats: side['eligible-seat-nos'].join(', '),
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="cards-panel__row">
                  <div className="cards-panel__head">
                    <h3>{mySeatNo != null ? t('detail.holeCardsSeat', { seat: mySeatNo }) : t('detail.holeCards')}</h3>
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
            </div>
          </div>
        </div>
        <div className="control-rail">
          <div className="seat-actions">
            <h3>{t('detail.seatActions')}</h3>
            <div className="seat-grid">
              <label>{t('detail.seatNo')}</label>
              <input
                type="number"
                min={1}
                value={seatNo}
                onChange={(e) => setSeatNo(Number(e.target.value))}
              />
              <label>{t('detail.stack')}</label>
              <input
                type="number"
                min={0}
                value={seatStack}
                onChange={(e) => setSeatStack(Number(e.target.value))}
              />
              <label>{t('detail.buyIn')}</label>
              <input
                type="number"
                min={0}
                value={buyInAmount}
                onChange={(e) => setBuyInAmount(Number(e.target.value))}
              />
            </div>
            <div className="actions">
              <button
                className="btn btn--small"
                onClick={handleJoinSeat}
                disabled={joinSeatDisabled}
                title={joinSeatDisabledReason}
              >
                {t('detail.joinSeat')}
              </button>
              <button className="btn btn--ghost btn--small" onClick={handleBuyIn} disabled={!token}>{t('detail.buyInAction')}</button>
              <button className="btn btn--ghost btn--small" onClick={handleLeaveSeat} disabled={!token}>{t('detail.leaveSeat')}</button>
              <button
                className="btn btn--ghost btn--small"
                onClick={handleRemovePlayer}
                disabled={!canRemovePlayer}
                title={canRemovePlayer ? t('detail.removePlayerTitle') : t('detail.selectedSeatEmpty')}
              >
                {t('detail.removePlayer')}
              </button>
              <button className="btn btn--ghost btn--small" onClick={handleSitOut} disabled={!token}>{t('detail.sitOut')}</button>
              <button className="btn btn--ghost btn--small" onClick={handleSitIn} disabled={!token}>{t('detail.sitIn')}</button>
            </div>
            {joinSeatDisabled && <p className="inline-hint">{joinSeatDisabledReason}</p>}
          </div>

          <div className="seat-actions">
            <h3>{t('detail.tableControls')}</h3>
            <div className="actions">
              <button
                className="btn btn--small"
                onClick={handleOpenTable}
                disabled={openTableDisabled}
                title={openTableDisabledReason}
              >
                {t('detail.openTable')}
              </button>
              <button className="btn btn--ghost btn--small" onClick={handleCloseTable} disabled={!token}>{t('detail.closeTable')}</button>
            </div>
            {openTableDisabled && <p className="inline-hint">{openTableDisabledReason}</p>}
          </div>

          {isAdmin && (
            <div className="seat-actions">
              <h3>{t('detail.handControls')}</h3>
              <div className="seat-grid">
                <label>{t('detail.dealerSeat')}</label>
                <input
                  type="number"
                  min={1}
                  value={dealerSeat}
                  onChange={(e) => setDealerSeat(Number(e.target.value))}
                />
              </div>
              <div className="actions">
                <button className="btn btn--small" onClick={handleStartHand} disabled={!token}>{t('detail.startHand')}</button>
                <button className="btn btn--ghost btn--small" onClick={handleResolve} disabled={!token}>{t('detail.resolveShowdown')}</button>
                <button className="btn btn--ghost btn--small" onClick={handleTimeout} disabled={!token}>{t('detail.timeout')}</button>
                <button className="btn btn--ghost btn--small" onClick={handleNextHand} disabled={!token}>{t('detail.nextHand')}</button>
              </div>
            </div>
          )}

          <div className="seat-actions">
            <h3>{t('detail.yourTurn')}</h3>
            {hasSeatConflict && (
              <p className="error">{t('detail.seatConflict')}</p>
            )}
            {!mySeatNo && !hasSeatConflict && (
              <p className="muted">{t('detail.joinToPlay')}</p>
            )}
            {mySeatNo && !isMyTurn && (
              <p className="muted">{t('detail.waitingForSeat', { seat: actorSeatNo ?? '-' })}</p>
            )}
            <div className="seat-grid">
              <label>{t('detail.yourSeat')}</label>
              <input type="text" value={mySeatNo ?? '—'} disabled />
              <label>{t('detail.amount')}</label>
              <input
                type="number"
                min={0}
                value={actionAmount}
                onChange={(e) => setActionAmount(Number(e.target.value))}
                disabled={!(canBet || canRaise || canAllIn) || !isMyTurn || hasSeatConflict}
              />
            </div>
            <div className="actions">
              {legalForSeat && legalForSeat.length > 0 ? (
                legalForSeat.map((action) => (
                  <button
                    key={action}
                    className={`btn btn--small ${action === 'bet' || action === 'raise' || action === 'all-in' ? 'btn--ghost' : ''}`}
                    onClick={() => submitAction(action)}
                    disabled={!token || !isMyTurn || hasSeatConflict}
                  >
                    {action === 'all-in' ? 'All-in' : action.charAt(0).toUpperCase() + action.slice(1)}
                  </button>
                ))
              ) : (
                <span className="muted">{t('detail.noLegalActions')}</span>
              )}
            </div>
            <p className="inline-hint">{actionMessage}</p>
            {legalForSeat && (
              <p className="muted">{t('detail.legalActions', { actions: legalForSeat.join(', ') })}</p>
            )}
          </div>

          {isAdmin && (
            <details className="seat-actions">
              <summary className="summary">{t('detail.adminDebug')}</summary>
              <div className="seat-grid">
                <label>{t('detail.boardCards')}</label>
                <input
                  placeholder={t('detail.boardCardsPlaceholder')}
                  value={boardText}
                  onChange={(e) => setBoardText(e.target.value)}
                />
                <label>{t('detail.holeCardsSeatInput')}</label>
                <input
                  placeholder={t('detail.holeCardsPlaceholder')}
                  value={holeText}
                  onChange={(e) => setHoleText(e.target.value)}
                />
              </div>
              <div className="actions">
                <button className="btn btn--ghost btn--small" onClick={handleSetCards} disabled={!token}>{t('detail.setCards')}</button>
              </div>
              <p className="muted">{t('detail.manualCardInjection')}</p>
            </details>
          )}
        </div>
      </div>
    </section>
  )
}

const SeatLayout = ({
  seats,
  actorSeatNo,
  dealerSeat,
  smallBlindSeat,
  bigBlindSeat,
}: {
  seats: Seat[]
  actorSeatNo?: number
  dealerSeat?: number
  smallBlindSeat?: number
  bigBlindSeat?: number
}) => {
  const { t } = useI18n()

  return (
    <div className="seat-layout">
      {seats.length === 0 && <p className="muted">{t('detail.noSeatsYet')}</p>}
      {seats.map((seat) => {
      const seatNo = seat['seat-no'] ?? seat.seat_no ?? 0
      const user = seat['user-id'] ?? seat.user_id ?? t('detail.emptySeatUser')
      const stack = seat.stack ?? 0
      const committed = (seat as Seat & { 'committed-total'?: number; committed_total?: number })[
        'committed-total'
      ] ?? (seat as Seat & { committed_total?: number }).committed_total ?? 0
      const sittingOut = Boolean(seat['sitting-out?'] ?? seat.sitting_out)
      const isActor = actorSeatNo === seatNo
      const isMine = user !== t('detail.emptySeatUser') && user === useAppStore.getState().userId
      const isDealer = dealerSeat === seatNo
      const isSmallBlind = smallBlindSeat === seatNo
      const isBigBlind = bigBlindSeat === seatNo
      return (
        <div
          key={seatNo}
          className={`seat-card ${isActor ? 'is-actor' : ''} ${sittingOut ? 'is-sitting-out' : ''} ${isMine ? 'is-mine' : ''}`}
        >
          <div className="seat-card__head">
            <span>{t('detail.seatTag', { seat: seatNo })}</span>
            <div className="pill-row">
              {isMine && <span className="pill pill--accent">{t('detail.you')}</span>}
              {isActor && <span className="pill">{t('detail.acting')}</span>}
              {isDealer && <span className="pill pill--dealer">D</span>}
              {isSmallBlind && <span className="pill pill--blind">SB</span>}
              {isBigBlind && <span className="pill pill--blind">BB</span>}
            </div>
          </div>
          <strong>{user}</strong>
          <span className="muted">{t('detail.stackValue', { value: stack })}</span>
          <span className="muted">{t('detail.committedValue', { value: committed })}</span>
          {sittingOut && <span className="pill pill--ghost">{t('detail.sittingOut')}</span>}
        </div>
      )
      })}
    </div>
  )
}
