export type Seat = {
  'seat-no'?: number
  seat_no?: number
  name?: string | null
  user_id?: string | null
  'user-id'?: string | null
  stack?: number
  sitting_out?: boolean
  'sitting-out?'?: boolean
  'showdown-rank'?: string | null
  showdown_rank?: string | null
}

export type Table = {
  id: string
  name?: string
  status?: string
  club_id?: string
  'club-id'?: string
  max_seats?: number
  'max-seats'?: number
  seats?: Seat[]
  current_hand?: unknown
  'current-hand'?: unknown
}

export type ClubMember = {
  user_id?: string
  'user-id'?: string
  role?: string
  joined_at?: number
  'joined-at'?: number
}

export type ClubHistoryEvent = {
  type: string
  at?: number
  user_id?: string
  'user-id'?: string
  table_id?: string
  'table-id'?: string
  table_name?: string
  'table-name'?: string
  hand_id?: string
  'hand-id'?: string
}

export type Club = {
  id: string
  name?: string
  private?: boolean
  'private?'?: boolean
  invite_code?: string
  'invite-code'?: string
  owner_user_id?: string
  'owner-user-id'?: string
  members?: ClubMember[]
  history?: ClubHistoryEvent[]
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
