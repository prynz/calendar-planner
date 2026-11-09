# ADR 0009 – Werkzeugentscheidungen aus Phase 1

> **Status:** akzeptiert · 2026-11-09 · präzisiert ADR 0001

| Thema | Entscheidung | Begründung | Alternative |
| --- | --- | --- | --- |
| i18n | **`intl-messageformat`** (FormatJS) direkt, eigener kleiner `t()` + React-Context; statt i18next | Eine Abhängigkeit statt drei, ICU vollständig, läuft in RN, Node und Deno; Schlüssel sind TypeScript-typisiert (fehlender Schlüssel = Compile-Fehler) | i18next + react-i18next + i18next-icu (ADR 0001) |
| Hermes-Plurale | Eigener Minimal-Fallback für `Intl.PluralRules` (de/en: „one“ nur bei 1) | Hermes liefert `PluralRules` nicht garantiert; Polyfill-Pakete bringen große Locale-Daten mit | `@formatjs/intl-pluralrules` |
| Geräte-Einstellungen | `expo-sqlite/kv-store` | SQLite ist ohnehin gesetzt (Offline-Kopie); keine zusätzliche AsyncStorage-Abhängigkeit | AsyncStorage |
| Icons | **Lucide** (`lucide-react-native`, ISC) | einheitliche, abgerundete Strichicons; baut auf `react-native-svg` auf | Phosphor |
| Schriften | `@expo-google-fonts/bricolage-grotesque` + `inter`, im App-Bundle (keine Laufzeit-Downloads) | OFL-Lizenz, kein Netzwerkzugriff zur Laufzeit (Datenschutz) | eigene TTF-Dateien |
| Zeitrechnung | Eigene, getestete Funktionen auf `Intl` (`packages/domain/time.ts`) | Für Phase 1 reicht Zonen-/Tageslogik; Entscheidung über `Temporal`-Polyfill/RRULE-Bibliothek fällt in Phase 3 | date-fns-tz |
| Beispielwelt | Eigenes reines Paket `@nowish/demo`, Daten relativ zu „heute“ | Prototyp wirkt immer aktuell; später Quelle für den DB-Seed | statische Seed-Datei |
| Peer-Abhängigkeiten | `auto-install-peers=false` | verhindert doppeltes React (gefunden in Phase 1, siehe setup.md) | – |
| Default-Rechte DB | `alter default privileges for role postgres revoke execute on functions from public` (global) | Ein schema-bezogenes Revoke entfernt das globale PUBLIC-EXECUTE nicht – durch pgTAP-Test gefunden | – |
| Native Builds | GitHub Actions ohne EAS-Konto (Android-APK debug-signiert, iOS-Simulator unsigniert) | Kein Store-/Apple-Konto nötig (ADR 0008) | EAS Build |
