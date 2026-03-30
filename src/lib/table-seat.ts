export const resolveEffectiveSeatNo = ({
  mySeatNo,
  seatNo,
  firstOpenSeatNo,
}: {
  mySeatNo?: number
  seatNo: number
  firstOpenSeatNo?: number
}) => {
  const hasManualSeatNo = Number.isFinite(seatNo) && seatNo > 0
  return mySeatNo ?? (hasManualSeatNo ? seatNo : firstOpenSeatNo ?? 1)
}

export const syncedSeatNo = ({
  mySeatNo,
  seatNo,
  firstOpenSeatNo,
}: {
  mySeatNo?: number
  seatNo: number
  firstOpenSeatNo?: number
}) => {
  if (mySeatNo != null) return seatNo === mySeatNo ? null : mySeatNo
  if (!(Number.isFinite(seatNo) && seatNo > 0) && firstOpenSeatNo != null && seatNo !== firstOpenSeatNo) {
    return firstOpenSeatNo
  }
  return null
}

export const isSeatInCurrentHand = (
  mySeatNo: number | undefined,
  handSeats: Array<Record<string, unknown>> = [],
) =>
  Boolean(
    mySeatNo != null &&
      handSeats.some(
        (seat) =>
          (((seat['seat-no'] as number | undefined) ?? (seat.seat_no as number | undefined)) === mySeatNo) &&
          Boolean(seat['in-hand?']),
      ),
  )
