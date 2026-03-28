import { useI18n } from '../../i18n'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { FieldGroup, FieldLabel } from '../../components/ui/field-group'
import { Input } from '../../components/ui/input'
import { ControlSection } from './control-section'

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
    <ControlSection
      title={t('detail.tableControls')}
      description={t('detail.tableClosedHint')}
      className="mt-4 border-white/8 bg-[rgba(12,22,17,0.62)]"
    >
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
    <ControlSection
      title={t('detail.handControls')}
      description={t('detail.handControlsAdminOnly')}
      className="mt-4 border-white/8 bg-[rgba(12,22,17,0.62)]"
    >
      <FieldGroup className="mb-3">
        <FieldLabel>{t('detail.dealerSeat')}</FieldLabel>
        <Input
          type="number"
          min={1}
          value={dealerSeat}
          onChange={(e) => onDealerSeatChange(Number(e.target.value))}
        />
      </FieldGroup>
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
    <ControlSection
      title={t('detail.seatActions')}
      description={hasOwnedSeat ? t('detail.alreadySeated') : t('detail.joinToPlay')}
      className="mt-4"
    >
      <FieldGroup className="mb-3">
        <FieldLabel>{t('detail.seatNo')}</FieldLabel>
        <Input
          type="number"
          min={1}
          value={seatNo}
          onChange={(e) => onSeatNoChange(Number(e.target.value))}
        />
        {!hasOwnedSeat ? (
          <>
            <FieldLabel>{t('detail.playerName')}</FieldLabel>
            <Input
              type="text"
              value={seatName}
              onChange={(e) => onSeatNameChange(e.target.value)}
              placeholder={t('detail.playerNamePlaceholder')}
            />
          </>
        ) : null}
        <FieldLabel>{t('detail.stack')}</FieldLabel>
        <Input
          type="number"
          min={0}
          value={seatStack}
          onChange={(e) => onSeatStackChange(Number(e.target.value))}
        />
        <FieldLabel>{t('detail.buyIn')}</FieldLabel>
        <Input
          type="number"
          min={0}
          value={buyInAmount}
          onChange={(e) => onBuyInAmountChange(Number(e.target.value))}
        />
      </FieldGroup>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          className="w-full"
          onClick={onJoinSeat}
          disabled={joinSeatDisabled}
          title={joinSeatDisabledReason}
        >
          {t('detail.joinSeat')}
        </Button>
        <Button className="w-full" variant="ghost" onClick={onBuyIn} disabled={!hasToken}>{t('detail.buyInAction')}</Button>
        <Button className="w-full" variant="ghost" onClick={onLeaveSeat} disabled={!hasToken}>{t('detail.leaveSeat')}</Button>
        {isAdmin ? (
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
        <Button className="w-full" variant="ghost" onClick={onSitOut} disabled={!hasToken}>{t('detail.sitOut')}</Button>
        <Button className="w-full" variant="ghost" onClick={onSitIn} disabled={!hasToken}>{t('detail.sitIn')}</Button>
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
  const amountActions = ['bet', 'raise', 'all-in'] as const
  const canSetAmount = (canBet || canRaise || canAllIn) && isMyTurn && !hasSeatConflict
  const primaryActions = legalForSeat?.filter((action) =>
    amountActions.includes(action as (typeof amountActions)[number]),
  ) ?? []
  const quickActions = legalForSeat?.filter((action) => !primaryActions.includes(action)) ?? []

  return (
    <ControlSection title={t('detail.yourTurn')} className="mt-4 border-[rgba(217,177,95,0.22)] bg-[linear-gradient(180deg,rgba(23,35,27,0.92),rgba(15,23,42,0.58))]">
      <div className="mb-4 rounded-2xl border border-white/8 bg-black/15 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={isMyTurn ? 'accent' : 'neutral'}>
            {isMyTurn ? t('detail.yourTurnToAct') : t('detail.waitingForActorSeat', { seat: actorSeatNo ?? '-' })}
          </Badge>
          {mySeatNo ? <Badge variant="success">{t('detail.yourSeat')}: {mySeatNo}</Badge> : null}
          {hasSeatConflict ? <Badge variant="danger">{t('detail.seatConflict')}</Badge> : null}
        </div>
        <p className="mt-3 text-sm text-[var(--color-muted)]">{actionMessage}</p>
      </div>
      {hasSeatConflict ? (
        <p className="mt-2.5 text-[var(--color-danger)]">{t('detail.seatConflict')}</p>
      ) : null}
      {!mySeatNo && !hasSeatConflict ? (
        <p className="text-sm text-[var(--color-muted)]">{t('detail.joinToPlay')}</p>
      ) : null}
      {mySeatNo && !isMyTurn ? (
        <p className="text-sm text-[var(--color-muted)]">{t('detail.waitingForSeat', { seat: actorSeatNo ?? '-' })}</p>
      ) : null}
      <div className="mb-4 grid gap-3 rounded-2xl border border-white/8 bg-white/4 p-4">
        <FieldGroup>
          <FieldLabel>{t('detail.amount')}</FieldLabel>
          <Input
            type="number"
            min={0}
            value={actionAmount}
            onChange={(e) => onActionAmountChange(Number(e.target.value))}
            disabled={!canSetAmount}
          />
        </FieldGroup>
        <p className="text-sm text-[var(--color-muted)]">
          {canSetAmount ? t('detail.chooseActionPrompt') : t('detail.noLegalActionsYet')}
        </p>
      </div>
      {legalForSeat && legalForSeat.length > 0 ? (
        <div className="grid gap-4">
          {quickActions.length > 0 ? (
            <div className="grid gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {t('detail.yourTurn')}
              </span>
              <div className="grid gap-3 sm:grid-cols-2">
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
          {primaryActions.length > 0 ? (
            <div className="grid gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {t('detail.amount')}
              </span>
              <div className="grid gap-3 sm:grid-cols-3">
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
      ) : (
        <span className="text-sm text-[var(--color-muted)]">{t('detail.noLegalActions')}</span>
      )}
      {legalForSeat ? (
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
    <details className="mt-4 rounded-2xl border border-white/8 bg-[rgba(15,23,42,0.38)] p-3.5">
      <summary className="mb-3 cursor-pointer font-semibold marker:text-[var(--color-muted)]">{t('detail.adminDebug')}</summary>
      <div className="flex flex-wrap gap-3">
        <Button variant="ghost" size="sm" onClick={onLoadDemoSeats}>
          {t('detail.loadDemoSeats')}
        </Button>
      </div>
      <FieldGroup className="mb-3">
        <FieldLabel>{t('detail.boardCards')}</FieldLabel>
        <Input
          placeholder={t('detail.boardCardsPlaceholder')}
          value={boardText}
          onChange={(e) => onBoardTextChange(e.target.value)}
        />
        <FieldLabel>{t('detail.holeCardsSeatInput')}</FieldLabel>
        <Input
          placeholder={t('detail.holeCardsPlaceholder')}
          value={holeText}
          onChange={(e) => onHoleTextChange(e.target.value)}
        />
      </FieldGroup>
      <div className="flex flex-wrap gap-3">
        <Button variant="ghost" size="sm" onClick={onSetCards} disabled={disabled}>{t('detail.setCards')}</Button>
      </div>
      <p className="text-sm text-[var(--color-muted)]">{t('detail.manualCardInjection')}</p>
    </details>
  )
}

const formatActionLabel = (action: string) => {
  if (action === 'all-in') return 'All-in'
  return action.charAt(0).toUpperCase() + action.slice(1)
}
