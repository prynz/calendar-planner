# PROJECT BRIEF – PLANLOS (Arbeitstitel)

> **Status:** v0.1 · 2026-11-03 · Ergebnis von Phase 0, **Entwurf zur Freigabe durch den PO**.
> Quelle: [MASTER_PROMPT.md](MASTER_PROMPT.md). Offene Punkte: [Milestone-Report Phase 0](docs/previews/milestone-reports/phase-0.md).

## 1. Vision

**Eine Planungs-App für alle, die sonst planlos sind.** Kalender, Terminplaner und Event-Organisator in
einem. Alles, was zu einem Termin gehört, liegt an **einem Ort**: Infos, Umfragen, Chat, Ort/Karte,
Aufgaben, Mitbringliste, Kosten, Dokumente und Erinnerungen.

Claim-Entwürfe: DE _„Du chillst. Wir planen.“_ · _„Endlich pünktlich. Ohne Stress.“_ —
EN _„You show up. We handle the rest.“_

Grundhaltung: hilfreich, warm, augenzwinkernd. **Keine manipulativen Mechaniken.**

## 2. Problem

Planung ist heute auf viele Apps verteilt: Kalender, Doodle/Rallly, WhatsApp-Gruppe, Splitwise,
Notizen, Google Maps. Das kostet Organisatoren Zeit und Nerven, und Infos gehen verloren. Bestehende
Kalender sagen dir, **wann** etwas anfängt. Sie sagen dir nicht, **wann du losmusst**, was du
mitnehmen sollst und wer noch nicht zugesagt hat. Belege: [market-research.md](docs/product/market-research.md).

## 3. Zielgruppen

Details mit Jobs-to-be-done: [personas.md](docs/product/personas.md).

| Persona          | Kernproblem                                              | Was PLANLOS für sie tut                            |
| ---------------- | -------------------------------------------------------- | -------------------------------------------------- |
| Chaos-Chris      | Vergisst Termine, unterschätzt Wegzeiten                 | Losgeh-Zeit, gestufte Erinnerungen, Bereit-Check   |
| Orga-Olivia      | Läuft Zusagen, Geld, Mitbringseln hinterher              | RSVP mit Frist, Mitbringliste, Kosten, Deadlines   |
| Familien-Frank   | Fahrdienste, Einkauf, kollidierende Termine              | Familienbereich, Kinderprofile, Fahrdienste        |
| ADHS-Alex        | Zeitblindheit, Überforderung                             | Fokus-Modus, sichtbare Zeit, Mikroschritte         |
| Gast-Gabi        | Will keine App installieren                              | Web-Link: zusagen, abstimmen, mitbringen           |

## 4. USPs (Kern der Marke)

1. **Anti-Chaos-Engine:** plant rückwärts vom Termin – Losgeh-Zeit (Wegzeit + persönlicher Puffer +
   Vorbereitung), eskalierende Erinnerungen, Bereit-Check, „Ich verspäte mich“ mit 1 Tap.
2. **Kompletter Event-Lebenszyklus:** Idee → Terminfindung → Einladung → Planung → Durchführung → Nachbereitung.
3. **Gäste ohne App-Zwang:** sicherer Web-Link für Zusage, Abstimmung, Mitbringliste.
4. **Entscheidungen, die enden:** Umfragen mit Deadline, „Vielleicht“ läuft ab.
5. **Fokus-Modus** für neurodivergente Menschen (eigenständiger Modus, nicht nur ein Theme).
6. **Familien-Logistik** mit Kinderprofilen ohne Account.
7. **Datenschutz als Feature:** EU-Hosting, keine Werbe-Tracker, transparente Datenübersicht.

## 5. Scope

Priorisierung nach MoSCoW mit Begründung: [roadmap.md §2](docs/product/roadmap.md).

