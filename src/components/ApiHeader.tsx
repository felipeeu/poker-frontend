import type { Locale } from '../i18n'
import { useAppStore } from '../state/useAppStore'
import { useI18n } from '../i18n'
import { Badge } from '../shared/ui/badge'
import { Input } from '../shared/ui/input'
import { Panel } from '../shared/ui/panel'
import { Select } from '../shared/ui/select'

export const ApiHeader = () => {
  const apiBase = useAppStore((state) => state.apiBase)
  const setApiBase = useAppStore((state) => state.setApiBase)
  const setLocale = useAppStore((state) => state.setLocale)
  const wsStatus = useAppStore((state) => state.wsStatus)
  const { locale, t } = useI18n()
  const wsStatusLabel = t(`ws.${wsStatus}`)
  const apiHost = (() => {
    try {
      return new URL(apiBase).host
    } catch {
      return apiBase
    }
  })()
  const wsStatusVariant = {
    connected: 'success',
    connecting: 'warning',
    disconnected: 'danger',
  } as const

  return (
    <Panel
      as="header"
      className="mb-8 flex flex-col gap-6 border-[rgba(217,177,95,0.18)] bg-[linear-gradient(135deg,rgba(42,23,11,0.92),rgba(15,31,22,0.9)),rgba(12,21,16,0.88)] lg:flex-row lg:items-end lg:justify-between"
    >
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div
          className="grid size-[72px] shrink-0 place-items-center rounded-[22px] bg-[radial-gradient(circle_at_30%_30%,#f4d48f,#a76a22_72%)] text-[2rem] text-[#27170d] shadow-[inset_0_2px_10px_rgba(255,247,225,0.28),0_14px_28px_rgba(0,0,0,0.24)]"
          aria-hidden="true"
        >
          <span>♠</span>
        </div>
        <div className="min-w-0">
          <p className="mb-2 text-[0.72rem] uppercase tracking-[0.2em] text-[rgba(217,177,95,0.85)]">
            {t('header.eyebrow')}
          </p>
          <h1 className="m-0 text-[clamp(2.2rem,4vw,3.4rem)] leading-none">{t('header.title')}</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)] sm:text-base">{t('header.subhead')}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="accent">{t('header.lobby')}</Badge>
            <Badge variant={wsStatusVariant[wsStatus]}>{wsStatusLabel}</Badge>
            <Badge>{apiHost}</Badge>
          </div>
        </div>
      </div>
      <div className="grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[rgba(16,29,21,0.74)] p-4 sm:min-w-[320px]">
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {t('header.apiBase')}
          <Input value={apiBase} onChange={(event) => setApiBase(event.target.value)} />
        </label>
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {t('lang.label')}
          <Select value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>
            <option value="en">{t('lang.en')}</option>
            <option value="pt-BR">{t('lang.pt-BR')}</option>
          </Select>
        </label>
      </div>
    </Panel>
  )
}
