# Milestone-Report Phase 1 – Projekt-Setup

> **Status:** 2026-11-09 · Phase 1 umgesetzt · **Stopp – wartet auf Review und Freigabe durch den PO.**

## 1. Ergebnis in einem Satz

Es gibt eine lauffähige App für iOS und Android mit Navigation, Hell-/Dunkelmodus, Deutsch/Englisch und einer
als „Demo“ gekennzeichneten Beispielwelt. Dazu kommen das Designsystem, erste Logo-Entwürfe, eine lokale
Datenbank mit Sicherheitstests und eine CI, die beide Plattformen ohne Store-Konten baut und echte Screenshots erzeugt.

## 2. Was fertig ist

| Bereich | Ergebnis | Wo |
| --- | --- | --- |
| Monorepo & Tooling | pnpm-Workspaces, TypeScript strict (inkl. `exactOptionalPropertyTypes`), ESLint mit Projektregeln (keine Roh-Farben/Typo-Werte in Screens, Routen nur Re-Exports, reine Pakete ohne UI-Imports, keine leeren `catch`), Prettier | Root |
| App (`apps/mobile`) | Expo SDK 58, Expo Router, 3 Tabs (Heute, Events, Einstellungen) auf schwebender Pill-Tab-Bar, Datumsleiste, Event-Karten mit Status-Reiter, Sprache und Darstellung umschaltbar und gespeichert (SQLite), Lade-/Leer-/Fehlerzustände, Haptik | `apps/mobile` |
| Designsystem (`packages/ui`) | Tokens (Farben, Typo, Abstände, Radien, Motion, Haptik), 13 Komponenten, **automatischer WCAG-AA-Test aller Farbpaare** in Hell und Dunkel | `packages/ui` |
| Marke (`packages/brand`) | Arbeitsname, Claims, neutrale Store-IDs (ADR 0007), Bildmarke als getesteter Code → App-Icon, Android-Adaptive-/Themed-Icon, Splash | `packages/brand`, `docs/brand/logo/` |
| Sprachen (`packages/i18n`) | Deutsch + Englisch (ICU), Tests auf identische Schlüssel und Variablen, Sprache folgt System oder Wahl | `packages/i18n` |
| Beispielwelt (`packages/demo`) | Chris, Olivia, Tom, Mia, Jonas, Alex, Familie Frank mit Lena und Paul, Gast Gabi; 12 Termine/Events relativ zu „heute“ | `packages/demo` |
| Domänenlogik (`packages/domain`) | Zeitzonen- und Tageslogik inkl. Sommerzeit, Event-Status („in 30 Min.“, „läuft gerade“) | `packages/domain` |
| Env-Validierung (`packages/config`) | Ohne Backend → Demo-Modus; Service-Role-/Secret-Keys werden abgelehnt | `packages/config` |
| Datenbank | Supabase lokal, erste Migration (Default-Rechte, `system_settings` mit RLS, `client_config()`), 14 pgTAP-Prüfungen | `supabase/` |
| CI | Qualität + Expo-Doctor + Metro-Bundle, DB-Tests, Secret-Scan, Android-APK + Emulator-Screenshots, iOS-Simulator-Build + Screenshots | `.github/workflows/` |
| Konzept-Mockups | Onboarding, Heute mit Losgeh-Zeit, Event-Detail als Bento, Swipe-Voting (gekennzeichnet) | `docs/design/concept/` |
| Doku | Setup-Anleitung, ADR 0009, aktualisierte CLAUDE.md, Roadmap, Designsystem, Datenschutz | `docs/` |

## 3. Prüfergebnisse

| Prüfung | Ergebnis |
| --- | --- |
| `pnpm check` lokal (typecheck · lint · format · Tests) | ✅ 167 Tests: ui 57, i18n 60, domain 13, brand 8, demo 8, config 6, App 15 |
| pgTAP (lokal + CI) | ✅ 14/14 |
| Metro-Bundle Android + iOS (Hermes) | ✅ lokal und in CI |
| Expo-Doctor | ✅ in CI; lokal 18/20 (die 2 übrigen Prüfungen brauchen die Expo-API, die in dieser Umgebung nicht erreichbar ist) |
| CI `ci.yml` | ✅ grün |
| Android-Build + Emulator | siehe §4 |
| iOS-Simulator-Build | siehe §4 |

