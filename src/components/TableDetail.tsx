import { useMemo, useState } from 'react'
import { useI18n } from '../i18n'
import { useApi } from '../api/useApi'
import { Card } from './Card'
import { useAppStore } from '../state/useAppStore'
import type { CurrentHand, Seat, Table } from '../types'
import { Panel } from '../shared/ui/panel'
import { Button } from '../shared/ui/button'
import { Input } from '../shared/ui/input'
import { Badge } from '../shared/ui/badge'

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
  const [seatName, setSeatName] = useState('')
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
  const hasValidSeatName = seatName.trim().length > 0
  const hasValidSeatStack = Number.isFinite(seatStack) && seatStack > 0
  const joinSeatDisabled =
    !token ||
    !selectedTable ||
    !isTableOpen ||
    hasHandInProgress ||
    isSeatOccupied ||
    hasOwnedSeat ||
    !hasValidSeatNo ||
    !hasValidSeatName ||
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
      case !hasValidSeatName:
        return t('detail.nameRequired')
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
    const trimmedSeatName = seatName.trim()
    if (!trimmedSeatName) {
      setStatus(t('detail.nameRequired'))
      return
    }
    setStatus('')
    try {
      const table = await api.request(`/api/tables/${selectedTable.id}/join`, {
        method: 'POST',
        body: JSON.stringify({ 'seat-no': seatNo, name: trimmedSeatName, stack: seatStack }),
      })
      updateTable(table as Table)
      setSelectedTable(table as Table)
      setSeatName('')
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

  const handleLoadDemoSeats = () => {
    if (!selectedTable) return
    const demoSeats: Seat[] = [
      { 'seat-no': 1, 'user-id': 'demo-1', name: 'Felipe', stack: 1280, 'sitting-out?': false },
      { 'seat-no': 2, 'user-id': 'demo-2', name: 'Ana', stack: 940, 'sitting-out?': false },
      { 'seat-no': 3, 'user-id': 'demo-3', name: 'Bruno', stack: 1510, 'sitting-out?': false },
      { 'seat-no': 4, 'user-id': 'demo-4', name: 'Carol', stack: 770, 'sitting-out?': false },
      { 'seat-no': 5, 'user-id': 'demo-5', name: 'Davi', stack: 1120, 'sitting-out?': false },
      { 'seat-no': 6, 'user-id': 'demo-6', name: 'Ellen', stack: 860, 'sitting-out?': false },
    ]
    const table = { ...selectedTable, seats: demoSeats, 'current-hand': undefined, current_hand: undefined }
    updateTable(table as Table)
    setSelectedTable(table as Table)
    setStatus(t('detail.demoSeatsLoaded'))
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
      <Panel className="min-h-[420px]">
        <h2>{t('detail.title')}</h2>
        <p className="text-sm text-[var(--color-muted)]">{t('detail.empty')}</p>
      </Panel>
    )
  }

  return (
    <Panel className="min-h-[420px] bg-[radial-gradient(circle_at_top,rgba(217,177,95,0.08),transparent_18%),rgba(19,29,22,0.88)]">
      <h2>{t('detail.title')}</h2>
      <div className="grid gap-[18px]">
        <div className="grid gap-[18px]">
          <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)] max-[1024px]:grid-cols-1">
            <div className="rounded-2xl border border-[rgba(217,177,95,0.18)] bg-[linear-gradient(135deg,rgba(217,177,95,0.12),rgba(15,23,42,0.62))] px-4 py-3.5">
              <strong>{t('detail.nextStepTitle')}</strong>
              <p className="m-0 mt-1.5">{nextStepMessage}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[rgba(8,18,13,0.56)] px-4 py-3.5">
              <strong>{t('detail.activePlayersLabel')}</strong>
              <p className="m-0 mt-1.5">{t('detail.activePlayersValue', { count: activeSeatCount })}</p>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant="accent">{t('detail.status', { status: selectedTable.status || t('tables.unknown') })}</Badge>
            <Badge>{t('detail.hand', { status: handStatus })}</Badge>
            <Badge>{t('detail.street', { street })}</Badge>
            <Badge>{t('detail.pot', { pot: typeof pot === 'number' ? pot : 0 })}</Badge>
            {isHandFinished && <Badge variant="success">{t('detail.gameFinished')}</Badge>}
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2 max-[1024px]:grid-cols-1">
            <div className="detail-row rounded-[14px] border border-[rgba(242,229,187,0.06)] bg-[rgba(8,18,13,0.5)] px-3 py-2.5">
              <span>{t('detail.id')}</span>
              <strong>{selectedTable.id}</strong>
            </div>
            <div className="detail-row rounded-[14px] border border-[rgba(242,229,187,0.06)] bg-[rgba(8,18,13,0.5)] px-3 py-2.5">
              <span>{t('detail.handLabel')}</span>
              <strong>{handStatus}</strong>
            </div>
            <div className="detail-row rounded-[14px] border border-[rgba(242,229,187,0.06)] bg-[rgba(8,18,13,0.5)] px-3 py-2.5">
              <span>{t('detail.streetLabel')}</span>
              <strong>{street}</strong>
            </div>
            <div className="detail-row rounded-[14px] border border-[rgba(242,229,187,0.06)] bg-[rgba(8,18,13,0.5)] px-3 py-2.5">
              <span>{t('detail.actorSeat')}</span>
              <strong>{actorSeatNo ?? '-'}</strong>
            </div>
            <div className="detail-row rounded-[14px] border border-[rgba(242,229,187,0.06)] bg-[rgba(8,18,13,0.5)] px-3 py-2.5">
              <span>{t('detail.seats')}</span>
              <strong>{selectedTable.seats?.length || 0}</strong>
            </div>
          </div>
          <div className="table-felt">
            <div className="table-felt__rail" />
            <DesktopSeatLayout
              seats={displaySeats}
              actorSeatNo={actorSeatNo}
              dealerSeat={handDealerSeat}
              smallBlindSeat={smallBlindSeat}
              bigBlindSeat={bigBlindSeat}
            />
            <TableCenter
              board={board}
              pot={pot}
              sidePots={sidePots}
              mySeatNo={mySeatNo}
              seatHoleCards={seatHoleCards}
            />
            <MobileSeatLayout
              seats={displaySeats}
              actorSeatNo={actorSeatNo}
              dealerSeat={handDealerSeat}
              smallBlindSeat={smallBlindSeat}
              bigBlindSeat={bigBlindSeat}
            />
          </div>
        </div>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))] max-[1024px]:grid-cols-1">
          <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[rgba(15,23,42,0.5)] p-3.5">
            <h3>{t('detail.seatActions')}</h3>
            <div className="mb-3 grid grid-cols-1 gap-1.5">
              <label className="text-sm font-medium text-[var(--color-foreground)]">{t('detail.seatNo')}</label>
              <Input
                type="number"
                min={1}
                value={seatNo}
                onChange={(e) => setSeatNo(Number(e.target.value))}
              />
              {!hasOwnedSeat && (
                <>
                  <label className="text-sm font-medium text-[var(--color-foreground)]">{t('detail.playerName')}</label>
                  <Input
                    type="text"
                    value={seatName}
                    onChange={(e) => setSeatName(e.target.value)}
                    placeholder={t('detail.playerNamePlaceholder')}
                  />
                </>
              )}
              <label className="text-sm font-medium text-[var(--color-foreground)]">{t('detail.stack')}</label>
              <Input
                type="number"
                min={0}
                value={seatStack}
                onChange={(e) => setSeatStack(Number(e.target.value))}
              />
              <label className="text-sm font-medium text-[var(--color-foreground)]">{t('detail.buyIn')}</label>
              <Input
                type="number"
                min={0}
                value={buyInAmount}
                onChange={(e) => setBuyInAmount(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-wrap gap-3 [&>button]:min-w-[calc(50%-6px)]">
              <Button
                size="sm"
                onClick={handleJoinSeat}
                disabled={joinSeatDisabled}
                title={joinSeatDisabledReason}
              >
                {t('detail.joinSeat')}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleBuyIn} disabled={!token}>{t('detail.buyInAction')}</Button>
              <Button variant="ghost" size="sm" onClick={handleLeaveSeat} disabled={!token}>{t('detail.leaveSeat')}</Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemovePlayer}
                disabled={!canRemovePlayer}
                title={canRemovePlayer ? t('detail.removePlayerTitle') : t('detail.selectedSeatEmpty')}
              >
                {t('detail.removePlayer')}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSitOut} disabled={!token}>{t('detail.sitOut')}</Button>
              <Button variant="ghost" size="sm" onClick={handleSitIn} disabled={!token}>{t('detail.sitIn')}</Button>
            </div>
            {joinSeatDisabled && <p className="mt-2.5 text-sm text-[var(--color-muted)]">{joinSeatDisabledReason}</p>}
          </div>

          <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[rgba(15,23,42,0.5)] p-3.5">
            <h3>{t('detail.tableControls')}</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                size="sm"
                onClick={handleOpenTable}
                disabled={openTableDisabled}
                title={openTableDisabledReason}
              >
                {t('detail.openTable')}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCloseTable} disabled={!token}>{t('detail.closeTable')}</Button>
            </div>
            {openTableDisabled && <p className="mt-2.5 text-sm text-[var(--color-muted)]">{openTableDisabledReason}</p>}
          </div>

          {isAdmin && (
            <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[rgba(15,23,42,0.5)] p-3.5">
              <h3>{t('detail.handControls')}</h3>
              <div className="mb-3 grid grid-cols-1 gap-1.5">
                <label className="text-sm font-medium text-[var(--color-foreground)]">{t('detail.dealerSeat')}</label>
                <Input
                  type="number"
                  min={1}
                  value={dealerSeat}
                  onChange={(e) => setDealerSeat(Number(e.target.value))}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" onClick={handleStartHand} disabled={!token}>{t('detail.startHand')}</Button>
                <Button variant="ghost" size="sm" onClick={handleResolve} disabled={!token}>{t('detail.resolveShowdown')}</Button>
                <Button variant="ghost" size="sm" onClick={handleTimeout} disabled={!token}>{t('detail.timeout')}</Button>
                <Button variant="ghost" size="sm" onClick={handleNextHand} disabled={!token}>{t('detail.nextHand')}</Button>
              </div>
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[rgba(15,23,42,0.5)] p-3.5">
            <h3>{t('detail.yourTurn')}</h3>
            {hasSeatConflict && (
              <p className="mt-2.5 text-[var(--color-danger)]">{t('detail.seatConflict')}</p>
            )}
            {!mySeatNo && !hasSeatConflict && (
              <p className="text-sm text-[var(--color-muted)]">{t('detail.joinToPlay')}</p>
            )}
            {mySeatNo && !isMyTurn && (
              <p className="text-sm text-[var(--color-muted)]">{t('detail.waitingForSeat', { seat: actorSeatNo ?? '-' })}</p>
            )}
            <div className="mb-3 grid grid-cols-1 gap-1.5">
              <label className="text-sm font-medium text-[var(--color-foreground)]">{t('detail.yourSeat')}</label>
              <Input type="text" value={mySeatNo ?? '—'} disabled />
              <label className="text-sm font-medium text-[var(--color-foreground)]">{t('detail.amount')}</label>
              <Input
                type="number"
                min={0}
                value={actionAmount}
                onChange={(e) => setActionAmount(Number(e.target.value))}
                disabled={!(canBet || canRaise || canAllIn) || !isMyTurn || hasSeatConflict}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              {legalForSeat && legalForSeat.length > 0 ? (
                legalForSeat.map((action) => (
                  <Button
                    key={action}
                    variant={action === 'bet' || action === 'raise' || action === 'all-in' ? 'ghost' : 'primary'}
                    size="sm"
                    onClick={() => submitAction(action)}
                    disabled={!token || !isMyTurn || hasSeatConflict}
                  >
                    {action === 'all-in' ? 'All-in' : action.charAt(0).toUpperCase() + action.slice(1)}
                  </Button>
                ))
              ) : (
                <span className="text-sm text-[var(--color-muted)]">{t('detail.noLegalActions')}</span>
              )}
            </div>
            <p className="mt-2.5 text-sm text-[var(--color-muted)]">{actionMessage}</p>
            {legalForSeat && (
              <p className="text-sm text-[var(--color-muted)]">{t('detail.legalActions', { actions: legalForSeat.join(', ') })}</p>
            )}
          </div>

          {isAdmin && (
            <details className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[rgba(15,23,42,0.5)] p-3.5">
              <summary className="mb-3 cursor-pointer font-semibold marker:text-[var(--color-muted)]">{t('detail.adminDebug')}</summary>
              <div className="flex flex-wrap gap-3">
                <Button variant="ghost" size="sm" onClick={handleLoadDemoSeats}>
                  {t('detail.loadDemoSeats')}
                </Button>
              </div>
              <div className="mb-3 grid grid-cols-1 gap-1.5">
                <label className="text-sm font-medium text-[var(--color-foreground)]">{t('detail.boardCards')}</label>
                <Input
                  placeholder={t('detail.boardCardsPlaceholder')}
                  value={boardText}
                  onChange={(e) => setBoardText(e.target.value)}
                />
                <label className="text-sm font-medium text-[var(--color-foreground)]">{t('detail.holeCardsSeatInput')}</label>
                <Input
                  placeholder={t('detail.holeCardsPlaceholder')}
                  value={holeText}
                  onChange={(e) => setHoleText(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="ghost" size="sm" onClick={handleSetCards} disabled={!token}>{t('detail.setCards')}</Button>
              </div>
              <p className="text-sm text-[var(--color-muted)]">{t('detail.manualCardInjection')}</p>
            </details>
          )}
        </div>
      </div>
    </Panel>
  )
}

const TableCenter = ({
  board,
  pot,
  sidePots,
  mySeatNo,
  seatHoleCards,
}: {
  board?: string[]
  pot?: number
  sidePots?: Array<{ amount: number; 'eligible-seat-nos': number[] }>
  mySeatNo?: number
  seatHoleCards?: string[]
}) => {
  const { t } = useI18n()

  return (
    <div className="table-center">
      <div className="cards-panel">
        <div className="cards-panel__row">
          <div className="cards-panel__head">
            <h3>{t('detail.board')}</h3>
            <span className="muted">{board?.length || 0} / 5</span>
          </div>
          <div className="card-row">
            {(board && board.length > 0 ? board : Array.from({ length: 5 }).map(() => undefined)).map((card, idx) => (
              <Card key={`board-${idx}`} value={card} faceDown={!card} />
            ))}
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
            {(seatHoleCards && seatHoleCards.length > 0 ? seatHoleCards : Array.from({ length: 2 }).map(() => undefined)).map(
              (card, idx) => (
                <Card key={`hole-${idx}`} value={card} faceDown={!card} />
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const DesktopSeatLayout = ({
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
  const positions = seatPositions(seats.length)

  return (
    <div className="seat-layout seat-layout--desktop">
      {seats.length === 0 && <p className="muted">{t('detail.noSeatsYet')}</p>}
      {seats.map((seat) => {
        const seatNo = seat['seat-no'] ?? seat.seat_no ?? 0
        const position = positions[seatNo - 1] ?? positions[0] ?? { x: 50, y: 50 }
        const slotClasses = ['seat-slot']
        if (position.y <= 20) slotClasses.push('seat-slot--far')
        else if (position.y >= 82) slotClasses.push('seat-slot--near')
        else slotClasses.push('seat-slot--mid')

        return (
          <div
            key={seatNo}
            className={slotClasses.join(' ')}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
          >
            <SeatChip
              seat={seat}
              actorSeatNo={actorSeatNo}
              dealerSeat={dealerSeat}
              smallBlindSeat={smallBlindSeat}
              bigBlindSeat={bigBlindSeat}
            />
          </div>
        )
      })}
    </div>
  )
}

const MobileSeatLayout = ({
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
  const { topSeats, bottomSeats } = useMemo(() => splitSeatsForMobile(seats), [seats])
  const { t } = useI18n()

  return (
    <div className="seat-layout-mobile">
      <div className="seat-layout-mobile__row seat-layout-mobile__row--top">
        {topSeats.length > 0 ? (
          topSeats.map((seat) => (
            <SeatChip
              key={seat['seat-no'] ?? seat.seat_no}
              seat={seat}
              actorSeatNo={actorSeatNo}
              dealerSeat={dealerSeat}
              smallBlindSeat={smallBlindSeat}
              bigBlindSeat={bigBlindSeat}
            />
          ))
        ) : (
          <p className="muted">{t('detail.noSeatsYet')}</p>
        )}
      </div>
      <div className="seat-layout-mobile__row seat-layout-mobile__row--bottom">
        {bottomSeats.map((seat) => (
          <SeatChip
            key={seat['seat-no'] ?? seat.seat_no}
            seat={seat}
            actorSeatNo={actorSeatNo}
            dealerSeat={dealerSeat}
            smallBlindSeat={smallBlindSeat}
            bigBlindSeat={bigBlindSeat}
          />
        ))}
      </div>
    </div>
  )
}

const SeatChip = ({
  seat,
  actorSeatNo,
  dealerSeat,
  smallBlindSeat,
  bigBlindSeat,
}: {
  seat: Seat
  actorSeatNo?: number
  dealerSeat?: number
  smallBlindSeat?: number
  bigBlindSeat?: number
}) => {
  const { t } = useI18n()
  const seatNo = seat['seat-no'] ?? seat.seat_no ?? 0
  const user = seat['user-id'] ?? seat.user_id ?? t('detail.emptySeatUser')
  const displayName = seat.name ?? user
  const stack = seat.stack ?? 0
  const committed = (seat as Seat & { 'committed-total'?: number; committed_total?: number })['committed-total'] ??
    (seat as Seat & { committed_total?: number }).committed_total ??
    0
  const sittingOut = Boolean(seat['sitting-out?'] ?? seat.sitting_out)
  const isActor = actorSeatNo === seatNo
  const isMine = user !== t('detail.emptySeatUser') && user === useAppStore.getState().userId
  const isDealer = dealerSeat === seatNo
  const isSmallBlind = smallBlindSeat === seatNo
  const isBigBlind = bigBlindSeat === seatNo
  const shortName = truncateSeatName(displayName)
  const avatarLabel = seatAvatarLabel(displayName)

  return (
    <div className={`seat-chip ${isActor ? 'is-actor' : ''} ${sittingOut ? 'is-sitting-out' : ''} ${isMine ? 'is-mine' : ''}`}>
      <div className="seat-chip__head">
        <span className="seat-chip__seat">{t('detail.seatTag', { seat: seatNo })}</span>
        <div className="pill-row">
          {isMine && <Badge variant="success" className="px-2 py-0.5 text-[9px] tracking-[0.14em]">{t('detail.you')}</Badge>}
          {isActor && <Badge className="px-2 py-0.5 text-[9px] tracking-[0.14em]">{t('detail.acting')}</Badge>}
          {isDealer && <Badge variant="accent" className="px-2 py-0.5 text-[9px] tracking-[0.14em]">D</Badge>}
          {isSmallBlind && <Badge variant="warning" className="px-2 py-0.5 text-[9px] tracking-[0.14em]">SB</Badge>}
          {isBigBlind && <Badge variant="warning" className="px-2 py-0.5 text-[9px] tracking-[0.14em]">BB</Badge>}
        </div>
      </div>
      <div className="seat-chip__body" title={`${displayName}${displayName !== user ? ` (${user})` : ''}`}>
        <span className="seat-chip__avatar" aria-hidden="true">{avatarLabel}</span>
        <div className="seat-chip__info">
          <strong className="seat-chip__user">{shortName}</strong>
          <span className="seat-chip__stack">{t('detail.stackShort', { value: stack })}</span>
        </div>
      </div>
      {(sittingOut || committed > 0) && (
        <div className="seat-chip__meta">
          {sittingOut && <Badge className="px-2 py-0.5 text-[9px] tracking-[0.14em]">{t('detail.sittingOut')}</Badge>}
          {committed > 0 && <span className="seat-chip__committed">{t('detail.committedShort', { value: committed })}</span>}
        </div>
      )}
    </div>
  )
}

const seatPositions = (count: number) => {
  switch (count) {
    case 2:
      return [{ x: 50, y: 88 }, { x: 50, y: 12 }]
    case 3:
      return [{ x: 50, y: 88 }, { x: 14, y: 24 }, { x: 86, y: 24 }]
    case 4:
      return [{ x: 50, y: 88 }, { x: 12, y: 50 }, { x: 50, y: 12 }, { x: 88, y: 50 }]
    case 5:
      return [{ x: 50, y: 89 }, { x: 14, y: 68 }, { x: 18, y: 18 }, { x: 82, y: 18 }, { x: 86, y: 68 }]
    case 6:
      return [
        { x: 50, y: 89 },
        { x: 16, y: 72 },
        { x: 14, y: 18 },
        { x: 86, y: 18 },
        { x: 84, y: 72 },
        { x: 50, y: 10 },
      ]
    default:
      return Array.from({ length: count }, (_, index) => {
        const angle = ((Math.PI * 2) / Math.max(count, 1)) * index - Math.PI / 2
        return {
          x: 50 + Math.cos(angle) * 38,
          y: 50 + Math.sin(angle) * 38,
        }
      })
  }
}

const splitSeatsForMobile = (seats: Seat[]) => {
  const positions = seatPositions(seats.length)
  const mappedSeats = seats.map((seat) => {
    const seatNo = seat['seat-no'] ?? seat.seat_no ?? 0
    const position = positions[Math.max(seatNo - 1, 0)] ?? { x: 50, y: 50 }
    return { seat, position }
  })

  return {
    topSeats: mappedSeats
      .filter(({ position }) => position.y <= 50)
      .sort((a, b) => a.position.x - b.position.x)
      .map(({ seat }) => seat),
    bottomSeats: mappedSeats
      .filter(({ position }) => position.y > 50)
      .sort((a, b) => a.position.x - b.position.x)
      .map(({ seat }) => seat),
  }
}

const truncateSeatName = (name: string) => {
  if (name.length <= 10) return name
  return `${name.slice(0, 9)}…`
}

const seatAvatarLabel = (name: string) => {
  const words = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase()
}
