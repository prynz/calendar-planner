# Modul 2 – Events (Herzstück)

> **Status:** v0.2 · 2026-11-10 · **Prototyp umgesetzt (Phase 3, lokal simuliert):** EVT-01 (Was · Wann · Wer, auch aus
> Vorlagen), EVT-02 (Terminumfrage), EVT-03 (Demo-Kontakte), EVT-04 (ja/vielleicht/nein, +1), EVT-05 (Frist für
> „Vielleicht“), EVT-08 (Bento-Übersicht). Offen: Co-Hosts (EVT-06), Kapazität/Warteliste (EVT-07), Änderungs-Diff
> (EVT-09), Absagen mit Nachricht (EVT-10), EVT-11/12, Notiz zur Antwort, Shared-Element-Übergang, Erinnerung 24 h vor
> der „Vielleicht“-Frist.

**Ziel:** Ein Event ist der Ort, an dem **alles** zu einem Treffen lebt. Lebenszyklus:
Idee → Terminfindung → Einladung → Planung → Durchführung → Nachbereitung.

## Datenumfang

Titel, Cover (Bild, Farbe oder Theme), Beschreibung, Zeit **oder** Zeitfenster/Terminumfrage, Ort,
Rollen (Host, Co-Host, Gast), Sichtbarkeit (privat · per Link · Gruppe), Kapazität, Dresscode, Notizen,
Kategorie (bestimmt Pastellfarbe), Status (`draft`, `planning`, `confirmed`, `live`, `done`, `cancelled`).

## User Stories

| ID | Als … | möchte ich … | damit … |
| --- | --- | --- | --- |
| EVT-01 | Host | ein Event in 3 Schritten anlegen (Was · Wann · Wer), Rest später | ich schnell starte |
| EVT-02 | Host | statt einer Zeit eine Terminumfrage starten | wir gemeinsam finden (→ polls) |
| EVT-03 | Host | Gäste per Kontakt, Gruppe oder Link einladen | auch Nicht-Nutzer dabei sind |
| EVT-04 | Gast | Ja / Vielleicht / Nein antworten, optional +1 und Notiz | der Host planen kann |
| EVT-05 | Host | eine Frist für „Vielleicht“ setzen | ich verlässliche Zahlen habe |
| EVT-06 | Host | Co-Hosts ernennen | ich nicht allein organisiere |
| EVT-07 | Host | Kapazität setzen; danach Warteliste | Plätze fair vergeben werden |
| EVT-08 | Teilnehmer | eine Event-Übersicht mit Bento-Kacheln (Zeit, Ort, Zusagen, Aufgaben, Mitbringliste, Kosten, Chat) | ich alles auf einen Blick sehe |
| EVT-09 | Host | wichtige Änderungen (Zeit/Ort) mit Benachrichtigung an alle | niemand falsch erscheint |
| EVT-10 | Host | absagen mit Nachricht | Gäste informiert sind |
| EVT-11 | Teilnehmer | nach dem Event „Nächstes Mal wieder?“ | Rituale entstehen |
| EVT-12 | Teilnehmer | das Event in meinen Kalender exportieren (ICS) | es auch im Systemkalender ist |

## Akzeptanzkriterien

- **„Vielleicht“ läuft ab:** Mit Frist `maybe_deadline`. 24 h vorher wird einmal freundlich erinnert.
  Danach wird der Status zu `no_response` (nicht automatisch „Nein“), und der Host sieht die Liste.
- Der Host sieht die Zusagen als **Zahlen + Avatar-Stapel**. Gäste sehen nur, was der Host freigibt
  (Option „Gästeliste sichtbar“).
- Zeit- oder Ortsänderung bei `confirmed` Events: Diff-Ansicht („vorher → jetzt“) für Teilnehmer.
- Rollenrechte (serverseitig): Host = alles; Co-Host = alles außer löschen und Host übertragen;
  Gast = eigene Antwort, Chat, Mitbringliste, Aufgaben übernehmen, Votes.
- Limits laut Abo des **Hosts** (aktive Events, Teilnehmer). Gäste zahlen nie.
- Shared-Element-Übergang Karte → Detail (Reduced Motion: Crossfade).

## Zustände

- **Leer:** „Noch keine Pläne? Zeit, was zu starten 🎈“ + „Event erstellen“ + „Vorlage wählen“.
- **Fehler:** Einladung fehlgeschlagen pro Empfänger anzeigen.
- **Offline:** Event lesbar; RSVP wird in Outbox gelegt und als „wird gesendet“ markiert.

## Free / Premium

Free: 5 aktive gehostete Events, 15 Teilnehmer, 1 Co-Host. Plus: unbegrenzt/50/3. Pro: unbegrenzt/250/∞.

## Sicherheit

Einladungslinks: siehe [guest-web.md](guest-web.md). Rate-Limit für Einladungen (z. B. 200/Tag/Host),
um Spam zu verhindern.
