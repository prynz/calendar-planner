# MASTER PROMPT – Social Planner App (Arbeitstitel „PLANLOS“)

> **Status:** v1.0 · 2026-11-02 · Startdokument. Der Agent erzeugt daraus `PROJECT_BRIEF.md`, `CLAUDE.md`
> und die Doku-Struktur und beginnt mit **Phase 0**. Danach Stopp und Review durch den Product Owner (PO).
>
> **So benutzen:** Diesen gesamten Text als erste Nachricht an Claude Code geben (im Repo `calendar-planner`).
> Design-Referenz-Screenshots nach `docs/design/references/` legen – ihre Analyse steht bereits in Abschnitt 5.1.

---

## 0. Deine Rolle

Du bist ein Senior-Team in einer Person: Product Lead, UX/UI- & Motion-Designer, Mobile-Architekt
(React Native/Expo), Backend-/Security-Engineer, Datenschutz-Berater (DSGVO) und Growth-/Monetarisierungs-
Stratege. Du arbeitest gründlich, in kleinen nachvollziehbaren Schritten, dokumentierst Entscheidungen und
**täuschst niemals Fertigkeit vor**. Du baust ein Produkt, das als **Marke** funktioniert und über Jahre
weiterentwickelt werden kann.

Sprache der Doku und Kommunikation mit dem PO: **Deutsch**. Code, Commits, Identifier: **Englisch**.

---

## 1. Produktvision

**Eine Planungs-App für alle, die sonst planlos sind.**
Kalender, Terminplaner und Event-Organisator in einem – mit Fokus auf Menschen, die chaotisch,
unorganisiert, notorisch zu spät oder schlecht im Planen sind. Alles, was zu einem Termin gehört, lebt an
**einem Ort**: Infos, Umfragen, Chat, Ort/Karte, Aufgaben, Mitbringliste, Kosten, Dokumente, Erinnerungen.

Die App funktioniert gleichermaßen für:

1. **Soziale Events** – Treffen, Partys, Geburtstage, Grillabende, Festivals, Urlaube, Junggesellenabschiede.
2. **Normale Terminplanung** – Arzt, Arbeit, Fristen, Routinen, wiederkehrende Termine.
3. **Familienplanung** – gemeinsamer Familienkalender, Kinder-Termine, Fahrdienste, Einkauf, Haushaltsaufgaben.
4. **Gruppen & Vereine** (später) – Trainingspläne, Teams, wiederkehrende Gruppentermine.

**Markenversprechen (Claim-Entwurf):**
- DE: _„Du chillst. Wir planen.“_ / _„Endlich pünktlich. Ohne Stress.“_
- EN: _„You show up. We handle the rest.“_

**Arbeitstitel:** „PLANLOS“ (selbstironisch, merkfähig im DACH-Raum). In Phase 0 lieferst du **5 weitere
Namensvorschläge** (international aussprechbar, Domain/App-Store-tauglich) inkl. Hinweis, dass Marken- und
Domainprüfung (DPMA/EUIPO/USPTO) durch den PO erfolgen muss. Der Name wird **zentral** gehalten
(`packages/brand`), damit ein Rename trivial ist.

**Grundhaltung:** Die App ist hilfreich und macht Spaß – aber **keine manipulativen Mechaniken**
(keine Dark Patterns, keine Schuldgefühle, kein künstlicher Zeitdruck beim Kauf, keine versteckten Kosten).

---

## 2. Zielgruppen & Personas

Erarbeite in Phase 0 mindestens diese Personas mit Jobs-to-be-done, Pain Points und Erfolgsmetrik:

| Persona | Kurzbeschreibung | Kernproblem |
| --- | --- | --- |
| **Chaos-Chris** (22–35) | Spontan, sozial, kommt immer 15 Min. zu spät | Vergisst Termine, unterschätzt Wegzeiten, verliert Infos im Gruppenchat |
| **Orga-Olivia** (25–40) | Die eine Person, die im Freundeskreis alles organisiert | Hinterherrennen nach Zusagen, Geld, Mitbringseln; Infos über 5 Apps verteilt |
| **Familien-Frank** (30–50) | 2 Kinder, Job, Hobbys der Kinder | Wer fährt wen wohin? Wer kauft was? Termine kollidieren |
| **ADHS-Alex** (alle Alter) | Neurodivergent, Zeitblindheit | Braucht sanfte, mehrstufige, konkrete Erinnerungen statt einem Pling |
| **Gast-Gabi** | Wird nur eingeladen, will keine App installieren | Möchte per Link zusagen, abstimmen, sehen was sie mitbringen soll |

---

## 3. Marktanalyse: Wettbewerb, Lücken & Nischen

### 3.1 Wettbewerb (in Phase 0 verifizieren & ergänzen – aktuelle Recherche, Quellen angeben)

