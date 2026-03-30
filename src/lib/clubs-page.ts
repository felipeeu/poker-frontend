export const clubsPageModel = (token: string) => ({
  showLoginGate: !token,
  backHref: '/tables',
})
