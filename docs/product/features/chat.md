# Modul 4 – Chat

> **Status:** v0.1 · 2026-11-03 · Spezifikation (Entwurf). Umsetzung: Phase 5.

**Ziel:** Abstimmung im Kontext des Events, sodass wichtige Infos **nicht untergehen**.

## User Stories

| ID | Als … | möchte ich … | damit … |
| --- | --- | --- | --- |
| CHT-01 | Teilnehmer | im Event- oder Gruppenchat schreiben (Realtime) | wir uns abstimmen |
| CHT-02 | Teilnehmer | antworten (Thread-Zitat), reagieren (Emoji), @erwähnen | Gespräche klar bleiben |
| CHT-03 | Teilnehmer | Bilder senden | wir Dinge zeigen können |
| CHT-04 | Host | Nachrichten anheften oder als „Wichtig“ markieren | Kerninfos oben bleiben |
| CHT-05 | Teilnehmer | den Chat stummschalten, aber „Wichtig“ trotzdem erhalten | ich Ruhe habe |
| CHT-06 | Teilnehmer | eine Nachricht oder Person melden | Missbrauch gestoppt wird |
| CHT-07 | Host | Nachrichten im eigenen Event entfernen und Teilnehmer entfernen | ich moderieren kann |
| CHT-08 | Teilnehmer | Systemnachrichten sehen („Zeit geändert“, „Umfrage beendet“) | ich Änderungen mitbekomme |
| CHT-09 | Nutzer | Personen blockieren | sie mich nicht mehr kontaktieren |

Später: Sprachnachrichten, „Was habe ich verpasst?“-Zusammenfassung (KI, opt-in).

## Akzeptanzkriterien

- Supabase Realtime (Postgres Changes oder Broadcast) mit RLS: nur Mitglieder des Events/der Gruppe empfangen.
- Nachrichten max. 4.000 Zeichen; Bilder werden serverseitig neu kodiert (EXIF entfernt, siehe files.md).
- Rate-Limit: z. B. 30 Nachrichten/Minute pro Nutzer und Kanal.
- Gemeldete Inhalte landen in der Admin-Moderation; Admins sehen den gemeldeten Inhalt + Kontext ±5 Nachrichten,
  **nur über den Moderationsfall** (protokolliert), nicht frei durchsuchbar.
- Bearbeiten innerhalb 15 Min. (gekennzeichnet), Löschen jederzeit (Platzhalter „Nachricht gelöscht“).
- Offline: Nachrichten in Outbox mit Status-Icon; Reihenfolge per Client-Timestamp + Server-Sequenz.
- **Keine House Ads** im Chat.
- Architektur offen für E2E-Verschlüsselung (Nachrichteninhalt als opakes Feld `body` + `body_format`), v1 ohne E2E.

## Zustände

Leer: „Sag Hallo 👋“. Fehler beim Senden: Retry-Icon an der Nachricht. Offline: Banner „Offline – wird gesendet, sobald du wieder online bist“.

## Free / Premium

Chat in allen Stufen. Gäste können über den Web-Link chatten (Phase 5, Option des Hosts).

## Store-Hinweis

Apple 1.2 / Google UGC-Richtlinien: Melden, Blockieren, Filter und eine Kontaktmöglichkeit sind Pflicht → in v1 enthalten.
