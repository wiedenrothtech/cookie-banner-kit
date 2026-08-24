# Cookie-Banner-Kit

Eigenes DSGVO-Cookie-Banner (kein Cookiebot / OneTrust / Usercentrics).
Abgeleitet aus dem Orbance-Stack, bereinigt für ein anderes Next.js- oder React-Projekt.

## Was enthalten ist

- Dialog mit **Alle akzeptieren**, **Alle ablehnen**, **Anpassen**
- Kategorien: **Notwendig**, **Funktional**, **Analytics**, **Marketing**
- Consent in eigenen Cookies: `cookie_consent` + `cookie_preferences` (365 Tage, SameSite=Lax)
- Erkennung gesetzter Cookies und Gruppierung nach Kategorie
- Event `cookieConsentUpdated` nach Speichern / Ablehnen
- Event `openCookieDialog`, um das Banner später wieder zu öffnen
- Texte DE/EN ohne `next-intl`

## Abhängigkeiten

```bash
npm install @radix-ui/react-collapsible @radix-ui/react-label @radix-ui/react-slot @radix-ui/react-switch class-variance-authority clsx lucide-react tailwind-merge
```

Voraussetzung: **React 18+**, **Tailwind CSS** mit shadcn-ähnlichen Tokens:

`background`, `foreground`, `primary`, `primary-foreground`, `muted`, `muted-foreground`, `border`, `input`, `ring`, `accent`, `accent-foreground`

Wenn das Zielprojekt schon shadcn/ui hat, könnt ihr `src/ui/*` durch eure eigenen `Button`, `Switch`, `Label`, `Collapsible` ersetzen.

## Einbinden

1. Ordner `src/` ins Projekt kopieren, z. B. nach `src/lib/cookie-banner-kit/`.
2. Im Root-Layout das Banner mounten:

```tsx
import { CookieBanner, CookieBannerProvider } from '@/lib/cookie-banner-kit'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <CookieBannerProvider>
          {children}
          <CookieBanner locale="de" />
        </CookieBannerProvider>
      </body>
    </html>
  )
}
```

3. Banner später erneut öffnen (Footer / Datenschutz):

```tsx
import { openCookieDialog } from '@/lib/cookie-banner-kit'

<button type="button" onClick={openCookieDialog}>
  Cookie-Einstellungen
</button>
```

4. Analytics / Sentry / Tracking erst nach Consent:

```tsx
import { isCategoryAllowed } from '@/lib/cookie-banner-kit'

if (isCategoryAllowed('analytics')) {
  // Tracker starten
}

window.addEventListener('cookieConsentUpdated', () => {
  // Tracker starten oder stoppen
})
```

Siehe `examples/ConsentGate.tsx` und `examples/layout-usage.tsx`.

## Anpassen

- **Cookie-Patterns:** `src/cookies/cookie-detector.ts` → `COOKIE_PATTERNS`
- **Texte:** `src/messages.ts` oder Prop `messages` am `CookieBanner`
- **Sprache:** `<CookieBanner locale="en" />`
- **Banner unterdrücken:** Query `?nocb=1`

Unbekannte Cookies gelten bewusst als `necessary` (konservativ). Eigene Tracker-Namen solltet ihr explizit unter `analytics` oder `marketing` eintragen.

## Hinweis

Das ist eine technische Basis, keine Rechtsberatung. Texte, Kategorien und eingesetzte Dienste an euer Projekt und eure Datenschutzerklärung anpassen.
