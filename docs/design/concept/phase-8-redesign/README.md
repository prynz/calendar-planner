# Phase 8 – Redesign-Konzept (**Mockup**)

> **Status:** 2026-11-13 · v3 „Schlank“ ergänzt · **Mockup zur Abnahme durch den PO – keine App-Screenshots.** Alle Daten sind erfunden.
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
