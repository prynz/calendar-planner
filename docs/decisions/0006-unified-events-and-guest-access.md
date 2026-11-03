# ADR 0006 – Ein Event-Modell für Termine und soziale Events; Gastzugriff nur über Edge Functions

> **Status:** vorgeschlagen · 2026-11-03

## Kontext

1. Die App vereint persönliche Termine (Arzt, Arbeit) und soziale Events (Party, Grillen). Beide brauchen
   Wiederholungen, Erinnerungen, Anti-Chaos-Logik, Ort und Kalenderansichten.
2. Gäste ohne Account müssen zusagen, abstimmen und Mitbringsel übernehmen können.

## Entscheidung

**(a) Eine Tabelle `events` mit `kind = appointment | social`.** Ein persönlicher Termin ist ein Event ohne weitere
Teilnehmer. Wird jemand eingeladen, wird `kind` zu `social` (gleiche ID, keine Migration der Daten).
Social-Funktionen (Chat, Umfragen, Listen) hängen per `event_id` an und werden erst bei Bedarf angelegt.

**(b) Gäste haben keine Datenbank-Identität.** Das Gast-Web ruft ausschließlich Edge Functions `guest-*` auf. Diese
prüfen Link-Token (Hash-Vergleich, Ablauf, Widerruf, PIN) und Gast-Session und rufen eng gefasste
`security definer`-Funktionen auf, die nur für `service_role` ausführbar sind. `anon` erhält **keine** Rechte auf
Event-Tabellen.

## Alternativen

- (a) Getrennte Tabellen `appointments` / `social_events`: doppelte Logik für RRULE, Erinnerungen, Sync; Umwandlung
  „Termin → Event“ wäre eine Migration → verworfen.
- (b) Anonyme Supabase-Auth-Sessions für Gäste mit RLS: Gäste würden zu `authenticated`-Nutzern, was jede Policy
  komplexer und fehleranfälliger macht; Spam-Konten-Risiko → verworfen. Kann als Upgrade-Pfad für die
  „Gast → Account“-Umwandlung genutzt werden.

## Konsequenzen

- `events` braucht saubere Spalten-Gruppen und Policies, die nach `kind` unterscheiden, wo nötig.
- Gast-Funktionen sind eine eigene, klar begrenzte API-Oberfläche mit eigenen Tests (Playwright + pgTAP).
