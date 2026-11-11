# Modul 12 – Gruppen

> **Status:** v0.2 · 2026-11-11 · **Prototyp umgesetzt (Phase 5, lokal + simuliert, [ADR 0014](../../decisions/0014-family-groups-local.md)):**
> GRP-01 (ohne Link, Demo-Personen), GRP-02 (nächste Treffen), GRP-03, GRP-04 (inkl. „jeden 1. Freitag“, Antwort pro Vorkommen),
> GRP-05, GRP-06 (Admins, Entfernen, Austritt). Offen: Einladungslink und Beitrittsanfragen (Block B2).

## User Stories

| ID | Als … | möchte ich … | damit … |
| --- | --- | --- | --- |
| GRP-01 | Nutzer | eine Gruppe anlegen (Freundeskreis, Team, WG) und per Link oder Kontakt einladen | wir einen festen Kreis haben |
| GRP-02 | Mitglied | einen gemeinsamen Gruppenkalender sehen | ich weiß, was ansteht |
| GRP-03 | Mitglied | Events für die Gruppe anlegen (alle automatisch eingeladen) | ich nicht jeden einzeln einlade |
| GRP-04 | Admin | wiederkehrende Gruppen-Events („jeden 1. Freitag Stammtisch“) | Rituale laufen von selbst |
| GRP-05 | Mitglied | den Gruppenchat nutzen | wir außerhalb von Events reden |
| GRP-06 | Admin | Rollen (Admin, Mitglied) und Beitrittsanfragen verwalten | die Gruppe geschützt ist |

Später (v2): rotierender Gastgeber, Anwesenheitsstatistik für Vereine, Untergruppen.

## Akzeptanzkriterien

- Gruppen sind **privat** (keine öffentliche Suche in v1).
- Einladungslink der Gruppe: wie Event-Links (≥ 128 Bit, widerrufbar, optional Ablauf), mit optionaler Admin-Freigabe.
- Wiederkehrende Gruppen-Events nutzen die RRULE-Logik des Kalenders; jedes Vorkommen hat eigene RSVPs.
- Austritt: Nutzer verlässt Gruppe und künftige Gruppen-Events; eigene Chat-Nachrichten bleiben (anonymisiert bei Account-Löschung).

## Free / Premium

Gruppen: Free 1 · Plus 5 · Pro unbegrenzt · Family Familie + 5. Mitgliederzahl folgt dem Teilnehmer-Limit des Gruppen-Admins.