**v1 (öffentlicher Launch, Phasen 1–8 + 10):** Accounts, persönlicher Kalender inkl. Wiederholungen und
ICS, Events mit Rollen und RSVP, Gast-Web-Link, Basis-Vorlagen, Chat, Umfragen mit Deadline, Aufgaben,
Mitbringliste, Dateien, Anti-Chaos-Engine (inkl. Wegzeit), Familie und Gruppen, Kalender-Sync
(Google, Outlook, iCloud), Abos + transparente Paywall, Admin-Dashboard, House Ads, DE + EN.

**v1.x (Phase 9):** Kosten-Split, Wetter/Plan B, Mitfahren, Erinnerungs-Album, Premium-Themes.

**Später (v2+):** KI-Assistent, Widgets/Live Activities in voller Tiefe, Smartwatch, QR-Check-in,
rotierende Gruppen-Rituale, Geschenke-Pool, Vereins-Funktionen, E2E-verschlüsselter Chat, weitere Sprachen inkl. RTL.

**Nicht geplant:** eigene Zahlungsabwicklung, externe Werbe-SDKs, öffentliche Event-Discovery/Ticketing.

## 6. Erfolgsmetriken

Alle Kennzahlen werden **aggregiert** und ohne personenbezogenes Tracking erhoben (siehe
[privacy.md](docs/security/privacy.md)). Zielwerte sind Startannahmen, die nach der Beta neu kalibriert werden.

| Bereich        | Metrik                                                                 | Startziel (12 Mon. nach Launch) |
| -------------- | ---------------------------------------------------------------------- | ------------------------------- |
| Aktivierung    | Anteil neuer Nutzer mit ≥ 1 Termin oder Event in den ersten 7 Tagen    | ≥ 60 %                          |
| Viralität      | Ø Gäste pro Event · Anteil Gäste, die später ein eigenes Konto anlegen | ≥ 5 · ≥ 8 %                     |
| USP-Nutzung    | Anteil Termine mit Ort, für die eine Losgeh-Zeit genutzt wird          | ≥ 40 %                          |
| Pünktlichkeit  | Selbstauskunft „rechtzeitig da“ bei Events mit Anti-Chaos (opt-in)     | Trend steigend                  |
| Retention      | D30 Retention                                                          | ≥ 25 %                          |
| Monetarisierung| Conversion Free → zahlend (Trial-Start → Abo)                          | 3–5 % aller aktiven Nutzer      |
| Zufriedenheit  | Store-Bewertung                                                        | ≥ 4,5                           |
| Vertrauen      | Datenschutz-Beschwerden / Sicherheitsvorfälle                          | 0 meldepflichtige Vorfälle      |

## 7. Monetarisierung (Kurzfassung)

Free / Plus / Pro / Family über Apple IAP und Google Play Billing (RevenueCat), interne House Ads nur
für Free-Nutzer. Gast-Funktionen sind immer kostenlos. Details: [monetization.md](docs/product/monetization.md).

## 8. Rahmenbedingungen

- Launch-Markt: DACH zuerst (DE/EN), Architektur international.
- Mindestalter-Vorschlag **16+** ([ADR 0004](docs/decisions/0004-minimum-age.md)); Kinderprofile ohne Login.
- EU-Hosting (Supabase Frankfurt, [ADR 0002](docs/decisions/0002-backend-supabase-eu.md)).
- Rechtstexte sind Entwürfe; die Rechtsprüfung übernimmt der PO.

## 9. Größte Risiken

1. **Scope:** Das Produkt vereint Funktionen von 6–8 bestehenden Apps. Gegenmittel: strikte Phasen,
   MoSCoW, Event-Herzstück zuerst.
2. **Netzwerkeffekt / Kaltstart:** Ein Social-Planner braucht Gäste. Gegenmittel: Gast-Web-Link ohne
   App-Zwang, nützlicher Solo-Kalender.
3. **Kalender-Sync-Komplexität** (drei Anbieter, Konflikte, Quoten, Google-OAuth-Verifizierung).
4. **Kosten für Routing/Wegzeit-APIs** bei vielen Losgeh-Berechnungen ([ADR 0005](docs/decisions/0005-maps-routing-provider.md)).
5. **Rechtliches:** DSGVO (Standort, Kinderdaten), Store-Richtlinien, Markenrecht beim Namen.