| Kategorie | Beispiele | Stärke | Lücke |
| --- | --- | --- | --- |
| Klassische Kalender | Google Kalender, Apple Kalender, Outlook | Sync, Zuverlässigkeit | Keine Gruppenorga, kein Chat, keine Listen, nicht „sozial“ |
| Terminfindung | Doodle, Rallly, WhenAvailable | Umfrage für Datum | Endet nach der Abstimmung; kein Event-Lebenszyklus |
| Social Events | Partiful, Luma, Facebook Events, Howbout | Einladung, RSVP, Vibe | Schwach bei Aufgaben, Kosten, Logistik, Familie; oft US-zentriert |
| Familienplaner | TimeTree, Cozi, FamilyWall | Geteilter Kalender | Wenig ansprechendes Design, kaum Event-Tiefe |
| Teams/Vereine | Spond, TeamSnap | Anwesenheit, Gruppen | Kein privater/sozialer Fokus |
| Kosten teilen | Splitwise, Tricount | Abrechnung | Losgelöst vom Event |
| Gruppenchat | WhatsApp, Signal, Telegram | Jeder hat es | Infos gehen unter, keine Struktur |
| To-do | Todoist, Microsoft To Do | Aufgaben | Nicht event- und gruppenbezogen |

### 3.2 Identifizierte Lücken – unsere Differenzierung

Diese Punkte sind **Kern der Marke** und müssen im Produkt prominent und attraktiv umgesetzt werden:

1. **Anti-Chaos-Engine (USP)** – Die App plant *rückwärts* vom Termin:
   - **„Losgeh-Zeit“** statt nur Startzeit: Wegzeit (je nach Verkehrsmittel, Live-Verkehr), persönlicher
     **Trödel-Puffer** (lernt aus der Vergangenheit, abschaltbar) und Vorbereitungszeit.
   - **Eskalierende Erinnerungen** in Stufen: „Morgen: Geschenk kaufen“ → „In 60 Min. fertig machen“ →
     „In 10 Min. losgehen“ → „JETZT los“. Ton & Intensität einstellbar (sanft → nachdrücklich).
   - **Bereit-Check** vor dem Losgehen: Checkliste (Ticket, Geschenk, Mitbringsel, Schlüssel, Ladekabel).
   - **„Ich verspäte mich“-Knopf** mit 1 Tap: teilt ETA (optional Live-Standort, zeitlich begrenzt) mit der Gruppe.
   - **Pünktlichkeits-Bilanz** (privat, positiv formuliert, keine öffentliche Bloßstellung).
2. **Event-Lebenszyklus komplett in einer App:** Idee → Terminfindung → Einladung → Planung → Durchführung
   → Erinnerungen (Fotos, Abrechnung, „Nächstes Mal wieder?“).
3. **Gäste ohne App-Zwang:** Jedes Event hat einen sicheren Web-Link (Zusage, Abstimmung, Mitbringliste,
   Infos). App-Installation wird angeboten, nie erzwungen. → organisches Wachstum.
4. **Entscheidungs-Deadlines:** Umfragen schließen automatisch; Nichtwähler werden einmal freundlich erinnert;
   danach entscheidet die Mehrheit bzw. der Host. Kein endloses „wer kann wann?“.
5. **Zuverlässigkeits-Zusagen:** RSVP mit „Ja / Vielleicht / Nein“ + **„Vielleicht“ läuft ab** (Frist), damit
   Hosts verlässlich planen können.
6. **Neurodivergenz-freundlicher Modus („Fokus-Modus“):** reduzierte Oberfläche, visuelle Zeitbalken
   (Zeit wird sichtbar), Mikroschritte, Body-Doubling-Timer, keine überfordernden Listen.
7. **Familien-Logistik:** Fahrdienst-Planung („Wer bringt/holt?“), Kinderprofile ohne eigenen Account,
   Haushalts-Ämtchen, Einkaufsliste, Ferien-/Schulkalender-Import.
8. **Vorlagen für Lebenssituationen:** Geburtstag, Grillen, Spieleabend, Festival, Urlaub, Umzug,
   Hochzeit/JGA, Kindergeburtstag, Weihnachten, Arzttermin, Behördengang (mit Dokumenten-Checkliste).
9. **Kosten direkt im Event:** Ausgaben erfassen, fair aufteilen, offene Beträge sehen, „Erledigt“ markieren
   (keine eigene Zahlungsabwicklung in v1 – nur Tracking & Deep-Links zu PayPal o. ä., rechtlich prüfen).
10. **Wetter- & Plan-B-Logik:** Outdoor-Events zeigen Wettertrend; Host kann Plan B hinterlegen, der bei
    Schlechtwetter mit einem Tap an alle geht.
11. **Mitfahr- & Anreise-Koordination:** Fahrgemeinschaften, freie Plätze, Treffpunkt, ÖPNV-Link.
12. **Datenschutz als Feature (DACH-Vorteil):** EU-Hosting, keine Werbe-Tracker, transparente Datenübersicht –
    aktiv als Markenwert kommuniziert.

### 3.3 Weitere Ideen (priorisieren in Phase 0, nicht alles in v1)

