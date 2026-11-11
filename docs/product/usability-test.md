# Usability-Test – Leitfaden zum Selbst-Durchführen

> **Status:** 2026-11-11 · Phase 7 · Leitfaden fertig, **Test noch nicht durchgeführt** (Sache des PO).
> Ergebnisse trägst du unten in §8 ein. Ich werte sie aus und setze sie mit deinen gesammelten Änderungswünschen um.

## 1. Ziel

Herausfinden, ob Menschen, die Nowish nicht kennen, die Kernversprechen **ohne Hilfe** verstehen und nutzen:

1. „Wann muss ich los?“ – die Losgeh-Zeit ist auf einen Blick klar.
2. Ein Treffen mit Freund:innen organisieren (Event, Zusage, Umfrage, Mitbringliste) fühlt sich leichter an als in
   WhatsApp.
3. Nichts wirkt wie ein Abo-Trick: Tarife, Grenzen und „Demo“ sind verständlich.

## 2. Wen testen (3–5 Personen reichen)

| Platz | Persona ([personas.md](personas.md)) | Merkmal |
| --- | --- | --- |
| 1 | Chaos-Chris | kommt öfter zu spät, nutzt den Handy-Kalender kaum |
| 2 | Orga-Olivia | organisiert regelmäßig Treffen in Gruppen-Chats |
| 3 | Familien-Frank | koordiniert Termine und Fahrten von Kindern |
| 4 | ADHS-Alex (optional) | profitiert von Fokus-Modus und Bereit-Check |
| 5 | beliebig (optional) | iPhone-Nutzer:in, falls die ersten vier Android haben (oder umgekehrt) |

Alle ab 16 Jahren. Keine Kolleg:innen, die das Projekt kennen. Eine kleine Aufmerksamkeit (z. B. Kaffee) ist üblich.

## 3. Vorbereitung (einmalig, ca. 15 Minuten)

- **Android:** Test-APK aus dem letzten CI-Lauf installieren ([setup.md](../development/setup.md), Artefakt
  `nowish-preview-apk`). **iPhone:** bis TestFlight eingerichtet ist (wartet auf die Secrets), die Web-Vorschau
  https://prynz.github.io/calendar-planner/ im Browser nutzen – sie hat dieselben Screens, aber keine Vibration und
  keine echten Erinnerungen.
- Vor jeder Person: **Einstellungen → „Beispielwelt zurücksetzen“**, damit alle dieselben Demo-Daten sehen. Für
  Aufgabe 1 die App neu installieren (bzw. in der Web-Vorschau die Website-Daten löschen), damit das Onboarding
  erscheint.
- Ausdruck oder zweites Gerät mit §5 (Aufgaben) und §6 (Beobachtungsbogen).

## 4. Ablauf pro Person (ca. 30 Minuten)

1. **Begrüßung (2 Min.)** – vorlesen:
   > „Danke, dass du mitmachst. Wir testen die App, nicht dich – du kannst nichts falsch machen. Bitte denk laut:
   > Sag, was du siehst, was du erwartest und was dich wundert. Ich helfe bewusst nicht, außer du kommst gar nicht
   > weiter. Die Personen und Termine in der App sind erfunden.“
2. **Einverständnis (1 Min.)** – Notizen ja; Bildschirmaufnahme oder Ton **nur mit ausdrücklichem Ja**, nur lokal,
   nach der Auswertung löschen. Keine Namen in den Notizen (P1, P2, …).
3. **Aufgaben (20 Min.)** – §5, eine nach der anderen, Aufgabe vorlesen, dann schweigen. Nach jeder Aufgabe die
   Leichtigkeitsfrage stellen (1 = sehr schwer … 7 = sehr leicht).
4. **Abschluss (5 Min.)** – §7.

## 5. Aufgaben

