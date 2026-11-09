# Monetarisierung: Abos, Paywall, House Ads, Admin-Steuerung

> **Status:** v0.2 · 2026-11-09 · Preise vom PO entschieden (günstigere Family-Variante). Umsetzung der Logik in
> Phase 8 mit **Demo-Käufen** ([ADR 0008](../decisions/0008-prototype-first.md)); echte Store-Abos erst in Phase 10. Technik: [ADR 0003](../decisions/0003-subscriptions-revenuecat.md).

## 1. Grundsätze (verbindlich)

1. **Free ist wirklich nützlich.** Persönlicher Kalender, Termine und Erinnerungen sind in Free
   **unbegrenzt**. Limits betreffen nur Organisator-Funktionen (gehostete Events, Speicher, Sync-Konten).
2. **Gast-Funktionen sind immer kostenlos:** zusagen, abstimmen, mitbringen, chatten, Infos sehen,
   ICS exportieren – egal welche Stufe der Host hat.
3. **Keine Limits auf Kernhandlungen** (Lehre aus Splitwise): Eine Ausgabe erfassen, eine Aufgabe
   abhaken oder abstimmen kostet nie etwas.
4. **Transparenz:** Vergleichstabelle, Preis inkl. MwSt., Laufzeit, automatische Verlängerung,
   Kündigungsweg (2 Taps zur Store-Abo-Verwaltung), Hinweis auf Kündigung über App Store/Play Store.
5. **Kein Druck:** keine Countdown-Timer, kein vorausgewähltes teuerstes Paket, kein
   „Bist du sicher, dass du auf Premium verzichten willst?“. Vorausgewählt ist das **Jahresabo der
   Stufe, die der Nutzer angetippt hat** (oder gar nichts).
6. **Server ist die Wahrheit.** Entitlements kommen ausschließlich aus der DB (gespeist aus
   Store-Webhooks über RevenueCat + Comp-Abos aus dem Admin). Der Client zeigt sie nur an.
7. **Downgrade ohne Datenverlust:** Wer unter ein Limit fällt, verliert nichts. Bestehendes bleibt
   lesbar und bearbeitbar; nur **neues** über dem Limit wird blockiert, mit klarer Erklärung.

## 2. Abo-Matrix

Eine Quelle der Wahrheit im Code: `packages/entitlements` (Limits als Daten, nicht verstreut im UI).

| | **Free** | **Plus** | **Pro** | **Family** |
| --- | --- | --- | --- | --- |
| Zielgruppe | Einsteiger, Gäste | Chaos-Chris, ADHS-Alex | Orga-Olivia | Familien-Frank (bis 6 Erwachsene/Konten; Kinderprofile zählen nicht) |
| Preis mtl. / jährl. (PO 2026-11-09) | 0 € | 2,99 € / 24,99 € | 5,99 € / 49,99 € | 6,99 € / 59,99 € |
| Kostenlose Testphase | – | 14 Tage | 14 Tage | 14 Tage |
| House Ads | ja (dezent) | nein | nein | nein |
| Persönliche Termine & Kalender | unbegrenzt | unbegrenzt | unbegrenzt | unbegrenzt |
| Gleichzeitig aktive **gehostete** Events | 5 | unbegrenzt | unbegrenzt | unbegrenzt |
| Teilnehmer pro Event | 15 | 50 | 250 | 50 |
| Co-Hosts pro Event | 1 | 3 | unbegrenzt | 3 |
| Anti-Chaos-Engine | Losgeh-Zeit + 1 Erinnerung | voll (Stufen, Puffer-Lernen, Bereit-Check) | voll | voll für alle Mitglieder |
| Fokus-Modus | ja | ja | ja | ja |
| Kalender-Sync-Konten | 1 | alle | alle | alle |
| Speicher | 100 MB | 5 GB | 25 GB | 25 GB geteilt |
| Vorlagen | kuratierte Basis | alle + eigene | alle + eigene + teilen | alle |
| Kosten-Split, Fahrdienste | Basis (1 Währung, gleich verteilt) | voll | voll | voll |
| Gruppen | 1 | 5 | unbegrenzt | Familie + 5 |
| Themes/Cover | Basis | Premium | Premium + eigenes Branding | Premium |
| KI-Assistent (v2) | – | Kontingent | großes Kontingent | Kontingent |

