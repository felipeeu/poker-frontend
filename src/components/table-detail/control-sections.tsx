import { useI18n } from '../../i18n'
import { Button } from '../../shared/ui/button'
import { ControlSection } from '../../shared/ui/control-section'
import { Input } from '../../shared/ui/input'

type AdminTableControlsSectionProps = {
  openTableDisabled: boolean
  openTableDisabledReason: string
  onOpenTable: () => void
  onCloseTable: () => void
  closeTableDisabled: boolean
}

export const AdminTableControlsSection = ({
  openTableDisabled,
  openTableDisabledReason,
  onOpenTable,
  onCloseTable,
  closeTableDisabled,
}: AdminTableControlsSectionProps) => {
  const { t } = useI18n()

  return (
    <ControlSection title={t('detail.tableControls')} className="mt-4">
      <div className="flex flex-wrap gap-3">
        <Button
          size="sm"
          onClick={onOpenTable}
          disabled={openTableDisabled}
          title={openTableDisabledReason}
        >
          {t('detail.openTable')}
        </Button>
        <Button variant="ghost" size="sm" onClick={onCloseTable} disabled={closeTableDisabled}>
          {t('detail.closeTable')}
        </Button>
      </div>
      {openTableDisabled ? (
        <p className="mt-2.5 text-sm text-[var(--color-muted)]">{openTableDisabledReason}</p>
      ) : null}
    </ControlSection>
  )
}

type AdminHandControlsSectionProps = {
  dealerSeat: number
  onDealerSeatChange: (value: number) => void
  onStartHand: () => void
  onResolve: () => void
  onTimeout: () => void
  onNextHand: () => void
  disabled: boolean
}

export const AdminHandControlsSection = ({
  dealerSeat,
  onDealerSeatChange,
  onStartHand,
  onResolve,
  onTimeout,
  onNextHand,
  disabled,
}: AdminHandControlsSectionProps) => {
  const { t } = useI18n()

  return (
    <ControlSection title={t('detail.handControls')} className="mt-4">
      <div className="mb-3 grid grid-cols-1 gap-1.5">
        <label className="text-sm font-medium text-[var(--color-foreground)]">{t('detail.dealerSeat')}</label>
        <Input
          type="number"
          min={1}
          value={dealerSeat}
          onChange={(e) => onDealerSeatChange(Number(e.target.value))}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button size="sm" onClick={onStartHand} disabled={disabled}>{t('detail.startHand')}</Button>
        <Button variant="ghost" size="sm" onClick={onResolve} disabled={disabled}>{t('detail.resolveShowdown')}</Button>
        <Button variant="ghost" size="sm" onClick={onTimeout} disabled={disabled}>{t('detail.timeout')}</Button>
        <Button variant="ghost" size="sm" onClick={onNextHand} disabled={disabled}>{t('detail.nextHand')}</Button>
      </div>
    </ControlSection>
  )
}

type PlayerControlsSectionProps = {
  seatNo: number
  onSeatNoChange: (value: number) => void
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
  onBuyIn: () => void
  onLeaveSeat: () => void
  onRemovePlayer: () => void
  canRemovePlayer: boolean
  onSitOut: () => void
  onSitIn: () => void
  hasToken: boolean
  isAdmin: boolean
}