| # | Aufgabe (vorlesen) | Erfolg, wenn … | Zeitlimit |
| --- | --- | --- | --- |
| 1 | „Du hast die App gerade installiert. Richte sie ein.“ | Onboarding ohne Hilfe abgeschlossen, Altersbestätigung verstanden | 3 Min. |
| 2 | „Du hast heute noch Termine. Wann musst du für den nächsten spätestens los?“ | nennt die Losgeh-Zeit von der Heute-Seite | 1 Min. |
| 3 | „Trag ein: Physio am Freitag um 10 Uhr, du fährst 15 Minuten mit dem Rad.“ | Termin gespeichert, Wegzeit gesetzt, Losgeh-Zeit sichtbar | 4 Min. |
| 4 | „Tom hat dich zu seiner Feier eingeladen. Sag zu.“ | Zusage in der Einladung gesetzt | 2 Min. |
| 5 | „Beim Grillen wird abgestimmt, wann es stattfindet. Stimm ab und schau, was die anderen gewählt haben.“ | mindestens eine Stimme abgegeben, Ergebnis gefunden | 3 Min. |
| 6 | „Du bringst beim Grillen etwas mit. Trag es ein.“ | etwas in der Mitbringliste übernommen | 2 Min. |
| 7 | „Du bist spät dran für den Spieleabend. Sag den anderen Bescheid.“ | „Ich verspäte mich“ gefunden und gesendet | 2 Min. |
| 8 | „Dein Kind muss diese Woche irgendwo hingebracht werden, und die Fahrt ist noch offen. Frag Sam, ob Sam fährt.“ | Fahrdienste (Gemeinsam → Familie) gefunden, Sam gefragt | 3 Min. |
| 9 | „Was kostet Plus, und was würdest du gegenüber Free bekommen?“ | Preis + zwei Unterschiede richtig genannt | 2 Min. |
| 10 | „Stell ein, dass das Handy bei Aktionen nicht mehr vibriert.“ (nur App, nicht Web) | Schalter in den Einstellungen gefunden | 1 Min. |

Wenn eine Aufgabe das Zeitlimit erreicht: freundlich abbrechen („Danke, das reicht – das ist ein Hinweis für uns“)
und als *nicht geschafft* notieren.

## 6. Beobachtungsbogen (pro Person kopieren)

| # | geschafft? (ja / mit Hilfe / nein) | Zeit | Leichtigkeit 1–7 | Wo gezögert / was gesagt? |
| --- | --- | --- | --- | --- |
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |
| 7 | | | | |
| 8 | | | | |
| 9 | | | | |
| 10 | | | | |

Gerät/System: ______ · Schriftgröße auffällig groß? ja/nein · Screenreader genutzt? ja/nein

## 7. Abschlussfragen

1. „Was ist diese App, in einem Satz?“ (Versteht die Person das Versprechen „pünktlich, ohne Chaos“?)
2. „Was hat dich am meisten genervt?“
3. „Was würdest du vermissen, wenn es die App nicht gäbe?“
4. „Würdest du Plus nach der Testphase behalten? Warum (nicht)?“
5. „Wie wahrscheinlich empfiehlst du die App weiter? (0–10)“

## 8. Auswertung

Nach allen Personen: Für jede Aufgabe Erfolgsquote und mittlere Leichtigkeit eintragen. Probleme nach Schwere
sortieren – **kritisch** (Aufgabe nicht geschafft), **ernst** (nur mit Hilfe oder Leichtigkeit ≤ 3), **klein**
(Zögern, Kommentar). Ein Problem, das bei 2 von 5 Personen auftritt, ist wichtig, auch wenn es „klein“ wirkt.

| # | Erfolg (x von n) | Ø Leichtigkeit | wichtigste Beobachtung |
| --- | --- | --- | --- |
| 1–10 | | | |

**Zielwerte für „Prototyp überzeugt“:** Aufgaben 2, 3, 4 und 7 (Kernversprechen) von mindestens 4 von 5 Personen ohne
Hilfe geschafft, Ø Leichtigkeit ≥ 5; Abschlussfrage 1 trifft bei der Mehrheit den Kern.

## 9. Datenschutz beim Test

- Keine echten Termine oder Kontakte der Testpersonen in die App eintragen lassen – die Beispielwelt reicht.
- Notizen ohne Namen; Aufnahmen nur mit Einverständnis und nach der Auswertung löschen.
- Die App sendet nichts an Server (Prototyp, [ADR 0010](../decisions/0010-local-first-prototype.md)).
