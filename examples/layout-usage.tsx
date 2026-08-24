'use client'

import { CookieBanner, CookieBannerProvider, openCookieDialog } from '../src'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <CookieBannerProvider>
      {children}
      <CookieBanner locale="de" />
    </CookieBannerProvider>
  )
}

/** Footer-Link oder Settings-Button: Banner erneut öffnen */
export function CookieSettingsLink() {
  return (
    <button type="button" onClick={openCookieDialog}>
      Cookie-Einstellungen
    </button>
  )
}
