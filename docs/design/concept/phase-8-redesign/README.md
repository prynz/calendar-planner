# Phase 8 – Redesign-Konzept (**Mockup**)

> **Status:** 2026-11-12 · **Mockup zur Abnahme durch den PO – keine App-Screenshots.** Alle Daten sind erfunden.
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
