export type CookieBannerLocale = 'de' | 'en'

export type CookieBannerMessages = {
  title: string
  description: string
  acceptAll: string
  rejectAll: string
  customize: string
  savePreferences: string
  close: string
  detectedCookies: string
  noCookiesInCategory: string
  categories: {
    necessary: string
    functional: string
    analytics: string
    marketing: string
  }
}

export const cookieBannerMessages: Record<CookieBannerLocale, CookieBannerMessages> = {
  de: {
    title: 'Cookie-Einstellungen',
    description:
      'Wir verwenden Cookies, um euch die bestmögliche Erfahrung auf unserer Website zu bieten. Einige Cookies sind für den Betrieb der Website erforderlich, während andere uns helfen, diese Website und die Nutzererfahrung zu verbessern.',
    acceptAll: 'Alle akzeptieren',
    rejectAll: 'Alle ablehnen',
    customize: 'Anpassen',
    savePreferences: 'Einstellungen speichern',
    close: 'Schließen',
    detectedCookies: 'Erkannte Cookies',
    noCookiesInCategory: 'Keine Cookies in dieser Kategorie gefunden',
    categories: {
      necessary: 'Notwendig',
      functional: 'Funktional',
      analytics: 'Analytics',
      marketing: 'Marketing',
    },
  },
  en: {
    title: 'Cookie settings',
    description:
      'We use cookies to provide you with the best possible experience on our website. Some cookies are required for the site to work, while others help us improve the website and user experience.',
    acceptAll: 'Accept all',
    rejectAll: 'Reject all',
    customize: 'Customize',
    savePreferences: 'Save preferences',
    close: 'Close',
    detectedCookies: 'Detected cookies',
    noCookiesInCategory: 'No cookies found in this category',
    categories: {
      necessary: 'Necessary',
      functional: 'Functional',
      analytics: 'Analytics',
      marketing: 'Marketing',
    },
  },
}
