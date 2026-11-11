# ADR 0014 – Familie, Gruppen und Kalender-Dateien im lokalen Prototyp

> **Status:** akzeptiert · 2026-11-11 · Phase 5 (Freigabe „nächste Phase“ durch den PO; Änderungswünsche erst am Ende aller Phasen)

## Kontext

Phase 5 bringt Familienbereich, Kinderprofile, Fahrdienste, Einkaufsliste, Ämtchen, Gruppen mit wiederkehrenden
Treffen und ICS-Import/-Export ([family.md](../product/features/family.md), [groups.md](../product/features/groups.md),
[calendar.md](../product/features/calendar.md) CAL-09). Der Prototyp läuft weiter lokal ohne Konten
([ADR 0010](0010-local-first-prototype.md)); andere Personen sind simuliert ([ADR 0012](0012-simulated-collaboration.md)).

## Entscheidung

1. **Ein Tab „Gemeinsam“** statt eines fünften Tabs: Events · Gruppen · Familie als Segmente. Die schwebende Tab-Leiste
   bleibt bei vier Einträgen (passt auch auf 360-dp-Geräte). Der Bereich steht in der Route (`?section=family`).
2. **Ein Familien-Dokument pro Haushalt** und **ein Dokument pro Gruppe**, wie die Event-Dokumente aus Phase 3:
   validiertes JSON in SQLite (Schema v4: Tabellen `household`, `circle`), im Web in `localStorage`. Die Logik liegt
   rein in `packages/domain` (`family/*`, `groups/*`), Fehler als Codes (`family.error.*`, `groups.error.*`).
3. **Kinderprofile ohne Konto:** nur Name, Farbe (aus der Kategorie-Palette, also Design-Tokens) und ein Symbol. Kein
   Geburtsdatum, kein Foto, keine Kontaktdaten (Regel 5).
4. **Fahrdienste** braucht ein Termin, wenn er einem Kind zugeordnet ist, einen Ort hat, nicht ganztägig ist und
   **kein Erwachsener des Haushalts** mit zugeordnet ist (dann fährt man zusammen). Konflikt = der Fahrer nimmt in
   der Zeit „Wegzeit + 15 Min. vor Beginn“ bzw. „nach Ende“ an einem eigenen Termin teil.
5. **Ämtchen** rotieren streng reihum über die Fälligkeitstage – fair ohne Zufall.
6. **Gruppen-Treffen sind normale Events** (ADR 0006) mit allen Mitgliedern eingeladen; die Gruppe verlinkt sie.
   Für wiederkehrende Treffen hat **jedes Vorkommen eine eigene Antwort** („Bin dabei“ / „Diesmal nicht“) im
   Gruppen-Dokument. Die Event-Zusage gilt für die Serie.
7. **Wiederholung „jeden n-ten Wochentag“** (z. B. 1. Freitag, letzter Montag) als `byNthWeekday` – RFC-5545
   `BYDAY=1FR`, auch im Export.
8. **ICS** ohne Server: Import über den System-Dateiauswahldialog (keine Speicher-Berechtigung), Vorschau mit
   „neu / schon vorhanden (per UID) / nicht importierbar“, Fehler pro Eintrag. Export als Datei über das
   Teilen-Menü. `TZID` mit IANA-Namen ohne VTIMEZONE-Blöcke (Google, Apple, Outlook lesen das); vollständige
   VTIMEZONE-Ausgabe folgt mit dem Kalender-Sync (Block B3). Nicht darstellbare Regeln (z. B. stündlich) werden als
   einzelner Termin übernommen und so gekennzeichnet; geänderte Einzeltermine (RECURRENCE-ID) werden zur
   Ausnahme der Serie plus eigenem Termin.
9. **Neue Abhängigkeiten:** `expo-document-picker`, `expo-file-system`, `expo-sharing` (Expo SDK 58, lokale Module ohne
   Netzwerk). Begründung: Import/Export von Kalender-Dateien.
10. **Limits:** ~~bis 6 Personen inklusive Kinderprofilen~~ – **korrigiert in Phase 6:** Die Frage war schon in
    [monetization.md §2](../product/monetization.md) entschieden: **Kinderprofile zählen nicht** zu den 6 Erwachsenen.
    Die Tarif-Grenzen (Free/Plus/Pro: 2 Erwachsene + 2 Kinderprofile, Family: 6 Erwachsene + bis 10 Kinderprofile,
    Gruppen 1/5/∞) kommen aus `@nowish/entitlements` ([ADR 0015](0015-premium-demo-entitlements.md)).

## Konsequenzen

- Einladungen per Link, Beitrittsanfragen und Ferien-/Feiertags-Abos brauchen Server bzw. Datenquellen und kommen
  mit Block B2/B3. In der App gibt es dafür keine Knöpfe, die etwas vortäuschen.
- Geräte mit älterem Prototyp bekommen Familie, Gruppen und deren Demo-Termine einmalig nachgeliefert
  (Meta-Flag `circles_seeded`), ohne vorhandene Einträge anzufassen.
- Die serverseitige Umsetzung (RLS: Familien-/Gruppenmitglieder sehen nur ihre Dokumente) folgt in Block B1.
