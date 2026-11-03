# Modul 14 – Gast-Web-Ansicht

> **Status:** v0.1 · 2026-11-03 · Spezifikation (Entwurf). Umsetzung: Phase 4. App: `apps/web`.

**Ziel:** Gast-Gabi sagt in **unter 30 Sekunden** zu, ohne App und ohne Account.

## User Stories

| ID | Als … | möchte ich … | damit … |
| --- | --- | --- | --- |
| GST-01 | Gast | den Link öffnen und Titel, Zeit, Ort, Host und Beschreibung sehen | ich weiß, worum es geht |
| GST-02 | Gast | mit Namen zusagen/absagen (E-Mail optional für Updates) | der Host Bescheid weiß |
| GST-03 | Gast | abstimmen (Termin/Ort) | ich mitentscheide |
| GST-04 | Gast | ein Mitbringsel übernehmen | ich beitrage |
| GST-05 | Gast | das Event in meinen Kalender übernehmen (ICS-Download, Google-Kalender-Link) | ich es nicht vergesse |
| GST-06 | Gast | meine Antwort später auf demselben Gerät ändern | ich flexibel bin |
| GST-07 | Gast | die App angeboten bekommen (einmal, dezent) | ich sie freiwillig ausprobiere |
| GST-08 | Gast | meinen Gast-Zugang in ein Konto umwandeln | meine Zusagen erhalten bleiben (Phase 4+) |
| GST-09 | Host | Links widerrufen, neu erzeugen, mit Ablauf oder PIN versehen | ich Kontrolle habe |

## Akzeptanzkriterien

- **Link-Token:** 32 Byte Zufall (256 Bit) Base64url; in der DB nur `sha256(token)`. Widerrufbar, optional `expires_at`,
  optional 4–6-stellige PIN (gehasht, Rate-Limit 5 Versuche/15 Min. pro Link + IP-Bucket).
- **Gast-Identität:** Nach der ersten Antwort bekommt der Gast ein **Gast-Session-Token** (HttpOnly-, Secure-,
  SameSite=Lax-Cookie, signiert, an Event gebunden). Ohne Cookie (anderes Gerät) kann er über einen „Magic Link“
  an die optional angegebene E-Mail zurück.
- Alle Gast-Aktionen laufen über **Edge Functions** (`guest-*`) mit Service-Rolle **nach** Token-Prüfung;
  kein direkter DB-Zugriff mit `anon` auf Event-Tabellen.
- **Bot-Schutz:** datensparsamer Challenge-Dienst (Kandidaten: Cloudflare Turnstile, Friendly Captcha (EU)) nur bei
  verdächtigem Verhalten oder für Schreibaktionen; Entscheidung + Datenschutzprüfung in Phase 4.
- Seite ist SSR, < 100 KB JS initial, Lighthouse Performance/Accessibility ≥ 90, funktioniert ohne JS für Ansicht + Zusage.
- `noindex`, kein Tracking, keine Werbung, keine Drittanbieter-Fonts zur Laufzeit (selbst gehostet).
- Open-Graph-Vorschau (Titel, Datum, Cover) für Messenger – **ohne** Gästeliste oder Adresse, wenn der Host
  „Adresse erst nach Zusage zeigen“ aktiviert hat.
- Sichtbarkeit pro Event steuerbar: Gästeliste sichtbar ja/nein, genaue Adresse erst nach Zusage, Chat für Gäste an/aus.

## Zustände

Link ungültig/widerrufen: freundliche Seite ohne Event-Details. Abgelaufen: „Dieser Link ist abgelaufen – frag den Host nach einem neuen.“
Event abgesagt: Hinweis + Nachricht des Hosts. Kapazität voll: Warteliste.

## Free / Premium

Für Gäste immer kostenlos. Die Limits (Teilnehmer) folgen dem Abo des Hosts.
