import { useI18n } from '@/i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ControlSection } from './control-section'

type AdminTableControlsSectionProps = {
  canOpenTable: boolean
  onOpenTable: () => void
  canCloseTable: boolean
  onCloseTable: () => void
  canResetTable: boolean
  onRequestResetTable: () => void
  tableControlsDescription?: string
}

export const AdminTableControlsSection = ({
  canOpenTable,
  onOpenTable,
  canCloseTable,
  onCloseTable,
  canResetTable,
  onRequestResetTable,
  tableControlsDescription,
}: AdminTableControlsSectionProps) => {
  const { t } = useI18n()
  const hasAnyAction = canOpenTable || canCloseTable || canResetTable

  return (
    <ControlSection
      title={t('detail.tableControls')}
      description={tableControlsDescription}
    >
      {hasAnyAction ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {canOpenTable ? (
            <Button className="w-full" onClick={onOpenTable}>
              {t('detail.openTable')}
            </Button>
          ) : null}
          {canCloseTable ? (
            <Button className="w-full" variant="ghost" onClick={onCloseTable}>
              {t('detail.closeTable')}
            </Button>
          ) : null}
          {canResetTable ? (
            <Button className="w-full" variant="ghost" onClick={onRequestResetTable}>
              {t('detail.resetTable')}
            </Button>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-muted)]">{tableControlsDescription}</p>
      )}
    </ControlSection>
  )
}

type AdminHandControlsSectionProps = {
  dealerSeat: number
  onDealerSeatChange: (value: number) => void
  canSetDealerSeat: boolean
  canStartHand: boolean
  onStartHand: () => void
  canResolve: boolean
  onResolve: () => void
  canTimeout: boolean
  onTimeout: () => void
  canNextHand: boolean
  onNextHand: () => void
  title?: string
  description?: string
}

export const AdminHandControlsSection = ({
  dealerSeat,
  onDealerSeatChange,
  canSetDealerSeat,
  canStartHand,
  onStartHand,
  canResolve,
  onResolve,
  canTimeout,
  onTimeout,
  canNextHand,
  onNextHand,
  title,
  description,
}: AdminHandControlsSectionProps) => {
  const { t } = useI18n()
  const hasAnyAction = canStartHand || canResolve || canTimeout || canNextHand

  return (
    <ControlSection
      title={title ?? t('detail.handControls')}
      description={description ?? t('detail.handControlsAdminOnly')}
    >
      {canSetDealerSeat ? (
        <div className="mb-3 grid gap-1.5">
          <Label>{t('detail.dealerSeat')}</Label>
          <Input
            type="number"
            min={1}
            value={dealerSeat}
            onChange={(e) => onDealerSeatChange(Number(e.target.value))}
          />
        </div>
      ) : null}
      {hasAnyAction ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {canStartHand ? <Button className="w-full" onClick={onStartHand}>{t('detail.startHand')}</Button> : null}
          {canResolve ? <Button className="w-full" variant="ghost" onClick={onResolve}>{t('detail.resolveShowdown')}</Button> : null}
          {canTimeout ? <Button className="w-full" variant="ghost" onClick={onTimeout}>{t('detail.timeout')}</Button> : null}
          {canNextHand ? <Button className="w-full" variant="ghost" onClick={onNextHand}>{t('detail.nextHand')}</Button> : null}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-muted)]">{description ?? t('detail.handControlsAdminOnly')}</p>
      )}
    </ControlSection>
  )
}

type PlayerControlsSectionProps = {
  seatNo: number
  onSeatNoChange: (value: number) => void
  seatNoLocked: boolean
  hasOwnedSeat: boolean
  seatName: string
  onSeatNameChange: (value: string) => void
  seatStack: number
  onSeatStackChange: (value: number) => void
  buyInAmount: number
  onBuyInAmountChange: (value: number) => void
  onJoinSeat: () => void
  joinSeatDisabled: boolean
  joinSeatDisabledReason: string
  showJoinSeat: boolean
  onBuyIn: () => void
  showBuyIn: boolean
  onLeaveSeat: () => void
  leaveSeatDisabled: boolean
  leaveSeatDisabledReason: string
  showLeaveSeat: boolean
  onRemovePlayer: () => void
  canRemovePlayer: boolean
  showRemovePlayer: boolean
  onSitOut: () => void
  showSitOut: boolean
  onSitIn: () => void
  showSitIn: boolean
  hasToken: boolean
}

