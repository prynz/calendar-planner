# Phase 8 – Redesign-Konzept (**Mockup**)

> **Status:** 2026-11-13 · v3 „Schlank“, v4 „Weich & groß“, v7 „Klar & farbig“ + Widgets – v5/v6 verworfen · **Mockup zur Abnahme durch den PO – keine App-Screenshots.** Alle Daten sind erfunden.
> Klickbare Fassung: Design-Canvas „Nowish Redesign Konzept“ (privat, Link im Chat).

Vorgaben des PO (2026-11-12): Lesbarkeit, Übersichtlichkeit, einfache Bedienung, moderne und nicht
standardmäßige Optik, flüssige Animationen, Personalisierung (Anordnung, Farben, Start-Ansicht) und die App als
persönlicher Helfer, der Überschneidungen und Konflikte bemerkt. Stilrichtung: **Lime + Pastell**. Vorgehen:
**erst Konzept, dann bauen**.

| Datei | Screen | Kernidee |
| --- | --- | --- |
| `Main.dc.html` | Heute | Begrüßung, Wochenleiste, „Nächster Aufbruch“, Helfer-Karte mit fertigen Lösungen, Zeitleiste mit Abhaken |
| `Kalender.dc.html` | Kalender | Monat mit farbigen Punkten pro Person, Filter-Chips (Alle/Du/Sam/Lena/Familie), Tagesliste |
| `Termin.dc.html` | Termin | Farbiger Kopf, Konflikt-Hinweis, „Dein Plan“ als Zeitachse, Zusage, Kacheln für Chat/Kosten/Weg/Bereit-Check |
| `Personalisieren.dc.html` | Ich → Personalisieren | Akzentfarbe (4 geprüfte Paletten), Dichte, „Heute“ anordnen und ausblenden, Start-Ansicht |

Die Dateien sind im `.dc.html`-Format des Design-Canvas und dienen nur als Referenz; die App wird nach Freigabe in
`packages/ui` und `apps/mobile` umgesetzt.

## v2 (nach PO-Feedback vom 2026-11-12)

Feedback: Bereiche besser voneinander trennen, Seiten nicht textlich überladen; Kacheln und Navigationsarten aus
Referenz 1 (Icon-Chips, Pill-Tabs, Kennzahlen-Raster) und die cleane, nicht zu bunte Aufbereitung mit viel Weißraum
aus Referenz 2 übernehmen.

| Datei | Änderung |
| --- | --- |
| `HeuteV2.dc.html` | Weiße Karten auf warmem Weiß, Abschnitte mit Überschrift und „Alle ansehen“ (max. 3 Einträge), Icon-Chips als Bereichs-Filter, Helfer als kompaktes Banner, „Diese Woche“ als Kennzahlen-Kacheln inkl. Fahrdienst-Bilanz |
| `TerminV2.dc.html` | Kopf mit Wann/Wo-Kacheln, Pill-Tabs Plan · Leute · Chat · Kosten statt langer Seite, Kennzahlen-Kacheln führen in den passenden Tab |
| `KalenderV2.dc.html` | Ansicht Tag/Woche/Monat als Pill-Umschalter, Personen als Avatar-Chips, ruhiges Monatsraster mit einem Punkt pro Tag, Tagesliste mit Avatar und Zeit rechts |

Kategorie-Farben erscheinen in v2 nur noch als Punkt oder Avatar-Hintergrund; Lime bleibt der einzige kräftige Akzent.

### Ergänzt in `HeuteV2.dc.html` (PO: „die 5 Ideen auch mit einbauen“, 2026-11-12)

1. **Aktionsblatt von unten** statt neuer Seiten (Plus-Knopf, „Planen“ in freien Lücken, „Anpassen“).
2. **„Dein Tag in 10 Sekunden“** oben, ausblendbar; abends als Rückblick auf morgen (Tweak „Morgen/Abend“).
3. **Freie Zeit** als gestrichelte Zeile zwischen Terminen mit Vorschlag und „Planen“.
4. **Schnell-Eintrag** in einer Zeile („Freitag 19 Uhr Grillen bei Tom“) mit Live-Vorschau Was/Wann/Wo – regelbasiert, ohne KI.
5. **Wochen-Kacheln anpassbar**: bis zu 3 aus 6 Kennzahlen wählen.

