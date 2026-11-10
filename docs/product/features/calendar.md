# Modul 1 – Kalender

> **Status:** v0.2 · 2026-11-10 · **Prototyp umgesetzt (Phase 2):** CAL-01 (Tag/Woche/Monat/Liste), CAL-02, CAL-03, CAL-04,
> CAL-05 teilweise (Löschen „nur dieser/ganze Serie“; Bearbeiten wirkt auf die ganze Serie), CAL-06 als Kategorien.
> Offen: Zeitzonen-Auswahl im Editor (CAL-07), Konfliktanzeige (CAL-08), ICS (CAL-09, Phase 5), Sync (Block B3), Heatmap (Phase 4).

**Ziel:** Ein vollwertiger persönlicher Kalender, der allein schon nützlich ist und Events, Familie und
externe Kalender auf einer Zeitachse zusammenführt.

## User Stories

| ID | Als … | möchte ich … | damit … |
| --- | --- | --- | --- |
| CAL-01 | Nutzer | Tag, Woche, Monat und Agenda wechseln | ich die passende Übersicht habe |
| CAL-02 | Nutzer | per Datumsleiste wischen (Spring-Snap) und „Heute“ antippen | ich schnell navigiere |
| CAL-03 | Nutzer | einen Termin in < 10 s anlegen (Titel, Zeit, optional Ort) | Erfassen keine Hürde ist |
| CAL-04 | Nutzer | Wiederholungen (täglich, wöchentlich an Tagen, monatlich, jährlich, benutzerdefiniert) | Routinen abgebildet sind |
| CAL-05 | Nutzer | „Nur dieses / dieses und folgende / alle“ bearbeiten oder löschen | Ausnahmen funktionieren |
| CAL-06 | Nutzer | mehrere Kalender mit Farben (z. B. Arbeit, Privat) | ich trennen kann |
| CAL-07 | Reisender | Termine in einer anderen Zeitzone anlegen | Flüge/Calls korrekt sind |
| CAL-08 | Nutzer | Konflikte beim Anlegen sehen | ich Doppelbuchungen vermeide |
| CAL-09 | Nutzer | ICS-Dateien importieren und Termine/Kalender als ICS exportieren | ich nicht eingesperrt bin |
| CAL-10 | Nutzer | Google, Outlook und iCloud verbinden (Zwei-Wege) | alles an einem Ort ist (Phase 7) |
| CAL-11 | Nutzer | private externe Termine als „belegt“ in Gruppen-Terminfindung einblenden | Vorschläge passen, ohne Details zu teilen |
| CAL-12 | Nutzer | eine Heatmap meiner Auslastung pro Monat | ich volle Wochen erkenne |

## Akzeptanzkriterien

- Ansichten laufen flüssig (Ziel 60 fps auf Mittelklasse-Android, gemessen in Phase 3) bei 500 Terminen im Monat.
- RRULE nach RFC 5545 (Teilmenge: FREQ, INTERVAL, BYDAY, BYMONTHDAY, BYMONTH, COUNT, UNTIL, EXDATE).
  Expansion im Paket `packages/domain`, deterministisch, mit Sommerzeit-Tests (Europe/Berlin, America/New_York).
- Zeitspeicherung: UTC-Instant + IANA-Zeitzone des Termins; Ganztags-Termine als lokales Datum ohne Zeitzone.
- Konflikterkennung markiert Überschneidungen, blockiert aber nie.
- Wochenstart und 12/24 h folgen der Locale und sind überschreibbar.
- ICS-Import: Vorschau vor dem Import, Duplikate per UID erkennen; Fehler pro Eintrag melden statt Abbruch.
- Sync: keine Löschung externer Termine ohne ausdrückliche Bestätigung; Konflikte: letzte Änderung gewinnt pro Feld,
  bei echtem Konflikt (beide Seiten seit letztem Sync geändert) Hinweis mit Auswahl.

## Zustände

- **Laden:** Raster sofort, Termine als Skeleton-Balken.
- **Leer:** „Dein Kalender ist noch frei wie ein Sonntag ☀️“ + „Termin anlegen“ + „Kalender verbinden“.
- **Fehler:** Sync-Fehler pro Konto mit Grund („Zugriff abgelaufen – neu verbinden“).
- **Offline:** Lokale Kopie (SQLite) lesbar und bearbeitbar; Änderungen in Outbox.

## Free / Premium

Persönliche Termine und Kalender unbegrenzt in allen Stufen. Sync: Free 1 Konto, ab Plus alle.

## Datenschutz

Externe Kalender-Tokens nur serverseitig verschlüsselt (Supabase Vault). Busy-Overlay überträgt nur
Zeitblöcke, keine Titel. Auf iOS optional EventKit-Lesen ohne Server-Upload (rein lokal).
