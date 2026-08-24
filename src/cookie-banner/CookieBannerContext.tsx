'use client'

import { createContext, useContext, type ReactNode } from 'react'

import { openCookieDialog } from '../cookies/cookie-manager'

interface CookieBannerContextType {
  openCookieDialog: () => void
}

const CookieBannerContext = createContext<CookieBannerContextType | undefined>(undefined)

export function CookieBannerProvider({ children }: { children: ReactNode }) {
  return (
    <CookieBannerContext.Provider value={{ openCookieDialog }}>
      {children}
    </CookieBannerContext.Provider>
  )
}

export function useCookieBanner() {
  const context = useContext(CookieBannerContext)
  if (context === undefined) {
    throw new Error('useCookieBanner must be used within a CookieBannerProvider')
  }
  return context
}
