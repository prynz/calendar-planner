# Roadmap & Priorisierung

> **Status:** v0.4 · 2026-11-10 · Phase 1 freigegeben. Roadmap neu geschnitten: lokaler Prototyp (Block A) vor Infrastruktur (Block B), ADR 0010. **Prototyp zuerst**:
> Phasen 1–9 bauen einen nicht veröffentlichten Prototyp mit Beispieldaten, Veröffentlichung erst nach
> Phase 10 ([ADR 0008](../decisions/0008-prototype-first.md)). Phase 1 startet nach Freigabe durch den PO.

## 1. Phasen mit Review-Gates

Jede Phase endet mit typecheck → lint → format → Tests → Build-Prüfung → Doku → Milestone-Report →
**Stopp und Freigabe durch den PO**.

**Neu geschnitten am 2026-11-10** ([ADR 0010](../decisions/0010-local-first-prototype.md)): Zuerst entsteht ein
**lokaler, simulierter Prototyp** (Block A), der Optik, Haptik und Funktion vollständig erlebbar macht, ohne
Konten, Logins oder Server. Die Infrastruktur folgt danach schrittweise (Block B).

### Block A – Prototyp (lokal, Beispielwelt, keine Konten)

| Phase | Inhalt | Ergebnis | Status |
| --- | --- | --- | --- |
| **0** – Discovery & Fundament | Recherche, Personas, MoSCoW, Abo-Matrix, Namen, Referenzen, Brand, Architektur, ERD, Threat Model, Datenschutz | Doku | ✅ freigegeben |
| **1** – Projekt-Setup | Monorepo, Tooling, CI (iOS + Android), Tokens, Logo v1, Beispielwelt, Konzept-Mockups | Lauffähige App mit Theme, Sprache, Navigation | ✅ freigegeben (2026-11-10) |
| **2** – Kalender-Kern + Anti-Chaos-Basis | Lokale Datenschicht (SQLite + Repositories), Termine anlegen/bearbeiten/löschen, Tag/Woche/Monat/Agenda, Wiederholungen, Zeitzonen, **Losgeh-Zeit** mit manueller Wegzeit, gestufte **lokale Erinnerungen**, Datumsleiste mit Spring-Snap, Haptik | Persönlicher Kalender mit erlebbarem USP | ⏳ nächste Phase |
| **3** – Events & Zusammenarbeit (simuliert) | Event anlegen (auch aus Vorlagen), Demo-Personen einladen, **simulierte Zusagen** inkl. ablaufendem „Vielleicht“, Event-Detail als Bento, Umfragen mit **Swipe-Voting** und Deadline, Mitbringliste, Aufgaben, Chat (lokal simuliert), Shared-Element-Übergang | Kompletter Event-Lebenszyklus zum Durchspielen | ⏳ |
| **4** – Anti-Chaos-Engine komplett | Bereit-Check, „Ich verspäte mich“, Eskalationsstufen + Ton, Trödel-Puffer-Lernen, Pünktlichkeits-Heatmap, **Fokus-Modus**, Karten-/Ortsanzeige (Wegzeit geschätzt, gekennzeichnet) | USP vollständig erlebbar | ⏳ |
| **5** – Familie & Gruppen | Familienbereich, Kinderprofile, Fahrdienste, Einkaufsliste, Ämtchen, Gruppen mit wiederkehrenden Treffen, ICS-Import/Export | Familienplaner | ⏳ |
| **6** – Profil, Premium & Feinschliff | Onboarding, Profil, Datenschutz-Center (UI), Paywall mit **Demo-Kauf**, House-Ad-Vorschau, Premium-Themes, Kosten-Split mit PayPal-Link, Wetter/Plan B (simuliert) | Alle Kernfunktionen als Prototyp | ⏳ |
| **7** – Erlebnis-Politur & Test | Motion- und Haptik-Feinschliff, Barrierefreiheit (VoiceOver/TalkBack, 200 % Schrift), Performance, Usability-Test mit Testpersonen, finales Logo | Prototyp, der überzeugt | ⏳ |

### Block B – Ausbau (erst wenn der Prototyp überzeugt, Schritt für Schritt)

| Phase | Inhalt | Braucht vom PO |
| --- | --- | --- |
| **B1** – Backend & Konten | Supabase gehostet (Frankfurt), Anmeldung (E-Mail, Passkey, später Google/Apple/Microsoft), RLS für alle Tabellen, Repositories auf Server umstellen, Offline-Sync | Supabase-Konto; OAuth-Projekte |
| **B2** – Echte Zusammenarbeit | Einladungen an echte Personen, Realtime-Chat, Push-Benachrichtigungen, **Gast-Web** auf Vercel | Vercel-Konto |
| **B3** – Karten & Kalender-Sync | Google Places/Routes (echte Wegzeit), Live-ETA, Google-/Outlook-/iCloud-Sync | Google-Cloud-Projekt + API-Schlüssel |
| **B4** – Monetarisierung & Admin | Echte Abos (RevenueCat), Admin-Dashboard (RBAC, Comp-Abos, Audit-Log), House-Ads-Steuerung | Store-Konten |
| **B5** – Launch-Readiness | Markenprüfung, Rechtsprüfung, Security-Review, Pen-Test, Store-Listings DE/EN, Beta | Apple-Developer- und Google-Play-Konto, Fachanwalt |

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

> Hinweis (2026-11-10): Das Diagramm nutzt noch die alte Phasennummerierung von vor ADR 0010. Fachlich gilt es
> weiter für Block B (B1 = Konten, B2 = Zusammenarbeit/Gast-Web, B3 = Karten/Sync, B4 = Monetarisierung).

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
