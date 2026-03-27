import { useI18n } from '../../i18n'
import { Badge } from '../../shared/ui/badge'
import { InfoCard } from '../../shared/ui/info-card'

type TableSummaryProps = {
  nextStepMessage: string
  activeSeatCount: number
  tableStatus?: string
  handStatus: string
  street: string
  pot?: number
  isHandFinished: boolean
  tableId: string
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
  tableId,
  actorSeatNo,
  seatCount,
}: TableSummaryProps) => {
  const { t } = useI18n()

  return (
    <>
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
        <Badge variant="accent">{t('detail.status', { status: tableStatus || t('tables.unknown') })}</Badge>
        <Badge>{t('detail.hand', { status: handStatus })}</Badge>
        <Badge>{t('detail.street', { street })}</Badge>
        <Badge>{t('detail.pot', { pot: typeof pot === 'number' ? pot : 0 })}</Badge>
        {isHandFinished ? <Badge variant="success">{t('detail.gameFinished')}</Badge> : null}
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2 max-[1024px]:grid-cols-1">
        <InfoCard label={t('detail.id')} value={tableId} />
        <InfoCard label={t('detail.handLabel')} value={handStatus} />
        <InfoCard label={t('detail.streetLabel')} value={street} />
        <InfoCard label={t('detail.actorSeat')} value={actorSeatNo ?? '-'} />
        <InfoCard label={t('detail.seats')} value={seatCount} />
      </div>
    </>
  )
}
