import { useI18n } from '../../i18n'
import { Badge } from '../../components/ui/badge'
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
  const phaseTone = handStatus === 'showdown' || isHandFinished ? 'success' : actorSeatNo != null ? 'accent' : 'neutral'

  return (
    <>
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge variant="accent">{t('detail.status', { status: tableStatus || t('tables.unknown') })}</Badge>
        <Badge variant={phaseTone}>{t('detail.street', { street })}</Badge>
        <Badge variant={actorSeatNo != null ? 'warning' : 'neutral'}>
          {actorSeatNo != null ? t('detail.actorSeatValue', { seat: actorSeatNo }) : t('detail.hand', { status: handStatus })}
        </Badge>
        <Badge>{t('detail.pot', { pot: typeof pot === 'number' ? pot : 0 })}</Badge>
        <Badge>{t('detail.activePlayersValue', { count: activeSeatCount })}</Badge>
        <Badge>{t('detail.seats')} {seatCount}</Badge>
        {isHandFinished ? <Badge variant="success">{t('detail.gameFinished')}</Badge> : null}
      </div>
      <p className="m-0 text-sm text-[var(--color-muted)]">{nextStepMessage}</p>
    </>
  )
}
