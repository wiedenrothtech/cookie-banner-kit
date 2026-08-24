import { categorizeCookie, type CookiePreferences } from './cookie-detector'

const COOKIE_CONSENT_KEY = 'cookie_consent'
const COOKIE_PREFERENCES_KEY = 'cookie_preferences'
const CONSENT_EXPIRY_DAYS = 365

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined

  const prefix = `${name}=`
  const match = document.cookie.split(';').find((entry) => entry.trim().startsWith(prefix))

  if (!match) return undefined

  return decodeURIComponent(match.trim().slice(prefix.length))
}

function writeCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return

  const expires = new Date()
  expires.setDate(expires.getDate() + CONSENT_EXPIRY_DAYS)

  const secure = window.location.protocol === 'https:' ? '; Secure' : ''

  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secure}`
}

function notifyConsentUpdated(): void {
  if (typeof window === 'undefined') return

  window.dispatchEvent(new CustomEvent('cookieConsentUpdated'))
}

export function loadCookiePreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = readCookie(COOKIE_PREFERENCES_KEY)

    if (!stored) {
      return null
    }

    const preferences = JSON.parse(stored) as CookiePreferences

    if (
      typeof preferences.necessary === 'boolean' &&
      typeof preferences.functional === 'boolean' &&
      typeof preferences.analytics === 'boolean' &&
      typeof preferences.marketing === 'boolean'
    ) {
      return preferences
    }
  } catch (error) {
    console.error('Error loading cookie preferences:', error)
  }

  return null
}

export function saveCookiePreferences(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    writeCookie(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences))
    writeCookie(COOKIE_CONSENT_KEY, 'true')
    notifyConsentUpdated()
  } catch (error) {
    console.error('Error saving cookie preferences:', error)
  }
}

export function hasConsent(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return readCookie(COOKIE_CONSENT_KEY) === 'true'
}

export function isCategoryAllowed(category: string): boolean {
  const preferences = loadCookiePreferences()

  if (!preferences) {
    return false
  }

  if (category === 'necessary') {
    return true
  }

  return preferences[category as keyof CookiePreferences] === true
}

export function removeNonEssentialCookies(preferences: CookiePreferences): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  for (const cookie of document.cookie.split(';')) {
    const [name] = cookie.split('=').map((s) => s.trim())

    if (!name) continue

    if (name === COOKIE_CONSENT_KEY || name === COOKIE_PREFERENCES_KEY) {
      continue
    }

    const category = categorizeCookie(name) as keyof CookiePreferences

    if (category !== 'necessary' && !preferences[category]) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`

      const hostname = window.location.hostname

      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${hostname};`
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.${hostname};`
    }
  }

  notifyConsentUpdated()
}

export function openCookieDialog(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('openCookieDialog'))
}
