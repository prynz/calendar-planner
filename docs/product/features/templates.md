# Modul 13 – Vorlagen

> **Status:** v0.1 · 2026-11-03 · Spezifikation (Entwurf). Umsetzung: Phase 4 (kuratiert), eigene Vorlagen Phase 9.

## Kuratierte Vorlagen (v1)

Geburtstag · Grillen · Spieleabend · Festival · Urlaub · Umzug · JGA · Kindergeburtstag · Weihnachten ·
Arzttermin · Behördengang. Hochzeit folgt später (sehr umfangreich).

Jede Vorlage enthält: Kategorie/Farbe, Cover, Standard-Dauer, Vorbereitungszeit und Ankunfts-Puffer
(Anti-Chaos), Aufgaben mit relativen Fälligkeiten („−7 Tage: Einladung verschicken“), Mitbringliste,
Bereit-Check-Items (z. B. Behördengang: „Personalausweis, Meldebescheinigung, Termin-Bestätigung“),
optional Umfrage-Vorschlag.

## User Stories

| ID | Als … | möchte ich … | damit … |
| --- | --- | --- | --- |
| TPL-01 | Host | beim Event-Anlegen eine Vorlage wählen | ich nicht bei null anfange |
| TPL-02 | Host | vorbefüllte Inhalte vor dem Übernehmen abwählen | nur Passendes übernommen wird |
| TPL-03 | Nutzer | ein Event als eigene Vorlage speichern (Plus+) | ich es wiederverwende |
| TPL-04 | Pro-Nutzer | eigene Vorlagen per Link teilen | Freunde profitieren |
| TPL-05 | Content-Editor | Vorlagen im Admin pflegen (DE/EN, Version, an/aus) | Inhalte ohne App-Update wachsen |

## Akzeptanzkriterien

- Vorlagen sind **versioniert**; ein Event speichert, aus welcher Version es entstand (keine Rückwirkung auf bestehende Events).
- Vorlagentexte über i18n (`templates.<slug>.<field>`); Admin-Vorlagen haben DE + EN Pflichtfelder.
- Relative Fälligkeiten werden zur Event-Zeit aufgelöst (Paket `domain`).

## Free / Premium

Free: kuratierte Basis (6 Vorlagen). Plus: alle + eigene. Pro: + teilen. Family: alle.
