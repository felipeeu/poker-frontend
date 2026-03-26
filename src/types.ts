export type Seat = {
  'seat-no'?: number
  seat_no?: number
  name?: string | null
  user_id?: string | null
  'user-id'?: string | null
  stack?: number
  sitting_out?: boolean
  'sitting-out?'?: boolean
}

export type Table = {
  id: string
  name?: string
  status?: string
  seats?: Seat[]
  current_hand?: unknown
  'current-hand'?: unknown
}

export type ApiEvent = {
  type: string
  table?: Table
  payload?: unknown
}

export type WsStatus = 'disconnected' | 'connecting' | 'connected'

export type CurrentHand = {
  'actor-seat'?: number
  'legal-actions'?: Record<string, string[]>
  board?: string[]
  'hole-cards'?: Record<string, string[]>
  pot?: number
  'side-pots'?: Array<{ amount: number; 'eligible-seat-nos': number[] }>
  'dealer-seat'?: number
  'small-blind-seat'?: number
  'big-blind-seat'?: number
} & Record<string, unknown>
