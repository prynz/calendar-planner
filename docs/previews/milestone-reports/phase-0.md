# Milestone-Report Phase 0 – Discovery & Fundament

> **Status:** 2026-11-03 · Phase 0 abgeschlossen · **Stopp – wartet auf Review und Freigabe durch den PO.**

## 1. Ergebnis in einem Satz

Die komplette Dokumentationsbasis steht (Produkt, Markt, Marke, Design, Architektur, Datenmodell, Sicherheit,
Datenschutz, ADRs). **Es wurde bewusst kein App-Code geschrieben.**

## 2. Was fertig ist

| Lieferobjekt | Datei | Bemerkung |
| --- | --- | --- |
| Project Brief | [PROJECT_BRIEF.md](../../../PROJECT_BRIEF.md) | Vision, Zielgruppen, USPs, Scope v1/später, Metriken, Risiken |
| Arbeitsregeln | [CLAUDE.md](../../../CLAUDE.md) | Regeln aus §11, Monorepo-Karte; Befehle erst ab Phase 1 |
| Marktanalyse | [market-research.md](../../product/market-research.md) | 14 Wettbewerber, Preis-Benchmark, Beschwerdemuster, Quellen mit Belastbarkeit H/D/U |
| Personas | [personas.md](../../product/personas.md) | 5 Personas mit JTBD, Pain Points, Metrik |
| Feature-Specs | [features/](../../product/features/README.md) | 15 Module mit User Stories, Akzeptanzkriterien, Zuständen, Free/Premium |
| Roadmap & MoSCoW | [roadmap.md](../../product/roadmap.md) | Priorisierung mit Begründung, Abhängigkeiten |
| Monetarisierung | [monetization.md](../../product/monetization.md) | Abo-Matrix, Paywall-Regeln, House Ads inkl. Tabu-Zonen, Comp-Abos |
| Brand Foundation | [brand-foundation.md](../../brand/brand-foundation.md) | 5 Namensvorschläge, Werte, Stimme, Logo-/Maskottchen-Idee |
| Design-System | [design-system.md](../../design/design-system.md) | Token-Entwurf, **berechnete Kontrast-Matrix**, Motion, Komponenteninventar, QA-Checkliste |
| Architektur | [overview.md](../../architecture/overview.md) | Systembild, Vertrauensgrenzen, Offline/Outbox, Benachrichtigungen, Sync |
| Datenmodell | [data-model.md](../../architecture/data-model.md) | ERD, ~50 Tabellen, RLS-Hilfsfunktionen, Policy-Matrix, Aufbewahrung |
| Threat Model | [threat-model.md](../../security/threat-model.md) | STRIDE für 10 Komponenten, Top-5-Risiken |
| Datenschutz | [privacy.md](../../security/privacy.md) | Datenarten, Rechtsgrundlagen (Entwurf), Fristen, SDK-Liste |
| ADRs | [decisions/](../../decisions/README.md) | 0001–0006 |

**Design-Referenzen:** Alle 5 Originaldateien liegen in `docs/design/references/` und wurden gesichtet. Die Analyse
in Master Prompt §5.1 stimmt mit den Bildern überein. Es fehlt nichts.

## 3. Was nicht fertig ist / bewusst offen (ehrlich)

- **Keine Nutzerinterviews.** Personas sind Hypothesen.
- **Marktrecherche** stützt sich teils auf Drittquellen; DE-Store-Preise in € nicht verifiziert; Store-Reviews nicht systematisch ausgewertet.
- **Konzept-Mockups** gibt es noch nicht (laut Roadmap Phase 1, Ablage `docs/design/concept/`, gekennzeichnet als Mockup).
- **Logo, App-Icon, Maskottchen** nur als Beschreibung.
- **Rechtstexte** (Datenschutzerklärung, AGB, Impressum) nicht erstellt. Nur das technische Datenschutzkonzept existiert.
- **Markenprüfung** der Namen nicht durchgeführt (Sache des PO).
- Versionen (Expo SDK usw.) werden erst zu Beginn von Phase 1 fixiert.
- Typecheck/Lint/Tests/Build: **nicht anwendbar**, da es keinen Code gibt. Geprüft wurde, dass alle internen Doku-Links auflösen.

## 4. Wichtigste Entscheidungen (zur Bestätigung)

