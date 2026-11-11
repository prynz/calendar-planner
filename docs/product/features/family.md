# Modul 11 – Familie

> **Status:** v0.2 · 2026-11-11 · **Prototyp umgesetzt (Phase 5, lokal + simuliert, [ADR 0014](../../decisions/0014-family-groups-local.md)):**
> FAM-01 (Einladen als Demo), FAM-02, FAM-03, FAM-04 (inkl. Konfliktwarnung), FAM-05, FAM-06 (lokal, „Echtzeit“ simuliert),
> FAM-07, FAM-09. Offen: FAM-08 Ferien/Feiertage (Datenquelle + Lizenz), Hinweis 24 h vorher bei offener Fahrt (Push, Block B2),
> Austritt/Rollenwechsel. Entscheidung zur offenen Frage: Kinderprofile zählen zu den 6 Personen (vorläufig, ADR 0014).

## User Stories

| ID | Als … | möchte ich … | damit … |
| --- | --- | --- | --- |
| FAM-01 | Familien-Admin | einen Familienbereich anlegen und Erwachsene einladen (max. 6 Personen im Family-Abo) | wir gemeinsam planen |
| FAM-02 | Familien-Admin | Kinderprofile **ohne Account** anlegen (nur Anzeigename + Farbe + optional Emoji) | Kindertermine zugeordnet sind |
| FAM-03 | Elternteil | einem Termin ein oder mehrere Familienmitglieder zuordnen | klar ist, wen es betrifft |
| FAM-04 | Elternteil | Fahrdienste planen: „Wer bringt? Wer holt?“ | niemand vergessen wird |
| FAM-05 | Elternteil | offene Fahrdienste der Woche auf einen Blick sehen | ich Lücken erkenne |
| FAM-06 | Familie | eine gemeinsame Einkaufsliste mit Echtzeit-Updates | nichts doppelt gekauft wird |
| FAM-07 | Familie | Haushaltsämtchen mit Rotation | es fair verteilt ist |
| FAM-08 | Elternteil | Schulferien/Feiertage importieren (Bundesland wählen) | ich nichts eintippe |
| FAM-09 | Elternteil | eine Heatmap „Familienwoche“ (Auslastung pro Tag) | ich volle Tage sehe |

## Akzeptanzkriterien

- Kinderprofile speichern **kein Geburtsdatum, keine Fotos von Gesichtern als Pflicht, keine Kontaktdaten**.
  Sie haben keinen Login und können nicht eingeladen werden. Sie sind nur für Mitglieder des Familienbereichs sichtbar.
- Fahrdienst: pro Termin `drop_off_by` / `pick_up_by` (Erwachsener). Nicht zugewiesen → Hinweis 24 h vorher an alle Erwachsenen.
- Konflikte: Erwachsener hat zur Fahrdienst-Zeit einen eigenen Termin → Warnung.
- Ferien/Feiertage: ICS-Quellen pro Bundesland (Quelle und Lizenz in Phase 7 prüfen, z. B. offizielle Kultusministerien
  oder offene Datensätze); als schreibgeschützter Kalender abonniert.
- Rollen: Familien-Admin (verwaltet Mitglieder, Abo), Erwachsener. Ein Nutzer kann max. 1 Familienbereich angehören (v1).
- Austritt eines Erwachsenen: eigene Termine bleiben beim Nutzer, Familien-Termine bleiben in der Familie.

## Zustände

Leer: „Noch allein hier? Lade deine Familie ein 🏡“. Kind ohne Termine: Profil mit „Termin für Lena anlegen“.

## Free / Premium

Familienbereich auch in Free (2 Erwachsene, 2 Kinderprofile, Einkaufsliste). Family-Abo: bis 6 Personen inkl. Kinderprofilen,
volle Anti-Chaos-Engine für alle Erwachsenen, Fahrdienste voll, 25 GB geteilt.
Offene Frage an PO: Zählen Kinderprofile zu den 6 Personen?