## 4. Screenshots (echt, aus CI)

⏳ Die Android- und iOS-Läufe für diesen Stand laufen noch (Commit `0f60922`). Die Screenshots werden automatisch nach `docs/previews/screenshots/2026-11-09-phase-01-*` committet und hier verlinkt, sobald die Läufe fertig sind.

## 5. Was nicht fertig ist / bewusst offen (ehrlich)

- **Gast-Web (`apps/web`) und Admin (`apps/admin`)** sind noch nicht angelegt; sie kommen in Phase 4 bzw. 8.
  Leere App-Hüllen hätten nichts gezeigt. Gleiches gilt für `packages/validation` (Phase 2) und
  `packages/entitlements` (Phase 4).
- **Keine Anmeldung, kein Server-Zugriff:** Die App läuft bewusst im Demo-Modus. Einen Offline-Zustand gibt es
  noch nicht, weil die App noch nichts über das Netz lädt; er kommt mit Phase 2/3.
- **Events sind nur lesbar.** Anlegen, Details, Losgeh-Zeit und Swipe-Voting gibt es bisher nur als Mockup.
- **Motion:** Die Datumsleiste scrollt normal, der geplante Spring-Snap und der Shared-Element-Übergang kommen mit
  Phase 3/4. Reduced Motion ist bei den bisherigen Animationen (Skeleton) berücksichtigt.
- **Barrierefreiheit:** Labels, Rollen und Touch-Ziele sind umgesetzt und teilweise getestet; ein manueller Test mit
  VoiceOver/TalkBack und 200 % Schrift auf echten Geräten steht noch aus.
- **Logo** ist Entwurf v1 (Feinschliff und Mindestgrößen-Test offen).
- **Kein Test auf echten Geräten**, nur Emulator/Simulator. Auf dem iPhone geht das erst mit Apple-Developer-Konto.

## 6. Funde & Risiken

| Fund | Wirkung | Status |
| --- | --- | --- |
| Postgres gibt neuen Funktionen standardmäßig **PUBLIC-EXECUTE** (global). Ein schema-bezogenes Revoke reicht nicht | Neue DB-Funktionen wären für anonyme Nutzer aufrufbar gewesen | ✅ durch pgTAP-Test gefunden und behoben (ADR 0009) |
| pnpm installierte automatisch eine **zweite React-Kopie** für Workspace-Pakete | App-Komponenten wären abgestürzt | ✅ `auto-install-peers=false`, dokumentiert |
| Hermes liefert `Intl.PluralRules` nicht garantiert | „1 Termine“-Fehler auf Geräten | ✅ getesteter Fallback |
| Store-IDs sind nach dem ersten Upload fest | Rebranding-Risiko | ✅ neutral bis zur Markenprüfung |
| Gradle-/Xcode-Builds dauern 15–40 Minuten in CI | langsame Rückmeldung | akzeptiert; iOS läuft nur bei Bedarf |

## 7. Offene Fragen an den PO

1. **Logo-Richtung:** Trifft „Uhr, deren Zeiger als Pfeil aus dem Kreis tritt“ die Marke? Feedback zu Farbe und Wortmarke?
2. **Mockups:** Soll die Losgeh-Zeit auf „Heute“ so dominant sein (große Lime-Karte oben)?
3. **Anmeldung in Phase 2 (Prototyp):** Apple-Login braucht ein Apple-Developer-Konto, Google und Microsoft brauchen
   eigene OAuth-Projekte. Vorschlag: im Prototyp zuerst **E-Mail (Magic Link) + Passkey**, Google/Microsoft/Apple
   vorbereitet und zugeschaltet, sobald die Konten existieren. Einverstanden?
4. **Supabase-Projekt für Tests auf dem Handy:** Willst du ein kostenloses Supabase-Konto anlegen (Region Frankfurt)?
   Bis dahin bleibt alles lokal und im Demo-Modus.

## 8. Nächster Schritt

Nach Freigabe: **Phase 2 – Accounts & Sicherheit** (Anmeldung, Profil, Konten verknüpfen, Löschung/Export, RLS-Basis,
Rate-Limits), weiter als Prototyp ohne Veröffentlichung.