- **KI-Planungsassistent (Premium):** „Freitag 19 Uhr Grillen bei Tom, 8 Leute“ → fertiges Event mit
  Vorlage, Mitbringliste, Aufgaben. Packlisten-Vorschläge. Zusammenfassung des Event-Chats („Was habe ich
  verpasst?“). Nur mit Opt-in, Datenminimierung, Anbieter in der Datenschutzerklärung.
- **Erinnerungs-Album** nach dem Event (geteilte Fotos, zeitlich begrenzt oder dauerhaft – Host entscheidet).
- **Widgets** (iOS/Android Homescreen & Lockscreen, Live Activities / Live Updates für „Losgehen in …“).
- **Apple Watch / Wear OS** Erinnerungen (später).
- **Kalender-Overlay:** private Termine aus Google/Apple/Outlook werden als „belegt“ eingeblendet, ohne
  Details zu teilen → automatische Terminvorschläge, wann alle können.
- **QR-Check-in** für größere Events, Gästeliste.
- **Wiederkehrende Gruppen-Rituale** („Jeden 1. Freitag Stammtisch“) mit rotierendem Gastgeber.
- **Geschenke-Pool & Wunschliste** für Geburtstage (ohne Geldabwicklung in v1).
- **Saisonale Themes & Event-Cover** (animierte Header, Sticker) – auch als Premium-Wert.

---

## 4. Funktionsumfang (Module)

Jedes Modul bekommt in Phase 0 eine eigene Spezifikation unter `docs/product/features/<modul>.md` mit
User Stories, Akzeptanzkriterien, Leer-/Lade-/Fehlerzuständen und Free/Premium-Grenze.

1. **Kalender** – Tag/Woche/Monat/Agenda, flüssige Gesten, Farben pro Kalender, wiederkehrende Termine
   (RRULE), Zeitzonen, Ganztags/Mehrtägig, Konflikterkennung. Import/Export (ICS), Zwei-Wege-Sync mit
   Google Kalender, Apple/iCloud (CalDAV/EventKit) und Outlook (Microsoft Graph) – Sync-Konflikte sauber lösen.
2. **Events (Herzstück)** – Titel, Cover, Beschreibung, Zeit/Zeitfenster, Ort, Rollen (Host, Co-Host,
   Gast), Sichtbarkeit (privat / per Link / Gruppe), Kapazität, Dresscode, Notizen.
3. **Umfragen & Votes** – Terminfindung, Ortswahl, freie Fragen, Mehrfachauswahl, anonym optional,
   Deadline, Ergebnisse animiert.
4. **Chat** – pro Event und pro Gruppe; Antworten, Reaktionen, Bilder, Sprachnachrichten (später),
   Erwähnungen, angeheftete Nachrichten, „Wichtig“-Markierung, Stummschalten. Moderation & Melden.
5. **Ort & Karte** – Ortssuche, Treffpunkt-Pin, Anreiseplanung, Wegzeit, Parken/ÖPNV-Hinweis,
   Live-ETA (opt-in, zeitlich begrenzt, jederzeit stoppbar).
6. **Aufgaben** – zuweisen, Fälligkeiten, Erledigt-Animation, „Wer übernimmt?“-Selbstzuweisung.
7. **Mitbringliste** – Items mit Mengen, Kategorien, „Ich bringe das mit“, Doppelte vermeiden.
8. **Kosten** – Ausgaben, Aufteilung, Salden (nur Tracking).
9. **Dateien/Datenspeicher** – Tickets, PDFs, Bilder, Links; Speicherlimit nach Abo; Virenscan/Typprüfung.
10. **Erinnerungen & Anti-Chaos-Engine** – siehe 3.2 Punkt 1. Push, lokale Notifications, Widgets.
11. **Familie** – Familienbereich, Kinderprofile (ohne Account, nur Namen/Farbe), Fahrdienste, Einkauf,
    Haushaltsaufgaben. Familien-Admin.
12. **Gruppen** – Freundeskreise/Teams mit gemeinsamem Kalender und wiederkehrenden Events.
13. **Vorlagen** – kuratiert + eigene speichern (Premium).
14. **Gast-Web-Ansicht** – schnelle, sichere, responsive Web-Seite pro Event-Link.
15. **Profil & Einstellungen** – Sprache, Theme (Hell/Dunkel/System), Erinnerungsstil, Fokus-Modus,
    Datenschutz-Center, verbundene Konten, Abo-Verwaltung, Account löschen.

---

## 5. Design, Marke & Erlebnis

> Die Original-Screenshots gehören nach `docs/design/references/` (der PO legt sie dort ab). Abschnitt 5.1
> ist die verbindliche Zusammenfassung des PO dazu. Leite daraus eine **eigene** Gestaltung ab – keine Kopie
> fremder Apps, Shots oder Marken.

### 5.1 Design-Referenzen des PO (Analyse)

Vom PO gelieferte Referenzen (Dribbble-artige Konzept-Shots):

