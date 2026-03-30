import { useI18n } from '../i18n'
import { clubsPageModel } from '../lib/clubs-page'
import { useAppStore } from '../state/useAppStore'
import { ClubsPanel } from '../components/ClubsPanel'
import { ButtonLink } from '../components/ui/button-link'
import { Panel } from '../components/ui/panel'

export const ClubsPage = () => {
  const token = useAppStore((state) => state.token)
  const { t } = useI18n()
  const page = clubsPageModel(token)

  if (page.showLoginGate) {
    return (
      <Panel className="h-fit">
        <h2 className="m-0 text-2xl font-semibold">{t('clubs.manage')}</h2>
        <p className="mb-0 mt-3 text-sm text-[var(--color-muted)]">{t('clubs.loginRequired')}</p>
        <ButtonLink className="mt-4" variant="ghost" to={page.backHref}>
          {t('table.backToTables')}
        </ButtonLink>
      </Panel>
    )
  }

  return (
    <>
      <Panel className="h-fit">
        <div className="flex items-center justify-between gap-3">
          <h2 className="m-0 text-2xl font-semibold">{t('clubs.manage')}</h2>
          <ButtonLink variant="ghost" to={page.backHref}>
            {t('table.backToTables')}
          </ButtonLink>
        </div>
      </Panel>
      <ClubsPanel />
    </>
  )
}
