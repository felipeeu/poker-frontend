import { useAppStore } from '../state/useAppStore'
import { useI18n } from '../i18n'

export const ApiHeader = () => {
  const apiBase = useAppStore((state) => state.apiBase)
  const locale = useAppStore((state) => state.locale)
  const wsStatus = useAppStore((state) => state.wsStatus)
  const setApiBase = useAppStore((state) => state.setApiBase)
  const setLocale = useAppStore((state) => state.setLocale)
  const { t } = useI18n()

  return (
    <header className="app__header">
      <div>
        <p className="eyebrow">{t('header.eyebrow')}</p>
        <h1>{t('header.title')}</h1>
        <p className="subhead">{t('header.subhead')}</p>
      </div>
      <div className="api-input">
        <label>{t('header.apiBase')}</label>
        <input value={apiBase} onChange={(e) => setApiBase(e.target.value)} />
        <label>{t('lang.label')}</label>
        <select value={locale} onChange={(e) => setLocale(e.target.value as 'en' | 'pt-BR')}>
          <option value="en">{t('lang.en')}</option>
          <option value="pt-BR">{t('lang.pt-BR')}</option>
        </select>
        <span className={`ws-badge ws-badge--${wsStatus}`}>{wsStatus}</span>
      </div>
    </header>
  )
}