| # | Referenz | Was wir übernehmen (als Prinzip) |
| --- | --- | --- |
| R1 | „Claims“-App: fast schwarzer Hintergrund, **Neon-Lime** als Signalfarbe, weiße Pill-Tabs | Dark-first, eine einzige knallige Akzentfarbe, große Radien (24–32), runde Icon-Buttons, Filter-Chips, Bento-Kacheln, Fortschrittsring, organische Blob-Formen |
| R2 | „My Tasks“: dunkles Navy, horizontale Datumsleiste mit Pill-Auswahl, Timeline | **Tages-Timeline** mit Zeitspalte links, Pastell-Eventkarten (Mint, Cyan, Flieder) mit **Status-Reiter** („Läuft“, „Erledigt“), Avatar-Stapel + „+“, Fortschrittsbalken |
| R3 | „Activity Planner“: Lila + Lime, Onboarding „Take control of your schedule“ | **Riesige Display-Typografie** mit eingerahmtem Schlüsselwort, schwebende Glas-Karten, rotierendes Text-Badge, **schwebende Pill-Tab-Bar**, große Zahlen („24/30“), gestreifte Fortschrittsbalken |
| R4 | „Heat Map“: dunkles Monatsraster mit Lime-Intensität | **Heatmap-Kalender** (z. B. Auslastung, Pünktlichkeits-Bilanz, Familienwoche), Kennzahl-Karten mit Balken |
| R5 | „Search freelancers“: helle Creme-Variante, **Swipe-Kartenstapel** | Heller Modus in warmem Creme statt Reinweiß, schwarze Pills, Karten-Stack mit Swipe-Geste – **ideal für Votes/Terminfindung** („wischen statt ankreuzen“) |

Abgeleitete Designrichtung (in Phase 0 als Token-Entwurf + Konzept-Mockups ausarbeiten):

- **Farbwelt:** Dark-first (Anthrazit/Navy-Schwarz), **Signal-Lime** als Markenfarbe, **Lila** als
  Sekundärfarbe, Pastell-Palette für Event-Kategorien (Mint, Cyan, Flieder, Pfirsich …). Heller Modus in
  warmem Creme. Lime auf Weiß ist kontrastschwach → Kontrastregeln (WCAG AA) im Token-System lösen
  (z. B. Lime nur als Fläche mit dunkler Schrift).
- **Typografie:** moderne Grotesk mit Charakter für Display (große Zahlen, Headlines), gut lesbare
  Text-Schrift; Lizenz prüfen (Open-Font-Lizenz bevorzugt).
- **Formen:** große Radien, Pills, Kreis-Buttons, Bento-Grids, Karten mit Reiter-Ausschnitt, Avatar-Stapel.
- **Navigation:** schwebende Pill-Tab-Bar; Haupt-Aktion („+ Event“) prominent.
- **Signature-Interaktionen:** Swipe-Voting, Datumsleiste mit Spring-Snap, Karten → Detail als
  Shared-Element-Übergang, Fortschrittsringe, die sich beim Abhaken füllen, Heatmap-Einblendung.
- Ziel: wiedererkennbarer Look („Lime auf Dunkel“ als Markenzeichen), der trotz Effekten ruhig und
  übersichtlich für chaotische Köpfe bleibt.

**Anspruch:** hochwertig, lebendig, animiert, interaktiv, spannend – und trotzdem ruhig und klar für
chaotische Köpfe. „Premium-Gefühl ab dem ersten Screen.“

- **Designsystem zentral** (`packages/ui`): Tokens für Farben, Typografie, Abstände, Radien, Schatten,
  Motion (Dauer/Easing/Springs), Haptik. **Keine Roh-Werte in Screens** (Lint-Regel).
- **Hell- & Dunkelmodus** von Anfang an; Event-Farben/Cover dynamisch, Kontrast WCAG AA.
- **Motion-Prinzipien:** physikalische Springs, Shared-Element-Übergänge (Event-Karte → Detail),
  Mikrointeraktionen (Zusagen, Abhaken, Vote), Konfetti/Celebration sparsam bei echten Erfolgen.
  `Reduced Motion` wird immer respektiert. Ziel: 60/120 fps.
- **Haptisches Feedback** für Kernaktionen.
- **Markenelemente:** Logo-System (Bildmarke + Wortmarke), App-Icon, Splash, Illustrationsstil, optional
  ein Maskottchen/Charakter (z. B. als freundlicher „Organisations-Buddy“, der in Leerzuständen und
  Erinnerungen auftaucht) – alles in `packages/brand`, versioniert, austauschbar.
- **Tonalität:** locker, warm, augenzwinkernd, nie belehrend („Na, schon losgegangen? 😉“). DE und EN
  jeweils muttersprachlich-natürlich, nicht wörtlich übersetzt.
- **Brand Book** unter `docs/brand/` (Werte, Stimme, Farben, Typo, Do/Don’t, Beispiel-Screens).
- **Barrierefreiheit:** Screenreader-Labels, dynamische Schriftgrößen, Touch-Ziele ≥ 48 dp, Farbe nie
  einziger Informationsträger.

---

## 6. Monetarisierung: Abos, interne Werbung, Admin

### 6.1 Abo-Stufen (Entwurf – in Phase 0 mit Preisrecherche finalisieren)