**Entscheidungen und Begründungen**
- **Fokus-Modus in allen Stufen:** Barrierefreiheit wird nicht hinter einer Paywall versteckt.
- **Anti-Chaos-Basis in Free:** Der USP muss erlebbar sein, sonst gibt es keinen Grund für ein Upgrade.
- **14 statt 7 Tage Trial:** Ein Planungszyklus (Event planen → stattfinden) dauert typischerweise
  1–2 Wochen. Erinnerung **3 Tage vor Ablauf** (Push + In-App), nicht nur am letzten Tag.
- **Preise (PO-Entscheidung 2026-11-09):** günstigere Variante – Family **6,99 € / 59,99 €**, näher am Benchmark
  (Cozi/FamilyWall ~40 $, Tiimo-Familie ~120 $). Plus und Pro wie im Entwurf.
- **Kinderprofile zählen nicht** zu den 6 Family-Plätzen (Entscheidung nach CLAUDE.md-Regel „sinnvoll entscheiden“):
  Sie haben keinen Account und verursachen kaum Kosten; eine Familie mit 2 Erwachsenen und 4 Kindern soll nicht
  an eine Grenze stoßen. Änderbar, da Limits in `packages/entitlements` liegen.
- **Gründer-Preis:** Wer im ersten Jahr ein Jahresabo abschließt, behält den Preis, solange das Abo
  ununterbrochen läuft (Store-Mechanik „Preiserhöhung nur für Neukunden“).
- **Empfehlungsprogramm:** 1 Monat Plus für beide, wenn der Eingeladene ein eigenes Konto anlegt und
  ein Event mit ≥ 2 Teilnehmern erstellt. Max. 12 Monate gesammelt. Keine Zufallsbelohnungen.

## 3. Paywall-Prinzipien

**Kontextuelle Hinweise statt Dauerbeschallung.**

| Auslöser | Hinweis | Frequenz |
| --- | --- | --- |
| Anlegen des 6. aktiven gehosteten Events | „Du organisierst richtig viel 🙌 Mit Plus sind Events unbegrenzt.“ + Vergleich | 1× pro Auslöser und 30 Tage |
| Upload über Speicherlimit | Hinweis mit konkreter Größe und Alternativen (alte Dateien löschen) | bei jedem Versuch (blockierend, aber erklärend) |
| Zweites Sync-Konto verbinden | Live-Vorschau: „So sähe deine Woche mit beiden Kalendern aus“ | 1× pro 30 Tage |
| Zweite Erinnerungsstufe einstellen | Vorschau der Stufen als Zeitstrahl (nicht aktivierbar in Free) | 1× pro 30 Tage |

- **Jeder Hinweis ist schließbar.** Global max. **1 Premium-Hinweis pro Tag** und **3 pro Woche**.
- **Live-Vorschau** zeigt echtes Verhalten mit den eigenen Daten (read-only), keine Fake-Screens.
- Paywall-Texte kommen aus dem Admin (Inhalt), **Preise kommen immer aus dem Store** (lokalisiert, inkl. MwSt.).
- Abo-Verwaltung in den Einstellungen: aktuelle Stufe, Quelle (Store / Comp / Trial), nächste
  Verlängerung, Button „Abo im App Store/Play Store verwalten“.

## 4. House Ads (interne Anzeigen)

**Nur Free-Nutzer. Keine externen Werbe-SDKs, kein Tracking, keine Profilbildung.**

### 4.1 Tabu-Zonen (fest im Code, nicht konfigurierbar)

Im Code als Liste `AD_FORBIDDEN_SURFACES` in `packages/entitlements`. Ein Test stellt sicher, dass
diese Screens keinen Slot rendern können.

- Chat (Event und Gruppe)
- Alle Eingabeformulare (Event anlegen, Termin bearbeiten, Profil)
- Erinnerungen und Notifications (Push und lokal)
- Bereit-Check, „Ich verspäte mich“, Live-ETA
- Fokus-Modus (gesamt)
- Onboarding und die **gesamte erste Session**
- Datenschutz-Center, Account-Löschung, Abo-/Kündigungsscreens, Paywall selbst
- Gast-Web-Ansicht (Gäste sehen nie Werbung)

