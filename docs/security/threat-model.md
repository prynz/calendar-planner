# Threat Model (STRIDE)

> **Status:** v0.1 · 2026-11-03 · Erstfassung Phase 0 auf Basis der Zielarchitektur. Wird in jeder Phase
> aktualisiert (neue Komponenten → neue Zeilen). Grundlagen: OWASP MASVS/MASTG (Mobile), ASVS (Backend/Web).

## 1. Schutzgüter

| Schutzgut | Schutzbedarf | Warum |
| --- | --- | --- |
| Accounts & Sitzungen | hoch | Übernahme = Zugriff auf private Termine, Familie, Chats |
| Standort / Live-ETA | **sehr hoch** | physische Sicherheit (Stalking) |
| Kinderprofile, Familienlogistik | **sehr hoch** | Kinder, Abholzeiten, Orte |
| Chat-Inhalte, Event-Details, Adressen | hoch | Privatsphäre, Einbruchsrisiko („alle sind im Urlaub“) |
| Externe Kalender-Tokens | hoch | Zugriff auf Google-/Outlook-Kalender |
| Entitlements, Comp-Abos | mittel | Umsatzverlust |
| Admin-Zugänge | **sehr hoch** | Zugriff auf alles |
| Verfügbarkeit (Erinnerungen) | mittel–hoch | USP; ausgefallene Erinnerung = Vertrauensverlust |

## 2. Angreifer

Neugierige Gäste/Ex-Partner mit Link · Bots (Spam-Einladungen, Link-Raten) · Fremde Nutzer, die RLS umgehen
wollen · kompromittiertes Gerät · böswillige Insider/Admin · Supply-Chain (npm-Paket) · Credential Stuffing.

## 3. STRIDE pro Komponente

### 3.1 Mobile-App

| | Bedrohung | Maßnahme |
| --- | --- | --- |
| S | Session-Diebstahl vom Gerät | Tokens in SecureStore (Keychain/Keystore), kein AsyncStorage; kurze Access-Token-Laufzeit, Refresh-Rotation |
| T | Manipulierte App verändert Limits/Rollen | Server prüft alles (RLS/RPC); Client-Entitlements nur Anzeige |
| R | Nutzer bestreitet Aktion (z. B. Kostenänderung) | Änderungshistorie bei Kosten/Rollen; Audit für Admin |
| I | Lokale SQLite enthält private Daten | Daten im App-Sandbox; optional SQLCipher (Phase 3 entscheiden); Logout löscht lokale DB; keine Inhalte in Logs |
| I | Push-Inhalte auf Sperrbildschirm | Option „Inhalte ausblenden“; sensible Pushes (Familie) standardmäßig neutral |
| D | Benachrichtigungsflut | Server-Rate-Limits, Bündelung |
| E | Deep-Link-Missbrauch (`planlos://admin…`) | Deep-Links nur auf erlaubte Routen, Parameter per zod validiert |

### 3.2 Gast-Web & Event-Links

| | Bedrohung | Maßnahme |
| --- | --- | --- |
| S | Link wird weitergeleitet / erraten | 256-Bit-Token, nur Hash in DB, Widerruf, Ablauf, optional PIN, Host sieht Liste der Gast-Antworten |
| S | Gast gibt sich als andere Person aus | Gast-Namen sind als „Gast“ gekennzeichnet; Host kann entfernen; E-Mail-Verifizierung optional |
| T | CSRF bei Zusage | SameSite-Cookies + CSRF-Token in Formularen |
| I | Adresse/Gästeliste über Link-Vorschau öffentlich | OG-Tags ohne Adresse/Gästeliste; Option „Adresse erst nach Zusage“; `noindex` |
| I | Enumeration über Fehlermeldungen | einheitliche Antwort für ungültig/abgelaufen/widerrufen (ohne Event-Details) |
| D | Bot-Flut auf Zusagen/PIN | Rate-Limits pro Link + IP-Bucket, Challenge bei Auffälligkeit |
| E | Gast erreicht Host-Funktionen | Gast-Funktionen sind explizit eng gefasst; keine generische DB-Session |

### 3.3 Backend (Supabase)

| | Bedrohung | Maßnahme |
| --- | --- | --- |
| S | Credential Stuffing | Rate-Limits Auth, Passwort-Leak-Prüfung, Passkeys, optional 2FA |
| T | Direkte REST-Writes an RLS vorbei | RLS auf jeder Tabelle, Column-Grants, sensible Writes nur per RPC, pgTAP-Tests |
| T | `security definer`-Funktion mit Search-Path-Hijack | `set search_path = ''`, voll qualifizierte Namen, `revoke execute from public` |
| R | Unklare Admin-Aktionen | append-only `audit_log` in derselben Transaktion |
| I | Daten-Leak über Realtime | Realtime-Autorisierung über RLS bzw. private Kanäle; Test: Nicht-Mitglied empfängt nichts |
| I | Busy-Overlay verrät Termininhalte | nur Zeitblöcke über Funktion, Titel nie ausgeliefert |
| I | Signierte Storage-URLs weitergegeben | Laufzeit ≤ 10 Min., private Buckets |
| D | Teure Abfragen (große Kalender, Ortssuche) | Indizes, Pagination, Edge-Caching, Kontingente pro Nutzer |
| E | Service-Role-Key-Leak | Key nur in Edge-Function-Secrets; Secret-Scan in CI; `packages/config` lehnt privilegierte Keys im Client ab |

