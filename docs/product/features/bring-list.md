# Modul 7 – Mitbringliste

> **Status:** v0.1 · 2026-11-03 · Spezifikation (Entwurf). Umsetzung: Phase 5.

**Ziel:** Keine fünf Kartoffelsalate. Jeder weiß, was er mitbringt.

## User Stories

| ID | Als … | möchte ich … | damit … |
| --- | --- | --- | --- |
| BRG-01 | Host | Items mit Menge und Kategorie anlegen (Essen, Getränke, Deko, Equipment) | klar ist, was gebraucht wird |
| BRG-02 | Teilnehmer/Gast | „Ich bringe das mit“ (ganz oder Teilmenge, z. B. 2 von 6 Flaschen) | sich Mengen verteilen |
| BRG-03 | Teilnehmer | eigene Items vorschlagen (Host kann freigeben) | Ideen einfließen |
| BRG-04 | Teilnehmer | eine Warnung bei ähnlichen Items („Salat“ existiert schon) | Doppeltes vermieden wird |
| BRG-05 | Teilnehmer | meine Mitbringsel automatisch im Bereit-Check haben | ich sie nicht vergesse |
| BRG-06 | Host | sehen, was noch fehlt | ich gezielt fragen kann |

## Akzeptanzkriterien

- Mengen als ganze Zahlen; Claims summieren sich nie über die Gesamtmenge (Serverprüfung in einer Transaktion).
- Duplikat-Erkennung: normalisierter Vergleich (Kleinschreibung, Umlaute, einfache Stammform) im Paket `domain`, mit Tests;
  nur Hinweis, keine Blockade.
- Gäste über den Web-Link können Items übernehmen (Gast-Identität).
- Übernommene Items erscheinen im Bereit-Check des Nutzers (Integration Anti-Chaos-Engine).

## Zustände

Leer: „Was soll mit? Leg das erste Item an 🧺“. Alles vergeben: „Alles vergeben 🎉“.

## Free / Premium

Unbegrenzt in allen Stufen.
