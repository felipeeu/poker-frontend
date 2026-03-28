import { useEffect } from 'react'
import { useI18n } from '../../i18n'
import { useAppStore, type ToastTone } from '../../state/useAppStore'
import { Button } from './button'
import { cn } from '../../lib/cn'

type ToastItemProps = {
  id: string
  message: string
  tone: ToastTone
}

const ToastItem = ({ id, message, tone }: ToastItemProps) => {
  const { t } = useI18n()
  const dismissToast = useAppStore((state) => state.dismissToast)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      dismissToast(id)
    }, 4500)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [dismissToast, id])

  return (
    <div
      className={cn(
        'pointer-events-auto w-full rounded-2xl border p-4 shadow-[var(--shadow-panel)] backdrop-blur-md',
        tone === 'success' &&
          'border-emerald-300/25 bg-[linear-gradient(135deg,rgba(52,211,153,0.18),rgba(6,78,59,0.92))]',
        tone === 'error' &&
          'border-rose-300/25 bg-[linear-gradient(135deg,rgba(251,113,133,0.18),rgba(76,5,25,0.92))]',
        tone === 'info' &&
          'border-sky-300/20 bg-[linear-gradient(135deg,rgba(96,165,250,0.18),rgba(15,23,42,0.92))]',
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <p className="m-0 flex-1 text-sm text-[var(--color-foreground)]">{message}</p>
        <Button variant="ghost" size="sm" onClick={() => dismissToast(id)}>
          {t('status.dismiss')}
        </Button>
      </div>
    </div>
  )
}

export const ToastViewport = () => {
  const toasts = useAppStore((state) => state.toasts)

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3 sm:right-6 sm:top-6">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} id={toast.id} message={toast.message} tone={toast.tone} />
      ))}
    </div>
  )
}
