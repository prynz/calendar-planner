# Marktanalyse: Wettbewerb, Preise, Nutzerbeschwerden

> **Status:** v0.1 · 2026-11-03 · Recherche-Stand Phase 0. Preise sind US-/Store-Preise laut Quelle und
> schwanken nach Region. **Viele Quellen sind Drittanbieter-Aggregatoren** – vor Preisentscheidungen
> gegen offizielle Store-Listings in DE prüfen (offene Aufgabe für Phase 8).

Ergänzt [MASTER_PROMPT §3](../../MASTER_PROMPT.md). Methode: Websuche (Herstellerseiten, Store-Listings,
Review-Aggregatoren, Fachpresse) am 2026-11-03. Jede Aussage hat eine Quelle, und die Belastbarkeit ist markiert:
**H** = Herstellerangabe/Store, **D** = Drittquelle, **U** = unbestätigt/widersprüchlich.

## 1. Wettbewerber im Detail

### 1.1 Social Events

| App | Modell & Preis | Stärke | Lücke für uns | Beleg |
| --- | --- | --- | --- | --- |
| **Partiful** | Kern kostenlos; seit Juni 2026 Ticketing in der App (zunächst USA); Zahlungen über Venmo/PayPal/Cash App | Einladungs-Ästhetik, Textblasts, Fotoalben, starkes Wachstum (~5 Mio. Nutzer berichtet) | US-zentriert, kaum Aufgaben/Kosten/Familie, keine Anreise-Logik | D: [subger.com](https://subger.com/en/service/partiful), [pulse.bot](https://www.pulse.bot/marketing/news/partiful-adds-inapp-ticketing-turning-its-social-platform-into-a-paidevent-marketplace-f1e21f34-b773-4906-b34f-19f859e5747b/), [ecosistemastartup.com](https://ecosistemastartup.com/partiful-la-startup-que-revoluciono-las-fiestas-con-5m-de-usuarios-en-2026/), [fotify.app](https://fotify.app/blog/best-partiful-alternatives-2026/) |
| **Luma** | Free: unbegrenzte Events/Gäste, 5 % Gebühr auf bezahlte Events. **Luma Plus** ca. 59 $/Monat (jährlich), 0 % Plattformgebühr, höhere Versandlimits | Community-/Business-Events, Kalender-Seiten | Auf Veranstalter ausgerichtet, nicht auf Freundeskreis/Familie | H: [luma.com/pricing](https://luma.com/pricing), [help.luma.com](https://help.luma.com/p/luma-plus-overview) |
| **Howbout** | Social Calendar, Store-Rating ~4,8 | Freunde-Verfügbarkeit, Social-Kalender | Beschwerden: **Einladungszwang** (App erst nutzbar, wenn Freunde beitreten), Kalenderdaten nach Deinstallation weg | U: [marlvel.ai](https://marlvel.ai/api/llm/apps/social-networking/howbout-shared-calendar), [trustpilot.com](https://www.trustpilot.com/review/howbout.app) |
| Facebook Events | kostenlos, werbefinanziert | Reichweite | Viele Nutzer haben kein Facebook mehr, Datenschutz, keine Struktur | Allgemeinwissen, nicht neu recherchiert |

### 1.2 Terminfindung

| App | Modell & Preis | Stärke | Lücke | Beleg |
| --- | --- | --- | --- | --- |
| **Doodle** | Free mit Werbung; Premium historisch ~39 $/Jahr (Private), Business teurer; 14 Tage Testphase. Aktueller Preis **unbestätigt** | Bekanntheit | Nach der Abstimmung ist Schluss: kein Event-Lebenszyklus. Werbung im Free-Tarif | U: [project-management.com](https://project-management.com/doodle-software-review/), [rallly.co](https://rallly.co/blog/is-doodle-still-free) |
| **Rallly** | Open Source (AGPL-3.0), Free mit max. 3 offenen Umfragen, bezahlte Stufe ~6 $/Sitz | Werbefrei, selbst hostbar | Nur Umfrage, kein Kalender/Chat | H/D: [rallly.co](https://rallly.co/blog/is-doodle-still-free), [toolradar.com](https://toolradar.com/compare/rallly-vs-doodle) |

### 1.3 Familienplaner

| App | Modell & Preis | Stärke | Lücke | Beleg |
| --- | --- | --- | --- | --- |
| **TimeTree** | Free mit Werbung; Premium ~4,49 $/Monat bzw. 44,99 $/Jahr (werbefrei, Support) | Sehr verbreitet in Asien/EU, geteilte Kalender | Premium bietet wenig Mehrwert außer „werbefrei“; kaum Event-Tiefe | D: [apppricinglab.com](https://apppricinglab.com/iap/apple/952578473), H: [timetreeapp.com](https://timetreeapp.com/intl/en/newsroom/2022-04-19/premium) |
| **Cozi** | Free mit Werbung; **Cozi Gold** ~39 $/Jahr; Cozi Max ~79,99 $ | Einkaufslisten, Familienkalender | Altbackenes Design, US-Fokus | H: [cozi.com](https://www.cozi.com/compare-plans/), D: [apppricinglab.com](https://www.apppricinglab.com/iap/apple/407108860) |
| **FamilyWall** | Premium ~4,99 $/Monat bzw. 41,99 $/Jahr | Familien-Hub (Listen, Ort, Kalender) | Kaum sozial, wenig Event-Logik | H (Store): [apps.apple.com](https://apps.apple.com/mw/app/id496889629?l=en-gb) |

### 1.4 Teams/Vereine

| App | Modell | Stärke | Lücke | Beleg |
| --- | --- | --- | --- | --- |
| **Spond** | Kostenlos und werbefrei, finanziert über **Transaktionsgebühren** (Zahlungen, Fundraising) | Anwesenheit, Vereinsorga, sehr verbreitet in Skandinavien/DACH | Kein privater/sozialer Fokus, keine Anreise | H: [help.spond.com](https://help.spond.com/no/articles/28548), [techround.co.uk](https://techround.co.uk/interviews/a-chat-with-trine-falnes-spond/) |
| TeamSnap | gestaffelte Abos | US-Sport | – | D: [marlvel.ai](https://marlvel.ai/intel-report/sports/com-spond) |

### 1.5 Kosten teilen

| App | Modell & Preis | Lücke | Beleg |
| --- | --- | --- | --- |
| **Splitwise** | Free mit **Tageslimit für Ausgaben** (je nach Quelle 3–5/Tag, nicht offiziell veröffentlicht); Pro ~3,99–4,99 $/Monat bzw. ~40–50 $/Jahr | Losgelöst vom Event; das Tageslimit wird in Reviews stark kritisiert | D: [getfinny.app](https://getfinny.app/blog/splitwise-pricing-2026), [split-circle-landing](https://split-circle-landing.pages.dev/en/blog/splitwise-free-vs-pro) |
| **Tricount** | 2022 von bunq übernommen; Premium eingestellt, App kostenlos (Monetarisierung über bunq-Konten) | Losgelöst vom Event | H: [tricount.com](https://tricount.com/en/what-happened-with-premium), [techcrunch.com](https://techcrunch.com/2022/05/03/bunq-to-acquire-group-expenses-app-tricount) |

### 1.6 Neurodivergenz / Zeitblindheit

| App | Modell & Preis | Stärke | Lücke | Beleg |
| --- | --- | --- | --- | --- |
| **Tiimo** | ~79,99 $/Jahr Einzel, ~119,99 $/Jahr Familie (Angaben schwanken) | Visuelle Tagesplanung, Fokus-Timer, KI-Aufgabenzerlegung | Einzelnutzer-Tool: keine Gruppen, keine Events, keine Wegzeit | D: [lifestack.ai](https://lifestack.ai/blog/tiimo-pricing), [habi.app](https://habi.app/insights/best-adhd-planner-apps/) |

### 1.7 Klassische Kalender, Chat, To-do

Google/Apple/Outlook-Kalender, WhatsApp/Signal und Todoist/Microsoft To Do sind kostenlos oder
gebündelt und gesetzt. **Wir konkurrieren nicht gegen sie, wir integrieren sie:** Zwei-Wege-Sync bzw.
Busy-Overlay, ICS-Export, Teilen-Links in bestehende Chats. Das Muster „Infos gehen im Gruppenchat
unter“ ist der Kern unseres Event-Hubs.

## 2. Preis-Benchmark (für die Abo-Matrix)

| Produkt | Monat | Jahr | Bemerkung |
| --- | --- | --- | --- |
| TimeTree Premium | ~4,49 $ | ~44,99 $ | im Wesentlichen werbefrei |
| Cozi Gold | – | ~39 $ | Familie |
| FamilyWall Premium | ~4,99 $ | ~41,99 $ | Familie |
| Splitwise Pro | ~3,99–4,99 $ | ~40–50 $ | nur Kosten |
| Tiimo | ~6,99 $ | ~79,99 $ (Familie ~119,99 $) | Neurodivergenz |
| Doodle Private | – | ~39 $ (unbestätigt) | nur Umfragen |
| **Nowish Plus (Entwurf)** | 2,99 € | 24,99 € | Power-User |
| **Nowish Family (Entwurf)** | 7,99 € | 64,99 € | bis 6 Personen |

**Schlussfolgerung:** Einzel-Tools im Familien-/Organisationssegment liegen bei **~40–45 $/Jahr**.
Nowish **Plus** liegt mit 24,99 €/Jahr bewusst darunter (Einstiegshürde senken, Wechsel aus Free).
**Family** bei 64,99 € ist nur vertretbar, wenn mehrere Tools ersetzt werden (Familienkalender +
Kosten + Fokus). Empfehlung und Alternativen: [monetization.md §2](monetization.md).

## 3. Wiederkehrende Nutzerbeschwerden (Muster)

| Muster | Bei | Konsequenz für uns |
| --- | --- | --- |
| Zwang, Freunde einzuladen, bevor die App nutzbar ist | Howbout (U) | Solo-Nutzen ab Minute 1; Einladen ist immer optional |
| Werbung im Free-Tarif nervt, Premium = nur „werbefrei“ | TimeTree, Doodle, Cozi (D) | House Ads dezent, mit Frequency Caps und Tabu-Zonen; Premium bietet **echten Mehrwert**, nicht nur Werbefreiheit |
| Künstliche Tageslimits | Splitwise (D) | Keine Limits für Kernhandlungen (Ausgabe erfassen, zusagen, abstimmen) |
| Daten verschwinden beim Deinstallieren / unklare Sync-Wirkung | Howbout (U) | Sync-Verhalten in der UI erklären; nie externe Kalenderdaten löschen ohne explizite Bestätigung |
| US-Zentrierung (Zahlungs-Apps, Sprache, Datumsformat) | Partiful, Cozi | DACH-first: Deutsch muttersprachlich, 24 h, Montag als Wochenstart, PayPal-Link statt Venmo |

## 4. Positionierung

```
                Struktur / Logistik hoch
                        │
       Spond · Cozi     │      ★ Nowish
       FamilyWall       │   (sozial + logistisch + Anti-Chaos)
                        │
 Einzelperson ──────────┼────────────── Gruppe / sozial
                        │
       Tiimo · Todoist  │   Partiful · Luma · Howbout
       Google Kalender  │   WhatsApp
                        │
                Struktur / Logistik niedrig
```

Kein Wettbewerber verbindet **soziale Events + Familien-Logistik + Pünktlichkeits-Hilfe**. Die
Anti-Chaos-Engine (Losgeh-Zeit, gestufte Erinnerungen, „Ich verspäte mich“) wurde bei keinem der
untersuchten Wettbewerber als Kernfunktion gefunden. Tiimo kommt mit sichtbarer Zeit am nächsten, hat
aber keine Wegzeit und keine Gruppe.

## 5. Lücken in dieser Recherche (ehrlich)

- Keine systematische Auswertung von 1-Stern-Reviews direkt in App Store/Play Store (dort nicht per
  Websuche zugänglich). **Empfehlung:** In Phase 1 manuell 50 Reviews je Top-Wettbewerber in DE lesen.
- DE-Store-Preise in € nicht verifiziert (Quellen meist US-$).
- Keine Nutzerinterviews. **Empfehlung:** 8–10 Interviews (je 2 pro Persona) vor Phase 4.
- DACH-spezifische Apps (z. B. Vereins- und Kita-Apps) nur oberflächlich betrachtet.
