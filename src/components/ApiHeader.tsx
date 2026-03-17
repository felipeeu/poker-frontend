import { useAppStore } from '../state/useAppStore'

export const ApiHeader = () => {
  const apiBase = useAppStore((state) => state.apiBase)
  const wsStatus = useAppStore((state) => state.wsStatus)
  const setApiBase = useAppStore((state) => state.setApiBase)

  return (
    <header className="app__header">
      <div>
        <p className="eyebrow">Poker Backend</p>
        <h1>Live Table Console</h1>
        <p className="subhead">Login, browse tables, and watch live updates from the backend.</p>
      </div>
      <div className="api-input">
        <label>API Base</label>
        <input value={apiBase} onChange={(e) => setApiBase(e.target.value)} />
        <span className={`ws-badge ws-badge--${wsStatus}`}>{wsStatus}</span>
      </div>
    </header>
  )
}
