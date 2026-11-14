# Milestone-Report Phase 12 – Zoom-Kalender

> **Status:** 2026-11-14 · Phase 12 umgesetzt · **Stopp – wartet auf Review und Freigabe durch den PO.**
> Auftrag (PO, 2026-11-14): „bleibt und weiter ja“ – Schrift bleibt (Bricolage Grotesque + Inter), weiter mit dem
> Zoom-Kalender ([ADR 0017](../../decisions/0017-kompass.md), Konzept `docs/product/overview/nowish-zoom.html`).

## 1. Ergebnis in einem Satz

Der Kalender wird gezoomt statt umgeschaltet: **Jahr → Monat → Woche → Tag** (und von dort in den Termin) – mit zwei
Fingern, per Tipp oder über die Stufen-Leiste; der gewählte Tag bleibt dabei immer der Anker.

## 2. Was fertig ist

| Bereich | Ergebnis |
| --- | --- |
| Vier Stufen | Jahr (zwölf Mini-Monate), Monat, Woche, Tag. Die fünfte Tiefe – der Termin – ist die Termin-Seite (Tipp auf eine Zeile) |
| Wärmekarte | Monat und Jahr zeigen pro Tag eine Farbfläche (hell = frei, kräftig = voll) statt Punkte; Legende „frei … voll“. Die Anzahl wird immer vorgelesen – Farbe ist nie der einzige Hinweis. Heute hat einen Sonnenring |
| Zoom-Geste | Zwei Finger auseinander = eine Stufe tiefer, zusammen = eine Stufe höher. Die Stufe rastet ein (kein freies Zoomen); die neue Stufe wächst sanft hinein, bei „Bewegung reduzieren“ nur Überblenden |
| Alternativen ohne Geste | Stufen-Leiste Jahr · Monat · Woche · Tag; Monat im Jahr antippen; Tages-Überschrift in der Woche antippen; Pfeile blättern auf der aktuellen Stufe |
| Fokus-Tag | Der zuletzt gewählte Tag bleibt beim Zoomen der Mittelpunkt – auch wenn man vorher geblättert hat |
| Bestehendes bleibt | Personen-Filter wirkt auf jeder Stufe (auch in der Wärmekarte); Abhaken und Wischen in Woche und Tag; „Heute“-Knopf |

## 3. Prüfergebnisse

| Prüfung | Ergebnis |
| --- | --- |
| `pnpm check` | ✅ 1660 Tests: i18n 1042, ui 267, App 172, domain 132, demo 21, brand 11, entitlements 9, config 6 |
| Neue/angepasste Tests | Zoomen über alle Stufen mit Fokus-Tag, Jahr als Wärmestufen, Personen-Filter auf Wochen-Stufe |
| Web-Vorschau | ✅ Jahr, Monat, Woche, Tag geprüft (ohne Fehler) |
| CI Android / iOS | wird eingetragen, sobald die Läufe grün sind |

## 4. Screenshots (echt, aus CI)

Präfix `2026-11-14-phase-12` – werden nach den CI-Läufen ergänzt. Neu: 55 (Jahr); 03 zeigt den Monat als Wärmekarte,
05 die Tages-Stufe.

## 5. Was nicht fertig ist / bewusst offen (ehrlich)

- **Die Zoom-Geste ist nur auf echten Geräten prüfbar.** In Tests und Web-Vorschau sind die Knöpfe geprüft, das
  Spreizen selbst nicht (auch die CI kann keine Zwei-Finger-Geste ausführen).
- Die Liste „nächste 30 Tage“ gibt es nicht mehr – sie ist in Woche und Tag aufgegangen.
- Die Brotkrümel-Zeile aus dem Konzept (2026 › Nov › KW 46 › Fr 13.) ist als Stufen-Leiste umgesetzt; Doppeltippen
  zum Hineinzoomen und „lange drücken = Termin zu dieser Uhrzeit“ fehlen noch.
- Die Woche zeigt weiter Zeilen mit Karten, noch nicht die Blöcke nebeneinander; der Tag ist noch kein „Faden“ mit
  freien Lücken (Phase 13).
- Die Beispielwelt beginnt gestern – frühere Monate sind im Jahr deshalb leer.
- `design-system.md` §2 (Farbtabellen) ist noch nicht neu geschrieben.

## 6. Offene Fragen an den PO

1. **Freigabe Phase 12?**
2. Weiter mit **Phase 13 – Termin als Satz & Tag als Faden** (Lückentext-Editor, Faden mit freien Lücken, neue
   Termin-Seite)?
