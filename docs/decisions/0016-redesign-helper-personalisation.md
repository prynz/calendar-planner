# ADR 0016 – Redesign: ruhige Bereiche, regelbasierter Helfer, Personalisierung

> **Status:** vorgeschlagen · 2026-11-12 · Phase 8 (Richtung vom PO am 2026-11-12 freigegeben: Konzept v2 + 5 Ideen)

## Kontext

Nach Block A hat der PO die gesammelten Änderungswünsche gegeben: Lesbarkeit, Übersicht und einfache Bedienung,
moderne und nicht zu bunte Optik, flüssige Animationen, Personalisierung (Anordnung, Farben, Start-Ansicht) und die
App als **persönlicher Helfer**, der Überschneidungen und Konflikte bemerkt. Das Konzept (Mockup,
[`docs/design/concept/phase-8-redesign/`](../design/concept/phase-8-redesign/README.md)) wurde in zwei Runden
abgestimmt: Stilrichtung „Lime + Pastell“, Bereiche klar getrennt, Icon-Chips und Pill-Tabs, viel Weißraum.

## Entscheidung

1. **Ein Container-Typ:** weiße Karten (`SoftCard`, `ListCard`) auf warmem Weiß (`paper`) mit weichem Schatten im
   hellen Thema. Kategorien erscheinen nur als Punkt, Icon oder Avatar – keine bunten Flächen mehr in Listen.
   Lime (bzw. die gewählte Akzentfarbe) ist die einzige kräftige Farbe pro Screen.
2. **Bereiche statt Textwand:** jeder Bereich hat eine Überschrift (`SectionHeader`) und zeigt höchstens drei
   Einträge; der Rest liegt hinter „Alle ansehen“. Gemeinsame Events teilen sich in die Tabs **Plan** und
   **Gemeinsam** (`PillTabs`). Filter sind runde Icon-Chips, nur der aktive zeigt die Beschriftung (`FilterChips`).
3. **Der Helfer ist regelbasiert, ohne KI** (`packages/domain/src/planning`): `findConflicts` erkennt
   Überschneidungen und knappe Übergänge (Losgehen für B vor dem Ende von A) und liefert fertige Lösungen;
   `freeGaps` findet echte freie Zeit (Weg und Vorbereitung zählen als belegt); `parseQuickEntry` liest Tag,
   Uhrzeit und Ort aus einer deutschen oder englischen Zeile. Eigene, nicht wiederholte Termine verschiebt der Helfer
   direkt; Termine anderer kann man nur anfragen – im Prototyp klar als „(Demo)“ gekennzeichnet.
4. **Personalisierung ist kostenlos** (keine Paywall für Grundbedienung): vier Akzentfarben, jede Kombination mit
   Hell/Dunkel per Test auf WCAG AA geprüft; Dichte „Luftig/Kompakt“; Reihenfolge und Sichtbarkeit der Bausteine von
   „Heute“ per Pfeil-Knöpfen (keine reine Ziehgeste – barrierefrei); Start-Ansicht; bis zu drei Wochen-Kacheln.
5. **Aktionsblätter von unten** (`BottomSheet`) statt neuer Seiten für schnelle Aufgaben (Schnell-Eintrag,
   Kacheln wählen). Animation über Reanimated auf dem UI-Thread; bei „Bewegung reduzieren“ ohne Bewegung.
6. **Demo-Welt:** ein Termin „Friseur“ endet knapp nach der Losgeh-Zeit zum Spieleabend, damit der Helfer in der
   Demo immer etwas zu zeigen hat.

## Alternativen

- **KI-Assistent** für Konflikte und Schnell-Eintrag: verworfen für jetzt (Datenschutz, Kosten, Anbieterwahl offen;
  Roadmap §5). Die Schnittstellen erlauben später eine KI hinter derselben Funktion.
- **Drag & Drop** zum Anordnen: verworfen, weil schwer barrierefrei; Pfeil-Knöpfe sind gleichwertig und testbar.
- **Freie Farbwahl:** verworfen; feste, geprüfte Paletten garantieren Lesbarkeit.

## Folgen

- Bestehende Screens bekommen das neue Grundgerüst über das Thema (warmes Weiß, weiße Karten) automatisch;
  „Heute“, Kalender, Termin und Personalisieren sind umgebaut. Weitere Screens (Events-Liste, Familie, Gruppen)
  folgen schrittweise.
- Der Plus-Knopf öffnet den Schnell-Eintrag statt des Editors; „Mehr Details“ führt mit vorausgefüllten Feldern
  in den Editor.
- Mit echten Konten (B1/B2) wird „Anfragen“ eine echte Nachricht an die Gastgeber:in.
