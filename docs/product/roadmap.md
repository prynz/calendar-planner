# Roadmap & Priorisierung

> **Status:** v0.2 · 2026-11-09 · Phase 0 abgeschlossen, PO-Entscheidungen eingearbeitet. **Prototyp zuerst**:
> Phasen 1–9 bauen einen nicht veröffentlichten Prototyp mit Beispieldaten, Veröffentlichung erst nach
> Phase 10 ([ADR 0008](../decisions/0008-prototype-first.md)). Phase 1 startet nach Freigabe durch den PO.

## 1. Phasen mit Review-Gates

Jede Phase endet mit typecheck → lint → format → Tests → Build-Prüfung → Doku → Milestone-Report →
**Stopp und Freigabe durch den PO**.

| Phase | Inhalt | Ergebnis | Status |
| --- | --- | --- | --- |
| **0** – Discovery & Fundament | Recherche, Personas, MoSCoW, Abo-Matrix, Namen, Referenz-Analyse, Brand, Architektur, ERD, Threat Model, Datenschutz, ADRs | Doku, **kein App-Code** | ✅ fertig, Review offen |
| **1** – Projekt-Setup | Monorepo, Tooling, CI (iOS+Android), Env-Validierung, Supabase lokal, i18n-Gerüst, Tokens, Logo-Entwürfe, Konzept-Mockups, **Demo-Modus-Gerüst** (Seed-Beispielwelt) | Lauffähige leere App mit Theme, Sprache, Navigation | ⏳ wartet |
| **2** – Accounts & Sicherheit | Auth (Apple, Google, Microsoft, E-Mail, Passkey), Profil, Konten verknüpfen, Löschung/Export, RLS-Basis, Rate-Limits | Sichere Anmeldung Ende-zu-Ende | ⏳ |
| **3** – Kalender-Kern | Ansichten, Termine, RRULE, Zeitzonen, lokale Erinnerungen, ICS; **+ Anti-Chaos-Basis** (PO-Entscheidung, §3) | Vollwertiger persönlicher Kalender + erlebbarer USP | ⏳ |
| **4** – Events & Einladungen | Events, Rollen, RSVP mit Frist, Gast-Web-Link, Basis-Vorlagen | Erste soziale Events | ⏳ |
| **5** – Zusammenarbeit | Chat (Realtime), Umfragen mit Deadline, Aufgaben, Mitbringliste, Dateien | Komplette Event-Planung | ⏳ |
| **6** – Anti-Chaos-Engine & Karte | Wegzeit (Routing-API), Puffer-Lernen, Eskalationsstufen voll, Bereit-Check, „Ich verspäte mich“, Live-ETA, Widgets (Basis) | USP live | ⏳ |
| **7** – Familie & Gruppen | Familienbereich, Kinderprofile, Fahrdienste, Einkauf, Gruppen, Kalender-Sync Google/Outlook/iCloud | Familienplaner | ⏳ |
| **8** – Monetarisierung & Admin | Entitlements, Paywall mit **Demo-Kauf**, Admin (RBAC, Comp-Abos, Audit-Log), House Ads | Bezahlmodell & Steuerung (ohne echte Store-Abos) | ⏳ |
| **9** – Premium-Extras | Kosten-Split (PayPal-Links), Wetter/Plan B, Mitfahren, Erinnerungs-Album, Premium-Themes; KI-Assistent nur eingeplant (siehe §5) | Premium-Mehrwert, **Prototyp komplett** | ⏳ |
| **10** – Launch-Readiness (erst wenn der Prototyp überzeugt) | Markenprüfung, Rechtsprüfung (Mindestalter, Datenschutz, PayPal-Links, AGB), Store-Konten, echte Abos (RevenueCat), Google-OAuth-Verifizierung, Hosting-Entscheidung, Performance, A11y-Audit, Pen-Test, Store-Listings DE/EN, Beta | Release-Kandidat für **DACH** | ⏳ |

## 2. MoSCoW-Priorisierung für v1 (öffentlicher Launch)

**Must** = ohne das kein Launch · **Should** = v1, kann aber notfalls in v1.x rutschen ·
**Could** = v1.x · **Won't (v1)** = bewusst später.

