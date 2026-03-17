import { create } from 'zustand'
import type { ApiEvent, Table, WsStatus } from '../types'

const DEFAULT_API = 'http://localhost:8080'

type AppStore = {
  apiBase: string
  token: string
  userId: string
  tables: Table[]
  selectedTable: Table | null
  events: ApiEvent[]
  status: string
  wsStatus: WsStatus
  setApiBase: (value: string) => void
  setStatus: (value: string) => void
  setAuth: (token: string, userId: string) => void
  clearAuth: () => void
  setTables: (tables: Table[]) => void
  updateTable: (table: Table) => void
  setSelectedTable: (table: Table | null) => void
  mergeSelectedTable: (updater: (prev: Table | null) => Table | null) => void
  appendEvent: (event: ApiEvent) => void
  setWsStatus: (status: WsStatus) => void
}

const readLocal = (key: string) => {
  try {
    return localStorage.getItem(key) || ''
  } catch {
    return ''
  }
}

export const useAppStore = create<AppStore>((set) => ({
  apiBase: DEFAULT_API,
  token: readLocal('poker_token'),
  userId: readLocal('poker_user_id'),
  tables: [],
  selectedTable: null,
  events: [],
  status: '',
  wsStatus: 'disconnected',
  setApiBase: (value) => set({ apiBase: value }),
  setStatus: (value) => set({ status: value }),
  setAuth: (token, userId) => {
    try {
      localStorage.setItem('poker_token', token)
      localStorage.setItem('poker_user_id', userId)
    } catch {
      // ignore storage errors
    }
    set({ token, userId })
  },
  clearAuth: () => {
    try {
      localStorage.removeItem('poker_token')
      localStorage.removeItem('poker_user_id')
    } catch {
      // ignore storage errors
    }
    set({ token: '', userId: '', selectedTable: null })
  },
  setTables: (tables) => set({ tables }),
  updateTable: (table) =>
    set((state) => {
      const idx = state.tables.findIndex((t) => t.id === table.id)
      if (idx === -1) return { tables: [table, ...state.tables] }
      const next = [...state.tables]
      next[idx] = { ...next[idx], ...table }
      return { tables: next }
    }),
  setSelectedTable: (table) => set({ selectedTable: table }),
  mergeSelectedTable: (updater) =>
    set((state) => ({ selectedTable: updater(state.selectedTable) })),
  appendEvent: (event) =>
    set((state) => ({ events: [event, ...state.events].slice(0, 20) })),
  setWsStatus: (status) => set({ wsStatus: status }),
}))
