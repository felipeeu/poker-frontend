import { useAppStore } from '../state/useAppStore'
import { useI18n } from '../i18n'
import { Badge } from '../shared/ui/badge'
import { Panel } from '../shared/ui/panel'

export const EventsPanel = () => {
  const events = useAppStore((state) => state.events)
  const { t } = useI18n()

  return (
    <Panel className="min-h-[420px]">
      <h2 className="m-0 text-2xl font-semibold">{t('events.liveTitle')}</h2>
      <div className="mt-5 grid gap-3">
        {events.length === 0 && <p className="text-sm text-[var(--color-muted)]">{t('events.none')}</p>}
        {events.map((event, idx) => (
          <div key={idx} className="rounded-2xl border border-white/8 bg-black/15 p-4">
            <Badge>{event.type}</Badge>
            <pre className="mt-3 overflow-x-auto text-xs leading-6 text-[var(--color-muted)]">
              {JSON.stringify(event.table ?? event.payload ?? event, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </Panel>
  )
}
