import { useMemo } from 'react'
import { createApiClient } from './client'
import { useAppStore } from '../state/useAppStore'

export const useApi = () => {
  const apiBase = useAppStore((state) => state.apiBase)
  const token = useAppStore((state) => state.token)
  return useMemo(() => createApiClient(apiBase, token), [apiBase, token])
}
