import { useEffect, useMemo, useState } from 'react'
import { useApi } from '../api/useApi'
import { useI18n } from '@/i18n'
import { useAppStore } from '@/state/useAppStore'
import type { Club } from '../types'
import { nextSelectedClub, selectedClubRoleForUser } from '../lib/clubs-view'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ClubsResponse = {
  clubs: Club[]
}

const clubRoleLabel = (t: (key: string, params?: Record<string, string | number>) => string, role?: string) => {
  switch ((role || '').toLowerCase()) {
    case 'owner':
      return t('clubs.owner')
    case 'admin':
      return t('clubs.admin')
    default:
      return t('clubs.member')
  }
}

const clubHistoryLabel = (t: (key: string, params?: Record<string, string | number>) => string, type: string) => {
  switch (type) {
    case 'club.created':
      return t('clubs.event.clubCreated')
    case 'member.joined':
      return t('clubs.event.memberJoined')
    case 'table.created':
      return t('clubs.event.tableCreated')
    case 'game.finished':
      return t('clubs.event.gameFinished')
    default:
      return type
  }
}

export const ClubsPanel = () => {
  const api = useApi()
  const { t } = useI18n()
  const token = useAppStore((state) => state.token)
  const userId = useAppStore((state) => state.userId)
  const clubs = useAppStore((state) => state.clubs)
  const selectedClub = useAppStore((state) => state.selectedClub)
  const setClubs = useAppStore((state) => state.setClubs)
  const updateClub = useAppStore((state) => state.updateClub)
  const setSelectedClub = useAppStore((state) => state.setSelectedClub)
  const pushToast = useAppStore((state) => state.pushToast)
  const setStatus = useAppStore((state) => state.setStatus)
  const [clubName, setClubName] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  const selectedClubRole = useMemo(() => selectedClubRoleForUser(selectedClub, userId), [selectedClub, userId])
  const recentHistory = useMemo(
    () => [...(selectedClub?.history ?? [])].slice(-5).reverse(),
    [selectedClub?.history],
  )

  const loadClubs = async () => {
    if (!token) {
      setClubs([])
      setSelectedClub(null)
      return
    }
    try {
      const body = await api.request<ClubsResponse>('/api/clubs')
      const nextClubs = body.clubs || []
      setClubs(nextClubs)
      setSelectedClub(nextSelectedClub(nextClubs, selectedClub?.id))
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleCreateClub = async () => {
    setStatus('')
    try {
      const club = await api.request<Club>('/api/clubs', {
        method: 'POST',
        body: JSON.stringify({ name: clubName.trim() }),
      })
      updateClub(club)
      setSelectedClub(club)
      setClubName('')
      pushToast(t('clubs.createSuccess', { club: club.name || club.id }), 'success')
      await loadClubs()
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleJoinClub = async () => {
    setStatus('')
    try {
      const club = await api.request<Club>('/api/club-joins', {
        method: 'POST',
        body: JSON.stringify({ 'invite-code': inviteCode.trim() }),
      })
      updateClub(club)
      setSelectedClub(club)
      setInviteCode('')
      pushToast(t('clubs.joinSuccess', { club: club.name || club.id }), 'success')
      await loadClubs()
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  useEffect(() => {
    loadClubs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <Card className="h-fit">
      <CardContent className="p-3.5 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="m-0 text-[1.38rem] font-semibold leading-none sm:text-[1.65rem]">{t('clubs.title')}</h2>
          {selectedClubRole ? <Badge>{clubRoleLabel(t, selectedClubRole)}</Badge> : null}
        </div>
        {selectedClub ? (
          <div className="mb-4 rounded-[22px] border border-[rgba(217,177,95,0.16)] bg-[linear-gradient(135deg,rgba(217,177,95,0.12),rgba(16,29,21,0.74))] p-3.5 sm:mb-5 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[0.68rem] uppercase tracking-[0.16em] text-[var(--color-muted)]">{t('clubs.selectedLabel')}</span>
                <strong className="mt-1.5 block text-lg sm:mt-2 sm:text-xl">{selectedClub.name || selectedClub.id}</strong>
              </div>
              {selectedClubRole ? <Badge>{clubRoleLabel(t, selectedClubRole)}</Badge> : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{t('clubs.members', { count: selectedClub.members?.length || 0 })}</Badge>
              {(selectedClub['invite-code'] || selectedClub.invite_code) ? (
                <Badge>
                  {t('clubs.inviteCode')} {(selectedClub['invite-code'] || selectedClub.invite_code)}
                </Badge>
              ) : null}
              <Badge>{t('clubs.private')}</Badge>
            </div>
            {(selectedClub.members?.length || 0) > 0 ? (
              <div className="mt-4">
                <div className="mb-2 text-[0.68rem] uppercase tracking-[0.16em] text-[var(--color-muted)]">{t('clubs.members', { count: selectedClub.members?.length || 0 })}</div>
                <div className="flex flex-wrap gap-2">
                  {selectedClub.members?.map((member) => {
                    const memberId = member['user-id'] ?? member.user_id ?? ''
                    return <Badge key={memberId}>{memberId} · {clubRoleLabel(t, member.role)}</Badge>
                  })}
                </div>
              </div>
            ) : null}
            {recentHistory.length > 0 ? (
              <div className="mt-4">
                <div className="mb-2 text-[0.68rem] uppercase tracking-[0.16em] text-[var(--color-muted)]">{t('clubs.history')}</div>
                <div className="grid gap-2">
                  {recentHistory.map((event, index) => (
                    <div key={`${event.type}-${event.at ?? index}`} className="rounded-xl border border-white/8 bg-black/10 px-3 py-2 text-sm">
                      <strong className="block">{clubHistoryLabel(t, event.type)}</strong>
                      <div className="mt-1 flex items-center justify-between gap-3 text-[var(--color-muted)]">
                        <span>{String(event['table-name'] ?? event.table_name ?? event['table-id'] ?? event.table_id ?? event['user-id'] ?? event.user_id ?? '')}</span>
                        {event.at ? <span>{new Date(event.at).toLocaleDateString()}</span> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <Alert tone="muted" className="mb-4 px-3.5 py-4 sm:mb-5 sm:px-4 sm:py-5">
            <strong className="block">{t('clubs.noneSelected')}</strong>
            <p className="mb-0 mt-1 text-sm text-[var(--color-muted)]">{t('clubs.pickClub')}</p>
          </Alert>
        )}
        <div className="mb-4 grid gap-3 sm:mb-5">
          <div className="rounded-[22px] border border-[var(--color-border)] bg-[rgba(16,29,21,0.66)] p-3.5 sm:p-5">
            <strong className="block">{t('clubs.newClub')}</strong>
            <div className="mt-3 grid gap-2.5 sm:gap-3">
              <div className="grid gap-2">
                <Label>{t('clubs.name')}</Label>
                <Input value={clubName} onChange={(e) => setClubName(e.target.value)} />
              </div>
              <Button onClick={handleCreateClub} disabled={!token || !clubName.trim()}>{t('clubs.create')}</Button>
            </div>
          </div>
          <div className="rounded-[22px] border border-[var(--color-border)] bg-[rgba(16,29,21,0.66)] p-3.5 sm:p-5">
            <strong className="block">{t('clubs.joinWithCode')}</strong>
            <div className="mt-3 grid gap-2.5 sm:gap-3">
              <div className="grid gap-2">
                <Label>{t('clubs.code')}</Label>
                <Input value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} />
              </div>
              <Button variant="ghost" onClick={handleJoinClub} disabled={!token || !inviteCode.trim()}>
                {t('clubs.join')}
              </Button>
            </div>
          </div>
        </div>
        <ul className="grid gap-2.5 p-0 sm:gap-3">
          {clubs.map((club) => {
            const member = club.members?.find((item) => (item['user-id'] ?? item.user_id) === userId)
            return (
              <li key={club.id} className="list-none">
                <button
                  className={
                    selectedClub?.id === club.id
                      ? 'flex w-full items-center justify-between gap-3 rounded-2xl border border-[color-mix(in_oklab,var(--color-accent)_35%,transparent)] bg-[color-mix(in_oklab,var(--color-accent)_12%,transparent)] p-3 sm:p-4 text-left shadow-[0_10px_30px_rgba(3,10,7,0.24)]'
                      : 'flex w-full items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/5 p-3 sm:p-4 text-left transition-colors hover:bg-white/8'
                  }
                  onClick={() => setSelectedClub(club)}
                >
                  <div className="min-w-0">
                    <strong className="block text-sm sm:text-base">{club.name || club.id}</strong>
                    <span className="text-sm text-[var(--color-muted)]">
                      {t('clubs.members', { count: club.members?.length || 0 })}
                    </span>
                  </div>
                  <Badge>{clubRoleLabel(t, member?.role)}</Badge>
                </button>
              </li>
            )
          })}
        </ul>
        {clubs.length === 0 ? (
          <Alert tone="muted" className="mt-4 px-3.5 py-4 sm:mt-5 sm:px-4 sm:py-5">
            {t(token ? 'clubs.empty' : 'clubs.emptyLoggedOut')}
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  )
}
