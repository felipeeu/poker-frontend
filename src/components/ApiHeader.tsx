import type { Locale } from '../i18n'
import { useAppStore } from '../state/useAppStore'
import { useI18n } from '../i18n'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Panel } from '../components/ui/panel'

type ApiHeaderProps = {
  compactOnTableRoute?: boolean
}

export const ApiHeader = ({ compactOnTableRoute = false }: ApiHeaderProps) => {
  const setLocale = useAppStore((state) => state.setLocale)
  const wsStatus = useAppStore((state) => state.wsStatus)
  const { locale, t } = useI18n()
  const wsStatusLabel = t(`ws.${wsStatus}`)
  const wsStatusVariant = {
    connected: 'success',
    connecting: 'warning',
    disconnected: 'danger',
  } as const
  const localeOptions: Array<{ value: Locale; flag: string; label: string }> = [
    { value: 'en', flag: '🇺🇸', label: t('lang.en') },
    { value: 'pt-BR', flag: '🇧🇷', label: t('lang.pt-BR') },
  ]

  return (
    <Panel
      as="header"
      className={[
        'mb-6 flex flex-col gap-5 bg-[var(--color-panel)] lg:flex-row lg:items-start lg:justify-between',
        compactOnTableRoute
          ? 'max-[1024px]:mb-2 max-[1024px]:gap-1.5 max-[1024px]:rounded-none max-[1024px]:border-x-0 max-[1024px]:border-t-0 max-[1024px]:bg-transparent max-[1024px]:p-0 max-[1024px]:shadow-none'
          : '',
      ].join(' ')}
    >
      <div className="flex min-w-0 flex-1 items-start gap-4 max-[1024px]:items-center max-[1024px]:gap-2">
        <div className="min-w-0">
          <p className={[
            'mb-2 text-[0.72rem] uppercase tracking-[0.16em] text-[var(--color-muted)]',
            compactOnTableRoute ? 'max-[1024px]:mb-0 max-[1024px]:text-[0.46rem] max-[1024px]:tracking-[0.1em]' : '',
          ].join(' ')}>
            {t('header.eyebrow')}
          </p>
          <h1 className={[
            'm-0 text-[clamp(2rem,4vw,3rem)] leading-none',
            compactOnTableRoute ? 'max-[1024px]:text-[0.9rem]' : '',
          ].join(' ')}>{t('header.title')}</h1>
          <p className={[
            'mt-2 max-w-xl text-sm text-[var(--color-muted)] sm:text-base',
            compactOnTableRoute ? 'max-[1024px]:hidden' : '',
          ].join(' ')}>{t('header.subhead')}</p>
          <div className={[
            'mt-4 flex flex-wrap gap-2',
            compactOnTableRoute ? 'max-[1024px]:mt-0.5 max-[1024px]:gap-1' : '',
          ].join(' ')}>
            <Badge className={compactOnTableRoute ? 'max-[1024px]:px-1.5 max-[1024px]:py-0.5 max-[1024px]:text-[0.52rem]' : ''} variant={wsStatusVariant[wsStatus]}>{wsStatusLabel}</Badge>
          </div>
        </div>
      </div>
      <div className={[
        'grid gap-3 border-t border-[var(--color-border)] pt-4 sm:min-w-[280px] lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0',
        compactOnTableRoute ? 'max-[1024px]:hidden' : '',
      ].join(' ')}>
        <label className="grid gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-muted)]">
          {t('lang.label')}
          <div className="inline-flex w-fit items-center gap-1 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-input)] p-1">
            {localeOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={locale === option.value ? 'primary' : 'ghost'}
                className="min-h-8 min-w-8 rounded-[8px] px-2 text-base leading-none"
                aria-label={option.label}
                title={option.label}
                onClick={() => setLocale(option.value)}
              >
                <span aria-hidden="true">{option.flag}</span>
              </Button>
            ))}
          </div>
        </label>
      </div>
      {compactOnTableRoute ? (
        <details className="hidden rounded-lg border border-[var(--color-border)] px-2.5 py-1 max-[1024px]:block">
          <summary className="cursor-pointer text-[9px] font-medium uppercase tracking-[0.1em] text-[var(--color-muted)] marker:text-[var(--color-muted)]">
            {t('lang.label')}
          </summary>
          <div className="mt-3 grid gap-3">
            <label className="grid gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-muted)]">
              {t('lang.label')}
              <div className="inline-flex w-fit items-center gap-1 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-input)] p-1">
                {localeOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    variant={locale === option.value ? 'primary' : 'ghost'}
                    className="min-h-8 min-w-8 rounded-[8px] px-2 text-base leading-none"
                    aria-label={option.label}
                    title={option.label}
                    onClick={() => setLocale(option.value)}
                  >
                    <span aria-hidden="true">{option.flag}</span>
                  </Button>
                ))}
              </div>
            </label>
          </div>
        </details>
      ) : null}
    </Panel>
  )
}