## v3 – „Schlank“ (nach PO-Feedback vom 2026-11-13, **Mockup**)

Feedback: Die App wirkt trotz v2 noch überladen und unübersichtlich – sie soll sehr ausgeschlankt werden.

| Datei | Kernidee |
| --- | --- |
| `HeuteV3.dc.html` | Nur noch „Als Nächstes“ (eine Karte, ein grüner Knopf, Rest im „…“-Menü), Helfer als eine Zeile, Tag als einzeilige Zeitleiste (Uhrzeit · Titel · Haken), freie Zeit als feine Linie, „Morgen“ als Link |
| `KalenderV3.dc.html` | Monatsraster ohne Karte, Ansicht als Text-Tabs, Personen-Filter hinter einem „Alle ▾“-Knopf, Tagesliste einzeilig |
| `TerminV3.dc.html` | Titel, Zeit, Ort, Antwort, Losgehen – darunter eine ruhige Liste (Gäste, Mitbringliste, Aufgaben, Chat); leere Bereiche hinter „+ Hinzufügen“, Bearbeiten/Löschen im „…“-Menü |
| `GemeinsamV3.dc.html` | Oben nur, was auf dich wartet (offene Einladung mit Antwort-Knöpfen), darunter „Diese Woche“ als Liste |

Regeln: eine Hauptsache pro Screen · keine Kästen in Kästen (Abstand und feine Linien) · Grün nur für die eine
Hauptaktion, Tab-Leiste hell · Zeilen einzeilig, Details nur beim nächsten Termin · Nebenaktionen im „…“-Menü ·
Leeres ausblenden · Zusatzinfos (Tageszusammenfassung, Wochen-Kacheln) standardmäßig aus. Keine Funktion fällt weg.

## v4 – „Weich & groß“ (Referenz des PO vom 2026-11-13, **Mockup**)

PO: „geh mal in diese Richtung vom Layout her“ – Referenz mit weichen Pastell-Verläufen, einer großen Karte im
Fokus, großen Zahlen und runden, schwebenden Knöpfen. Übernommen wird nur die **Layout-Richtung**, keine fremden
Inhalte; ein Maskottchen gibt es nicht (Markenregel), stattdessen weiche Farbflächen. Die Schlank-Regeln aus v3
gelten weiter.

| Datei | Kernidee |
| --- | --- |
| `HeuteV4.dc.html` | Pastell-Verlauf oben, „Als Nächstes“ als große Karte mit Kartenstapel dahinter, riesige Losgeh-Zeit, runder Lime-Knopf „Bin unterwegs →“, darunter „Dein Tag auf einen Blick“ als zwei Kacheln + Helfer-Zeile |
| `KalenderV4.dc.html` | Tages-Picker wie ein Zahlenrad (gewählter Tag groß, Nachbarn kleiner), Termine als runde Karten mit großer Uhrzeit |
| `TerminV4.dc.html` | Verlauf-Kopf, Termin als große Karte im Fokus (leicht gestapelt), Antwort als drei runde Knöpfe, unten schwebende Leiste „Losgehen 18:28“ + runder Lime-Knopf |
| `GemeinsamV4.dc.html` | „Wartet auf dich“ als wischbares Karten-Karussell in Pastell, darunter „Deine Woche auf einen Blick“ |

## v5 und v6 verworfen (PO, 2026-11-13)

„v6, v5 gefällt mir nicht so gut, löschen“ – beide Reihen sind aus Canvas und Repo entfernt.

## v4 optimiert – „Wow“ + neue Navigation (PO, 2026-11-13, **Mockup**)

