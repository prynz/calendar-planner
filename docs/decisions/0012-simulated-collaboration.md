# ADR 0012 – Zusammenarbeit im Prototyp: ein Dokument pro Event, simulierte Personen nach festen Regeln

> **Status:** akzeptiert · 2026-11-10 · Phase 3, erweitert ADR 0010

## Kontext

Phase 3 soll den ganzen Lebenszyklus eines Events erlebbar machen: einladen, zusagen, abstimmen, Mitbringliste,
Aufgaben und Chat. Es gibt aber weiterhin **keine Konten und keinen Server** (ADR 0010). Die anderen Personen
müssen also simuliert werden, nachvollziehbar und klar als „Demo“ gekennzeichnet. Später übernimmt Supabase
(Block B1/B2), ohne dass die Screens umgebaut werden müssen.

## Entscheidung

1. **Ein Zusammenarbeits-Dokument pro sozialem Event** (`EventCollab` in `packages/domain/src/collab`): Einladungen,
   Umfragen, Mitbringliste, Aufgaben, Chat und geplante Demo-Aktionen. Es liegt neben dem Termin, in SQLite in der
   Tabelle `collab` (Schema v2, additive Migration), im Web in `localStorage`. Beim Lesen prüft ein zod-Schema jedes
   Dokument; ein kaputtes wird übersprungen und gemeldet.
2. **Alle Regeln sind reine Funktionen** (`respond`, `vote`, `pollOutcome`, `setClaim`, `takeTask`, `postMessage` …) mit
   Fehlercodes statt Texten (`CollabError` → `collab.error.<code>`). Sie bilden die späteren Server-Prüfungen
   (RLS, Transaktionen) 1:1 ab: Mengen nie überbucht, Aufgaben „wer zuerst kommt“, Stimmen nach der Frist abgelehnt,
   Gleichstand entscheidet der Host, nie der Zufall.
3. **Simulierte Personen** handeln nur über **geplante Aktionen** (`pending`: Zusage, Stimme, Chat-Nachricht mit
   Zeitpunkt). Sie entstehen nach festen Regeln aus einem Hash der IDs (`packages/demo/src/collab.ts`), z. B.
   „Eingeladene antworten nach 5–25 s, 60 % ja / 25 % vielleicht / 15 % nein“. Ein Takt pro Sekunde
   (`useSimulation`) spielt fällige Aktionen ab. Was die Regeln nicht erlauben (Umfrage inzwischen beendet), wird
   verworfen. Kinderprofile handeln nie selbst.
4. **Der Termin bleibt die Zeitachse.** Teilnehmende am Termin folgen automatisch den Mitgliedern des Dokuments;
   eine entschiedene Terminumfrage verschiebt den Termin (POL-09).
5. **Kennzeichnung:** Demo-Badge auf allen Event-Screens, Hinweis im Chat und im Editor („Demo: Die Eingeladenen
   antworten nach ein paar Sekunden“).

## Konsequenzen

- Der komplette Ablauf ist ohne Netz und Konto testbar und deterministisch (Unit-Tests für Regeln und Simulation).
- Block B ersetzt das lokale Dokument durch Tabellen (`event_member`, `poll_vote`, `bring_claim`, `task`, `message`,
  data-model.md) und die Simulation durch echte Personen; die Domänenregeln bleiben als Client-Vorprüfung.
- Bewusst noch nicht enthalten: Co-Hosts, Kapazität/Warteliste, Melden/Blockieren im Chat, Erinnerungen an
  Nichtwähler und Fristen, Shared-Element-Übergang (siehe Milestone-Report Phase 3).