### 4.2 Erlaubte Slots (einzeln an/aus im Admin)

| Slot-ID | Ort | Format | Standard-Cap |
| --- | --- | --- | --- |
| `agenda_feed` | Agenda-Liste | native Karte, gekennzeichnet „Anzeige“ | max. 1 pro 10 Einträge, max. 3 pro Tag |
| `events_overview_banner` | Event-Übersicht unten | Banner | 1 pro Session |
| `post_event_create` | nach erfolgreichem Anlegen eines Events | Interstitial | max. 1/Tag, nie in der ersten Woche |
| `settings_card` | Einstellungen | Karte | 1 pro Session |
| `empty_state` | Leerzustände | dezente Karte unter dem Leerzustand | 1 pro Session |

### 4.3 Steuerbare Parameter (Admin)

Inhalt (Titel, Text, Bild/Lottie, CTA, Ziel als Deep-Link/Paywall/URL, Sprache) · Laufzeit von–bis ·
Frequency Caps (Session/Tag/Woche) · Mindestabstand · max. Feed-Anteil · Schließen-Knopf nach X s
(**0–5 s, niemals ohne Schließen**; das Schema erlaubt technisch keinen Wert > 5) · Zielgruppe
(Stufe, Sprache, App-Version, Plattform, Account-Alter in Buckets) · Priorität, Rotation,
A/B-Varianten · Vorschau pro Gerät/Theme · **Not-Aus** (globales Flag `house_ads_enabled`).

### 4.4 Messung ohne Tracking

- Der Client zählt Impressionen/Klicks pro `ad_id` + `variant` + Tag **lokal** und sendet Zähler-Batches
  ohne Nutzer-ID. Der Server speichert nur Tagesaggregate (`ad_stats_daily`).
- Frequency Caps werden **auf dem Gerät** durchgesetzt (lokaler Zähler), Kampagnen-Auswahl kommt vom
  Server anhand der nicht identifizierenden Zielgruppen-Attribute.
- Conversion = Anzahl Paywall-Käufe mit Herkunft `house_ad:<id>` (aggregiert, ohne Nutzerbezug).
- Mindest-Aggregationsgröße für die Anzeige im Admin: k ≥ 20 (kleinere Zahlen werden als „< 20“ gezeigt).

## 5. Admin-Steuerung (Monetarisierungs-Teil)

- **Comp-Abos:** Stufe, Start, Ende oder unbefristet, Grund (Enum: `beta`, `influencer`, `support`,
  `partner`, `employee`, `other`), Pflicht-Notiz, Widerruf, Sammelzuweisung per Liste von User-IDs/E-Mails.
  Klar getrennt von gekauften Abos (eigene Tabelle `comp_grants`). Effektive Stufe = Maximum aus Store und Comp.
- **Feature-Flags & Remote-Config**, **Paywall-Texte**, **Ankündigungen**, **Vorlagen**.
- Jede Aktion landet im **Audit-Log** (wer, was, wann, vorher/nachher).

## 6. Rechtliche Punkte (Prüfung durch PO/Fachanwalt)

- Preisangaben nach PAngV (Endpreis inkl. MwSt.), Widerrufsrecht bei digitalen Inhalten (Store-Abwicklung).
- „Kündigungsbutton“ (§ 312k BGB) – gilt primär für Web-Verträge; da Abos über Stores laufen, ist der Link
  zur Store-Verwaltung Pflicht. Rechtliche Bestätigung nötig.
- Empfehlungsprogramm: Bedingungen transparent veröffentlichen.
- House Ads für eigene Produkte sind Werbung im Sinne des UWG → klar als „Anzeige“ kennzeichnen.
- **PayPal-Links** (PO-Entscheidung: PayPal) im Kosten-Modul: nur externer `paypal.me`-Deep-Link, keine eigene
  Zahlungsabwicklung. Vor Veröffentlichung prüfen, ob Store-Richtlinien (Apple 3.1.x) und Zahlungsdiensterecht
  berührt sind (Phase 10).
