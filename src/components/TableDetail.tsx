import { useMemo, useState } from 'react'
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
import { Panel } from '../components/ui/panel'

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
  const [isRemovePlayerDialogOpen, setIsRemovePlayerDialogOpen] = useState(false)
  const [isCloseTableDialogOpen, setIsCloseTableDialogOpen] = useState(false)

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
      setStatus(t('detail.nameRequired'), 'info')
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
        body: JSON.stringify({ 'seat-no': seatNo }),
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
      <Panel className="min-h-[420px] bg-[radial-gradient(circle_at_top,rgba(217,177,95,0.08),transparent_18%),rgba(19,29,22,0.88)]">
      <h2>{t('detail.title')}</h2>
      <div className="grid gap-[18px]">
        <div className="grid gap-[18px]">
          <TableSummary
            nextStepMessage={nextStepMessage}
            activeSeatCount={activeSeatCount}
            tableStatus={selectedTable.status}
            handStatus={handStatus}
            street={street}
            pot={pot}
            isHandFinished={isHandFinished}
            tableId={selectedTable.id}
            actorSeatNo={actorSeatNo}
            seatCount={selectedTable.seats?.length || 0}
          />
          <div className="relative grid min-h-[620px] items-center justify-items-center gap-[26px] overflow-hidden rounded-[40px] border-[10px] border-[#57351c] bg-[radial-gradient(circle_at_50%_40%,rgba(52,122,78,0.92),rgba(18,68,39,0.96)_58%,rgba(9,39,24,0.98)_100%)] px-[clamp(14px,3vw,28px)] py-8 shadow-[inset_0_0_0_3px_rgba(245,228,177,0.18),inset_0_-18px_36px_rgba(0,0,0,0.25),0_28px_50px_rgba(0,0,0,0.3)] max-[1024px]:min-h-0 max-[1024px]:gap-[18px] max-[1024px]:rounded-[28px] max-[1024px]:border-[8px] max-[1024px]:px-3 max-[1024px]:py-[22px] max-[520px]:gap-[14px] max-[520px]:rounded-[24px] max-[520px]:border-[7px] max-[520px]:px-2 max-[520px]:py-4">
            <div className="pointer-events-none absolute inset-4 rounded-[999px] border-2 border-[rgba(242,229,187,0.14)] max-[1024px]:rounded-[28px] max-[520px]:rounded-[24px]" />
            <div className="pointer-events-none absolute inset-[10px] rounded-[999px] border border-[rgba(28,13,4,0.4)] max-[1024px]:rounded-[28px] max-[520px]:rounded-[24px]" />
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
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(240px,1fr))] max-[1279px]:grid-cols-2 max-[1024px]:grid-cols-1">
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

          <PlayerControlsSection
            seatNo={seatNo}
            onSeatNoChange={setSeatNo}
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
            onBuyIn={handleBuyIn}
            onLeaveSeat={handleLeaveSeat}
            onRemovePlayer={handleRequestRemovePlayer}
            canRemovePlayer={canRemovePlayer}
            onSitOut={handleSitOut}
            onSitIn={handleSitIn}
            hasToken={Boolean(token)}
            isAdmin={isAdmin}
          />

          {isAdmin && (
            <AdminTableControlsSection
              openTableDisabled={openTableDisabled}
              openTableDisabledReason={openTableDisabledReason}
              onOpenTable={handleOpenTable}
              onCloseTable={handleRequestCloseTable}
              closeTableDisabled={!token}
              tableControlsDescription={
                hasHandInProgress
                  ? t('detail.cannotOpenDuringHand')
                  : isTableOpen
                    ? t('detail.tableAlreadyOpen')
                    : t('detail.tableClosedHint')
              }
            />
          )}

          {isAdmin && (
            <AdminHandControlsSection
              dealerSeat={dealerSeat}
              onDealerSeatChange={setDealerSeat}
              onStartHand={handleStartHand}
              onResolve={handleResolve}
              onTimeout={handleTimeout}
              onNextHand={handleNextHand}
              disabled={!token}
            />
          )}

          {isAdmin && (
            <AdminDebugSection
              boardText={boardText}
              onBoardTextChange={setBoardText}
              holeText={holeText}
              onHoleTextChange={setHoleText}
              onLoadDemoSeats={handleLoadDemoSeats}
              onSetCards={handleSetCards}
              disabled={!token}
            />
          )}
        </div>
      </div>
      <ConfirmDialog
        open={isRemovePlayerDialogOpen}
        onOpenChange={setIsRemovePlayerDialogOpen}
        title={t('detail.removePlayerConfirmTitle')}
        description={t('detail.confirmRemovePlayer', { user: selectedSeatUserId, seat: seatNo })}
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
    </Panel>
  )
}
