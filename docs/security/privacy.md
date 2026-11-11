# Datenschutzkonzept

> **Status:** v0.1 · 2026-11-03 · Technisches Konzept Phase 0. **Keine Rechtsberatung.** Datenschutzerklärung,
> AV-Verträge, VVT und Rechtsgrundlagen müssen durch einen Fachanwalt geprüft werden (Sache des PO).

## 1. Prinzipien

1. **Datensparsamkeit:** Wir erheben nur, was eine Funktion braucht. Kein Geburtsdatum, keine Telefonnummer
   als Pflicht, kein Standortverlauf, keine Diagnosen.
2. **EU-Verarbeitung:** Primärdaten in Supabase Frankfurt (eu-central-1), Dienstleister bevorzugt EU-basiert.
3. **Keine Werbe-Tracker, keine Analytics-SDKs mit Profilbildung.** Kennzahlen nur aggregiert serverseitig.
4. **Transparenz:** Datenschutz-Center in der App zeigt, was gespeichert ist, mit Export und Löschung.
5. **Privacy by Default:** Live-ETA aus, Crash-Reports nur nach Einwilligung (wo nötig), Push-Inhalte bei Familie neutral.

## 2. Datenarten, Zweck, Rechtsgrundlage (Entwurf), Speicherdauer

| Kategorie | Beispiele | Zweck | Rechtsgrundlage (Vorschlag) | Speicherdauer |
| --- | --- | --- | --- | --- |
| Konto | E-Mail, Login-Provider-ID, Anzeigename, Avatar, Alters-Bestätigung | Account | Art. 6 (1) b | bis Löschung + 30 Tage |
| Kalender & Events | Termine, Orte, Beschreibungen, RSVP | Kernfunktion | Art. 6 (1) b | bis Löschung durch Nutzer/Host |
| Gäste (ohne Account) | Name, optional E-Mail, Antworten | Teilnahme am Event | Art. 6 (1) b (Gast) / f (Host) | 90 Tage nach Event-Ende |
| Chat | Nachrichten, Bilder, Reaktionen | Kommunikation | Art. 6 (1) b | bis Löschung; bei Account-Löschung anonymisiert |
| Familie | Kinder-Anzeigename, Farbe, Termine, Fahrdienste | Familienplanung | Art. 6 (1) b (für den Erwachsenen) | bis Löschung des Profils |
| Anti-Chaos | Losgeh-Zeiten, Losgeh-Signale, Puffer | Erinnerungen | Art. 6 (1) b | Signale 180 Tage |
| Standort (momentan) | aktuelle Position zur Wegzeit-Berechnung | Wegzeit | Art. 6 (1) a (Einwilligung über OS-Berechtigung + In-App-Erklärung) | **nicht gespeichert** (nur Ergebnis „25 Min.“) |
| Live-ETA | ETA-Zeitpunkt (keine Koordinaten an andere) | Teilen mit Event | Art. 6 (1) a | Ablauf + 1 h |
| Externe Kalender | OAuth-Token, gespiegelte Zeitblöcke | Sync | Art. 6 (1) b + a (Verbinden) | bis Trennen (+ 24 h) |
| Abo | Store-Produkt, Status, Laufzeit (keine Zahlungsdaten) | Entitlements | Art. 6 (1) b, c (Steuer) | Laufzeit + gesetzliche Fristen |
| Technik | Push-Token, App-Version, Plattform | Betrieb | Art. 6 (1) b, f | bis Logout/Inaktivität 12 Monate |
| Crash-Reports | Stacktrace, Gerät, App-Version (PII gescrubbt) | Stabilität | Art. 6 (1) a oder f (prüfen) | 30 Tage |
| Server-Logs | IP (gekürzt nach 7 Tagen), Zeit, Endpoint, Status | Sicherheit | Art. 6 (1) f | 14 Tage |
| House-Ad-Statistik | Zähler pro Anzeige/Tag | Steuerung | keine personenbezogenen Daten | – |

**Mindestalter:** 16+ (Vorschlag, [ADR 0004](../decisions/0004-minimum-age.md)). Kinder unter 16 nutzen die App
nicht selbst, sondern erscheinen nur als Kinderprofil (Name/Farbe) im Haushalt eines Erwachsenen.

## 3. Betroffenenrechte in der App

| Recht | Umsetzung |
| --- | --- |
| Auskunft (Art. 15) | Datenschutz-Center: Übersicht pro Kategorie + vollständiger Export |
| Datenübertragbarkeit (Art. 20) | Export JSON (maschinenlesbar) + ICS |
| Berichtigung (Art. 16) | Profil/Einträge bearbeitbar |
| Löschung (Art. 17) | Account-Löschung in der App (30 Tage Karenz, sofort deaktiviert) |
| Widerruf (Art. 7) | Einwilligungen einzeln widerrufbar (Crash-Reports, Live-ETA, Standort, KI) |
| Widerspruch (Art. 21) | Kontaktweg im Datenschutz-Center |

## 4. Auftragsverarbeiter & SDKs (geplant, Prüfung vor Einsatz)

Neue Abhängigkeiten mit Datenfluss nach außen werden hier eingetragen **bevor** sie in den Code kommen.

