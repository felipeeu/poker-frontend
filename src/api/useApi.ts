import { useMemo } from 'react'
import { createApiClient } from './client'
import { useAppStore } from '../state/useAppStore'

export const useApi = () => {
  const apiBase = useAppStore((state) => state.apiBase)
  return useMemo(() => createApiClient(apiBase), [apiBase])
}
