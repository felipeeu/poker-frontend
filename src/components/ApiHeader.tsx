import type { Locale } from '../i18n'
import { useAppStore } from '../state/useAppStore'
import { useI18n } from '../i18n'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Panel } from '../components/ui/panel'
import { Select } from '../components/ui/select'

type ApiHeaderProps = {
  compactOnTableRoute?: boolean
}

export const ApiHeader = ({ compactOnTableRoute = false }: ApiHeaderProps) => {
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
      className={[
        'mb-8 flex flex-col gap-6 border-[rgba(217,177,95,0.18)] bg-[linear-gradient(135deg,rgba(42,23,11,0.92),rgba(15,31,22,0.9)),rgba(12,21,16,0.88)] lg:flex-row lg:items-end lg:justify-between',
        compactOnTableRoute
          ? 'max-[1024px]:mb-2 max-[1024px]:gap-1.5 max-[1024px]:rounded-none max-[1024px]:border-x-0 max-[1024px]:border-t-0 max-[1024px]:bg-transparent max-[1024px]:p-0 max-[1024px]:shadow-none max-[1024px]:backdrop-blur-0'
          : '',
      ].join(' ')}
    >
      <div className="flex min-w-0 flex-1 items-start gap-4 max-[1024px]:items-center max-[1024px]:gap-2">
        <div
          className={[
            'grid size-[72px] shrink-0 place-items-center rounded-[22px] bg-[radial-gradient(circle_at_30%_30%,#f4d48f,#a76a22_72%)] text-[2rem] text-[#27170d] shadow-[inset_0_2px_10px_rgba(255,247,225,0.28),0_14px_28px_rgba(0,0,0,0.24)]',
            compactOnTableRoute ? 'max-[1024px]:size-8 max-[1024px]:rounded-[10px] max-[1024px]:text-[0.9rem] max-[1024px]:shadow-[inset_0_1px_6px_rgba(255,247,225,0.22)]' : '',
          ].join(' ')}
          aria-hidden="true"
        >
          <span>♠</span>
        </div>
        <div className="min-w-0">
          <p className={[
            'mb-2 text-[0.72rem] uppercase tracking-[0.2em] text-[rgba(217,177,95,0.85)]',
            compactOnTableRoute ? 'max-[1024px]:mb-0 max-[1024px]:text-[0.46rem] max-[1024px]:tracking-[0.12em]' : '',
          ].join(' ')}>
            {t('header.eyebrow')}
          </p>
          <h1 className={[
            'm-0 text-[clamp(2.2rem,4vw,3.4rem)] leading-none',
            compactOnTableRoute ? 'max-[1024px]:text-[0.9rem]' : '',
          ].join(' ')}>{t('header.title')}</h1>
          <p className={[
            'mt-2 max-w-2xl text-sm text-[var(--color-muted)] sm:text-base',
            compactOnTableRoute ? 'max-[1024px]:hidden' : '',
          ].join(' ')}>{t('header.subhead')}</p>
          <div className={[
            'mt-4 flex flex-wrap gap-2',
            compactOnTableRoute ? 'max-[1024px]:mt-0.5 max-[1024px]:gap-1' : '',
          ].join(' ')}>
            <Badge className={compactOnTableRoute ? 'max-[1024px]:hidden' : ''} variant="accent">{t('header.lobby')}</Badge>
            <Badge className={compactOnTableRoute ? 'max-[1024px]:px-1.5 max-[1024px]:py-0.5 max-[1024px]:text-[0.52rem]' : ''} variant={wsStatusVariant[wsStatus]}>{wsStatusLabel}</Badge>
            <Badge className={compactOnTableRoute ? 'max-[1024px]:hidden' : ''}>{apiHost}</Badge>
          </div>
        </div>
      </div>
      <div className={[
        'grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[rgba(16,29,21,0.74)] p-4 sm:min-w-[320px]',
        compactOnTableRoute ? 'max-[1024px]:hidden' : '',
      ].join(' ')}>
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
      {compactOnTableRoute ? (
        <details className="hidden rounded-lg border border-[var(--color-border)] bg-[rgba(16,29,21,0.56)] px-2.5 py-1 max-[1024px]:block">
          <summary className="cursor-pointer text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)] marker:text-[var(--color-muted)]">
            {t('lang.label')}
          </summary>
          <div className="mt-3 grid gap-3">
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
        </details>
      ) : null}
    </Panel>
  )
}