export const PlayerControlsSection = ({
  seatNo,
  onSeatNoChange,
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
  onBuyIn,
  onLeaveSeat,
  onRemovePlayer,
  canRemovePlayer,
  onSitOut,
  onSitIn,
  hasToken,
  isAdmin,
}: PlayerControlsSectionProps) => {
  const { t } = useI18n()

  return (
    <ControlSection title={t('detail.seatActions')} className="mt-4">
      <div className="mb-3 grid grid-cols-1 gap-1.5">
        <label className="text-sm font-medium text-[var(--color-foreground)]">{t('detail.seatNo')}</label>
        <Input
          type="number"
          min={1}
          value={seatNo}
          onChange={(e) => onSeatNoChange(Number(e.target.value))}
        />
        {!hasOwnedSeat ? (
          <>
            <label className="text-sm font-medium text-[var(--color-foreground)]">{t('detail.playerName')}</label>
            <Input
              type="text"
              value={seatName}
              onChange={(e) => onSeatNameChange(e.target.value)}
              placeholder={t('detail.playerNamePlaceholder')}
            />
          </>
        ) : null}
        <label className="text-sm font-medium text-[var(--color-foreground)]">{t('detail.stack')}</label>
        <Input
          type="number"
          min={0}
          value={seatStack}
          onChange={(e) => onSeatStackChange(Number(e.target.value))}
        />
        <label className="text-sm font-medium text-[var(--color-foreground)]">{t('detail.buyIn')}</label>
        <Input
          type="number"
          min={0}
          value={buyInAmount}
          onChange={(e) => onBuyInAmountChange(Number(e.target.value))}
        />
      </div>
      <div className="flex flex-wrap gap-3 [&>button]:min-w-[calc(50%-6px)]">
        <Button
          size="sm"
          onClick={onJoinSeat}
          disabled={joinSeatDisabled}
          title={joinSeatDisabledReason}
        >
          {t('detail.joinSeat')}
        </Button>
        <Button variant="ghost" size="sm" onClick={onBuyIn} disabled={!hasToken}>{t('detail.buyInAction')}</Button>
        <Button variant="ghost" size="sm" onClick={onLeaveSeat} disabled={!hasToken}>{t('detail.leaveSeat')}</Button>
        {isAdmin ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemovePlayer}
            disabled={!canRemovePlayer}
            title={canRemovePlayer ? t('detail.removePlayerTitle') : t('detail.selectedSeatEmpty')}
          >
            {t('detail.removePlayer')}
          </Button>
        ) : null}
        <Button variant="ghost" size="sm" onClick={onSitOut} disabled={!hasToken}>{t('detail.sitOut')}</Button>
        <Button variant="ghost" size="sm" onClick={onSitIn} disabled={!hasToken}>{t('detail.sitIn')}</Button>
      </div>
      {joinSeatDisabled ? (
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

  return (
    <ControlSection title={t('detail.yourTurn')} className="mt-4">
      {hasSeatConflict ? (
        <p className="mt-2.5 text-[var(--color-danger)]">{t('detail.seatConflict')}</p>
      ) : null}
      {!mySeatNo && !hasSeatConflict ? (
        <p className="text-sm text-[var(--color-muted)]">{t('detail.joinToPlay')}</p>
      ) : null}
      {mySeatNo && !isMyTurn ? (
        <p className="text-sm text-[var(--color-muted)]">{t('detail.waitingForSeat', { seat: actorSeatNo ?? '-' })}</p>
      ) : null}
      <div className="mb-3 grid grid-cols-1 gap-1.5">
        <label className="text-sm font-medium text-[var(--color-foreground)]">{t('detail.yourSeat')}</label>
        <Input type="text" value={mySeatNo ?? '—'} disabled />
        <label className="text-sm font-medium text-[var(--color-foreground)]">{t('detail.amount')}</label>
        <Input
          type="number"
          min={0}
          value={actionAmount}
          onChange={(e) => onActionAmountChange(Number(e.target.value))}
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
              onClick={() => onSubmitAction(action)}
              disabled={!hasToken || !isMyTurn || hasSeatConflict}
            >
              {action === 'all-in' ? 'All-in' : action.charAt(0).toUpperCase() + action.slice(1)}
            </Button>
          ))
        ) : (
          <span className="text-sm text-[var(--color-muted)]">{t('detail.noLegalActions')}</span>
        )}
      </div>
      <p className="mt-2.5 text-sm text-[var(--color-muted)]">{actionMessage}</p>
      {legalForSeat ? (
        <p className="text-sm text-[var(--color-muted)]">{t('detail.legalActions', { actions: legalForSeat.join(', ') })}</p>
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
    <details className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[rgba(15,23,42,0.5)] p-3.5">
      <summary className="mb-3 cursor-pointer font-semibold marker:text-[var(--color-muted)]">{t('detail.adminDebug')}</summary>
      <div className="flex flex-wrap gap-3">
        <Button variant="ghost" size="sm" onClick={onLoadDemoSeats}>
          {t('detail.loadDemoSeats')}
        </Button>
      </div>
      <div className="mb-3 grid grid-cols-1 gap-1.5">
        <label className="text-sm font-medium text-[var(--color-foreground)]">{t('detail.boardCards')}</label>
        <Input
          placeholder={t('detail.boardCardsPlaceholder')}
          value={boardText}
          onChange={(e) => onBoardTextChange(e.target.value)}
        />
        <label className="text-sm font-medium text-[var(--color-foreground)]">{t('detail.holeCardsSeatInput')}</label>
        <Input
          placeholder={t('detail.holeCardsPlaceholder')}
          value={holeText}
          onChange={(e) => onHoleTextChange(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="ghost" size="sm" onClick={onSetCards} disabled={disabled}>{t('detail.setCards')}</Button>
      </div>
      <p className="text-sm text-[var(--color-muted)]">{t('detail.manualCardInjection')}</p>
    </details>
  )
}
