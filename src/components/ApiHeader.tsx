import { useState } from 'react'
import type { Locale } from '@/i18n'
import { useApi } from '../api/useApi'
import { useAppStore } from '@/state/useAppStore'
import { useI18n } from '@/i18n'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  const clearAuth = useAppStore((state) => state.clearAuth)
  const pushToast = useAppStore((state) => state.pushToast)
  const setStatus = useAppStore((state) => state.setStatus)
  const setLocale = useAppStore((state) => state.setLocale)
  const { locale, t } = useI18n()
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const localeOptions: Array<{ value: Locale; flag: string; label: string }> = [
    { value: 'en', flag: '🇺🇸', label: t('lang.en') },
    { value: 'pt-BR', flag: '🇧🇷', label: t('lang.pt-BR') },
  ]
  const isLoggedIn = Boolean(token)
  const userLabel = userId || 'Guest'
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
          'mb-3',
          compactOnTableRoute
            ? 'max-[1024px]:mb-1 max-[1024px]:rounded-none max-[1024px]:border-x-0 max-[1024px]:border-t-0 max-[1024px]:bg-transparent max-[1024px]:shadow-none'
            : '',
        ].join(' ')}
      >
        <CardContent
          className={[
            'flex items-center justify-between gap-2.5 p-2 sm:p-3',
            compactOnTableRoute ? 'max-[1024px]:p-0' : '',
          ].join(' ')}
        >
          <h1 className="m-0 text-[0.62rem] font-medium uppercase tracking-[0.12em] text-[var(--color-muted)] sm:text-[0.68rem]">
            Poker Game
          </h1>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="inline-flex items-center gap-0.5 rounded-[9px] border border-[var(--color-border)] bg-[var(--color-input)] p-0.5">
              {localeOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={locale === option.value ? 'primary' : 'ghost'}
                  className="min-h-[22px] min-w-[22px] rounded-[7px] px-0.5 text-[0.68rem] leading-none sm:min-h-6 sm:min-w-6 sm:px-1 sm:text-xs"
                  aria-label={option.label}
                  title={option.label}
                  onClick={() => setLocale(option.value)}
                >
                  <span aria-hidden="true">{option.flag}</span>
                </Button>
              ))}
            </div>
            <Separator orientation="vertical" className="h-4 sm:h-5" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex size-7 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-input)] sm:size-8"
                >
                  <Avatar className="size-7 border-0 bg-transparent sm:size-8">
                    <AvatarFallback className="text-[0.68rem] sm:text-xs">{avatarLabel}</AvatarFallback>
                  </Avatar>
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
        </CardContent>
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
