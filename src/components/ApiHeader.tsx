import { useAppStore } from '../state/useAppStore'
import { useI18n } from '../i18n'

export const ApiHeader = () => {
  const apiBase = useAppStore((state) => state.apiBase)
  const locale = useAppStore((state) => state.locale)
  const wsStatus = useAppStore((state) => state.wsStatus)
  const setApiBase = useAppStore((state) => state.setApiBase)
  const setLocale = useAppStore((state) => state.setLocale)
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
      <div className="api-input control-deck">
        <div className="control-deck__head">
          <span className="eyebrow">{t('header.controlDesk')}</span>
          <span className={`ws-badge ws-badge--${wsStatus}`}>{wsStatusLabel}</span>
        </div>
        <label>{t('header.apiBase')}</label>
        <input value={apiBase} onChange={(e) => setApiBase(e.target.value)} />
        <label>{t('lang.label')}</label>
        <select value={locale} onChange={(e) => setLocale(e.target.value as 'en' | 'pt-BR')}>
          <option value="en">{t('lang.en')}</option>
          <option value="pt-BR">{t('lang.pt-BR')}</option>
        </select>
      </div>
    </header>
  )
}
