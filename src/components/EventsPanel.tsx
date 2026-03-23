import { useAppStore } from '../state/useAppStore'
import { useI18n } from '../i18n'

export const EventsPanel = () => {
  const events = useAppStore((state) => state.events)
  const { t } = useI18n()

  return (
    <section className="panel panel--detail">
      <h2>{t('events.liveTitle')}</h2>
      <div className="events">
        {events.length === 0 && <p className="muted">{t('events.none')}</p>}
        {events.map((event, idx) => (
          <div key={idx} className="event">
            <span className="pill pill--ghost">{event.type}</span>
            <pre>{JSON.stringify(event.table ?? event.payload ?? event, null, 2)}</pre>
          </div>
        ))}
      </div>
    </section>
  )
}
