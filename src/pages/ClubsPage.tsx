import { useI18n } from '@/i18n'
import { clubsPageModel } from '../lib/clubs-page'
import { useAppStore } from '@/state/useAppStore'
import { ClubsPanel } from '../components/ClubsPanel'
import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const ClubsPage = () => {
  const token = useAppStore((state) => state.token)
  const { t } = useI18n()
  const page = clubsPageModel(token)

  if (page.showLoginGate) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>{t('clubs.manage')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="mb-0 text-sm text-[var(--color-muted)]">{t('clubs.loginRequired')}</p>
          <ButtonLink className="mt-4" variant="ghost" to={page.backHref}>
            {t('table.backToTables')}
          </ButtonLink>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="h-fit">
        <CardContent className="flex items-center justify-between gap-3 p-5">
          <h2 className="m-0 text-2xl font-semibold">{t('clubs.manage')}</h2>
          <ButtonLink variant="ghost" to={page.backHref}>
            {t('table.backToTables')}
          </ButtonLink>
        </CardContent>
      </Card>
      <ClubsPanel />
    </>
  )
}
