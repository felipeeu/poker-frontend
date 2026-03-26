import { useAppStore } from '../state/useAppStore'
import { useI18n } from '../i18n'

export const ApiHeader = () => {
  const apiBase = useAppStore((state) => state.apiBase)
  const wsStatus = useAppStore((state) => state.wsStatus)
  const { t } = useI18n()
  const wsStatusLabel = t(`ws.${wsStatus}`)
  const apiHost = (() => {
    try {
      return new URL(apiBase).host
    } catch {
      return apiBase
    }
  })()

  return (
    <header className="app__header">
      <div className="app__brand">
        <div className="app__logo" aria-hidden="true">
          <span>♠</span>
        </div>
        <div className="app__headline">
          <p className="eyebrow">{t('header.eyebrow')}</p>
          <h1>{t('header.title')}</h1>
          <p className="subhead">{t('header.subhead')}</p>
          <div className="app__meta">
            <span className="header-chip header-chip--accent">{t('header.lobby')}</span>
            <span className={`header-chip header-chip--${wsStatus}`}>{wsStatusLabel}</span>
            <span className="header-chip header-chip--ghost">{apiHost}</span>
          </div>
        </div>
      </div>
      <span className={`ws-badge ws-badge--${wsStatus}`}>{wsStatusLabel}</span>
    </header>
  )
}