1. Stack wie vorgeschlagen, präzisiert (i18next + ICU, getrennte Next.js-Apps für Gast-Web und Admin) – ADR 0001.
2. Supabase Frankfurt, Migrationspfad zu self-hosted offen gehalten – ADR 0002.
3. RevenueCat, Entitlements nur aus unserer DB – ADR 0003.
4. Mindestalter 16+, Alters-Bestätigung statt Geburtsdatum – ADR 0004.
5. Persönliche Termine und Events in **einer** Tabelle; Gäste ohne DB-Identität, nur über Edge Functions – ADR 0006.
6. **Free:** persönlicher Kalender unbegrenzt, Fokus-Modus und Live-ETA für alle (Barrierefreiheit/Sicherheit kein Premium-Hebel).
7. Trial **14 Tage** mit Erinnerung 3 Tage vor Ablauf.
8. Live-ETA teilt **nie Koordinaten**, nur Ankunftszeit.
9. Violett `#7C5CFF` ist **kein** Textfarben-Token (4,44 : 1) → Text in `violet.300`/`violet.700`. Lime nie als Text auf Creme.

## 5. Risiken

| Risiko | Wirkung | Gegenmaßnahme |
| --- | --- | --- |
| Scope (6–8 Apps in einer) | Verzögerung | MoSCoW, strikte Phasen-Gates |
| Kaltstart/Netzwerkeffekt | wenig Wachstum | Gast-Web, Solo-Nutzen |
| Kalender-Sync (Google-OAuth-Verifizierung) | Wochen Verzögerung | Antrag früh, EventKit lokal für iOS |
| Routing-Kosten | Marge | Kontingente, Caching, manuelle Wegzeit |
| iOS-Limit 64 lokale Notifications / Android Exact Alarms | unzuverlässige Erinnerungen | Scheduler mit Nachplanung, Silent Push, ehrliche UI |
| US-Anbieter (Supabase/AWS, RevenueCat) | DSGVO-Bewertung | Rechtsprüfung, Migrationspfad |
| Name nicht schützbar („planlos“ beschreibend) | Rebranding | frühe Markenprüfung, Name zentral in `packages/brand` |

## 6. Offene Fragen an den PO (priorisiert, max. 10)

1. **Name:** Bleibt es für den DACH-Launch bei „PLANLOS“, oder soll einer der 5 Vorschläge (Empfehlung international: *Leavo*) in die Markenprüfung? Davon hängt die Bundle-ID ab, die vor dem ersten Store-Upload final sein muss.
2. **Anti-Chaos-Basis vorziehen:** Einverstanden, Losgeh-Zeit mit manueller Wegzeit + Stufen + Bereit-Check schon in Phase 3 zu bauen (roadmap.md §3)?
3. **Preise:** Family 7,99 €/64,99 € (Entwurf) oder 6,99 €/59,99 € (Empfehlung)? Trial 14 Tage ok? Zählen Kinderprofile zu den 6 Family-Personen?
4. **Mindestalter 16+** ok? Rechtsprüfung beauftragen?
5. **Karten/Routing:** Darf Google (Places/Routes) genutzt werden, oder sollen EU-Anbieter (HERE/TomTom) bevorzugt werden, auch wenn das mehr kostet?
6. **KI-Assistent:** Bestätigung, dass er nicht in v1 kommt? Gibt es einen bevorzugten Anbieter mit EU-Verarbeitung?
7. **Zahlungs-Deep-Links** (PayPal.me o. ä.) im Kosten-Modul: rechtlich prüfen lassen, oder vorerst weglassen?
8. **Hosting Gast-Web/Admin:** Vercel (EU-Region) ok, oder EU-Anbieter/self-hosted?
9. **Maskottchen „Tick“:** gewünscht? Wenn ja, Illustrator extern oder intern?
10. **Launch-Markt & Konten:** Nur DACH zum Start? Liegen Apple-Developer- und Google-Play-Konten (Organisation, D-U-N-S) schon vor?

## 7. Nächster Schritt

Nach Freigabe: **Phase 1 – Projekt-Setup** (Monorepo, Tooling, CI für iOS + Android, Env-Validierung, Supabase
lokal, i18n-Gerüst, Tokens in `packages/ui`, gekennzeichnete Konzept-Mockups der Kernscreens).