### 3.4 Uploads

| | Bedrohung | Maßnahme |
| --- | --- | --- |
| T | Polyglot-/Schad-Datei | Magic-Byte-Allowlist, Re-Encoding von Bildern, `Content-Disposition: attachment` für PDFs im Web |
| I | EXIF/GPS in Fotos | Re-Encoding entfernt Metadaten **vor** Freigabe (`status = ready`) |
| D | Speicher-Missbrauch | Quotas, Größenlimit, Rate-Limit |

### 3.5 Standort / Live-ETA

| | Bedrohung | Maßnahme |
| --- | --- | --- |
| I | Stalking über Live-Position | Keine Koordinaten an andere – **nur ETA**; zeitlich begrenzt; nur Event-Mitglieder; Dauerhinweis + Stopp |
| I | Rückschluss auf Wohnort über „Losgeh-Zeit“ | Losgeh-Daten nur für Eigentümer; „Zuhause“ nur lokal auf dem Gerät |
| E | Teilen ohne Wissen | Live-ETA immer explizit pro Event gestartet, nie automatisch |

### 3.6 Kalender-Sync

| | Bedrohung | Maßnahme |
| --- | --- | --- |
| I | Token-Diebstahl aus DB | Supabase Vault, minimale Scopes, Widerruf bei Trennen |
| T | Sync löscht/überschreibt externe Termine falsch | Schreiben nur in eigenem PLANLOS-Kalender beim Anbieter (Standard); Löschungen mit Bestätigung |
| S | Gefälschte Webhooks (Google/Graph) | Kanal-Token/Client-State prüfen, danach immer aktiv nachladen statt Payload zu vertrauen |

### 3.7 Abos & Billing

| | Bedrohung | Maßnahme |
| --- | --- | --- |
| S | Gefälschter Webhook | Authorization-Header-Secret, danach Abgleich über RevenueCat-REST |
| T | Client behauptet Premium | Entitlements nur aus DB |
| R | Streit über Comp-Abos | Comp-Grants mit Grund, Admin, Audit |

### 3.8 Admin-Dashboard

| | Bedrohung | Maßnahme |
| --- | --- | --- |
| S | Phishing eines Admins | Pflicht-Passkey/TOTP (AAL2), separate Domain, kurze Sessions, optional IP-Allowlist |
| E | Support liest Chats ohne Grund | Inhalte nur über Moderationsfall mit Begründung + zeitlich begrenzt + Audit |
| T | Audit-Log manipuliert | append-only, keine UPDATE/DELETE-Rechte, regelmäßiger Export (Hash-Kette optional) |
| I | Massenexport von Nutzerdaten | Kein Bulk-Export im UI; Suche nur mit Mindestlänge; Rate-Limits |

### 3.9 Chat & Moderation

| | Bedrohung | Maßnahme |
| --- | --- | --- |
| I/T | Belästigung, Spam | Melden, Blockieren, Host-Moderation, Rate-Limits, Admin-Moderation |
| D | Link-Spam in Gruppen | neue Accounts: niedrigere Limits für Einladungen/Nachrichten in den ersten 24 h |

### 3.10 Supply Chain & Build

| Bedrohung | Maßnahme |
| --- | --- |
| Kompromittiertes npm-Paket | Lockfile, `pnpm install --frozen-lockfile` in CI, Renovate/Dependabot mit Review, `pnpm audit`, minimale Abhängigkeiten (ADR-Pflicht bei neuen), pnpm `onlyBuiltDependencies`-Allowlist für Install-Skripte |
| Secrets im Repo | gitleaks in CI + Pre-Commit, `.env*` in `.gitignore` |
| Manipulierte Builds | EAS-Credentials nur in EAS, GitHub-Environments mit Schutzregeln |

## 4. Top-Risiken (priorisiert)

1. **RLS-Fehler** durch die Vielzahl an Tabellen und Zugriffswegen (Event/Gruppe/Haushalt/Gast) → zentrale
   Hilfsfunktionen, Policy-Matrix, pgTAP-Pflicht pro Tabelle, Review-Checkliste.
2. **Gast-Links** als größte öffentliche Angriffsfläche → eigene App, Edge Functions, Rate-Limits, Pen-Test vor Launch.
3. **Live-ETA/Standort** → keine Koordinaten-Weitergabe, kurze Lebensdauer.
4. **Admin-Missbrauch** → RBAC, AAL2, Audit, Inhaltszugriff nur über Fälle.
5. **Kalender-Tokens** → Vault, minimale Scopes, EventKit lokal bevorzugt.

## 5. Vor jedem Release

Security-Checkliste (MASVS-L1, ab Launch L2 für Auth/Storage/Network), Dependency-Audit, Secret-Scan,
RLS-Testabdeckung = 100 % der Tabellen, Threat-Model-Update, externer Pen-Test vor öffentlichem Launch (Phase 10).