| Dienst / SDK | Zweck | Datenort | Status |
| --- | --- | --- | --- |
| Supabase | DB, Auth, Storage, Realtime, Functions | EU (Frankfurt), US-Unternehmen (DPA + SCC) | geplant (ADR 0002) |
| RevenueCat | Abo-Verwaltung | USA (DPA + SCC prüfen) | geplant (ADR 0003) – App-User-ID pseudonym (UUID), keine E-Mail übertragen |
| Apple / Google (Store, Push, Sign-in) | Abos, Push, Login | Plattformanbieter | unvermeidbar |
| Expo Push Service | Push-Zustellung | USA | geplant; Alternative: direkt APNs/FCM aus Edge Function (prüfen in Phase 5) |
| E-Mail-Versand | Magic Links, Gast-Updates | EU-Anbieter bevorzugt | offen (Phase 2) |
| Crash-Reporting | Stabilität | EU-Region (z. B. Sentry EU) | offen (Phase 1/10) |
| Google Maps Platform (Places, Routes) | Ortssuche, Wegzeit | Google (Drittland, DPA + SCC) | entschieden (ADR 0005); Aufruf nur über Edge Function, ohne Nutzer-ID, Koordinaten gerundet |
| PayPal (nur Link) | `paypal.me`-Deep-Link im Kosten-Modul | – (wir übertragen nichts an PayPal) | entschieden; Nutzer öffnet PayPal selbst |
| Bot-Schutz Gast-Web | Spam-Schutz | abhängig vom Anbieter | offen (Phase 4) |
| Vercel | Hosting Gast-Web + Admin | Funktionen in Frankfurt (`fra1`), US-Unternehmen | Prototyp (nur Demo-Daten); Launch-Entscheidung Phase 10 |
| Wetter-API | Plan B | – | Phase 9 |
| KI-Anbieter | Assistent | EU-Verarbeitung erforderlich | eingeplant, nicht entschieden; nur opt-in |

Phase 1 (2026-11-09): Die App enthält **keine** Netzwerk-SDKs. Neu sind nur lokale Bibliotheken ohne Datenfluss
nach außen: Expo-Module (SQLite, Haptik, Lokalisierung, Schriften), Lucide-Icons, gebündelte Schriften (keine
Laufzeit-Downloads). Gespeichert werden nur Sprache und Darstellung auf dem Gerät.

Phase 5 (2026-11-11): Familienbereich, Kinderprofile, Einkaufsliste, Ämtchen und Gruppen liegen ebenfalls nur auf dem
Gerät. **Kinderprofile speichern nur Name, Farbe und ein Symbol** – kein Geburtsdatum, kein Foto, keine Kontaktdaten.
Neue lokale Expo-Module ohne Netzwerk: `expo-document-picker` (System-Dateiauswahl für den ICS-Import, keine
Speicher-Berechtigung), `expo-file-system` (Export-Datei im App-Cache), `expo-sharing` (Teilen-Menü). Kalender-Dateien
verlassen das Gerät nur, wenn der Nutzer sie selbst teilt; Dateiinhalte und -namen werden nie geloggt.

Phase 2–4 (2026-11-11): Termine, Zusammenarbeit (Demo) und der **private Losgeh-Verlauf** (geplante und
tatsächliche Losgeh-Zeit, angekündigte Verspätung, Bereit-Check-Haken) liegen nur auf dem Gerät (SQLite, in der
Web-Vorschau `localStorage`). Puffer-Lernen und Pünktlichkeits-Bilanz sind abschaltbar; „Verlauf löschen“ entfernt
alle Einträge. Nichts davon wird übertragen oder geteilt; die Bilanz kennt keinen Vergleich mit anderen.

**Ausgeschlossen:** Werbe-SDKs, Attribution-SDKs, Analytics mit Geräte-IDs, Session-Replay, Facebook-SDK
(auch nicht für späteren Facebook-Login ohne erneute Prüfung).

## 5. Technische und organisatorische Maßnahmen (Auszug)

TLS 1.2+ überall · Verschlüsselung at rest (Supabase/AWS) · Secrets im Vault · RLS · Least-Privilege-Admin-Rollen ·
Pflicht-2FA für Admins · Audit-Log · Backups (Supabase PITR prüfen) · Löschkonzept per pg_cron · Logging ohne
Inhalte · Incident-Response-Plan (Meldung binnen 72 h, Art. 33) – wird in Phase 10 ausgearbeitet.

## 6. Logging-Regeln (für Entwickler)

**Nie loggen:** Chat-Texte, Event-Titel/Beschreibungen, Adressen, Koordinaten, E-Mail-Adressen, Tokens,
Kindernamen, Dateinamen von Uploads. Erlaubt: IDs (UUID), Fehlercodes, Dauer, App-Version.

## 7. Dokumente, die der PO beauftragen/prüfen lassen muss

Datenschutzerklärung (App, Gast-Web, Admin) · Impressum · AGB/Nutzungsbedingungen · AV-Verträge mit allen
Auftragsverarbeitern · Verzeichnis der Verarbeitungstätigkeiten · ggf. DSFA (Live-Standort, Kinderprofile – Prüfung,
ob erforderlich) · TTDDG-Prüfung (§ 25: Speicherzugriff auf Endgeräten – für technisch notwendige Speicherung
voraussichtlich ohne Einwilligung, Crash-Reports prüfen).