export const PlayerControlsSection = ({
  seatNo,
  onSeatNoChange,
  seatNoLocked,
  hasOwnedSeat,
  seatName,
  onSeatNameChange,
  seatStack,
  onSeatStackChange,
  buyInAmount,
  onBuyInAmountChange,
  onJoinSeat,
  joinSeatDisabled,
  joinSeatDisabledReason,
  showJoinSeat,
  onBuyIn,
  showBuyIn,
  onLeaveSeat,
  leaveSeatDisabled,
  leaveSeatDisabledReason,
  showLeaveSeat,
  onRemovePlayer,
  canRemovePlayer,
  showRemovePlayer,
  onSitOut,
  showSitOut,
  onSitIn,
  showSitIn,
  hasToken,
}: PlayerControlsSectionProps) => {
  const { t } = useI18n()
  const showIdentityFields = showJoinSeat && !hasOwnedSeat
  const showStackField = showJoinSeat
  const showBuyInField = showBuyIn
  const showActions = showJoinSeat || showBuyIn || showLeaveSeat || showRemovePlayer || showSitOut || showSitIn

  return (
    <ControlSection
      title={t('detail.seatActions')}
      description={hasOwnedSeat ? t('detail.alreadySeated') : t('detail.joinToPlay')}
    >
      <div className="mb-4 grid gap-4 rounded-[14px] border border-[var(--color-border)] p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {showJoinSeat ? (
            <div className="grid gap-1.5">
              <Label>{t('detail.seatNo')}</Label>
              <Input
                type="number"
                min={1}
                value={seatNo}
                onChange={(e) => onSeatNoChange(Number(e.target.value))}
                disabled={seatNoLocked}
              />
            </div>
          ) : null}
          {showIdentityFields ? (
            <div className="grid gap-1.5 sm:col-span-2">
              <Label>{t('detail.playerName')}</Label>
              <Input
                type="text"
                value={seatName}
                onChange={(e) => onSeatNameChange(e.target.value)}
                placeholder={t('detail.playerNamePlaceholder')}
              />
            </div>
          ) : null}
          {showStackField ? (
            <div className="grid gap-1.5">
              <Label>{t('detail.stack')}</Label>
              <Input
                type="number"
                min={0}
                value={seatStack}
                onChange={(e) => onSeatStackChange(Number(e.target.value))}
              />
            </div>
          ) : null}
          {showBuyInField ? (
            <div className="grid gap-1.5">
              <Label>{t('detail.buyIn')}</Label>
              <Input
                type="number"
                min={0}
                value={buyInAmount}
                onChange={(e) => onBuyInAmountChange(Number(e.target.value))}
              />
            </div>
          ) : null}
        </div>
      </div>
      {showActions ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {showJoinSeat ? (
            <Button
              className="w-full"
              onClick={onJoinSeat}
              disabled={joinSeatDisabled}
              title={joinSeatDisabledReason}
            >
              {t('detail.joinSeat')}
            </Button>
          ) : null}
          {showBuyIn ? (
            <Button className="w-full" variant="ghost" onClick={onBuyIn} disabled={!hasToken}>
              {t('detail.buyInAction')}
            </Button>
          ) : null}
          {showLeaveSeat ? (
            <Button
              className="w-full"
              variant="ghost"
              onClick={onLeaveSeat}
              disabled={leaveSeatDisabled}
              title={leaveSeatDisabledReason}
            >
              {t('detail.leaveSeat')}
            </Button>
          ) : null}
          {showRemovePlayer ? (
            <Button
              className="w-full"
              variant="ghost"
              onClick={onRemovePlayer}
              disabled={!canRemovePlayer}
              title={canRemovePlayer ? t('detail.removePlayerTitle') : t('detail.selectedSeatEmpty')}
            >
              {t('detail.removePlayer')}
            </Button>
          ) : null}
          {showSitOut ? <Button className="w-full" variant="ghost" onClick={onSitOut} disabled={!hasToken}>{t('detail.sitOut')}</Button> : null}
          {showSitIn ? <Button className="w-full" variant="ghost" onClick={onSitIn} disabled={!hasToken}>{t('detail.sitIn')}</Button> : null}
        </div>
      ) : null}
      {showJoinSeat && joinSeatDisabled ? (
        <p className="mt-2.5 text-sm text-[var(--color-muted)]">{joinSeatDisabledReason}</p>
      ) : null}
    </ControlSection>
  )
}

type TurnActionsSectionProps = {
  hasSeatConflict: boolean
  mySeatNo?: number
  isMyTurn: boolean
  actorSeatNo?: number
  actionAmount: number
  onActionAmountChange: (value: number) => void
  canBet: boolean
  canRaise: boolean
  canAllIn: boolean
  legalForSeat?: string[]
  onSubmitAction: (action: string) => void
  hasToken: boolean
  actionMessage: string
}

