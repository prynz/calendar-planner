# Entwicklungsumgebung

> **Status:** 2026-11-09 · Phase 1. Gilt für den Prototyp (ADR 0008).

## Voraussetzungen

Node ≥ 22.18 (native TypeScript-Ausführung für `app.config.ts` und Render-Skripte), pnpm 10.28 (`corepack enable`),
für die Datenbank Docker + Supabase CLI 3.x, für native Builds Android Studio bzw. Xcode (oder nur CI).

## Befehle

```bash
pnpm install                 # nach jeder package.json-Änderung, Lockfile mitcommitten
pnpm check                   # typecheck + lint + format:check + alle Unit-Tests
pnpm mobile                  # Expo Dev-Server (Dev-Client)
pnpm db:start                # lokale Supabase (Docker)
pnpm db:reset                # Migrationen + Seed neu anwenden
pnpm db:test                 # pgTAP-Tests gegen die lokale DB
pnpm brand:assets            # App-Icons + Logo-Entwürfe aus packages/brand rendern (Playwright)
pnpm design:mockups          # Konzept-Mockups rendern (Playwright)
pnpm --filter @nowish/mobile export:native   # Metro-Bundle Android + iOS prüfen
```

## pnpm-Besonderheiten (`.npmrc`)

- `node-linker=hoisted`: flaches `node_modules`, damit Metro, Autolinking und Gradle zuverlässig funktionieren.
- `auto-install-peers=false`: Workspace-Pakete (z. B. `@nowish/ui`) beziehen `react`/`react-native` aus der App.
  Sonst installiert pnpm eine zweite React-Kopie, und Hooks brechen („Cannot read properties of null (reading
  'useMemo')“). Folge: Peers wie `vite` (für Vitest) stehen explizit in der Root-`package.json`.
- Install-Skripte von Abhängigkeiten laufen nicht (`onlyBuiltDependencies: []`), `@parcel/watcher` ist bewusst
  ignoriert (lädt vorkompilierte Binärdateien).

## Umgebungsvariablen (App)

Ohne Variablen läuft die App im **Demo-Modus** (Beispielwelt). Für ein späteres Backend:
`EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` (immer beide). Ein Service-Role- oder
`sb_secret_`-Key wird von `@nowish/config` abgelehnt und in den Einstellungen als Fehler angezeigt.
`.env*` niemals committen.

## Native Builds & Screenshots (ohne Store-Konten)

| Workflow | Auslöser | Ergebnis |
| --- | --- | --- |
| `ci.yml` | jeder Push | Qualität, Expo-Doctor, Metro-Bundle, DB-Tests, Secret-Scan |
| `android.yml` | Push mit App-Änderungen, manuell | Preview-APK (Artefakt `nowish-preview-apk`, installierbar), Emulator-Screenshots |
| `ios.yml` | nur manuell | Simulator-Build ohne Signierung + Screenshots (kein Apple-Konto nötig) |

Screenshots ins Repo übernehmen: Workflow manuell starten mit `commit_screenshots = true` und Präfix
`YYYY-MM-DD-phase-NN`. Die Android-Test-App installierst du, indem du das Artefakt herunterlädst und die APK auf
dem Gerät öffnest („Installation aus unbekannten Quellen“ erlauben). Auf einem echten iPhone geht das erst mit
Apple-Developer-Konto.