| Funktion | MoSCoW | Begründung |
| --- | --- | --- |
| Persönlicher Kalender (Tag/Woche/Monat/Agenda, RRULE, Zeitzonen) | **Must** | Solo-Nutzen ab Minute 1 (Lehre aus Howbout-Beschwerden) |
| Events mit Rollen, RSVP inkl. ablaufendem „Vielleicht“ | **Must** | Herzstück |
| Gast-Web-Link (Zusage, Vote, Mitbringliste) | **Must** | Wachstumsmotor, Gast-Gabi |
| Anti-Chaos: Losgeh-Zeit + gestufte Erinnerungen + Bereit-Check + „Ich verspäte mich“ | **Must** | USP, Kern der Marke |
| Umfragen mit Deadline | **Must** | Lücke bei Doodle/Rallly |
| Chat pro Event inkl. Melden/Moderation | **Must** | Ohne Chat bleibt WhatsApp nötig; Moderation ist Store-Pflicht bei UGC |
| Aufgaben, Mitbringliste | **Must** | Orga-Olivia |
| Accounts (Apple, Google, E-Mail), Löschung, Export | **Must** | Store-/DSGVO-Pflicht |
| DE + EN, Hell/Dunkel, Barrierefreiheit | **Must** | Markenversprechen, gesetzliche Anforderungen (BFSG) |
| Abos + transparente Paywall + Entitlements | **Must** | Geschäftsmodell |
| Admin (RBAC, Nutzer, Comp-Abos, Audit-Log, Moderation) | **Must** | Betrieb ohne Admin nicht möglich |
| ICS-Import/Export | **Must** | Brücke zu bestehenden Kalendern, günstig |
| Familienbereich, Kinderprofile, Fahrdienste, Einkauf | **Should** | Familien-Frank; Family-Abo hängt daran |
| Kalender-Sync Google/Outlook (Zwei-Wege) | **Should** | Hoher Wert, hohes Risiko (OAuth-Verifizierung, Konflikte) |
| iCloud/CalDAV-Sync, EventKit-Lesezugriff | **Should** | Auf iOS über EventKit einfacher als CalDAV |
| Microsoft- und Passkey-Login | **Should** | Komfort, nicht launchkritisch |
| Fokus-Modus | **Should** | ADHS-Alex; zum großen Teil UI-Variante, hohe Markenwirkung |
| House Ads | **Should** | Free-Monetarisierung; ohne sie funktioniert Free trotzdem |
| Dateien (Tickets/PDFs) | **Should** | Speicherlimit ist Premium-Hebel |
| Live-ETA (Standort teilen) | **Should** | Datenschutz-sensibel, „Ich verspäte mich“ funktioniert auch ohne |
| Gruppen mit gemeinsamem Kalender | **Should** | Wiederkehrende Treffen |
| Vorlagen (kuratiert) | **Should** · eigene Vorlagen **Could** | |
| Kosten-Split (Tracking) | **Could** | Splitwise existiert; Wert im Event-Kontext hoch |
| Wetter + Plan B | **Could** | Benötigt Wetter-API (Kosten/Datenschutz) |
| Mitfahr-Koordination | **Could** | |
| Widgets (Homescreen) | **Could** · Live Activities **Won't (v1)** | Native Erweiterungen, hoher Aufwand |
| Erinnerungs-Album | **Could** | Speicher-/Moderationsaufwand |
| Premium-Themes/Cover | **Could** | |
| KI-Assistent | **Won't (v1)** | Datenschutz, Kosten, Anbieterwahl offen |
| Smartwatch, QR-Check-in, Gruppen-Rituale, Geschenke-Pool, Sprachnachrichten | **Won't (v1)** | |
| E2E-Verschlüsselung Chat | **Won't (v1)** | Architektur bleibt offen dafür (ADR 0001) |
| RTL-Sprachen | **Won't (v1)** | Layout von Anfang an RTL-fähig |

## 3. Abweichung vom Master Prompt (PO-Entscheidung 2026-11-09: angenommen)

**Anti-Chaos-Basis nach Phase 3 vorziehen.** Losgeh-Zeit mit **manuell** gewählter Wegzeit, gestufte
lokale Erinnerungen und ein einfacher Bereit-Check sind reine Domänenlogik plus lokale
Notifications. Sie lassen sich mit dem Kalender-Kern bauen und brauchen weder Routing-API noch Server.
Vorteil: Der USP ist ab der ersten Beta erlebbar und kann früh mit echten Nutzern getestet werden.
Phase 6 ergänzt dann Google-Routing, Puffer-Lernen, Live-ETA und Widgets.

## 4. Abhängigkeiten & kritischer Pfad

```
Phase 1 ─► Phase 2 ─► Phase 3 ─► Phase 4 ─► Phase 5 ─► Phase 6
   │          │                     │                     │
   │          └──► RLS-Basis ───────┘                     │
   └──► Tokens/i18n ─────────────── alle UI-Phasen        │
                                     Phase 7 (Sync) ◄─────┘ (unabhängig ab Phase 3)
                                     Phase 8 ◄── Entitlements werden ab Phase 4 als
                                                 Limit-Prüfung vorbereitet (Free-Limits greifen sofort)
```

Wegen der Prototyp-Strategie erst in Phase 10 nötig (lange Vorlaufzeiten, rechtzeitig vorher starten):
- **Google OAuth Verification** für Calendar-Scopes (im Prototyp reichen Testnutzer).
- **Apple Developer / Google Play Konten**, D-U-N-S, Steuerdaten. Hinweis: Für Tests auf einem **echten iPhone**
  ist ein Apple-Developer-Konto schon früher nötig (Android-Test-APK geht ohne).
- **Markenprüfung** Nowish + Gleichda.
- **Rechtsprüfung** Datenschutzerklärung, AGB, Impressum, Mindestalter, PayPal-Links.

## 5. KI-Assistent: eingeplant, nicht entschieden

PO-Entscheidung 2026-11-09: Bedenken berücksichtigen, Umsetzung offen lassen, aber **architektonisch einplanen**:
- Eingabe „Freitag 19 Uhr Grillen bei Tom, 8 Leute“ wird bereits ohne KI durch einen **regelbasierten Parser**
  in `packages/domain` (DE/EN, Datum/Uhrzeit/Ort/Personenzahl) unterstützt. Eine KI kann später dieselbe
  Schnittstelle `parseEventDraft(text) → EventDraft` bedienen.
- Vorlagen, Packlisten und Chat-Zusammenfassung bekommen klar definierte Ein-/Ausgabe-Schemas (zod), damit ein
  KI-Anbieter austauschbar bleibt.
- Vor einer Umsetzung: Anbieter mit EU-Verarbeitung, Opt-in, Datenminimierung, Eintrag in privacy.md, eigene ADR.

## 6. Markt

PO-Entscheidung 2026-11-09: **nur DACH** zum Start (Deutschland, Österreich, Schweiz; Sprachen DE + EN).
Formate: 24 h, Montag als Wochenstart, Euro und CHF (Kosten-Modul: eine Währung pro Event).
