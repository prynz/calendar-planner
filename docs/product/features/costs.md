# Modul 8 – Kosten

> **Status:** v0.1 · 2026-11-03 · Spezifikation (Entwurf). Umsetzung: Phase 9 (Could für v1).
> **Nur Tracking, keine Zahlungsabwicklung.**

## User Stories

| ID | Als … | möchte ich … | damit … |
| --- | --- | --- | --- |
| CST-01 | Teilnehmer | eine Ausgabe erfassen (Betrag, Wer hat gezahlt, Für wen, Notiz, optional Beleg) | nichts verloren geht |
| CST-02 | Teilnehmer | gleich, nach Anteilen oder exakt aufteilen | es fair ist |
| CST-03 | Teilnehmer | Salden sehen („Du bekommst 12,40 € von Tom“) | ich weiß, wo ich stehe |
| CST-04 | Teilnehmer | eine minimale Ausgleichsliste („3 Überweisungen statt 12“) | Begleichen einfach ist |
| CST-05 | Teilnehmer | einen Ausgleich als „erledigt“ markieren (beide Seiten bestätigen) | Salden stimmen |
| CST-06 | Teilnehmer | optional meinen PayPal.me-Namen hinterlegen | ich schnell bezahlt werde |

## Akzeptanzkriterien

- Beträge in **Minor Units (Cent) als Integer**, eine Währung pro Event (v1). Rundungsreste deterministisch
  auf die Zahler verteilt (Algorithmus in `packages/domain`, Property-based Tests: Summe der Anteile = Betrag).
- Ausgleichsliste: Greedy-Minimierung der Transaktionen, deterministisch.
- **PayPal** (PO-Entscheidung 2026-11-09): Link `https://paypal.me/<name>/<betrag>EUR` öffnet die PayPal-App bzw. Website;
  keine Zahlung in der App, keine PayPal-API, keine Bestätigung von PayPal. Der Ausgleich wird manuell als
  „erledigt“ markiert. Rechtliche und Store-Prüfung vor Veröffentlichung (Phase 10).
- Keine Limits auf das Erfassen von Ausgaben (Abgrenzung zu Splitwise).

## Free / Premium

Free: gleiche Aufteilung, 1 Währung. Plus/Pro/Family: Anteile/exakt, Belegfotos, Export (CSV).