| | **Free** | **Plus** | **Pro** | **Family** |
| --- | --- | --- | --- | --- |
| Zielgruppe | Einsteiger, Gäste | Einzelne Power-User | Organisatoren/Hosts | Haushalte (bis 6 Pers.) |
| Preisidee (mtl./jährl.) | 0 € | ~2,99 € / 24,99 € | ~5,99 € / 49,99 € | ~7,99 € / 64,99 € |
| Interne Werbung | ja (dezent) | nein | nein | nein |
| Aktive Events | z. B. 5 | unbegrenzt | unbegrenzt | unbegrenzt |
| Teilnehmer pro Event | z. B. 15 | 50 | 250 | 50 |
| Anti-Chaos-Engine | Basis (1 Erinnerung + Losgeh-Zeit) | voll (Stufen, Puffer-Lernen, Bereit-Check) | voll | voll für alle Mitglieder |
| Kalender-Sync | 1 Konto | alle | alle | alle |
| Speicher | 100 MB | 5 GB | 25 GB | 25 GB geteilt |
| Vorlagen | kuratierte Basis | alle + eigene | alle + eigene + teilen | alle |
| KI-Assistent | – | Kontingent | großes Kontingent | Kontingent |
| Themes/Cover | Basis | Premium | Premium + eigenes Branding | Premium |
| Kosten-Split, Fahrdienste | Basis | voll | voll | voll |
| Gruppen | 1 | 5 | unbegrenzt | Familie + 5 |

Grundsätze (verbindlich):

- **Free muss wirklich nützlich sein.** Premium erweitert, es erpresst nicht. Gäste-Funktionen
  (zusagen, abstimmen, mitbringen, chatten) sind **immer kostenlos** – sonst bricht das Netzwerk.
- **Volle Transparenz:** Vergleichstabelle, Preis inkl. MwSt., Laufzeit, Verlängerung, Kündigung in
  2 Taps, Hinweis auf Kündigung über App Store/Play Store. Kein vorausgewähltes teuerstes Paket als Trick.
- **Kostenlose Testphase** (z. B. 7–14 Tage) mit **Erinnerung vor Ablauf**.
- **Wert sichtbar machen statt drängen:** Kontextuelle, einmalige „Wusstest du?“-Hinweise genau dort, wo
  ein Premium-Feature hilft (z. B. beim 6. Event, beim Upload eines großen Tickets). Gesperrte Features
  zeigen eine **Live-Vorschau**, was sie tun würden. Jeder Hinweis ist schließbar; Frequenz begrenzt.
- **Belohnung für Treue:** Jahresabo-Rabatt, Gründer-Preis für frühe Nutzer, Empfehlungsprogramm
  (z. B. 1 Monat Plus für beide) – ohne Glücksspielmechaniken.
- **Technik:** Abos ausschließlich über **Apple In-App-Purchase und Google Play Billing** (Store-Pflicht für
  digitale Inhalte), Abstraktion via RevenueCat (oder gleichwertig, begründen). **Server ist die einzige
  Wahrheit für Berechtigungen** (Entitlements), Store-Webhooks/Receipts serverseitig validiert.

### 6.2 Interne Werbung (House Ads) – vollständig steuerbar

Für Free-Nutzer werden **eigene/interne Anzeigen** (Eigenwerbung für Premium, Features, Partner-Aktionen
später) an definierten Stellen gezeigt. **Keine externen Werbe-SDKs, kein Tracking.**

Im Admin einstellbar:

- **Platzierungen (Slots):** z. B. Agenda-Feed (native Karte), Event-Übersicht (Banner unten),
  nach Event-Erstellung (Interstitial, max. 1×/Tag), Einstellungen, Leerzustände. Jeder Slot einzeln an/aus.
- **Inhalt:** Titel, Text, Bild/Animation (Lottie), CTA, Ziel (Deep-Link in die App/Paywall/URL), Sprache.
- **Intensität:** Frequency Caps (pro Session/Tag/Woche), Mindestabstand zwischen Anzeigen, max. Anteil im Feed.
- **Dauer:** Laufzeit von–bis, Anzeigedauer, Schließen-Knopf nach X Sekunden (max. 5 s, nie ohne Schließen).
- **Zielgruppe (datensparsam):** Abo-Stufe, Sprache, App-Version, Plattform, Account-Alter – keine Profilbildung.
- **Priorität, Rotation, A/B-Varianten**, Vorschau pro Gerät/Theme, Not-Aus („alle Anzeigen aus“).
- **Statistik:** Impressionen, Klicks, Conversions – **aggregiert**, ohne personenbezogenes Tracking.

Tabu-Zonen (fest im Code, nicht konfigurierbar): Chat, Eingabeformulare, Erinnerungen/Notifications,
Bereit-Check, „Ich verspäte mich“, Onboarding der ersten Session, Datenschutz-/Kündigungsscreens.

### 6.3 Admin-Dashboard (Web)

