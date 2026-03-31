import { Navigate } from 'react-router-dom'
import { useAppStore } from '@/state/useAppStore'
import { AuthPanel } from '../components/AuthPanel'

export const AuthPage = () => {
  const token = useAppStore((state) => state.token)

  if (token) {
    return <Navigate to="/tables" replace />
  }

  return (
    <div className="mx-auto grid w-full max-w-[420px]">
      <AuthPanel />
    </div>
  )
}
