# Modul 3 – Umfragen & Votes

> **Status:** v0.2 · 2026-11-10 · **Prototyp umgesetzt (Phase 3, lokal simuliert):** Typen `date` und Auswahl (`single`),
> POL-01 (ohne Busy-Overlay), POL-02 Swipe-Stapel mit gleichwertigen Knöpfen, POL-03 Liste zum Ändern, POL-04 Frist,
> POL-06 Mehrheit/Host, POL-08 Balken, POL-09 Gewinner-Termin übernehmen. Offen: POL-05 Erinnerung, POL-07 anonym,
> Ortsumfrage, Mehrfachauswahl, Vorschläge sammeln.

**Ziel:** Entscheidungen, die **enden**. Kein endloses „Wer kann wann?“.

## Typen

`date` (Terminfindung) · `place` (Ortswahl) · `single` · `multi` · `free_text` (Vorschläge sammeln, dann abstimmen).

## User Stories

| ID | Als … | möchte ich … | damit … |
| --- | --- | --- | --- |
| POL-01 | Host | Terminoptionen vorschlagen, optional mit Busy-Overlay der Teilnehmer | gute Optionen entstehen |
| POL-02 | Teilnehmer | per **Swipe-Kartenstapel** abstimmen (rechts = passt, links = passt nicht, hoch = wenn nötig) | Abstimmen Spaß macht |
| POL-03 | Teilnehmer | alternativ in einer Liste ankreuzen | es barrierefrei ist |
| POL-04 | Host | eine Deadline setzen | die Umfrage endet |
| POL-05 | Nichtwähler | einmal freundlich erinnert werden | ich nicht vergesse |
| POL-06 | Host | festlegen: nach Deadline entscheidet Mehrheit oder ich | Klarheit herrscht |
| POL-07 | Host | anonyme Umfragen | heikle Fragen ehrlich beantwortet werden |
| POL-08 | Teilnehmer | animierte Ergebnisse sehen | das Ergebnis greifbar ist |
| POL-09 | Host | Gewinner-Termin mit 1 Tap ins Event übernehmen | kein Abtippen nötig ist |

## Akzeptanzkriterien

- Swipe-Geste hat **immer** eine gleichwertige Button-Alternative (Screenreader, motorische Einschränkungen).
- Deadline wird **serverseitig** durchgesetzt (Scheduled Edge Function / `pg_cron`): Nach Ablauf sind keine Stimmen mehr möglich.
- Erinnerung an Nichtwähler genau **einmal**, 24 h (konfigurierbar) vor Deadline.
- Gleichstand bei Mehrheitsentscheid: Host entscheidet; wenn der Host nicht entscheidet → Benachrichtigung an Host, kein Zufall.
- Anonym: Server speichert die Stimme mit `voter_id`, um Doppelstimmen zu verhindern, gibt sie aber über keine API heraus.
  Auch Hosts sehen sie nicht. Das ist in der UI erklärt („anonym für alle, auch für den Host“).
- Gäste ohne Account können über den Web-Link abstimmen (Gast-Identität).

## Zustände

Leer: „Noch keine Optionen – schlag was vor“. Offline: Stimme in Outbox. Nach Deadline: Ergebnis + Status „Beendet“.

## Free / Premium

Umfragen in allen Stufen unbegrenzt (Kernhandlung). Busy-Overlay setzt verbundene Kalender voraus (Sync-Limit gilt).
