import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useI18n } from '../i18n'
import { useApi } from '../api/useApi'
import {
  AdminDebugSection,
  AdminHandControlsSection,
  AdminTableControlsSection,
  PlayerControlsSection,
  TurnActionsSection,
} from './table-detail/control-sections'
import {
  DesktopSeatLayout,
  MobileSeatLayout,
  TableCenter,
} from './table-detail/table-visuals'
import { TableSummary } from './table-detail/table-summary'
import { useAppStore } from '../state/useAppStore'
import type { CurrentHand, Seat, Table } from '../types'
import { ConfirmDialog } from '../components/ui/confirm-dialog'
import { Badge } from '../components/ui/badge'
import { Panel } from '../components/ui/panel'
import { evaluateVisibleHandRank } from '../lib/hand-rank'
import {
  isSeatInCurrentHand,
  resolveEffectiveSeatNo,
  syncedSeatNo,
} from '../lib/table-seat'

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
  const [seatNo, setSeatNo] = useState(0)
  const [seatName, setSeatName] = useState('')
  const [seatStack, setSeatStack] = useState(1000)
  const [buyInAmount, setBuyInAmount] = useState(500)
  const [dealerSeat, setDealerSeat] = useState(1)
  const [actionAmount, setActionAmount] = useState(20)
  const [boardText, setBoardText] = useState('')
  const [holeText, setHoleText] = useState('')
  const [isRemovePlayerDialogOpen, setIsRemovePlayerDialogOpen] = useState(false)
  const [isCloseTableDialogOpen, setIsCloseTableDialogOpen] = useState(false)
  const [isResetTableDialogOpen, setIsResetTableDialogOpen] = useState(false)

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
  const mySeat = ownedSeats.length === 1 ? ownedSeats[0] : undefined
  const isSittingOut = Boolean(mySeat && (mySeat['sitting-out?'] ?? mySeat.sitting_out))
  const legalForSeat =
    mySeatNo != null && legalActions
      ? legalActions[String(mySeatNo)] || legalActions[mySeatNo]
      : undefined
  const seatHoleCards = holeCards
    ? holeCards[String(mySeatNo ?? '')] || holeCards[mySeatNo as number]
    : undefined
  const handRankBySeatNo = useMemo(() => {
    const ranks: Record<number, string> = {}
    const handSeats = ((currentHand?.seats as Array<Record<string, unknown>> | undefined) ?? [])
    for (const seat of handSeats) {
      const seatNo = (seat['seat-no'] as number | undefined) ?? (seat.seat_no as number | undefined)
      if (seatNo == null) continue
      const showdownRank =
        (seat['showdown-rank'] as string | undefined) ??
        (seat.showdown_rank as string | undefined)
      if (showdownRank) {
        ranks[seatNo] = showdownRank
        continue
      }
      const visibleHoleCards = holeCards?.[String(seatNo)] ?? holeCards?.[seatNo]
      if (!board || !visibleHoleCards || visibleHoleCards.length !== 2) continue
      const category = evaluateVisibleHandRank([...board, ...visibleHoleCards])
      if (category) ranks[seatNo] = category
    }
    return ranks
  }, [board, currentHand?.seats, holeCards])
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
  const displaySeats = useMemo(() => {
    const seats = selectedTable?.seats ?? []
    return [...seats].sort((a, b) => {
      const aNo = a['seat-no'] ?? a['seat_no'] ?? 0
      const bNo = b['seat-no'] ?? b['seat_no'] ?? 0
      return aNo - bNo
    })
  }, [selectedTable])
  const firstOpenSeatNo = useMemo(() => {
    const occupied = new Set(
      displaySeats
        .filter((seat) => Boolean(seat['user-id'] ?? seat.user_id))
        .map((seat) => seat['seat-no'] ?? seat.seat_no)
        .filter((value): value is number => typeof value === 'number'),
    )
    const maxSeats = selectedTable?.['max-seats'] ?? Math.max(displaySeats.length, 1)
    for (let candidate = 1; candidate <= maxSeats; candidate += 1) {
      if (!occupied.has(candidate)) return candidate
    }
    return undefined
  }, [displaySeats, selectedTable?.['max-seats']])
  const effectiveSeatNo = resolveEffectiveSeatNo({ mySeatNo, seatNo, firstOpenSeatNo })

  useEffect(() => {
    const nextSeatNo = syncedSeatNo({ mySeatNo, seatNo, firstOpenSeatNo })
    if (nextSeatNo != null) setSeatNo(nextSeatNo)
  }, [firstOpenSeatNo, mySeatNo, seatNo])

  const activeSeats = displaySeats.filter((seat) => {
    const seatUserId = seat['user-id'] ?? seat.user_id
    const seatStack = seat.stack ?? 0
    const sittingOut = Boolean(seat['sitting-out?'] ?? seat.sitting_out)
    return Boolean(seatUserId) && !sittingOut && seatStack > 0
  })
  const activeSeatCount = activeSeats.length
  const mySeatInCurrentHand = isSeatInCurrentHand(
    mySeatNo,
    ((currentHand?.seats as Array<Record<string, unknown>> | undefined) ?? []),
  )
  const selectedSeat = displaySeats.find((seat) => (seat['seat-no'] ?? seat.seat_no) === effectiveSeatNo)
  const selectedSeatUserId = selectedSeat?.['user-id'] ?? selectedSeat?.user_id ?? ''
  const isSeatOccupied = Boolean(selectedSeatUserId)
  const hasOwnedSeat = ownedSeats.length > 0
  const hasValidSeatNo = Number.isFinite(effectiveSeatNo) && effectiveSeatNo > 0
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
  const leaveSeatDisabled = !token || mySeatNo == null || mySeatInCurrentHand
  const leaveSeatDisabledReason = (() => {
    if (!token) return t('detail.loginRequired')
    if (mySeatNo == null) return t('detail.notSeated')
    if (mySeatInCurrentHand) return t('detail.cannotLeaveDuringHand')
    return t('detail.leaveSeat')
  })()
  const nextStepMessage = (() => {
    if (!token) return t('detail.loginToControlTable')
    if (isSittingOut) return t('detail.sittingOutNeedSitIn')
    if (isHandFinished) {
      if (activeSeatCount < 2) return t('detail.handCompleteNeedPlayers')
      return t('detail.handCompleteReadyNext')
    }
    if (!currentHand) {
      if (!isTableOpen) return t('detail.tableClosedHint')
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
    if (isSittingOut) return t('detail.sittingOutNeedSitIn')
    if (!currentHand) return t('detail.startHandToReceiveActions')
    if (isHandFinished) return t('detail.handAlreadyFinished')
    if (handStatus === 'showdown') return t('detail.waitingForShowdownResolution')
    if (!isMyTurn) return t('detail.waitingForActorSeat', { seat: actorSeatNo ?? '-' })
    if (!legalForSeat || legalForSeat.length === 0) return t('detail.noLegalActionsYet')
    return t('detail.chooseActionPrompt')
  })()
  const hasAvailableTurnActions = isMyTurn && !hasSeatConflict && Boolean(legalForSeat?.length)
  const canOpenTable = Boolean(token && selectedTable && !isTableOpen && !hasHandInProgress)
  const canCloseTable = Boolean(token && selectedTable && isTableOpen && !hasHandInProgress)
  const canResetTable = Boolean(token && selectedTable)
  const canStartHand = Boolean(token && selectedTable && isTableOpen && !currentHand && activeSeatCount >= 2)
  const canResolveHand = Boolean(token && selectedTable && handStatus === 'showdown')
  const canTimeoutHand = Boolean(token && selectedTable && currentHand && !isHandFinished && handStatus !== 'showdown')
  const canGoNextHand = Boolean(token && selectedTable && isHandFinished && activeSeatCount >= 2)
  const showDealerSeatControl = canStartHand
  const showJoinSeatAction = !hasOwnedSeat
  const showBuyInAction = Boolean(hasOwnedSeat && token)
  const showLeaveSeatAction = mySeatNo != null
  const showRemovePlayerAction = Boolean(isAdmin && selectedSeatUserId && selectedSeatUserId !== userId)
  const showSitOutAction = Boolean(mySeatNo != null && token && !isSittingOut)
  const showSitInAction = Boolean(mySeatNo != null && token && isSittingOut)
  const hasVisiblePlayerActions =
    showJoinSeatAction ||
    showBuyInAction ||
    showLeaveSeatAction ||
    showRemovePlayerAction ||
    showSitOutAction ||
    showSitInAction
  const hasVisibleAdminTableActions = canOpenTable || canCloseTable || canResetTable
  const hasVisibleRecoveryActions = canStartHand || canResolveHand || canTimeoutHand || canGoNextHand

  const handleJoinSeat = async () => {
    if (!selectedTable) return
    const trimmedSeatName = seatName.trim()
    if (!trimmedSeatName) {
      setStatus(t('detail.nameRequired'), 'info')
      return
    }
    setStatus('')
    try {
      const table = await api.request(`/api/tables/${selectedTable.id}/join`, {
        method: 'POST',
        body: JSON.stringify({ 'seat-no': effectiveSeatNo, name: trimmedSeatName, stack: seatStack }),
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
        body: JSON.stringify({ 'seat-no': effectiveSeatNo, amount: buyInAmount }),
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
        body: JSON.stringify({ 'seat-no': effectiveSeatNo }),
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
        body: JSON.stringify({ 'seat-no': effectiveSeatNo }),
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
        body: JSON.stringify({ 'seat-no': effectiveSeatNo }),
      })
      updateTable(table as Table)
      setSelectedTable(table as Table)
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleRequestRemovePlayer = () => {
    if (!selectedTable || !selectedSeatUserId) return
    setIsRemovePlayerDialogOpen(true)
  }

  const handleRemovePlayer = async () => {
    if (!selectedTable || !selectedSeatUserId) return
    setStatus('')
    try {
      const table = await api.request(`/api/tables/${selectedTable.id}/leave`, {
        method: 'POST',
        body: JSON.stringify({ 'seat-no': effectiveSeatNo }),
      })
      updateTable(table as Table)
      setSelectedTable(table as Table)
      setIsRemovePlayerDialogOpen(false)
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
      setIsCloseTableDialogOpen(false)
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleResetTable = async () => {
    if (!selectedTable) return
    setStatus('')
    try {
      const table = await api.request(`/api/tables/${selectedTable.id}/reset`, {
        method: 'POST',
      })
      updateTable(table as Table)
      setSelectedTable(table as Table)
      setIsResetTableDialogOpen(false)
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleRequestResetTable = () => {
    if (!selectedTable) return
    setIsResetTableDialogOpen(true)
  }

  const handleRequestCloseTable = () => {
    if (!selectedTable) return
    setIsCloseTableDialogOpen(true)
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
      if (holes.length > 0) payload['hole-cards'] = { [String(effectiveSeatNo)]: holes }

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
    setStatus(t('detail.demoSeatsLoaded'), 'success')
  }

  const submitAction = async (type: string) => {
    if (!selectedTable) return
    if (mySeatNo == null) {
      setStatus(t('detail.notSeated'), 'info')
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
      <Panel className="min-h-[420px]">
      <div className="grid gap-[18px]">
        <div className="grid gap-[18px]">
          <div className="grid gap-2 rounded-[16px] border border-[var(--color-border)] px-4 py-4 max-[1024px]:gap-1.5 max-[1024px]:px-3.5 max-[1024px]:py-3 sm:px-5">
            <div className="flex flex-wrap items-center gap-2 max-[1024px]:gap-1.5">
              <Badge variant={isHandFinished ? 'success' : actorSeatNo != null ? 'accent' : 'neutral'}>
                {t('detail.street', { street })}
              </Badge>
              {isMyTurn ? <Badge variant="accent">{t('detail.yourTurnToAct')}</Badge> : null}
            </div>
            <p className="m-0 text-[15px] leading-6 text-[var(--color-muted)] max-[1024px]:text-[13px] max-[1024px]:leading-5">
              {nextStepMessage}
            </p>
          </div>
          <div className="relative grid min-h-[620px] items-center justify-items-center gap-[26px] overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[radial-gradient(circle_at_50%_40%,rgba(32,47,38,0.96),rgba(17,24,20,0.98)_58%,rgba(12,16,14,1)_100%)] px-[clamp(14px,3vw,28px)] py-8 shadow-[0_18px_36px_rgba(0,0,0,0.18)] max-[1024px]:min-h-0 max-[1024px]:gap-[18px] max-[1024px]:rounded-[22px] max-[1024px]:px-3 max-[1024px]:py-[22px] max-[520px]:gap-[14px] max-[520px]:rounded-[20px] max-[520px]:px-2 max-[520px]:py-4">
            <div className="pointer-events-none absolute inset-4 rounded-[999px] border border-[rgba(255,255,255,0.08)] max-[1024px]:rounded-[28px] max-[520px]:rounded-[24px]" />
            <DesktopSeatLayout
              seats={displaySeats}
              actorSeatNo={actorSeatNo}
              dealerSeat={handDealerSeat}
              smallBlindSeat={smallBlindSeat}
              bigBlindSeat={bigBlindSeat}
              handRankBySeatNo={handRankBySeatNo}
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
              handRankBySeatNo={handRankBySeatNo}
            />
          </div>
          <div className="hidden min-[1025px]:block">
            <TableSummary
              nextStepMessage={nextStepMessage}
              activeSeatCount={activeSeatCount}
              tableStatus={selectedTable.status}
              handStatus={handStatus}
              street={street}
              pot={pot}
              isHandFinished={isHandFinished}
              actorSeatNo={actorSeatNo}
              seatCount={selectedTable.seats?.length || 0}
            />
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(240px,1fr))] max-[1279px]:grid-cols-2 max-[1024px]:grid-cols-1">
          <div className={hasAvailableTurnActions ? 'max-[1024px]:sticky max-[1024px]:bottom-3 max-[1024px]:z-10' : ''}>
            <TurnActionsSection
              hasSeatConflict={hasSeatConflict}
              mySeatNo={mySeatNo}
              isMyTurn={isMyTurn}
              actorSeatNo={actorSeatNo}
              actionAmount={actionAmount}
              onActionAmountChange={setActionAmount}
              canBet={canBet}
              canRaise={canRaise}
              canAllIn={canAllIn}
              legalForSeat={legalForSeat}
              onSubmitAction={submitAction}
              hasToken={Boolean(token)}
              actionMessage={actionMessage}
            />
          </div>
          <DisclosurePanel
            title={t('detail.statusLabel')}
            className="min-[1025px]:hidden"
          >
            <TableSummary
              nextStepMessage={nextStepMessage}
              activeSeatCount={activeSeatCount}
              tableStatus={selectedTable.status}
              handStatus={handStatus}
              street={street}
              pot={pot}
              isHandFinished={isHandFinished}
              actorSeatNo={actorSeatNo}
              seatCount={selectedTable.seats?.length || 0}
            />
          </DisclosurePanel>
          {hasVisiblePlayerActions ? (
            <DisclosurePanel
              title={t('detail.seatActions')}
              defaultOpen={!hasOwnedSeat}
              className="min-[1025px]:hidden"
            >
              <PlayerControlsSection
                seatNo={effectiveSeatNo}
                onSeatNoChange={setSeatNo}
                seatNoLocked={Boolean(mySeatNo != null)}
                hasOwnedSeat={hasOwnedSeat}
                seatName={seatName}
                onSeatNameChange={setSeatName}
                seatStack={seatStack}
                onSeatStackChange={setSeatStack}
                buyInAmount={buyInAmount}
                onBuyInAmountChange={setBuyInAmount}
                onJoinSeat={handleJoinSeat}
                joinSeatDisabled={joinSeatDisabled}
                joinSeatDisabledReason={joinSeatDisabledReason}
                showJoinSeat={showJoinSeatAction}
                onBuyIn={handleBuyIn}
                showBuyIn={showBuyInAction}
                onLeaveSeat={handleLeaveSeat}
                leaveSeatDisabled={leaveSeatDisabled}
                leaveSeatDisabledReason={leaveSeatDisabledReason}
                showLeaveSeat={showLeaveSeatAction}
                onRemovePlayer={handleRequestRemovePlayer}
                canRemovePlayer={canRemovePlayer}
                showRemovePlayer={showRemovePlayerAction}
                onSitOut={handleSitOut}
                showSitOut={showSitOutAction}
                onSitIn={handleSitIn}
                showSitIn={showSitInAction}
                hasToken={Boolean(token)}
              />
            </DisclosurePanel>
          ) : null}
          {hasVisiblePlayerActions ? (
            <DisclosurePanel
              title={t('detail.seatActions')}
              defaultOpen={!hasOwnedSeat}
              className="max-[1024px]:hidden"
            >
              <PlayerControlsSection
                seatNo={effectiveSeatNo}
                onSeatNoChange={setSeatNo}
                seatNoLocked={Boolean(mySeatNo != null)}
                hasOwnedSeat={hasOwnedSeat}
                seatName={seatName}
                onSeatNameChange={setSeatName}
                seatStack={seatStack}
                onSeatStackChange={setSeatStack}
                buyInAmount={buyInAmount}
                onBuyInAmountChange={setBuyInAmount}
                onJoinSeat={handleJoinSeat}
                joinSeatDisabled={joinSeatDisabled}
                joinSeatDisabledReason={joinSeatDisabledReason}
                showJoinSeat={showJoinSeatAction}
                onBuyIn={handleBuyIn}
                showBuyIn={showBuyInAction}
                onLeaveSeat={handleLeaveSeat}
                leaveSeatDisabled={leaveSeatDisabled}
                leaveSeatDisabledReason={leaveSeatDisabledReason}
                showLeaveSeat={showLeaveSeatAction}
                onRemovePlayer={handleRequestRemovePlayer}
                canRemovePlayer={canRemovePlayer}
                showRemovePlayer={showRemovePlayerAction}
                onSitOut={handleSitOut}
                showSitOut={showSitOutAction}
                onSitIn={handleSitIn}
                showSitIn={showSitInAction}
                hasToken={Boolean(token)}
              />
            </DisclosurePanel>
          ) : null}

          {isAdmin && hasVisibleAdminTableActions ? (
            <DisclosurePanel title={t('detail.tableControls')}>
              <AdminTableControlsSection
                canOpenTable={canOpenTable}
                onOpenTable={handleOpenTable}
                canCloseTable={canCloseTable}
                onCloseTable={handleRequestCloseTable}
                canResetTable={canResetTable}
                onRequestResetTable={handleRequestResetTable}
                tableControlsDescription={
                  hasHandInProgress
                    ? t('detail.cannotOpenDuringHand')
                    : isTableOpen
                      ? t('detail.tableAlreadyOpen')
                      : t('detail.tableClosedHint')
                }
              />
            </DisclosurePanel>
          ) : null}

          {isAdmin && hasVisibleRecoveryActions ? (
            <DisclosurePanel title={t('detail.recoveryToolsSummary')}>
              <AdminHandControlsSection
                dealerSeat={dealerSeat}
                onDealerSeatChange={setDealerSeat}
                canSetDealerSeat={showDealerSeatControl}
                canStartHand={canStartHand}
                onStartHand={handleStartHand}
                canResolve={canResolveHand}
                onResolve={handleResolve}
                canTimeout={canTimeoutHand}
                onTimeout={handleTimeout}
                canNextHand={canGoNextHand}
                onNextHand={handleNextHand}
                title={t('detail.recoveryTools')}
                description={t('detail.handControlsRecoveryOnly')}
              />
            </DisclosurePanel>
          ) : null}

          {isAdmin && (
            <DisclosurePanel title={t('detail.adminDebug')}>
              <AdminDebugSection
                boardText={boardText}
                onBoardTextChange={setBoardText}
                holeText={holeText}
                onHoleTextChange={setHoleText}
                onLoadDemoSeats={handleLoadDemoSeats}
                onSetCards={handleSetCards}
                disabled={!token}
              />
            </DisclosurePanel>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={isRemovePlayerDialogOpen}
        onOpenChange={setIsRemovePlayerDialogOpen}
        title={t('detail.removePlayerConfirmTitle')}
        description={t('detail.confirmRemovePlayer', { user: selectedSeatUserId, seat: effectiveSeatNo })}
        cancelLabel={t('dialog.cancel')}
        confirmLabel={t('dialog.confirm')}
        onConfirm={handleRemovePlayer}
      />
      <ConfirmDialog
        open={isCloseTableDialogOpen}
        onOpenChange={setIsCloseTableDialogOpen}
        title={t('detail.confirmCloseTableTitle')}
        description={t('detail.confirmCloseTable', { table: selectedTable?.name || selectedTable?.id || '' })}
        cancelLabel={t('dialog.cancel')}
        confirmLabel={t('dialog.confirm')}
        onConfirm={handleCloseTable}
      />
      <ConfirmDialog
        open={isResetTableDialogOpen}
        onOpenChange={setIsResetTableDialogOpen}
        title={t('detail.confirmResetTableTitle')}
        description={t('detail.confirmResetTable', { table: selectedTable?.name || selectedTable?.id || '' })}
        cancelLabel={t('dialog.cancel')}
        confirmLabel={t('dialog.confirm')}
        onConfirm={handleResetTable}
      />
    </Panel>
  )
}

type DisclosurePanelProps = {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}

const DisclosurePanel = ({
  title,
  children,
  defaultOpen = false,
  className = '',
}: DisclosurePanelProps) => (
  <details
    className={`rounded-[16px] border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-[var(--color-foreground)] ${className}`.trim()}
    open={defaultOpen}
  >
    <summary className="cursor-pointer text-sm font-semibold marker:text-[var(--color-muted)]">
      {title}
    </summary>
    <div className="mt-3">{children}</div>
  </details>
)
