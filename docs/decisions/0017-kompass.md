# ADR 0017 – „Kompass“: Jetzt-Kugel, Schreibleiste, drei Tabs

> **Status:** akzeptiert · 2026-11-14 · Richtung vom PO am 2026-11-14 gewählt („Kompass komplett“), Umsetzung in
> Phasen 11–15 mit Freigabe nach jeder Phase. Konzept (Mockup):
> [`docs/product/overview/nowish-kompass.html`](../product/overview/README.md), Detail Zoom-Kalender:
> `nowish-zoom.html`.

## Kontext

Nach mehreren Design-Runden (v2–v7) fand der PO die App weiterhin zu überladen und bat um ein komplett neues Konzept:
einfache Bedienung, modernes, neuartiges Design, Premium-Funktionen. Das Konzept „Kompass“ stellt eine Frage in den
Mittelpunkt – **„Wie viel Zeit habe ich noch?“** – und ordnet alles andere unter.

## Entscheidung

1. **Ein Verlauf mit fester Bedeutung.** Sonnenaufgang (Orange) heißt in der App „jetzt“ bzw. ist die eine
   Hauptaktion. Auswahl-Zustände (Tabs, Segmente, Datumspillen) sind Tinte, Ruhe ist Periwinkle. Grund ist kühles
   Nebelweiß, Text Indigo-Tinte; das dunkle Thema ist ein Indigo-Nachtton. Alle Paare bleiben per Test WCAG AA.
2. **Jetzt-Kugel (`Orb`)** ersetzt die Losgeh-Karte: ruhig blau, solange Zeit ist; Sonnenaufgang in den letzten
   30 Minuten. Die Kugel zeigt Minuten (ab einer Stunde `1:40`), darüber steht ein Satz in Klartext. Farbe ist nie
   der einzige Hinweis; die Kugel hat ein vollständiges Sprach-Label und atmet nur ohne „Bewegung reduzieren“.
   Außerhalb des 3-Stunden-Fensters zählt sie zum nächsten Termin von heute oder morgen (`nextUp`).
3. **Schreibleiste statt Plus-Knopf.** Die Leiste unten (`FloatingTabBar` als Dock) hat drei Symbol-Tabs und ein
   Feld „Was steht an?“; es öffnet den Schnell-Eintrag in einer Zeile (ADR 0016). Tab-Namen bleiben für
   Screenreader erhalten.
4. **Drei Tabs: Jetzt · Kalender · Leute.** „Ich“ (Profil, Einstellungen) liegt hinter dem Avatar oben rechts in
   jedem Tab (`AccountButton`). Die Route `/settings` bleibt bestehen.
5. **Ruhe zuerst.** Tageszusammenfassung und Wochen-Kacheln sind standardmäßig ausgeblendet und unter
   „Personalisieren“ einschaltbar. Bestehende Einstellungen der Nutzer:innen bleiben unverändert.
6. **Akzentfarbe bleibt wählbar** (Sonnenaufgang neu als Standard, Lime, Ozean, Koralle, Lavendel weiter verfügbar).

## Folgen

- Entfernt: `LeaveHero`, `Fab` (ersetzt durch `Orb` und das Dock).
- Schrift bleibt Bricolage Grotesque + Inter (PO-Entscheidung 2026-11-14) – keine neue Abhängigkeit für Sora.
- Offen für die nächsten Phasen: Zoom-Kalender (12), Termin als Satz / Lückentext-Editor und Tag als Faden (13),
  Leute-Seite, Einladungskarte, Wärmekarten-Umfrage (14), Morgen-Briefing, Puffer-Coach, Ruhe-Modus (15).
  Live-Ankunft, Widgets, Uhr brauchen Konten bzw. native Module und bleiben in Block B.
- Premium-Zuordnung der neuen Funktionen ist ein Vorschlag und wird vor Phase 15 mit dem PO festgelegt.
