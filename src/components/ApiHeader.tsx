import { useState } from 'react'
import type { Locale } from '@/i18n'
import { useApi } from '../api/useApi'
import { useAppStore } from '@/state/useAppStore'
import { useI18n } from '@/i18n'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ButtonLink } from '@/components/ui/button-link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type ApiHeaderProps = {
  compactOnTableRoute?: boolean
}

export const ApiHeader = ({ compactOnTableRoute = false }: ApiHeaderProps) => {
  const api = useApi()
  const token = useAppStore((state) => state.token)
  const refreshToken = useAppStore((state) => state.refreshToken)
  const userId = useAppStore((state) => state.userId)
  const role = useAppStore((state) => state.role)
  const clearAuth = useAppStore((state) => state.clearAuth)
  const pushToast = useAppStore((state) => state.pushToast)
  const setStatus = useAppStore((state) => state.setStatus)
  const setLocale = useAppStore((state) => state.setLocale)
  const wsStatus = useAppStore((state) => state.wsStatus)
  const { locale, t } = useI18n()
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
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
  const isLoggedIn = Boolean(token)
  const userLabel = userId || t('auth.unknown')
  const avatarLabel = initialsForUser(userLabel)

  const handleLogout = async () => {
    setStatus('')
    let revoked = false
    try {
      if (refreshToken) {
        await api.request('/api/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ 'refresh-token': refreshToken }),
        })
      }
      revoked = true
    } catch (err) {
      setStatus((err as Error).message)
    } finally {
      clearAuth()
      if (revoked || !refreshToken) {
        pushToast(t('auth.logoutSuccess'), 'success')
      }
    }
  }

  return (
    <>
      <Card
        as="header"
        className={[
          'mb-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start',
          compactOnTableRoute
            ? 'max-[1024px]:mb-2 max-[1024px]:rounded-none max-[1024px]:border-x-0 max-[1024px]:border-t-0 max-[1024px]:bg-transparent max-[1024px]:shadow-none'
            : '',
        ].join(' ')}
      >
        <CardContent className="flex min-w-0 items-start gap-4 p-5 max-[1024px]:items-center max-[1024px]:gap-2 max-[1024px]:p-0">
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
        </CardContent>
        <CardContent className={[
          'grid gap-3 border-t border-[var(--color-border)] p-5 pt-4 sm:min-w-[280px] lg:border-l lg:border-t-0 lg:pl-5 lg:pt-5',
          compactOnTableRoute ? 'max-[1024px]:hidden' : '',
        ].join(' ')}>
          <div className="flex items-start justify-between gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-3 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-3"
                >
                  <Avatar>
                    <AvatarFallback>{avatarLabel}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 items-center gap-3">
                    <p className="m-0 text-sm text-[var(--color-muted)]">
                      {isLoggedIn ? (role || 'player') : t('detail.loginRequired')}
                    </p>
                    <Badge variant={isLoggedIn ? 'success' : 'neutral'}>
                      {isLoggedIn ? 'Live' : 'Guest'}
                    </Badge>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <ButtonLink to="/auth" variant="ghost" size="sm" className="w-full justify-start border-0 px-2.5 py-2 shadow-none">
                    {isLoggedIn ? 'Account' : t('auth.login')}
                  </ButtonLink>
                </DropdownMenuItem>
                {isLoggedIn ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setIsLogoutDialogOpen(true)}>
                      {t('auth.logout')}
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Separator />
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
        </CardContent>
        {compactOnTableRoute ? (
          <details className="hidden rounded-lg border border-[var(--color-border)] px-2.5 py-1 max-[1024px]:block">
            <summary className="cursor-pointer text-[9px] font-medium uppercase tracking-[0.1em] text-[var(--color-muted)] marker:text-[var(--color-muted)]">
              {t('lang.label')}
            </summary>
            <div className="mt-3 grid gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center justify-between gap-3 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs">{avatarLabel}</AvatarFallback>
                      </Avatar>
                      <p className="m-0 text-[10px] text-[var(--color-muted)]">
                        {isLoggedIn ? (role || 'player') : t('detail.loginRequired')}
                      </p>
                    </div>
                    <Badge className="px-2 py-0.5 text-[10px]" variant={isLoggedIn ? 'success' : 'neutral'}>
                      {isLoggedIn ? 'Live' : 'Guest'}
                    </Badge>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[160px]">
                  <DropdownMenuItem asChild>
                    <ButtonLink to="/auth" variant="ghost" size="sm" className="w-full justify-start border-0 px-2.5 py-2 shadow-none">
                      {isLoggedIn ? 'Account' : t('auth.login')}
                    </ButtonLink>
                  </DropdownMenuItem>
                  {isLoggedIn ? (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => setIsLogoutDialogOpen(true)}>
                        {t('auth.logout')}
                      </DropdownMenuItem>
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
              <Separator />
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
      </Card>
      <ConfirmDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        title={t('auth.confirmLogoutTitle')}
        description={t('auth.confirmLogoutDescription')}
        cancelLabel={t('dialog.cancel')}
        confirmLabel={t('auth.logout')}
        onConfirm={handleLogout}
        confirmVariant="danger"
      />
    </>
  )
}

const initialsForUser = (value: string) => {
  const words = value
    .split(/[\s@._-]+/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase()
}