- **Rollen (RBAC):** Super-Admin, Admin, Support, Content-Editor, Read-only. Pflicht-2FA (Passkey/TOTP).
- **Nutzerverwaltung:** suchen, Status, Sperren, Account-Löschung auf Anfrage – mit Sichtbarkeit nur der
  nötigen Daten (keine Chat-/Event-Inhalte ohne gesonderte, protokollierte Begründung).
- **Premium manuell zuteilen („Comp-Abos“):** Stufe, Start, Ende/unbefristet, Grund, Notiz; Widerruf;
  Sammelzuweisung (z. B. Beta-Tester, Influencer, Support-Kulanz). Klar getrennt von gekauften Abos.
- **Werbe-Steuerung** (siehe 6.2), **Feature-Flags & Remote-Config**, **Ankündigungen/In-App-News**,
  **Vorlagen-Verwaltung**, **Preis-/Paywall-Texte** (Inhalt, nicht Store-Preise).
- **Audit-Log** für jede Admin-Aktion (wer, was, wann, vorher/nachher), unveränderlich.
- **Kennzahlen-Dashboard** (aggregiert): Aktive Nutzer, Events, Conversion Free→Premium, Churn.
- **Moderation:** gemeldete Inhalte/Nutzer, Bearbeitungsstatus.

---

## 7. Accounts & Anmeldung

- **Anmeldung mit:** Google, Apple (Pflicht im App Store, wenn Google angeboten wird), Microsoft,
  E-Mail (Magic Link oder Passwort mit Stärkeprüfung), **Passkeys**. Optional später: Facebook.
- **Konten verknüpfen/trennen** (mehrere Login-Methoden pro Account), E-Mail ändern mit Bestätigung.
- **Gast-Zugang** per Event-Link (nur Name, optional E-Mail), später in vollen Account umwandelbar.
- **2FA** optional für Nutzer, Geräte-/Sitzungsübersicht mit „Überall abmelden“.
- **Account-Löschung in der App** (Store-Pflicht) inkl. Datenlöschung nach definierter Frist.
- **Mindestalter** festlegen (Vorschlag 16+, Familienfunktion mit Kinderprofilen ohne eigenen Login;
  in Phase 0 rechtlich begründen).

---

## 8. Sicherheit & Datenschutz (höchste Priorität)

Grundlage: **OWASP MASVS/MASTG** (Mobile), **OWASP ASVS** (Backend/Web), **DSGVO/BDSG/TTDSG**.

- **Server ist die einzige Autorität** für Berechtigungen, Abos, Rollen, Limits. Clients sind untrusted.
- **Datenbank:** Row Level Security auf **jeder** Tabelle, explizite Policies, Least Privilege;
  `security definer`-Funktionen nur mit fixem `search_path`. Tests für jede Policy.
- **Keine Secrets im Client.** Service-Keys nur serverseitig; `.env*` nie committen; Secret-Scanning in CI.
- **Transport & Speicherung:** TLS überall, Verschlüsselung at rest, sensible Tokens im Secure Store
  (Keychain/Keystore). Optional später: Ende-zu-Ende-Verschlüsselung für Chats (Architektur offen halten).
- **Event-Links:** nicht erratbar (≥128 Bit), widerrufbar, optional mit Ablaufdatum/PIN.
- **Rate-Limiting & Missbrauchsschutz** (Login, Einladungen, Uploads, Chat), Bot-Schutz für Web-Links.
- **Uploads:** Typ-/Größenprüfung, Bild-Re-Encoding (EXIF/Standort entfernen), private Buckets, signierte URLs.
- **Standort:** nur bei aktiver Nutzung, Live-ETA zeitlich begrenzt, jederzeit stoppbar, nie gespeichert länger als nötig.
- **Datensparsamkeit:** nur nötige Felder, kein Geburtsdatum wenn nicht nötig, keine Werbe-Tracker,
  Crash-Reporting nur datensparsam & mit Opt-in wo erforderlich.
- **Datenschutz-Center in der App:** Was speichern wir? Export (Art. 20), Löschung (Art. 17), Einwilligungen.
- **EU-Hosting**, AV-Verträge, Verzeichnis der Verarbeitungstätigkeiten, Datenschutzerklärung & Impressum
  (Entwürfe – **rechtliche Prüfung durch Fachanwalt ist Sache des PO**, Technik ≠ Rechtsfreigabe).
- **Supply Chain:** Lockfile, Dependabot/Renovate, `pnpm audit`, nur begründete Abhängigkeiten.
- **Security-Doku:** Threat Model (STRIDE) unter `docs/security/threat-model.md`, regelmäßig aktualisiert.
- Vor jedem Release: Security-Checkliste, Pentest-Plan (extern, später).

---

## 9. Sprache & Internationalisierung

- Standard **Deutsch**, umschaltbar auf **Englisch** in der App (unabhängig von Systemsprache möglich).
- Alle Texte über i18n-Schlüssel (ICU MessageFormat: Plural, Geschlecht, Variablen) – **keine Literale**.
- Datums-/Zeit-/Zahlenformate locale-abhängig, 24h/12h, Wochenstart Mo/So, Zeitzonen.
- Architektur bereit für weitere Sprachen inkl. RTL (Arabisch/Hebräisch) – Layouts nicht hart links/rechts.
- Lint/Tests prüfen fehlende Übersetzungsschlüssel.

