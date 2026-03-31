import { useAppStore } from '@/state/useAppStore'
import { useI18n } from '@/i18n'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'

export const EventsPanel = () => {
  const events = useAppStore((state) => state.events)
  const { t } = useI18n()

  return (
    <Card className="min-h-[420px]">
      <CardContent className="p-3.5 sm:p-5">
        <h2 className="m-0 text-[1.38rem] font-semibold sm:text-2xl">{t('events.liveTitle')}</h2>
        <div className="mt-3.5 grid gap-2.5 sm:mt-4 sm:gap-3">
          {events.length === 0 && <Alert tone="muted">{t('events.none')}</Alert>}
          {events.map((event, idx) => (
            <div key={idx} className="rounded-[16px] border border-[var(--color-border)] p-3 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <Badge>{event.type}</Badge>
                <span className="text-xs text-[var(--color-muted)]">#{idx + 1}</span>
              </div>
              <pre className="mt-3 overflow-x-auto text-xs leading-5 text-[var(--color-muted)]">
                {JSON.stringify(event.table ?? event.payload ?? event, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
