# CLAUDE.md – Arbeitsregeln für Nowish

> **Status:** 2026-11-10 · **Phase 2 (Kalender-Kern + Anti-Chaos-Basis) umgesetzt, wartet auf Review** ([Report](docs/previews/milestone-reports/phase-2.md)).
> Prototyp lokal und simuliert, **ohne Login, Konten und Server** (ADR 0008, ADR 0010). Wird ein Konto/Dienst nötig
> (API-Schlüssel, Apple-Konto, Hosting), vorher den PO fragen. Kein Apple-Developer-Konto → iOS nur Simulator.

Social-Planner-App (iOS + Android) für alle, die sonst planlos sind: Kalender, Terminplaner und
Event-Organisator in einem, mit der **Anti-Chaos-Engine** (Losgeh-Zeit, eskalierende Erinnerungen,
Bereit-Check, „Ich verspäte mich“) als USP. Arbeitsname „Nowish“ (Alternative „Gleichda“, Markenprüfung offen) – Name zentral in `packages/brand`.

Produkt: [PROJECT_BRIEF.md](PROJECT_BRIEF.md) · Ursprung: [MASTER_PROMPT.md](MASTER_PROMPT.md) ·
Architektur: [docs/architecture/overview.md](docs/architecture/overview.md) ·
Design: [docs/design/design-system.md](docs/design/design-system.md) ·
Roadmap: [docs/product/roadmap.md](docs/product/roadmap.md) · Doku-Index: [docs/README.md](docs/README.md)

Sprache: Doku und Kommunikation mit dem PO **Deutsch**; Code, Commits, Identifier **Englisch**.

## Monorepo-Karte (pnpm Workspaces)

| Pfad                    | Inhalt                                                                         |
| ----------------------- | ------------------------------------------------------------------------------ |
| `apps/mobile`           | Expo + Expo Router (iOS/Android). Routen dünn, Screens in `features/*`         |
| `apps/web`              | Gast-Web-Ansicht für Event-Links (Next.js) – **ab Phase 4**                    |
| `apps/admin`            | Admin-Dashboard (Next.js + Tailwind) – **ab Phase 8**                          |
| `packages/ui`           | Designsystem: Tokens, Komponenten, Motion, Haptik                              |
| `packages/brand`        | Name, Claims, Logo, Icon (kein Maskottchen) – zentral & austauschbar          |
| `packages/i18n`         | Übersetzungen de/en (ICU), Formatierung, Schlüssel-Prüfung                     |
| `packages/domain`       | Reine Logik: Zeit/Tage (jetzt), später RRULE, Anti-Chaos-Engine, Votes, Kosten |
| `packages/demo`         | Beispielwelt für den Prototyp (ADR 0008), relativ zu „heute“                   |
| `packages/validation`   | zod-Verträge Client ↔ Server – **ab Phase 2**                                  |
| `packages/entitlements` | Abo-Stufen, Limits, Feature-Gates – **ab Phase 4**                             |
| `packages/config`       | Env-Validierung, verbietet privilegierte Keys im Client                        |
| `supabase/`             | Migrationen, pgTAP-Tests, Seed (nur lokal), Edge Functions                     |
| `docs/`                 | Produkt, Design, Brand, Architektur, Security, ADRs, Previews                  |

Abhängigkeitsrichtung: `apps/* → packages/*`; reine Pakete (`domain`, `entitlements`, `validation`,
`i18n`) importieren **nie** `react`, `react-native`, `expo-*`, `next`. Keine Zyklen.

## Nicht verhandelbare Regeln

1. **Server ist die einzige Autorität** für Berechtigungen, Abos/Entitlements, Rollen und Limits.
   Clients (App, Gast-Web) sind untrusted. Store-Receipts/Webhooks nur serverseitig validieren.
2. **RLS auf jeder Tabelle**, explizite Policies, Least Privilege. Neue `public`-Funktionen sind für
   `anon`/`authenticated` nicht ausführbar, bis explizit gegrantet. Jede `security definer`-Funktion setzt
   `search_path = ''`. Für jede Policy gibt es pgTAP-Tests.
3. **Keine Secrets im Client.** Service-Keys nur in Edge Functions/Admin-Server. `.env*` nie committen.
4. **Event-Links** ≥ 128 Bit Zufall, nur als Hash gespeichert, widerrufbar, optional Ablauf/PIN.
5. **Datensparsamkeit:** kein Geburtsdatum (nur Alters-Bestätigung), Kinderprofile ohne Account,
   Live-Standort nur opt-in, zeitlich begrenzt, jederzeit stoppbar. Keine Werbe-/Tracking-SDKs.
6. **House Ads** nur aus eigenem System; **Tabu-Zonen** fest im Code (siehe
   [monetization.md §4](docs/product/monetization.md)). Gast-Funktionen sind immer kostenlos.
7. **Keine Dark Patterns:** kein künstlicher Zeitdruck, kein vorausgewähltes teuerstes Paket, Kündigung
   in 2 Taps erklärt, Preise inkl. MwSt.
