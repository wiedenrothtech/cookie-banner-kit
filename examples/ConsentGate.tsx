'use client'

import { useEffect, useState } from 'react'

import { isCategoryAllowed } from '../src/cookies'

/**
 * Beispiel: Analytics / Sentry / Umami erst nach Consent laden.
 * Auf `cookieConsentUpdated` hören und die Kategorie prüfen.
 */
export function AnalyticsConsentGate({
  category = 'analytics',
  children,
}: {
  category?: 'functional' | 'analytics' | 'marketing'
  children: React.ReactNode
}) {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const sync = () => setAllowed(isCategoryAllowed(category))
    sync()
    window.addEventListener('cookieConsentUpdated', sync)
    return () => window.removeEventListener('cookieConsentUpdated', sync)
  }, [category])

  if (!allowed) return null
  return <>{children}</>
}
