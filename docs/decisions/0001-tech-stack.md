# ADR 0001 – Tech-Stack

> **Status:** vorgeschlagen · 2026-11-03

## Kontext

PLANLOS muss auf iOS und Android gleichwertig laufen, hochwertig animiert sein, offline funktionieren und von
einem kleinen Team über Jahre gepflegt werden. Es gibt drei Oberflächen (App, Gast-Web, Admin) mit gemeinsamer
Domänenlogik. Der PO hat einen Stack vorgeschlagen (Master Prompt §10). Der PO betreibt bereits zwei Repos mit
Expo + pnpm + Supabase (Erfahrung vorhanden, Muster wiederverwendbar).

## Entscheidung

Wir übernehmen den vorgeschlagenen Stack mit folgenden Präzisierungen:

| Bereich | Wahl | Präzisierung / Begründung |
| --- | --- | --- |
| Monorepo | pnpm Workspaces, TS strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) | Pakete als TS-Quelle konsumiert (kein Build-Schritt) |
| Mobile | Expo + Expo Router, New Architecture, Hermes | eine Codebasis, EAS Build für beide Plattformen, Config Plugins für native Teile (Widgets) |
| Animation | Reanimated, Gesture Handler, Skia (lazy), Lottie, expo-haptics | Skia nur dort, wo nötig (Startzeit) |
| State | TanStack Query + Zustand + SQLite (`expo-sqlite`) | Query = Server-Cache, SQLite = Offline-Kopie + Outbox |
| i18n | **i18next + react-i18next + ICU-Plugin** (`i18next-icu`) | ICU-Plural/Select, läuft in RN, Next.js und Deno; Alternative FormatJS ähnlich gut, i18next hat das breitere RN-Ökosystem |
| Backend | Supabase EU (siehe ADR 0002) | |
| Web | Next.js (App Router) für `apps/web` und `apps/admin`, **getrennt** | unterschiedliche Angriffsflächen und Deployments |
| Validierung | zod | gemeinsame Verträge Client/Server/Deno |
| Abos | RevenueCat (ADR 0003) | |
| Push | expo-notifications (lokal + remote) | |
| Tests | Vitest, Jest + RNTL, pgTAP, Maestro, Playwright | |
| CI/CD | GitHub Actions + EAS | iOS- und Android-Build bei jedem relevanten Push |
| Lint/Format | ESLint (flat config) + Prettier | eigene Regeln: keine Roh-Farben/Literale in Screens, keine RN-Imports in reinen Paketen |

Versionen (Expo SDK, React Native, Next.js) werden zu Beginn von Phase 1 auf den dann aktuellen stabilen Stand
fixiert und hier nachgetragen; Expo-Pakete nur über `npx expo install`.

## Alternativen

- **Flutter:** sehr gute Performance und Animationen, aber kein Code-Sharing mit Next.js/Deno (Domänenlogik doppelt) → verworfen.
- **Native (Swift/Kotlin):** beste Plattformintegration (Widgets, Live Activities), aber doppelter Aufwand → verworfen;
  native Teile gezielt per Config Plugin.
- **Firebase statt Supabase:** siehe ADR 0002.

## Konsequenzen

- Domänenlogik (`packages/domain`) muss in RN (Hermes), Node (Tests/Next) **und** Deno (Edge Functions) laufen →
  nur Web-Standard-APIs, ESM, keine Node-Builtins.
- Widgets/Live Activities erfordern native Targets; Aufwand in Phase 6 neu schätzen.
- E2E-Verschlüsselung des Chats bleibt möglich: `messages.body` ist opak, Schlüsselverwaltung wäre eine eigene ADR.