---

## 10. Technische Architektur (Vorschlag – in Phase 0 begründen oder begründet abweichen)

| Bereich | Wahl |
| --- | --- |
| Monorepo | pnpm Workspaces, TypeScript strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) |
| Mobile | Expo (aktuelles SDK) + Expo Router, React Native New Architecture, iOS + Android parallel |
| Animation | Reanimated, Gesture Handler, Skia (lazy), Lottie; Haptics |
| State/Daten | TanStack Query (Server-State), Zustand (UI-State), lokale Persistenz/Offline (SQLite) |
| Backend | Supabase (EU-Region): Postgres + RLS, Auth, Realtime (Chat/Live-Updates), Storage, Edge Functions |
| Admin | Next.js (App Router) + Tailwind, eigenes Deployment, nur für Admin-Rollen |
| Gast-Web | Next.js-Route oder separate leichte Web-App für Event-Links |
| Abos | StoreKit / Play Billing via RevenueCat, serverseitige Entitlements |
| Push | Expo Notifications (APNs/FCM) + lokale Notifications für Anti-Chaos-Engine |
| Karten | react-native-maps (Apple Maps/Google Maps) oder Mapbox – Datenschutz & Kosten vergleichen |
| Kalender-Sync | Google Calendar API, Microsoft Graph, CalDAV/EventKit, ICS |
| Validierung | zod-Schemas als gemeinsame API-Verträge |
| Tests | Vitest (Pakete), Jest + RNTL (App), pgTAP (DB/RLS), Maestro (E2E-Flows) |
| CI/CD | GitHub Actions: typecheck, lint, format, test, DB-Tests, EAS Build iOS+Android |
| Monitoring | datensparsames Crash-Reporting (z. B. Sentry mit EU-Region, PII-Scrubbing) |

Vorgeschlagene Struktur:

```
apps/mobile          Expo-App (Routen dünn, Screens in features/*)
apps/admin           Admin-Dashboard
apps/web             Gast-Web-Ansicht für Event-Links
packages/ui          Designsystem, Tokens, Komponenten, Motion
packages/brand       Name, Logo, Claims, Assets (zentral, austauschbar)
packages/i18n        Übersetzungen de/en, Formatierung
packages/domain      Reine Logik: Termine, RRULE, Anti-Chaos-Engine, Kosten-Split, Votes (ohne RN-Imports)
packages/validation  zod-Verträge Client ↔ Server
packages/entitlements Abo-Stufen, Limits, Feature-Gates (eine Quelle der Wahrheit)
packages/config      Env-Validierung, verbietet privilegierte Keys im Client
supabase/            Migrationen, pgTAP-Tests, Seed (nur lokal), Edge Functions
docs/                Produkt, Design, Brand, Architektur, Security, Entscheidungen (ADRs)
```

Reine Pakete (`domain`, `entitlements`, `validation`) sind deterministisch und vollständig getestet.

---

## 11. Arbeitsregeln für dich (gelten dauerhaft → in `CLAUDE.md` übernehmen)

1. Vor Änderungen Repo-Zustand und Abhängigkeiten prüfen; nichts Funktionierendes blind überschreiben.
2. Kleine Schritte, klare Commits (Englisch, Imperativ, z. B. `calendar: add week view gestures`).
3. Unklare Entscheidungen sinnvoll treffen und als **ADR** (`docs/decisions/NNNN-titel.md`) begründen;
   nur rückfragen, wenn nicht verlässlich entscheidbar.
4. **Keine Fake-Funktionen, keine toten Buttons, keine Platzhalter, die Fertigkeit vortäuschen.**
   Simuliertes ist in der UI als solches gekennzeichnet. Keine verschluckten Fehler.
5. Jeder Screen hat Lade-, Leer-, Fehler- und Offline-Zustand.
6. Nur Design-Tokens und Komponenten aus `packages/ui`; Texte nur über i18n.
7. Neue Abhängigkeiten nur mit Begründung; Expo-Pakete via `npx expo install`; Lockfile mitcommitten.
8. Kein Force-Push, keine Änderungen an der Remote-Konfiguration.
9. Doku entspricht dem **tatsächlichen** Stand (Status-Zeile oben in jedem Dokument).
10. Mockups nur unter `docs/design/concept/` und klar als **Mockup** gekennzeichnet; echte Screenshots
    nach Meilensteinen unter `docs/previews/`.
11. Nach jeder Phase: typecheck → lint → format → Tests → Build-Prüfung → Doku → **Milestone-Report**
    (was fertig ist, was nicht, Risiken, offene Fragen) → **Stopp, Freigabe durch PO abwarten**.

**Definition of Done:** funktioniert Ende-zu-Ende auf iOS **und** Android, validiert Eingaben, alle
Zustände behandelt, Tests (Unit + DB/RLS wo relevant), DE+EN übersetzt, barrierefrei, Doku aktualisiert,
CI grün. Unvollständiges wird ehrlich benannt.

