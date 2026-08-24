/**
 * Cookie-Erkennung und Kategorisierung für DSGVO-Consent.
 * Patterns bei Bedarf um eigene Cookie-Namen erweitern.
 */

export type CookieCategory = 'necessary' | 'functional' | 'analytics' | 'marketing'

export interface DetectedCookie {
  name: string
  category: CookieCategory
  description: string
}

export interface CookiePreferences {
  necessary: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
  timestamp: string
  version: string
}

const COOKIE_PATTERNS: Record<CookieCategory, RegExp[]> = {
  necessary: [
    /^cookie_consent$/i,
    /^cookie_preferences$/i,
    /^NEXT_LOCALE$/i,
    /^sb-.*-auth-token/i,
  ],
  functional: [
    /^theme$/i,
    /^preferred_/i,
    /^user_preference/i,
    /^session_/i,
    /^csrf_/i,
    /^XSRF-TOKEN$/i,
  ],
  analytics: [
    /^_ga$/i,
    /^_gid$/i,
    /^_gat$/i,
    /^_ga_/i,
    /^_gcl_/i,
    /^analytics_/i,
    /^tracking_/i,
  ],
  marketing: [
    /^_fbp$/i,
    /^_fbc$/i,
    /^ads_/i,
    /^advertising_/i,
    /^marketing_/i,
    /^utm_/i,
  ],
}

export function categorizeCookie(name: string): CookieCategory {
  for (const [category, patterns] of Object.entries(COOKIE_PATTERNS)) {
    if (patterns.some((pattern) => pattern.test(name))) {
      return category as CookieCategory
    }
  }

  // Unbekannte Cookies konservativ als notwendig behandeln
  return 'necessary'
}

export function getCategoryDescription(category: CookieCategory, locale: string = 'de'): string {
  const descriptions: Record<CookieCategory, { de: string; en: string }> = {
    necessary: {
      de: 'Diese Cookies sind für die grundlegende Funktionalität der Website erforderlich und können nicht deaktiviert werden.',
      en: 'These cookies are essential for the basic functionality of the website and cannot be disabled.',
    },
    functional: {
      de: 'Diese Cookies ermöglichen erweiterte Funktionalitäten wie Spracheinstellungen und Benutzereinstellungen.',
      en: 'These cookies enable advanced functionality such as language settings and user preferences.',
    },
    analytics: {
      de: 'Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren, indem sie Informationen anonym sammeln.',
      en: 'These cookies help us understand how visitors interact with the website by collecting information anonymously.',
    },
    marketing: {
      de: 'Diese Cookies werden verwendet, um Ihnen relevante Werbung und Marketinginhalte anzuzeigen.',
      en: 'These cookies are used to show you relevant advertising and marketing content.',
    },
  }

  return descriptions[category][locale as 'de' | 'en'] || descriptions[category].de
}

export function detectCookies(): DetectedCookie[] {
  if (typeof document === 'undefined') {
    return []
  }

  const cookies: DetectedCookie[] = []
  const cookieString = document.cookie

  if (!cookieString) {
    return cookies
  }

  for (const pair of cookieString.split(';').map((c) => c.trim())) {
    if (!pair) continue

    const [name] = pair.split('=')
    if (!name) continue

    const trimmedName = name.trim()

    if (trimmedName === 'cookie_consent' || trimmedName === 'cookie_preferences') {
      continue
    }

    const category = categorizeCookie(trimmedName)

    cookies.push({
      name: trimmedName,
      category,
      description: getCategoryDescription(category),
    })
  }

  return cookies
}

export function groupCookiesByCategory(
  cookies: DetectedCookie[],
): Record<CookieCategory, DetectedCookie[]> {
  const grouped: Record<CookieCategory, DetectedCookie[]> = {
    necessary: [],
    functional: [],
    analytics: [],
    marketing: [],
  }

  for (const cookie of cookies) {
    grouped[cookie.category].push(cookie)
  }

  return grouped
}

export function getDefaultPreferences(): CookiePreferences {
  return {
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
    timestamp: new Date().toISOString(),
    version: '1.0',
  }
}
