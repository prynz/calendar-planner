# Roadmap & Priorisierung

> **Status:** v0.1 · 2026-11-03 · **Phase 0 abgeschlossen, wartet auf Review.** Phase 1 startet erst
> nach Freigabe durch den PO.

## 1. Phasen mit Review-Gates

Jede Phase endet mit typecheck → lint → format → Tests → Build-Prüfung → Doku → Milestone-Report →
**Stopp und Freigabe durch den PO**.

| Phase | Inhalt | Ergebnis | Status |
| --- | --- | --- | --- |
| **0** – Discovery & Fundament | Recherche, Personas, MoSCoW, Abo-Matrix, Namen, Referenz-Analyse, Brand, Architektur, ERD, Threat Model, Datenschutz, ADRs | Doku, **kein App-Code** | ✅ fertig, Review offen |
| **1** – Projekt-Setup | Monorepo, Tooling, CI (iOS+Android), Env-Validierung, Supabase lokal, i18n-Gerüst, Tokens, Konzept-Mockups | Lauffähige leere App mit Theme, Sprache, Navigation | ⏳ wartet |
| **2** – Accounts & Sicherheit | Auth (Apple, Google, Microsoft, E-Mail, Passkey), Profil, Konten verknüpfen, Löschung/Export, RLS-Basis, Rate-Limits | Sichere Anmeldung Ende-zu-Ende | ⏳ |
| **3** – Kalender-Kern | Ansichten, Termine, RRULE, Zeitzonen, lokale Erinnerungen, ICS; **+ Anti-Chaos-Basis** (siehe §3) | Vollwertiger persönlicher Kalender | ⏳ |
| **4** – Events & Einladungen | Events, Rollen, RSVP mit Frist, Gast-Web-Link, Basis-Vorlagen | Erste soziale Events | ⏳ |
| **5** – Zusammenarbeit | Chat (Realtime), Umfragen mit Deadline, Aufgaben, Mitbringliste, Dateien | Komplette Event-Planung | ⏳ |
| **6** – Anti-Chaos-Engine & Karte | Wegzeit (Routing-API), Puffer-Lernen, Eskalationsstufen voll, Bereit-Check, „Ich verspäte mich“, Live-ETA, Widgets (Basis) | USP live | ⏳ |
| **7** – Familie & Gruppen | Familienbereich, Kinderprofile, Fahrdienste, Einkauf, Gruppen, Kalender-Sync Google/Outlook/iCloud | Familienplaner | ⏳ |
| **8** – Monetarisierung & Admin | Entitlements, Paywall, Store-Abos, Admin (RBAC, Comp-Abos, Audit-Log), House Ads | Bezahlmodell & Steuerung | ⏳ |
| **9** – Premium-Extras | Kosten-Split, Wetter/Plan B, Mitfahren, KI-Assistent (falls freigegeben), Erinnerungs-Album, Premium-Themes | Premium-Mehrwert | ⏳ |
| **10** – Launch-Readiness | Performance, A11y-Audit, Security-Review, Store-Listings DE/EN, Rechtstexte, Beta | Release-Kandidat | ⏳ |

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

## 3. Abweichung vom Master Prompt (Vorschlag)

**Anti-Chaos-Basis nach Phase 3 vorziehen.** Losgeh-Zeit mit **manuell** gewählter Wegzeit, gestufte
lokale Erinnerungen und ein einfacher Bereit-Check sind reine Domänenlogik plus lokale
Notifications. Sie lassen sich mit dem Kalender-Kern bauen und brauchen weder Routing-API noch Server.
Vorteil: Der USP ist ab der ersten Beta erlebbar und kann früh mit echten Nutzern getestet werden.
Phase 6 ergänzt dann Routing, Puffer-Lernen, Live-ETA und Widgets. **Entscheidung durch PO** (offene Frage im Milestone-Report).

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

Früh zu klären, weil lange Vorlaufzeiten:
- **Google OAuth Verification** für Calendar-Scopes (sensible Scopes, Prüfung kann Wochen dauern) → Antrag in Phase 6.
- **Apple Developer / Google Play Konten**, D-U-N-S, Steuerdaten → vor Phase 8.
- **Markenprüfung** des Namens → vor Store-Listings (spätestens Phase 8).
- **Rechtsprüfung** Datenschutzerklärung, AGB, Impressum → vor Beta (Phase 10).
