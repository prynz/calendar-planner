# ADR 0011 – Web-Vorschau des Prototyps (GitHub Pages)

> **Status:** akzeptiert · 2026-11-10 · Wunsch des PO („App im Web simulieren“)

## Kontext

Bis die iOS-Test-Builds über TestFlight laufen, soll der PO die App ohne Installation ansehen und durchklicken
können, auch auf dem eigenen iPhone im Browser. Expo kann dieselbe App über `react-native-web` fürs Web bauen.

## Entscheidung

1. **Gleicher Code, Web nur als Vorschau.** Die App wird mit `expo export --platform web` als Single-Page-App
   gebaut und vom Workflow `.github/workflows/pages.yml` auf **GitHub Pages** veröffentlicht
   (`https://prynz.github.io/calendar-planner/`). Kein neues Konto, kein Server. Vercel bleibt für die
   Gast-Web-Ansicht ab Phase 4 vorgesehen.
2. **Plattformdateien statt Verzweigungen** (`*.web.ts(x)`): Speicher über `localStorage` statt SQLite
   (`data/device-event-repository.web.ts`, `storage/settings-store.web.ts`), Datum/Uhrzeit über die
   Browser-Eingabefelder (`DateTimeField.web.tsx`), Rückfragen über den Browser-Dialog (`services/confirm.web.ts`).
3. **Ehrlich gekennzeichnet:** Eine Leiste oben sagt „Web-Vorschau (Demo) · Erinnerungen und Haptik nur in der App“.
   Lokale Benachrichtigungen und Haptik gibt es im Web nicht; der Detail-Screen zeigt dafür den vorhandenen Hinweis
   „Auf diesem Gerät sind keine Erinnerungen möglich“.
4. Die App erscheint im Browser in Handybreite (max. 430 px), zentriert.

## Konsequenzen

- Optik, Abläufe und Losgeh-Logik lassen sich im Browser prüfen; Gefühl (Haptik, Federn, Gesten) und Erinnerungen
  nur in der echten App (Android-APK, später TestFlight).
- Daten der Web-Vorschau liegen nur im jeweiligen Browser; „Beispielwelt zurücksetzen“ funktioniert auch dort.
- Pages muss einmalig vom Repo-Inhaber aktiviert werden (Settings → Pages → Source „GitHub Actions“).
