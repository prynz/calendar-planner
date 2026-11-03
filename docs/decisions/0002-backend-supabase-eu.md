# ADR 0002 – Backend: Supabase in der EU-Region

> **Status:** vorgeschlagen · 2026-11-03

## Kontext

Wir brauchen Postgres mit feingranularer Zugriffskontrolle (RLS), Auth mit Apple/Google/Microsoft/E-Mail/Passkey,
Realtime für Chat, Storage und serverseitige Funktionen. Datenschutz und EU-Hosting sind Markenversprechen.

## Entscheidung

**Supabase (gehostet) in der Region Central EU – Frankfurt (`eu-central-1`).** Laut Supabase-Doku bleiben die
Dienste eines Projekts bei Wahl einer konkreten EU-Region in dieser AWS-Region; Supabase bietet einen DPA mit
Standardvertragsklauseln und ist nach SOC 2 und ISO 27001 zertifiziert
([Regions](https://supabase.com/docs/guides/platform/regions),
[GDPR-Guide](https://supabase.com/docs/guides/security/gdpr-compliance),
[Data-Residency-FAQ](https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq)).

- Geschäftslogik mit Konfliktpotenzial als Postgres-Funktionen (Transaktionen), Secrets/Drittanbieter in Edge Functions.
- Supabase Vault für OAuth-Tokens.
- pg_cron für Fristen und Löschjobs.
- Lokale Entwicklung mit Supabase CLI; Seeds nur lokal.

## Alternativen

- **Firebase:** keine relationale DB, Regeln weniger ausdrucksstark für Event/Gruppe/Haushalt-Beziehungen, stärkere
  Bindung an Google → verworfen.
- **Eigenes Backend (z. B. Node + Postgres bei Hetzner/IONOS):** volle Datenhoheit in EU-Unternehmenshand, aber
  deutlich mehr Betriebsaufwand (Auth, Realtime, Storage selbst bauen) → für v1 verworfen.
- **Self-hosted Supabase bei EU-Anbieter:** Ausweg, falls rechtliche Prüfung den US-Anbieter ablehnt. Gleiches
  Programmiermodell → **Migrationspfad bleibt offen.**

## Konsequenzen / Risiken

- Supabase Inc. und AWS sind US-Unternehmen (Thema CLOUD Act / Drittlandtransfer). Rechtliche Bewertung durch
  den PO nötig; in der Datenschutzerklärung transparent benennen.
- Wir vermeiden Supabase-spezifische Features, die einen Wechsel zu self-hosted verhindern würden.
