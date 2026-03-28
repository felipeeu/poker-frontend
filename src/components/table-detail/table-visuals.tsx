import { useMemo } from 'react'
import { useI18n } from '../../i18n'
import { useAppStore } from '../../state/useAppStore'
import type { Seat } from '../../types'
import { Badge } from '../../components/ui/badge'
import { cn } from '../../lib/cn'
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
    <div className="z-[2] w-full py-[132px] pb-[118px] max-[1024px]:w-[min(100%,360px)] max-[1024px]:p-0 max-[520px]:w-[min(100%,296px)]">
      <div className="mx-auto grid w-[min(100%,560px)] gap-4 rounded-2xl border border-[rgba(242,229,187,0.08)] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),rgba(7,18,12,0.5))] p-4 backdrop-blur-[4px] max-[1024px]:w-full max-[1024px]:p-3 max-[520px]:gap-3 max-[520px]:rounded-[14px] max-[520px]:p-2.5">
        <div className="grid gap-2.5">
          <div className="flex items-center justify-between">
            <h3 className="m-0 text-base">{t('detail.board')}</h3>
            <span className="text-[0.85rem] text-[var(--color-muted)]">{board?.length || 0} / 5</span>
          </div>
          <div className="flex flex-wrap gap-3 max-[1024px]:justify-center max-[1024px]:gap-2 max-[520px]:gap-2">
            {(board && board.length > 0 ? board : Array.from({ length: 5 }).map(() => undefined)).map((card, idx) => (
              <Card key={`board-${idx}`} value={card} faceDown={!card} />
            ))}
          </div>
          <div className="grid gap-2">
            <div className="flex justify-between gap-3 border-b border-dashed border-[var(--color-border)] py-1.5">
              <span>{t('detail.potLabel')}</span>
              <strong>{typeof pot === 'number' ? pot : 0}</strong>
            </div>
            {sidePots && sidePots.length > 0 && (
              <div className="flex justify-between gap-3 border-b border-dashed border-[var(--color-border)] py-1.5 max-[1024px]:items-start">
                <span>{t('detail.sidePots')}</span>
                <div className="flex flex-wrap gap-2">
                  {sidePots.map((side, idx) => (
                    <div
                      key={`side-pot-${idx}`}
                      className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-xs text-[var(--color-foreground)]"
                    >
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

        <div className="grid gap-2.5">
          <div className="flex items-center justify-between">
            <h3 className="m-0 text-base">{mySeatNo != null ? t('detail.holeCardsSeat', { seat: mySeatNo }) : t('detail.holeCards')}</h3>
            <span className="text-[0.85rem] text-[var(--color-muted)]">{seatHoleCards?.length || 0} / 2</span>
          </div>
          <div className="flex flex-wrap gap-3 max-[1024px]:justify-center max-[1024px]:gap-2 max-[520px]:gap-2">
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
}

export const DesktopSeatLayout = ({
  seats,
  actorSeatNo,
  dealerSeat,
  smallBlindSeat,
  bigBlindSeat,
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
              transform: `translate(-50%, -50%) scale(${desktopSeatScale(position.y)})`,
              transformOrigin: 'center',
            }}
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

export const MobileSeatLayout = ({
  seats,
  actorSeatNo,
  dealerSeat,
  smallBlindSeat,
  bigBlindSeat,
}: SeatLayoutProps) => {
  const { topSeats, bottomSeats } = useMemo(() => splitSeatsForMobile(seats), [seats])
  const { t } = useI18n()

  return (
    <div className="z-[3] hidden w-full gap-3 max-[1024px]:grid">
      <div className="order-[-1] flex flex-wrap justify-center gap-2">
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
          <p className="text-[0.85rem] text-[var(--color-muted)]">{t('detail.noSeatsYet')}</p>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
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

type SeatChipProps = {
  seat: Seat
  actorSeatNo?: number
  dealerSeat?: number
  smallBlindSeat?: number
  bigBlindSeat?: number
}

const SeatChip = ({
  seat,
  actorSeatNo,
  dealerSeat,
  smallBlindSeat,
  bigBlindSeat,
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

  return (
    <div
      className={cn(
        'seat-chip grid min-w-[92px] max-w-[120px] gap-[5px] rounded-[18px] border border-[rgba(242,229,187,0.1)] bg-[linear-gradient(180deg,rgba(24,47,31,0.82),rgba(8,18,13,0.88)),rgba(11,24,17,0.82)] px-[9px] py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_12px_22px_rgba(0,0,0,0.18)] backdrop-blur-[6px] max-[1024px]:min-w-[82px] max-[1024px]:max-w-[100px] max-[1024px]:gap-1 max-[1024px]:rounded-[15px] max-[1024px]:px-[7px] max-[1024px]:pb-[7px] max-[1024px]:pt-1.5 max-[520px]:min-w-[70px] max-[520px]:max-w-[84px] max-[520px]:px-[5px] max-[520px]:pb-[5px] max-[520px]:pt-1',
        isActor && 'border-[var(--color-accent)] shadow-[0_0_0_1px_rgba(217,177,95,0.38),0_14px_24px_rgba(0,0,0,0.2)]',
        isMine && 'border-[rgba(88,214,141,0.56)] shadow-[0_0_0_1px_rgba(88,214,141,0.32),0_14px_24px_rgba(0,0,0,0.2)]',
        sittingOut && 'opacity-70',
      )}
    >
      <div className="flex items-start justify-between gap-1.5 text-[0.68rem] text-[var(--color-muted)] max-[1024px]:items-center max-[1024px]:gap-1 max-[1024px]:text-[0.56rem] max-[520px]:gap-[3px]">
        <span className="inline-flex min-h-[18px] items-center rounded-full bg-white/6 px-[7px] text-[0.68rem] font-bold uppercase tracking-[0.04em] max-[1024px]:min-h-4 max-[1024px]:px-1.5 max-[520px]:min-h-[15px] max-[520px]:px-[5px]">
          {t('detail.seatTag', { seat: seatNo })}
        </span>
        <div className="flex items-center gap-1 max-[1024px]:flex-wrap max-[1024px]:justify-end max-[1024px]:gap-[3px]">
          {isMine && <Badge variant="success" className="px-2 py-0.5 text-[9px] tracking-[0.14em] max-[1024px]:px-[7px] max-[1024px]:py-[2px] max-[1024px]:text-[0.58rem] max-[520px]:text-[0.54rem]">{t('detail.you')}</Badge>}
          {isActor && <Badge className="px-2 py-0.5 text-[9px] tracking-[0.14em] max-[1024px]:px-[7px] max-[1024px]:py-[2px] max-[1024px]:text-[0.58rem] max-[520px]:text-[0.54rem]">{t('detail.acting')}</Badge>}
          {isDealer && <Badge variant="accent" className="px-2 py-0.5 text-[9px] tracking-[0.14em] max-[1024px]:px-[7px] max-[1024px]:py-[2px] max-[1024px]:text-[0.58rem] max-[520px]:text-[0.54rem]">D</Badge>}
          {isSmallBlind && <Badge variant="warning" className="px-2 py-0.5 text-[9px] tracking-[0.14em] max-[1024px]:px-[7px] max-[1024px]:py-[2px] max-[1024px]:text-[0.58rem] max-[520px]:text-[0.54rem]">SB</Badge>}
          {isBigBlind && <Badge variant="warning" className="px-2 py-0.5 text-[9px] tracking-[0.14em] max-[1024px]:px-[7px] max-[1024px]:py-[2px] max-[1024px]:text-[0.58rem] max-[520px]:text-[0.54rem]">BB</Badge>}
        </div>
      </div>
      <div
        className="grid grid-cols-[28px_minmax(0,1fr)] items-center gap-2 max-[1024px]:grid-cols-[20px_minmax(0,1fr)] max-[1024px]:gap-[5px] max-[520px]:grid-cols-[18px_minmax(0,1fr)] max-[520px]:gap-1"
        title={`${displayName}${displayName !== user ? ` (${user})` : ''}`}
      >
        <span
          className="grid size-7 place-items-center rounded-full bg-[linear-gradient(160deg,rgba(217,177,95,0.26),rgba(74,222,128,0.18))] text-[0.72rem] font-bold tracking-[0.04em] text-[#f7e4b7] max-[1024px]:size-5 max-[1024px]:text-[0.58rem] max-[520px]:size-[18px] max-[520px]:text-[0.52rem]"
          aria-hidden="true"
        >
          {avatarLabel}
        </span>
        <div className="grid min-w-0 gap-0.5">
          <strong className="overflow-hidden text-[0.76rem] font-semibold leading-[1.2] tracking-[-0.01em] text-ellipsis whitespace-nowrap max-[1024px]:text-[0.64rem] max-[520px]:text-[0.6rem]">
            {shortName}
          </strong>
          <span className="text-[0.68rem] leading-[1.2] text-[var(--color-muted)] [font-variant-numeric:tabular-nums] max-[1024px]:text-[0.56rem] max-[520px]:text-[0.54rem]">
            {t('detail.stackShort', { value: stack })}
          </span>
        </div>
      </div>
      {(sittingOut || committed > 0) && (
        <div className="flex items-center justify-between gap-1.5 max-[1024px]:flex-col max-[1024px]:items-start max-[1024px]:gap-[3px]">
          {sittingOut && <Badge className="px-2 py-0.5 text-[9px] tracking-[0.14em] max-[1024px]:px-[7px] max-[1024px]:py-[2px] max-[1024px]:text-[0.58rem] max-[520px]:text-[0.54rem]">{t('detail.sittingOut')}</Badge>}
          {committed > 0 && (
            <span className="text-[0.68rem] leading-[1.2] text-[var(--color-muted)] [font-variant-numeric:tabular-nums] max-[1024px]:text-[0.56rem] max-[520px]:text-[0.54rem]">
              {t('detail.committedShort', { value: committed })}
            </span>
          )}
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

const desktopSeatScale = (y: number) => {
  if (y <= 20) return 0.88
  if (y >= 82) return 1
  return 0.95
}
