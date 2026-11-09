# Modul-Spezifikationen

> **Status:** v0.1 · 2026-11-03 · Entwürfe Phase 0. Jede Spezifikation hat User Stories,
> Akzeptanzkriterien, Zustände, Free/Premium-Grenze, Datenschutz-Hinweise und die Ziel-Phase.

| # | Modul | Datei | Phase | MoSCoW |
| --- | --- | --- | --- | --- |
| 1 | Kalender | [calendar.md](calendar.md) | 3 (Sync: 7) | Must |
| 2 | Events (Herzstück) | [events.md](events.md) | 4 | Must |
| 3 | Umfragen & Votes | [polls.md](polls.md) | 5 | Must |
| 4 | Chat | [chat.md](chat.md) | 5 | Must |
| 5 | Ort & Karte | [places-maps.md](places-maps.md) | 4 (Ort) / 6 (Karte, Wegzeit) | Must/Should |
| 6 | Aufgaben | [tasks.md](tasks.md) | 5 | Must |
| 7 | Mitbringliste | [bring-list.md](bring-list.md) | 5 | Must |
| 8 | Kosten | [costs.md](costs.md) | 9 | Could |
| 9 | Dateien | [files.md](files.md) | 5 | Should |
| 10 | Erinnerungen & Anti-Chaos-Engine | [anti-chaos-engine.md](anti-chaos-engine.md) | 3 (Basis) / 6 (voll) | Must |
| 11 | Familie | [family.md](family.md) | 7 | Should |
| 12 | Gruppen | [groups.md](groups.md) | 7 | Should |
| 13 | Vorlagen | [templates.md](templates.md) | 4 | Should |
| 14 | Gast-Web-Ansicht | [guest-web.md](guest-web.md) | 4 | Must |
| 15 | Profil & Einstellungen | [profile-settings.md](profile-settings.md) | 2 (+ jede Phase) | Must |

## Gemeinsame Regeln für alle Module

- **Zustände:** Jeder Screen definiert *Laden* (Skeleton statt Spinner, wo möglich), *Leer*
  (freundlich, mit genau einer klaren Aktion, optional Illustration), *Fehler* (verständlich, mit „Nochmal
  versuchen“, keine technischen Codes ohne Erklärung) und *Offline* (zuletzt synchronisierter Stand
  sichtbar und gekennzeichnet; Schreibaktionen landen in der Outbox und sind als „wird gesendet“ markiert).
- **Berechtigungen** prüft immer der Server (RLS/Edge Function). Die UI blendet nur aus.
- **Texte** nur über i18n-Schlüssel, DE + EN.
- **House Ads** nie in den Tabu-Zonen ([monetization.md §4.1](../monetization.md)).
- IDs der User Stories: `<MODUL>-<NR>`, z. B. `EVT-03`, damit Tests und Commits darauf verweisen können.