8. **Prototyp zuerst** ([ADR 0008](docs/decisions/0008-prototype-first.md), [ADR 0010](docs/decisions/0010-local-first-prototype.md)):
   nichts wird veröffentlicht; Block A läuft lokal ohne Konten. Screens sprechen nur mit Repository-Schnittstellen.
   Beispieldaten und Simulationen (z. B. Demo-Kauf) sind in der UI als **„Demo“** gekennzeichnet; keine echten
   Personendaten im Prototyp. Sicherheit (RLS, Tests) trotzdem von Anfang an vollständig.
9. **Technik ≠ Rechtsfreigabe.** Datenschutzerklärung, Impressum, AGB, Zahlungs-Links und Mindestalter
   sind Entwürfe, bis ein Fachanwalt (Sache des PO) sie freigibt.

## Arbeitsweise

1. Vor Änderungen Repo-Zustand und Abhängigkeiten prüfen; nichts Funktionierendes blind überschreiben.
2. Kleine Schritte, klare Commits (Englisch, Imperativ, z. B. `calendar: add week view gestures`).
3. Unklare Entscheidungen sinnvoll treffen und als **ADR** (`docs/decisions/NNNN-titel.md`) begründen;
   nur rückfragen, wenn nicht verlässlich entscheidbar.
4. **Keine Fake-Funktionen, keine toten Buttons, keine Platzhalter, die Fertigkeit vortäuschen.**
   Simuliertes ist in der UI als solches gekennzeichnet. Keine verschluckten Fehler (`catch {}` verboten).
5. Jeder Screen hat Lade-, Leer-, Fehler- und Offline-Zustand.
6. Nur Design-Tokens und Komponenten aus `packages/ui`; Texte nur über i18n-Schlüssel (keine Literale).
7. Neue Abhängigkeiten nur mit Begründung (Commit/PR + ggf. SDK-Liste in
   [privacy.md](docs/security/privacy.md)); Expo-Pakete via `npx expo install`; Lockfile mitcommitten.
8. Kein Force-Push, keine Änderungen an der Remote-Konfiguration.
9. Doku entspricht dem **tatsächlichen** Stand (Status-Zeile oben in jedem Dokument pflegen).
10. Mockups nur unter `docs/design/concept/` und klar als **Mockup** gekennzeichnet; echte Screenshots
    nach Meilensteinen unter `docs/previews/screenshots/YYYY-MM-DD-phase-NN-<screen>.png`.
11. Nach jeder Phase: typecheck → lint → format → Tests → Build-Prüfung → Doku → **Milestone-Report**
    (`docs/previews/milestone-reports/phase-N.md`: fertig, nicht fertig, Risiken, offene Fragen) →
    **Stopp, Freigabe durch PO abwarten**.

## Code-Standards (ab Phase 1)

- TypeScript strict inkl. `noUncheckedIndexedAccess` und `exactOptionalPropertyTypes`. Kein `any`;
  Type-Casts nur mit Kommentar-Begründung. Kein `@ts-ignore`/`skip` ohne Begründung.
- Ganzzahlen in Minor Units (Cent) für Geld. Zeitpunkte als UTC-Instant + IANA-Zeitzone.
- Dateien `kebab-case.ts`, Komponenten `PascalCase.tsx`, SQL `snake_case`, Enum-Werte lowercase.
  TS-Enums in `packages/*` und PG-Enums werden per Test synchron gehalten.
- Migrationen `supabase/migrations/YYYYMMDDHHMMSS_name.sql`; angewandte Migrationen nie editieren.
- Barrierefreiheit: Screenreader-Labels, dynamische Schrift, Touch-Ziele ≥ 48 dp, Farbe nie einziger
  Informationsträger, `Reduced Motion` immer respektiert. Kontrast WCAG AA (Token-Matrix in design-system.md).
- Layouts mit `start`/`end` statt `left`/`right` (RTL-fähig).

## Befehle

Details und pnpm-Besonderheiten: [docs/development/setup.md](docs/development/setup.md).

```bash
pnpm install                 # nach jeder package.json-Änderung, Lockfile mitcommitten
pnpm check                   # typecheck + lint + format:check + Unit-Tests (muss grün sein)
pnpm mobile                  # Expo Dev-Server
pnpm db:start && pnpm db:reset && pnpm db:test   # lokale Supabase + pgTAP
pnpm --filter @nowish/mobile export:native       # Metro-Bundle Android + iOS
pnpm brand:assets            # App-Icons/Logo aus packages/brand
pnpm design:mockups          # Konzept-Mockups (docs/design/concept/)
```

`.npmrc` setzt `auto-install-peers=false` – sonst entsteht eine zweite React-Kopie (setup.md).

## Definition of Done

Funktioniert Ende-zu-Ende auf iOS **und** Android, validiert Eingaben, alle Zustände behandelt, Tests
(Unit + DB/RLS wo relevant), DE+EN übersetzt, barrierefrei, Doku aktualisiert, CI grün.
Unvollständiges wird ehrlich benannt.
