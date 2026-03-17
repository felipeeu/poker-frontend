import { useAppStore } from '../state/useAppStore'

export const EventsPanel = () => {
  const events = useAppStore((state) => state.events)

  return (
    <section className="panel panel--detail">
      <h2>Live Events</h2>
      <div className="events">
        {events.length === 0 && <p className="muted">No events yet.</p>}
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
