# Modul 5 – Ort & Karte

> **Status:** v0.1 · 2026-11-03 · Spezifikation (Entwurf). Ortsangabe: Phase 4 · Karte, Wegzeit, Live-ETA: Phase 6.
> Anbieter: **Google** Places + Routes ([ADR 0005](../../decisions/0005-maps-routing-provider.md)).

## User Stories

| ID | Als … | möchte ich … | damit … |
| --- | --- | --- | --- |
| MAP-01 | Host | einen Ort suchen (Autocomplete) oder frei eingeben | Gäste wissen, wohin |
| MAP-02 | Host | einen Treffpunkt-Pin setzen (z. B. „Eingang Nord“) | sich niemand verläuft |
| MAP-03 | Teilnehmer | den Ort in Apple Maps / Google Maps / ÖPNV-App öffnen | ich gewohnt navigiere |
| MAP-04 | Teilnehmer | meine Wegzeit je Verkehrsmittel sehen (zu Fuß, Rad, ÖPNV, Auto) | ich realistisch plane |
| MAP-05 | Host | Hinweise zu Parken/ÖPNV hinterlegen | Anreise einfach ist |
| MAP-06 | Teilnehmer | meine Live-ETA teilen (opt-in, zeitlich begrenzt, jederzeit stoppbar) | andere wissen, wann ich komme |
| MAP-07 | Host | sehen, wer gerade unterwegs ist und wann er ankommt | ich nicht nachfragen muss |

## Akzeptanzkriterien

- Ortssuche läuft über eine **Edge Function als Proxy** (API-Key bleibt serverseitig, Rate-Limit, Caching der Ergebnisse).
- Wegzeit-Berechnung: Startpunkt ist der **aktuelle Standort nur zum Berechnungszeitpunkt** oder ein gespeicherter Ort
  („Zuhause“, „Arbeit“ – nur auf Gerät gespeichert, optional). Der Standort wird **nicht** dauerhaft gespeichert.
- Ohne Standortfreigabe funktioniert alles mit manueller Wegzeit („Ich brauche ca. 25 Min.“).
- Live-ETA: Maximaldauer 2 h oder bis Ankunft/Eventstart + 30 Min. Sichtbar nur für Teilnehmer dieses Events.
  Ein permanenter Hinweis zeigt „Du teilst deine Ankunftszeit · Stoppen“. Positionsdaten werden nach Ende gelöscht
  (nur ETA-Werte, keine Spur/Historie).
- Im Gast-Web wird nur die ETA angezeigt (z. B. „ca. 12 Min.“), nie Koordinaten.
- Kartenansicht lazy geladen (Performance, kein SDK-Start ohne Bedarf).

## Zustände

Kein Ort: „Wo soll’s hingehen?“. Standort verweigert: Hinweis + manuelle Wegzeit. Routing-API-Fehler: letzter
bekannter Wert + „Wegzeit geschätzt“ gekennzeichnet.

## Free / Premium

Ort, Karte und Wegzeit für alle. Live-ETA für alle (Sicherheit/Pünktlichkeit ist kein Premium-Hebel).
Limit gegen Kosten: Wegzeit-Neuberechnungen pro Event und Nutzer gedrosselt (z. B. max. 1×/5 Min.).