PO: „v4 finde ich insgesamt am besten, aber es fehlt noch ein Wow-Effekt; zeige weitere Seiten in der v4 und
optimiere. Navigation unten auch in diese Richtung anpassen von der Form her“ (Referenz: Leiste mit Mulde und rundem
Plus-Knopf in der Mitte).

| Datei | Neu / geändert |
| --- | --- |
| `HeuteV4.dc.html` | Lebendiger Hintergrund (Pastell-Flächen wandern langsam), **Karten-Stapel** „Danach“ blättert mit Feder-Animation durch die nächsten Aufbrüche, Lime-Knopf mit **Ring, der sich bis zur Losgeh-Zeit füllt**, **Tagesband** 6–24 Uhr mit pulsierendem „Jetzt“ |
| `LosV4.dc.html` | **Losgeh-Modus** (neu, über „Bin unterwegs“): fließender Farbverlauf, großer Countdown-Ring, Bereit-Check als Chips mit Plopp-Haken, „Ich verspäte mich um 5/10/15 Min.“ mit einem Tipp, „Angekommen“ |
| `FamilieV4.dc.html` | Familie (neu): Avatare mit Farbring für die gewählte Person, offene Fahrt als große Pastell-Karte („Ich fahre“ / „Sam fragen“), Einkauf und Ämtchen als Kacheln mit Fortschritt |
| `IchV4.dc.html` | Ich (neu): Pünktlichkeit „92 %“ mit wachsenden Säulen, **Farbwelt wählen** färbt den Kopf live um (Lavendel, Ozean, Pfirsich, Minze), Einstellungen als ruhige Zeilen |
| `KalenderV4.dc.html`, `GemeinsamV4.dc.html` | Neue Navigation; Gemeinsam mit Hinweis-Zeile zur Familie |

**Navigation:** weiße Leiste über die ganze Breite mit **Mulde in der Mitte**, darin ein runder violetter
Plus-Knopf; vier Ziele mit Symbol **und** Beschriftung (Heute, Kalender, Gemeinsam, Ich). Alle Bewegungen sind bei
„Bewegung reduzieren“ aus.

## v7 – Neuer Prototyp „Klar & farbig“ + erweiterte Kalender-Übersicht + Widgets (PO, 2026-11-13, **Mockup**)

PO: „nein, gefällt mir nicht – baue einen neuen Prototyp und gleichzeitig eine Idee für eine weitere
Kalenderübersicht, die erweitert ist und später auch als Widget auf Handys genutzt werden kann, passend zur App“
(Referenzen: Monatsraster mit Termin-Chips je Tag, Wochenansicht mit Zeilen pro Tag und farbigen Blöcken).

| Datei | Kernidee |
| --- | --- |
| `HeuteV7.dc.html` | Klares Weiß, große schwarze Schrift; Aufbruch als schwarze Leiste („07:55 los“), darunter der Tagesplan als Zeitraster mit farbigen Blöcken und „Jetzt“-Linie |
| `MonatV7.dc.html` | **Monat erweitert:** jeder Tag zeigt bis zu 2 Termine als Chips (Titel + Uhrzeit), „+n“ für mehr; Tag antippen öffnet die Tagesliste von unten |
| `WocheV7.dc.html` | **Woche erweitert:** Wochen-Wähler oben, eine Zeile pro Tag, Termine als Blöcke nebeneinander, heutiger Tag mit „Jetzt“-Linie |
| `WidgetsV7.dc.html` | **Widgets** im selben Look: klein (Losgeh-Zeit / Tag), mittel (heute), groß (Woche), Sperrbildschirm (Countdown-Ring, Zeile) |

Farben: Termine als Pastell-Fläche mit dunkler Schrift derselben Farbe (gut lesbar); heute = schwarz mit Lime.
Technik für später: echte Widgets brauchen ein natives Zusatzmodul (iOS WidgetKit, Android App-Widget) und eine
geteilte Datenablage zwischen App und Widget – das ist eine neue Abhängigkeit und wird vor dem Bau mit dem PO geklärt.