export const TurnActionsSection = ({
  hasSeatConflict,
  mySeatNo,
  isMyTurn,
  actorSeatNo,
  actionAmount,
  onActionAmountChange,
  canBet,
  canRaise,
  canAllIn,
  legalForSeat,
  onSubmitAction,
  hasToken,
  actionMessage,
}: TurnActionsSectionProps) => {
  const { t } = useI18n()
  const amountActions = ['bet', 'raise', 'all-in'] as const
  const canSetAmount = (canBet || canRaise || canAllIn) && isMyTurn && !hasSeatConflict
  const primaryActions = legalForSeat?.filter((action) =>
    amountActions.includes(action as (typeof amountActions)[number]),
  ) ?? []
  const quickActions = legalForSeat?.filter((action) => !primaryActions.includes(action)) ?? []
  const hasAnyActions = quickActions.length > 0 || primaryActions.length > 0
  const showAmountBox = primaryActions.length > 0
  const showEmptyState = hasSeatConflict || !mySeatNo || !isMyTurn || !hasAnyActions
  const infoOnlyState = showEmptyState && !hasAnyActions
  const quickActionGridClass = quickActions.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
  const primaryActionGridClass = primaryActions.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'

  return (
    <ControlSection title={t('detail.yourTurn')} className={isMyTurn ? 'border-[var(--color-border-strong)]' : ''}>
      <div className="rounded-[14px] border border-[var(--color-border)] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={isMyTurn ? 'accent' : 'neutral'}>
            {isMyTurn ? t('detail.yourTurnToAct') : t('detail.waitingForActorSeat', { seat: actorSeatNo ?? '-' })}
          </Badge>
          {mySeatNo ? <Badge>{t('detail.yourSeat')}: {mySeatNo}</Badge> : null}
          {hasSeatConflict ? <Badge variant="danger">{t('detail.seatConflict')}</Badge> : null}
        </div>
        <p className="mt-3 text-sm text-[var(--color-muted)]">{actionMessage}</p>
      </div>
      {infoOnlyState ? null : <div className="mb-4" />}
      {showAmountBox ? (
        <div className="mb-4 grid gap-2 rounded-[14px] border border-[var(--color-border)] p-4">
          <div className="grid gap-1.5">
            <Label className="text-xs uppercase tracking-[0.08em] text-[var(--color-muted)]">{t('detail.amount')}</Label>
            <Input
              type="number"
              min={0}
              value={actionAmount}
              onChange={(e) => onActionAmountChange(Number(e.target.value))}
              disabled={!canSetAmount}
            />
          </div>
        </div>
      ) : null}
      {!showEmptyState ? (
        <div className="grid gap-3">
          {quickActions.length > 0 ? (
            <div className="grid gap-2">
              <div className={`grid gap-2 ${quickActionGridClass}`}>
                {quickActions.map((action) => (
                  <Button
                    key={action}
                    className="w-full"
                    onClick={() => onSubmitAction(action)}
                    disabled={!hasToken || !isMyTurn || hasSeatConflict}
                  >
                    {formatActionLabel(action)}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
          {showAmountBox ? (
            <div className="grid gap-2">
              <div className={`grid gap-2 ${primaryActionGridClass}`}>
                {primaryActions.map((action) => (
                  <Button
                    key={action}
                    className="w-full"
                    variant="ghost"
                    onClick={() => onSubmitAction(action)}
                    disabled={!hasToken || !isMyTurn || hasSeatConflict}
                  >
                    {formatActionLabel(action)}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
      {hasAnyActions && legalForSeat ? (
        <p className="mt-3 text-sm text-[var(--color-muted)]">{t('detail.legalActions', { actions: legalForSeat.join(', ') })}</p>
      ) : null}
    </ControlSection>
  )
}

type AdminDebugSectionProps = {
  boardText: string
  onBoardTextChange: (value: string) => void
  holeText: string
  onHoleTextChange: (value: string) => void
  onLoadDemoSeats: () => void
  onSetCards: () => void
  disabled: boolean
}

export const AdminDebugSection = ({
  boardText,
  onBoardTextChange,
  holeText,
  onHoleTextChange,
  onLoadDemoSeats,
  onSetCards,
  disabled,
}: AdminDebugSectionProps) => {
  const { t } = useI18n()

  return (
    <details className="rounded-[16px] border border-[var(--color-border)] px-3 py-2.5 text-[var(--color-foreground)] opacity-80 transition-opacity open:opacity-100">
      <summary className="cursor-pointer text-sm font-semibold marker:text-[var(--color-muted)]">{t('detail.adminDebug')}</summary>
      <div className="mt-3 flex flex-wrap gap-3">
        <Button variant="ghost" size="sm" onClick={onLoadDemoSeats}>
          {t('detail.loadDemoSeats')}
        </Button>
      </div>
      <div className="mb-3 mt-3 grid gap-2.5">
        <Label>{t('detail.boardCards')}</Label>
        <Input
          placeholder={t('detail.boardCardsPlaceholder')}
          value={boardText}
          onChange={(e) => onBoardTextChange(e.target.value)}
        />
        <Label>{t('detail.holeCardsSeatInput')}</Label>
        <Input
          placeholder={t('detail.holeCardsPlaceholder')}
          value={holeText}
          onChange={(e) => onHoleTextChange(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="ghost" size="sm" onClick={onSetCards} disabled={disabled}>{t('detail.setCards')}</Button>
      </div>
      <p className="mt-3 text-sm text-[var(--color-muted)]">{t('detail.manualCardInjection')}</p>
    </details>
  )
}

const formatActionLabel = (action: string) => {
  if (action === 'all-in') return 'All-in'
  return action.charAt(0).toUpperCase() + action.slice(1)
}
