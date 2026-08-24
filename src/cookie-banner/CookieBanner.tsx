'use client'

import { useEffect, useState } from 'react'
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Cookie,
  Inbox,
  Megaphone,
  Settings,
  Shield,
  X,
  XCircle,
} from 'lucide-react'

import { useIsClient } from '../hooks/use-is-client'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import {
  detectCookies,
  getCategoryDescription,
  getDefaultPreferences,
  groupCookiesByCategory,
  type CookieCategory,
  type CookiePreferences,
  type DetectedCookie,
} from '../cookies/cookie-detector'
import {
  hasConsent,
  loadCookiePreferences,
  removeNonEssentialCookies,
  saveCookiePreferences,
} from '../cookies/cookie-manager'
import {
  cookieBannerMessages,
  type CookieBannerLocale,
  type CookieBannerMessages,
} from '../messages'

/** `?nocb=1` unterdrückt den Auto-Banner — z. B. für OAuth- oder Crawler-Checks. */
function isCookieBannerSuppressed(): boolean {
  if (typeof window === 'undefined') return false
  const value = new URLSearchParams(window.location.search).get('nocb')
  if (value === null) return false
  return value === '' || value === '1' || value === 'true'
}

type CookieBannerProps = {
  locale?: CookieBannerLocale
  messages?: CookieBannerMessages
}

