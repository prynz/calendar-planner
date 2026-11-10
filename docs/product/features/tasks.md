# Modul 6 – Aufgaben

> **Status:** v0.2 · 2026-11-10 · **Prototyp umgesetzt (Phase 3, lokal simuliert):** TSK-01 (Fälligkeit aus Vorlagen),
> TSK-02 (nur Host, über Vorlagen/Demo), TSK-03 „Ich übernehme das“ mit „schon übernommen von …“, TSK-04 Abhaken
> mit Haptik, TSK-06 Fortschritt. Offen: TSK-05 Erinnerung, TSK-07 Anti-Chaos-Plan (Phase 4), Fälligkeit beim
> manuellen Anlegen, Fortschrittsring statt Balken.

**Ziel:** Event- und gruppenbezogene To-dos ohne zusätzliche App.

## User Stories

| ID | Als … | möchte ich … | damit … |
| --- | --- | --- | --- |
| TSK-01 | Host | Aufgaben anlegen (Titel, Fälligkeit, optional Notiz) | nichts vergessen wird |
| TSK-02 | Host | Aufgaben Personen zuweisen | klar ist, wer was macht |
| TSK-03 | Teilnehmer | „Ich übernehme das“ antippen (Selbstzuweisung) | Arbeit sich verteilt |
| TSK-04 | Teilnehmer | erledigen mit Animation (Fortschrittsring füllt sich) | es sich gut anfühlt |
| TSK-05 | Teilnehmer | an fällige Aufgaben erinnert werden (eine Erinnerung, einstellbar) | ich dran denke |
| TSK-06 | Host | den Fortschritt aller Aufgaben sehen | ich weiß, wo wir stehen |
| TSK-07 | Nutzer | persönliche Vorbereitungs-Aufgaben (z. B. „Geschenk kaufen“) im Anti-Chaos-Plan | sie eingeplant sind |

## Akzeptanzkriterien

- Eine Aufgabe hat 0–1 Verantwortliche (v1); Mehrfachzuweisung ist bewusst nicht enthalten (Verantwortung bleibt klar).
- Selbstzuweisung ist konfliktsicher (Server-seitig atomar; bei gleichzeitigem Tap gewinnt der erste, der zweite
  bekommt „Schon übernommen von Mia“).
- Erledigt-Animation via Reanimated, Haptik `success`; Reduced Motion → nur Häkchen ohne Animation.
- Fortschritt als Ring auf der Event-Kachel (Anzahl erledigt / gesamt, zusätzlich als Text für Screenreader).

## Zustände

Leer: „Alles erledigt – oder noch nichts geplant? 😄“ + „Aufgabe hinzufügen“. Offline: Abhaken in Outbox.

## Free / Premium

Unbegrenzt in allen Stufen (Kernhandlung).
