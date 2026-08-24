export {
  categorizeCookie,
  detectCookies,
  getCategoryDescription,
  getDefaultPreferences,
  groupCookiesByCategory,
  type CookieCategory,
  type CookiePreferences,
  type DetectedCookie,
} from './cookie-detector'

export {
  hasConsent,
  isCategoryAllowed,
  loadCookiePreferences,
  openCookieDialog,
  removeNonEssentialCookies,
  saveCookiePreferences,
} from './cookie-manager'
