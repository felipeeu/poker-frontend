import { useMemo } from 'react'
import { useI18n } from '@/i18n'
import { useAppStore } from '@/state/useAppStore'
import type { Seat } from '../../types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/cn'
import { Card } from '../Card'

type TableCenterProps = {
  board?: string[]
  pot?: number
  sidePots?: Array<{ amount: number; 'eligible-seat-nos': number[] }>
  mySeatNo?: number
  seatHoleCards?: string[]
}

export const TableCenter = ({
  board,
  pot,
  sidePots,
  mySeatNo,
  seatHoleCards,
}: TableCenterProps) => {
  const { t } = useI18n()

  return (
    <div className="z-[2] w-full py-[132px] pb-[118px] max-[1024px]:w-[min(100%,340px)] max-[1024px]:p-0 max-[520px]:w-[min(100%,282px)]">
      <div className="mx-auto grid w-[min(100%,520px)] gap-3 rounded-[18px] border border-[var(--color-border)] bg-[rgba(17,22,19,0.9)] p-3.5 max-[1024px]:w-full max-[1024px]:gap-2.5 max-[1024px]:p-2.5 max-[520px]:gap-2 max-[520px]:rounded-[14px] max-[520px]:p-2">
        <div className="grid gap-2.5">
          <div className="flex items-center justify-between">
            <h3 className="m-0 text-base">{t('detail.board')}</h3>
            <span className="text-[0.85rem] text-[var(--color-muted)]">{board?.length || 0} / 5</span>
          </div>
          <div className="flex flex-wrap gap-2.5 max-[1024px]:justify-center max-[1024px]:gap-1.5 max-[520px]:gap-1">
            {(board && board.length > 0 ? board : Array.from({ length: 5 }).map(() => undefined)).map((card, idx) => (
              <Card key={`board-${idx}`} value={card} faceDown={!card} />
            ))}
          </div>
          <div className="grid gap-2">
            <div className="flex justify-between gap-3 border-b border-dashed border-[var(--color-border)] py-1.5">
              <span>{t('detail.potLabel')}</span>
              <strong>{typeof pot === 'number' ? pot : 0}</strong>
            </div>
            {sidePots && sidePots.length > 1 && (
              <div className="flex justify-between gap-3 border-b border-dashed border-[var(--color-border)] py-1.5 max-[1024px]:items-start">
                <span>{t('detail.sidePots')}</span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {sidePots.map((side, idx) => (
                    <div
                      key={`side-pot-${idx}`}
                      className="grid gap-0.5 rounded-[14px] border border-[var(--color-border)] px-2.5 py-1.5 text-xs text-[var(--color-foreground)] sm:px-3 sm:py-2"
                    >
                      <strong className="text-[0.78rem] font-semibold">
                        {t('detail.sidePotLabel', { index: idx + 1, amount: side.amount })}
                      </strong>
                      <span className="text-[0.72rem] text-[var(--color-muted)]">
                        {t('detail.sidePotEligibleSeats', { seats: side['eligible-seat-nos'].join(', ') })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-2.5">
          <div className="flex items-center justify-between">
            <h3 className="m-0 text-base">{mySeatNo != null ? t('detail.holeCardsSeat', { seat: mySeatNo }) : t('detail.holeCards')}</h3>
            <span className="text-[0.85rem] text-[var(--color-muted)]">{seatHoleCards?.length || 0} / 2</span>
          </div>
          <div className="flex flex-wrap gap-2.5 max-[1024px]:justify-center max-[1024px]:gap-1.5 max-[520px]:gap-1">
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

type SeatLayoutProps = {
  seats: Seat[]
  actorSeatNo?: number
  dealerSeat?: number
  smallBlindSeat?: number
  bigBlindSeat?: number
  handRankBySeatNo?: Record<number, string>
}

export const DesktopSeatLayout = ({
  seats,
  actorSeatNo,
  dealerSeat,
  smallBlindSeat,
  bigBlindSeat,
  handRankBySeatNo,
}: SeatLayoutProps) => {
  const { t } = useI18n()
  const positions = seatPositions(seats.length)

  return (
    <div className="pointer-events-none absolute inset-[14px] z-[3] hidden w-auto min-[1025px]:block">
      {seats.length === 0 && <p className="text-[0.85rem] text-[var(--color-muted)]">{t('detail.noSeatsYet')}</p>}
      {seats.map((seat) => {
        const seatNo = seat['seat-no'] ?? seat.seat_no ?? 0
        const position = positions[seatNo - 1] ?? positions[0] ?? { x: 50, y: 50 }

        return (
          <div
            key={seatNo}
            className="absolute"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: `translate(-50%, -50%) translateY(${desktopSeatOffsetY(position.y)}px) scale(${desktopSeatScale(position.y)})`,
              transformOrigin: 'center',
            }}
          >
            <SeatChip
              seat={seat}
              actorSeatNo={actorSeatNo}
              dealerSeat={dealerSeat}
              smallBlindSeat={smallBlindSeat}
              bigBlindSeat={bigBlindSeat}
              handRank={handRankBySeatNo?.[seatNo]}
            />
          </div>
        )
      })}
    </div>
  )
}

export const MobileSeatLayout = ({
  seats,
  actorSeatNo,
  dealerSeat,
  smallBlindSeat,
  bigBlindSeat,
  handRankBySeatNo,
}: SeatLayoutProps) => {
  const { topSeats, bottomSeats } = useMemo(() => splitSeatsForMobile(seats), [seats])
  const { t } = useI18n()

  return (
    <div className="z-[3] hidden w-full gap-2.5 max-[1024px]:grid">
      <div className="order-[-1] flex flex-wrap justify-center gap-1.5">
        {topSeats.length > 0 ? (
          topSeats.map((seat) => (
            <SeatChip
              key={seat['seat-no'] ?? seat.seat_no}
              seat={seat}
              actorSeatNo={actorSeatNo}
              dealerSeat={dealerSeat}
              smallBlindSeat={smallBlindSeat}
              bigBlindSeat={bigBlindSeat}
              handRank={handRankBySeatNo?.[(seat['seat-no'] ?? seat.seat_no ?? 0)]}
            />
          ))
        ) : (
          <p className="text-[0.85rem] text-[var(--color-muted)]">{t('detail.noSeatsYet')}</p>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {bottomSeats.map((seat) => (
          <SeatChip
            key={seat['seat-no'] ?? seat.seat_no}
            seat={seat}
            actorSeatNo={actorSeatNo}
            dealerSeat={dealerSeat}
            smallBlindSeat={smallBlindSeat}
            bigBlindSeat={bigBlindSeat}
            handRank={handRankBySeatNo?.[(seat['seat-no'] ?? seat.seat_no ?? 0)]}
          />
        ))}
      </div>
    </div>
  )
}

type SeatChipProps = {
  seat: Seat
  actorSeatNo?: number
  dealerSeat?: number
  smallBlindSeat?: number
  bigBlindSeat?: number
  handRank?: string
}

const SeatChip = ({
  seat,
  actorSeatNo,
  dealerSeat,
  smallBlindSeat,
  bigBlindSeat,
  handRank,
}: SeatChipProps) => {
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
  const handRankLabel = translateHandRank(t, handRank)
  const handRankClass = handRankToneClass(handRank)
  const statusBadgeClass =
    'px-1.5 py-[3px] text-[8px] leading-none tracking-[0.08em] max-[1024px]:px-[5px] max-[1024px]:py-[2px] max-[1024px]:text-[0.5rem]'

  return (
    <div
      className={cn(
        'seat-chip grid min-w-[82px] max-w-[102px] gap-1 rounded-[14px] border border-[var(--color-border)] bg-[rgba(18,23,20,0.96)] px-2 py-[8px] shadow-[0_6px_14px_rgba(0,0,0,0.1)] max-[1024px]:min-w-[72px] max-[1024px]:max-w-[88px] max-[1024px]:gap-[3px] max-[1024px]:rounded-[13px] max-[1024px]:px-[5px] max-[1024px]:pb-[5px] max-[1024px]:pt-1.5 max-[520px]:min-w-[62px] max-[520px]:max-w-[74px] max-[520px]:px-1 max-[520px]:pb-1 max-[520px]:pt-[3px]',
        isActor && 'border-[var(--color-border-strong)]',
        isMine && 'border-emerald-200/24',
        sittingOut && 'opacity-70',
      )}
    >
      <div className="grid gap-1 text-[0.66rem] text-[var(--color-muted)] max-[1024px]:gap-[3px] max-[1024px]:text-[0.54rem]">
        <span className="inline-flex w-fit min-h-[17px] items-center rounded-full border border-[var(--color-border)] px-[6px] text-[0.6rem] font-medium tracking-[0.03em] max-[1024px]:min-h-[15px] max-[1024px]:px-[5px] max-[1024px]:text-[0.5rem] max-[520px]:min-h-[14px] max-[520px]:px-1">
          #{seatNo}
        </span>
        <div className="flex min-w-0 flex-wrap items-center gap-1 max-[1024px]:gap-[3px]">
          {isMine && <Badge variant="success" className={statusBadgeClass}>{t('detail.youShort')}</Badge>}
          {isActor && <Badge variant="accent" className={statusBadgeClass}>{t('detail.actingShort')}</Badge>}
          {isDealer && <Badge variant="accent" className={statusBadgeClass}>D</Badge>}
          {isSmallBlind && !isBigBlind && <Badge className={statusBadgeClass}>SB</Badge>}
          {isBigBlind && <Badge className={statusBadgeClass}>BB</Badge>}
        </div>
      </div>
      <div
        className="grid grid-cols-[28px_minmax(0,1fr)] items-center gap-2 max-[1024px]:grid-cols-[18px_minmax(0,1fr)] max-[1024px]:gap-1 max-[520px]:grid-cols-[16px_minmax(0,1fr)]"
        title={`${displayName}${displayName !== user ? ` (${user})` : ''}`}
      >
        <span
          className="grid size-7 place-items-center rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.03)] text-[0.72rem] font-semibold tracking-[0.04em] text-[var(--color-foreground)] max-[1024px]:size-[18px] max-[1024px]:text-[0.54rem] max-[520px]:size-4 max-[520px]:text-[0.48rem]"
          aria-hidden="true"
        >
          {avatarLabel}
        </span>
        <div className="grid min-w-0 gap-px">
          <strong className="overflow-hidden text-[0.74rem] font-semibold leading-[1.1] tracking-[-0.01em] text-ellipsis whitespace-nowrap max-[1024px]:text-[0.58rem] max-[520px]:text-[0.55rem]">
            {shortName}
          </strong>
          <span className="text-[0.62rem] leading-[1.2] text-[var(--color-muted)] [font-variant-numeric:tabular-nums] max-[1024px]:text-[0.52rem] max-[520px]:text-[0.5rem]">
            {t('detail.stackShort', { value: stack })}
          </span>
          {handRankLabel ? (
            <span className={cn('text-[0.56rem] leading-[1.15] max-[1024px]:text-[0.48rem] max-[520px]:text-[0.46rem]', handRankClass)}>
              {handRankLabel}
            </span>
          ) : null}
        </div>
      </div>
      {(sittingOut || committed > 0) && (
        <div className="flex items-center justify-between gap-1.5 max-[1024px]:flex-col max-[1024px]:items-start max-[1024px]:gap-[2px]">
          {sittingOut && <span className="text-[0.58rem] uppercase tracking-[0.08em] text-[var(--color-muted)] max-[1024px]:text-[0.48rem]">{t('detail.sittingOut')}</span>}
          {committed > 0 && (
            <span className="text-[0.62rem] leading-[1.2] text-[var(--color-muted)] [font-variant-numeric:tabular-nums] max-[1024px]:text-[0.52rem] max-[520px]:text-[0.5rem]">
              {t('detail.committedShort', { value: committed })}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

const translateHandRank = (t: (key: string, params?: Record<string, string | number>) => string, handRank?: string) => {
  switch (handRank) {
    case 'high-card':
      return t('detail.rank.highCard')
    case 'one-pair':
      return t('detail.rank.onePair')
    case 'two-pair':
      return t('detail.rank.twoPair')
    case 'three-of-a-kind':
      return t('detail.rank.threeOfAKind')
    case 'straight':
      return t('detail.rank.straight')
    case 'flush':
      return t('detail.rank.flush')
    case 'full-house':
      return t('detail.rank.fullHouse')
    case 'four-of-a-kind':
      return t('detail.rank.fourOfAKind')
    case 'straight-flush':
      return t('detail.rank.straightFlush')
    default:
      return null
  }
}

const handRankToneClass = (handRank?: string) => {
  switch (handRank) {
    case 'straight-flush':
    case 'four-of-a-kind':
      return 'font-semibold text-[#f59e0b]'
    case 'full-house':
    case 'flush':
      return 'font-semibold text-[#f7e4b7]'
    case 'straight':
    case 'three-of-a-kind':
      return 'text-[#cbd5e1]'
    case 'two-pair':
    case 'one-pair':
      return 'text-[var(--color-muted)]'
    case 'high-card':
      return 'text-[rgba(148,163,184,0.8)]'
    default:
      return 'text-[var(--color-muted)]'
  }
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

const desktopSeatScale = (y: number) => {
  if (y <= 20) return 0.88
  if (y >= 82) return 1
  return 0.95
}

const desktopSeatOffsetY = (y: number) => {
  if (y >= 82) return 12
  return 0
}
