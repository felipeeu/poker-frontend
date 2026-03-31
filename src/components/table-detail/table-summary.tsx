import { useI18n } from '@/i18n'
import { InfoCard } from './info-card'
type TableSummaryProps = {
  nextStepMessage: string
  activeSeatCount: number
  tableStatus?: string
  handStatus: string
  street: string
  pot?: number
  isHandFinished: boolean
  actorSeatNo?: number
  seatCount: number
}

export const TableSummary = ({
  nextStepMessage,
  activeSeatCount,
  tableStatus,
  handStatus,
  street,
  pot,
  isHandFinished,
  actorSeatNo,
  seatCount,
}: TableSummaryProps) => {
  const { t } = useI18n()

  return (
    <>
      <div className="mb-2.5 grid gap-2 sm:mb-3 sm:grid-cols-2 xl:grid-cols-3">
        <InfoCard label={t('detail.statusLabel')} value={tableStatus || t('tables.unknown')} />
        <InfoCard label={t('detail.streetLabel')} value={street} />
        <InfoCard
          label={t('detail.handLabel')}
          value={actorSeatNo != null ? t('detail.actorSeatValue', { seat: actorSeatNo }) : handStatus}
        />
        <InfoCard label={t('detail.potLabel')} value={typeof pot === 'number' ? pot : 0} />
        <InfoCard label={t('detail.activePlayersLabel')} value={activeSeatCount} />
        <InfoCard label={t('detail.seats')} value={seatCount} />
        {isHandFinished ? <InfoCard label={t('detail.hand')} value={t('detail.gameFinished')} /> : null}
      </div>
      <p className="m-0 text-sm leading-5 text-[var(--color-muted)] sm:leading-6">{nextStepMessage}</p>
    </>
  )
}
