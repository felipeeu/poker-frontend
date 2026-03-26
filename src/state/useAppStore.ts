import { create } from 'zustand'
import type { Locale } from '../i18n'
import type { ApiEvent, Table, WsStatus } from '../types'

const DEFAULT_API = 'http://localhost:8080'

type AppStore = {
  apiBase: string
  token: string
  userId: string
  role: string
  locale: Locale
  tables: Table[]
  selectedTable: Table | null
  events: ApiEvent[]
  status: string
  wsStatus: WsStatus
  setApiBase: (value: string) => void
  setStatus: (value: string) => void
  setAuth: (token: string, userId: string, role?: string) => void
  setLocale: (locale: Locale) => void
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
  apiBase: readLocal('poker_api_base') || DEFAULT_API,
  token: readLocal('poker_token'),
  userId: readLocal('poker_user_id'),
  role: readLocal('poker_role'),
  locale: (readLocal('poker_locale') as Locale) || 'en',
  tables: [],
  selectedTable: null,
  events: [],
  status: '',
  wsStatus: 'disconnected',
  setApiBase: (value) => {
    try {
      localStorage.setItem('poker_api_base', value)
    } catch {
      // ignore storage errors
    }
    set({ apiBase: value })
  },
  setStatus: (value) => set({ status: value }),
  setAuth: (token, userId, role = '') => {
    try {
      localStorage.setItem('poker_token', token)
      localStorage.setItem('poker_user_id', userId)
      localStorage.setItem('poker_role', role)
    } catch {
      // ignore storage errors
    }
    set({ token, userId, role })
  },
  setLocale: (locale) => {
    try {
      localStorage.setItem('poker_locale', locale)
    } catch {
      // ignore storage errors
    }
    set({ locale })
  },
  clearAuth: () => {
    try {
      localStorage.removeItem('poker_token')
      localStorage.removeItem('poker_user_id')
      localStorage.removeItem('poker_role')
    } catch {
      // ignore storage errors
    }
    set({ token: '', userId: '', role: '', selectedTable: null })
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