---

## 12. Roadmap (Phasen mit Review-Gates)

| Phase | Inhalt | Ergebnis |
| --- | --- | --- |
| **0 – Discovery & Fundament (Doku)** | Wettbewerbsrecherche (aktuell, mit Quellen), Personas, Feature-Priorisierung (MoSCoW), Abo-Matrix & Preisrecherche, Namensvorschläge, Analyse der Referenz-Screenshots, Brand-Grundlagen, Architektur, Datenmodell (ERD), Threat Model, Datenschutzkonzept, Roadmap | `PROJECT_BRIEF.md`, `CLAUDE.md`, `docs/*`, ADRs – **kein App-Code** |
| **1 – Projekt-Setup** | Monorepo, Tooling, CI (iOS+Android Build), Env-Validierung, Supabase lokal, i18n-Grundgerüst, Designsystem-Tokens, Konzept-Mockups der Kernscreens (gekennzeichnet) | Lauffähige leere App mit Theme, Sprache, Navigation |
| **2 – Accounts & Sicherheit** | Auth (Google, Apple, Microsoft, E-Mail, Passkey), Profil, Konten verknüpfen, Löschung/Export, RLS-Basis, Rate-Limits | Sichere Anmeldung Ende-zu-Ende |
| **3 – Kalender-Kern** | Ansichten, Termine, Wiederholungen, Zeitzonen, lokale Erinnerungen, ICS | Vollwertiger persönlicher Kalender |
| **4 – Events & Einladungen** | Events, Rollen, RSVP, Gast-Web-Link, Vorlagen (Basis) | Erste soziale Events |
| **5 – Zusammenarbeit** | Chat (Realtime), Umfragen/Votes mit Deadline, Aufgaben, Mitbringliste, Dateien | Komplette Event-Planung |
| **6 – Anti-Chaos-Engine & Karte** | Losgeh-Zeit, Wegzeit, Eskalations-Erinnerungen, Bereit-Check, „Ich verspäte mich“, Live-ETA, Widgets | USP live |
| **7 – Familie & Gruppen** | Familienbereich, Kinderprofile, Fahrdienste, Einkauf, Gruppen, Kalender-Sync (Google/Outlook/iCloud) | Familienplaner |
| **8 – Monetarisierung & Admin** | Entitlements, Paywall (transparent), Store-Abos, Admin-Dashboard (RBAC, Comp-Abos, Audit-Log), House-Ads-System | Bezahlmodell & Steuerung |
| **9 – Premium-Extras** | Kosten-Split, Wetter/Plan B, Mitfahren, KI-Assistent, Erinnerungs-Album, Premium-Themes | Premium-Mehrwert |
| **10 – Launch-Readiness** | Performance, Accessibility-Audit, Security-Review, Store-Listings DE/EN, Datenschutztexte, Beta (TestFlight/Play Testing) | Release-Kandidat |

---

## 13. Dein erster Auftrag: Phase 0

Führe **jetzt Phase 0** aus – nur Dokumentation, kein App-Code:

1. Lies diesen Master Prompt vollständig, prüfe `docs/design/references/` und nutze Abschnitt 5.1 als
   verbindliche Designrichtung (fehlende Originaldateien im Report vermerken).
2. Recherchiere den Markt aktuell (Wettbewerber, Preise, Bewertungen, häufige Nutzerbeschwerden in Store-
   Reviews) und ergänze Abschnitt 3 mit Quellen unter `docs/product/market-research.md`.
3. Erstelle:
   - `PROJECT_BRIEF.md` (Vision, Zielgruppen, USPs, Scope v1 vs. später, Erfolgsmetriken)
   - `CLAUDE.md` (Arbeitsregeln aus Abschnitt 11, Monorepo-Karte, Befehle)
   - `docs/product/personas.md`, `docs/product/features/*.md`, `docs/product/roadmap.md`
   - `docs/product/monetization.md` (Abo-Matrix, Paywall-Prinzipien, House-Ads-Regeln, Tabu-Zonen)
   - `docs/brand/brand-foundation.md` (Namensvorschläge, Werte, Stimme, Farb-/Typo-Richtung, Logo-Idee)
   - `docs/design/design-system.md` (Tokens, Motion, Komponenteninventar, Design-QA-Checkliste)
   - `docs/architecture/overview.md`, `docs/architecture/data-model.md` (ERD inkl. RLS-Konzept)
   - `docs/security/threat-model.md`, `docs/security/privacy.md`
   - `docs/decisions/0001-tech-stack.md` (und weitere ADRs nach Bedarf)
4. Liste offene Fragen an den PO (max. 10, priorisiert), z. B. Name, Preise, Mindestalter, Zahlungs-Links,
   KI-Anbieter, Karten-Anbieter.
5. Schreibe den **Milestone-Report** `docs/previews/milestone-reports/phase-0.md`, committe, pushe und
   **stoppe** für das Review.
