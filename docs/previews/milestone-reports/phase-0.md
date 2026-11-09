# Milestone-Report Phase 0 – Discovery & Fundament

> **Status:** 2026-11-09 · Phase 0 abgeschlossen · Review: Fragen 1–7, 9, 10 entschieden, Frage 8 offen.

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
| Brand Foundation | [brand-foundation.md](../../brand/brand-foundation.md) | Name Nowish, Werte, Stimme, Logo-Idee |
| Design-System | [design-system.md](../../design/design-system.md) | Token-Entwurf, **berechnete Kontrast-Matrix**, Motion, Komponenteninventar, QA-Checkliste |
| Architektur | [overview.md](../../architecture/overview.md) | Systembild, Vertrauensgrenzen, Offline/Outbox, Benachrichtigungen, Sync |
| Datenmodell | [data-model.md](../../architecture/data-model.md) | ERD, ~50 Tabellen, RLS-Hilfsfunktionen, Policy-Matrix, Aufbewahrung |
| Threat Model | [threat-model.md](../../security/threat-model.md) | STRIDE für 10 Komponenten, Top-5-Risiken |
| Datenschutz | [privacy.md](../../security/privacy.md) | Datenarten, Rechtsgrundlagen (Entwurf), Fristen, SDK-Liste |
| ADRs | [decisions/](../../decisions/README.md) | 0001–0008 |

**Design-Referenzen:** Alle 5 Originaldateien liegen in `docs/design/references/` und wurden gesichtet. Die Analyse
in Master Prompt §5.1 stimmt mit den Bildern überein. Es fehlt nichts.

## 3. Was nicht fertig ist / bewusst offen (ehrlich)

- **Keine Nutzerinterviews.** Personas sind Hypothesen.
- **Marktrecherche** stützt sich teils auf Drittquellen; DE-Store-Preise in € nicht verifiziert; Store-Reviews nicht systematisch ausgewertet.
- **Konzept-Mockups** gibt es noch nicht (laut Roadmap Phase 1, Ablage `docs/design/concept/`, gekennzeichnet als Mockup).
- **Logo und App-Icon** nur als Beschreibung (kein Maskottchen, PO-Entscheidung).
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
| Name „Nowish“ nicht schützbar oder belegt | Rebranding | Markenprüfung Nowish + Gleichda parallel, Name zentral in `packages/brand`, neutrale Bundle-ID bis zur Freigabe |

## 6. Offene Fragen an den PO (priorisiert, max. 10)

1. ~~**Name**~~ → **entschieden 2026-11-09:** Arbeitsname **Nowish**, Alternative **Gleichda** ([ADR 0007](../../decisions/0007-working-name-nowish.md)). Offen bleibt nur die Markenprüfung beider Namen durch den PO.
2. ✅ **Anti-Chaos-Basis:** in Phase 3 ([roadmap.md §3](../../product/roadmap.md)).
3. ✅ **Preise:** günstigere Variante, Family 6,99 € / 59,99 €. Trial 14 Tage beibehalten; Kinderprofile zählen nicht
   zu den 6 Plätzen (begründet in [monetization.md §2](../../product/monetization.md)).
4. ✅ **Mindestalter:** für den Prototyp nicht relevant; technisch als 16+-Bestätigung umgesetzt, Rechtsprüfung vor
   Veröffentlichung ([ADR 0004](../../decisions/0004-minimum-age.md)).
5. ✅ **Karten/Routing:** Google ([ADR 0005](../../decisions/0005-maps-routing-provider.md)).
6. ✅ **KI-Assistent:** eingeplant, nicht entschieden ([roadmap.md §5](../../product/roadmap.md)).
7. ✅ **Zahlungs-Links:** PayPal (`paypal.me`), Rechtsprüfung vor Veröffentlichung.
8. ⏳ **Hosting Gast-Web/Admin:** offen – Erklärung an PO am 2026-11-09 gegeben, Entscheidung ausstehend
   (für den Prototyp nicht blockierend).
9. ✅ **Kein Maskottchen**, professionelle Bildmarke ([brand-foundation.md §6](../../brand/brand-foundation.md)).
10. ✅ **Markt:** nur DACH. Store-Konten erst in Phase 10 nötig (Ausnahme: echtes iPhone zum Testen braucht ein Apple-Developer-Konto).

**Grundsatzentscheidung:** Prototyp zuerst, Veröffentlichung erst ganz am Ende ([ADR 0008](../../decisions/0008-prototype-first.md)).

## 7. Nächster Schritt

Nach Freigabe: **Phase 1 – Projekt-Setup** (Monorepo, Tooling, CI für iOS + Android, Env-Validierung, Supabase
lokal, i18n-Gerüst, Tokens in `packages/ui`, gekennzeichnete Konzept-Mockups der Kernscreens).