export function CookieBanner({ locale = 'de', messages }: CookieBannerProps) {
  const t = messages ?? cookieBannerMessages[locale] ?? cookieBannerMessages.de
  const mounted = useIsClient()

  const [showDialog, setShowDialog] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [hasGivenConsent, setHasGivenConsent] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>(getDefaultPreferences)
  const [_detectedCookies, setDetectedCookies] = useState<DetectedCookie[]>([])
  const [groupedCookies, setGroupedCookies] = useState<Record<CookieCategory, DetectedCookie[]>>(
    () => ({
      necessary: [],
      functional: [],
      analytics: [],
      marketing: [],
    }),
  )
  const [openCategories, setOpenCategories] = useState<Record<CookieCategory, boolean>>({
    necessary: false,
    functional: false,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const saved = loadCookiePreferences()
    if (saved) setPreferences(saved)

    const cookies = detectCookies()
    setDetectedCookies(cookies)
    setGroupedCookies(groupCookiesByCategory(cookies))

    const consentGiven = hasConsent()
    setHasGivenConsent(consentGiven)

    if (!consentGiven && !isCookieBannerSuppressed()) {
      setShowDialog(true)
    }

    const handleOpenDialog = () => {
      const nextSaved = loadCookiePreferences()
      if (nextSaved) setPreferences(nextSaved)

      const updatedCookies = detectCookies()
      setDetectedCookies(updatedCookies)
      setGroupedCookies(groupCookiesByCategory(updatedCookies))

      const nextConsent = hasConsent()
      setHasGivenConsent(nextConsent)
      setShowDetails(nextConsent)
      setShowDialog(true)
    }

    window.addEventListener('openCookieDialog', handleOpenDialog)
    return () => {
      window.removeEventListener('openCookieDialog', handleOpenDialog)
    }
  }, [])

  if (!mounted || !showDialog) {
    return null
  }

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
      version: '1.0',
    }

    setPreferences(allAccepted)
    saveCookiePreferences(allAccepted)
    setHasGivenConsent(true)
    setShowDialog(false)
  }

  const handleRejectAll = () => {
    const onlyNecessary = getDefaultPreferences()

    setPreferences(onlyNecessary)
    saveCookiePreferences(onlyNecessary)
    removeNonEssentialCookies(onlyNecessary)
    setHasGivenConsent(true)
    setShowDialog(false)
  }

  const handleSavePreferences = () => {
    saveCookiePreferences(preferences)
    removeNonEssentialCookies(preferences)
    setHasGivenConsent(true)
    setShowDialog(false)
  }

  const handleCategoryToggle = (category: CookieCategory, enabled: boolean) => {
    if (category === 'necessary') {
      return
    }

    setPreferences((prev) => ({
      ...prev,
      [category]: enabled,
    }))
  }

  const getCategoryIcon = (category: CookieCategory) => {
    switch (category) {
      case 'necessary':
        return <Shield className="h-3.5 w-3.5" />
      case 'functional':
        return <Settings className="h-3.5 w-3.5" />
      case 'analytics':
        return <BarChart3 className="h-3.5 w-3.5" />
      case 'marketing':
        return <Megaphone className="h-3.5 w-3.5" />
      default:
        return <Cookie className="h-3.5 w-3.5" />
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label={t.close}
        onClick={() => {
          if (hasGivenConsent) {
            setShowDialog(false)
          }
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-banner-title"
        className={`relative z-[201] flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-xl ${
          showDetails ? 'max-w-2xl' : 'max-w-md'
        }`}
      >
        {hasGivenConsent ? (
          <button
            type="button"
            onClick={() => setShowDialog(false)}
            className="absolute top-4 right-4 z-10 rounded-sm opacity-70 transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t.close}</span>
          </button>
        ) : null}

        <div className={`shrink-0 px-6 pt-6 text-left ${showDetails ? 'pb-6' : 'pb-4'}`}>
          <h2 id="cookie-banner-title" className="flex items-center gap-2 text-base font-semibold">
            <Cookie className="h-4 w-4" />
            {t.title}
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">{t.description}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <Collapsible
            open={showDetails}
            onOpenChange={setShowDetails}
            className={`w-full ${!showDetails ? '-mb-4' : ''}`}
          >
            <CollapsibleContent>
              <div className="px-6">
                <div className="space-y-6 pb-4">
                  {(['necessary', 'functional', 'analytics', 'marketing'] as CookieCategory[]).map(
                    (category) => {
                      const categoryCookies = groupedCookies[category]
                      const isEnabled = preferences[category]
                      const canToggle = category !== 'necessary'
                      const isOpen = openCategories[category]

                      return (
                        <Collapsible
                          key={category}
                          open={isOpen}
                          onOpenChange={(open) => {
                            setOpenCategories((prev) => ({
                              ...prev,
                              [category]: open,
                            }))
                          }}
                          className="space-y-3"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <CollapsibleTrigger asChild>
                              <button
                                type="button"
                                className="flex flex-1 items-start gap-3 text-left transition-opacity hover:opacity-80"
                              >
                                {getCategoryIcon(category)}
                                <div className="flex-1">
                                  <Label
                                    htmlFor={`cookie-${category}`}
                                    className="cursor-pointer text-sm font-semibold"
                                  >
                                    {t.categories[category]}
                                  </Label>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {getCategoryDescription(category, locale)}
                                  </p>
                                </div>
                                <ChevronDown
                                  className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                                    isOpen ? 'rotate-180 transform' : ''
                                  }`}
                                />
                              </button>
                            </CollapsibleTrigger>
                            <div className="flex shrink-0 items-center gap-2">
                              {isEnabled ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="h-4 w-4 text-gray-400" />
                              )}
                              <Switch
                                id={`cookie-${category}`}
                                checked={isEnabled}
                                onCheckedChange={(checked) => handleCategoryToggle(category, checked)}
                                disabled={!canToggle}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>

                          <CollapsibleContent className="ml-8 space-y-2">
                            {categoryCookies.length > 0 ? (
                              <>
                                <p className="text-xs font-medium text-muted-foreground">
                                  {t.detectedCookies} ({categoryCookies.length}):
                                </p>
                                <div className="space-y-1">
                                  {categoryCookies.map((cookie) => (
                                    <div
                                      key={cookie.name}
                                      className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-xs"
                                    >
                                      <code className="font-mono text-[10px]">{cookie.name}</code>
                                      <span className="rounded border px-2 py-0.5 text-[10px]">
                                        {cookie.category}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                <Inbox className="mb-2 h-6 w-6 opacity-50" />
                                <p className="text-xs">{t.noCookiesInCategory}</p>
                              </div>
                            )}
                          </CollapsibleContent>

                          <div className="h-px bg-border" />
                        </Collapsible>
                      )
                    },
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="shrink-0 border-t px-6 pt-4 pb-6">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
            {!showDetails ? (
              <>
                <Button variant="outline" onClick={() => setShowDetails(true)} className="w-full sm:w-auto">
                  <Settings className="mr-2 h-4 w-4" />
                  {t.customize}
                </Button>
                <Button variant="outline" onClick={handleRejectAll} className="w-full sm:w-auto">
                  {t.rejectAll}
                </Button>
                <Button onClick={handleAcceptAll} className="w-full sm:w-auto">
                  {t.acceptAll}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleRejectAll} className="w-full sm:w-auto">
                  {t.rejectAll}
                </Button>
                <Button variant="outline" onClick={handleAcceptAll} className="w-full sm:w-auto">
                  {t.acceptAll}
                </Button>
                <Button onClick={handleSavePreferences} className="w-full sm:w-auto">
                  {t.savePreferences}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
