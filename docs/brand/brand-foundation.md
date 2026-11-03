# Brand Foundation

> **Status:** v0.1 · 2026-11-03 · Entwurf Phase 0. Name, Logo und Maskottchen sind **nicht final**.
> Marken- und Domainprüfung erfolgt durch den PO. Umsetzung zentral in `packages/brand` (ab Phase 1).

## 1. Name

### Arbeitstitel: **PLANLOS**

Selbstironisch und sofort verständlich im DACH-Raum („Du bist planlos? Perfekt.“). Schwächen: Für
nicht deutschsprachige Nutzer bedeutungslos, auf Englisch schwer auszusprechen; „planlos“ ist ein
gängiges deutsches Wort, die Eintragung als Wortmarke ist daher **fraglich** (beschreibend/Freihaltebedürfnis).

### 5 weitere Vorschläge

**Wichtig:** Keiner der Namen wurde auf Markenrechte (DPMA, EUIPO, USPTO, WIPO), App-Store-Namen oder Domains
geprüft. Das muss der PO (idealerweise mit Markenanwalt) erledigen. Bekannte Kollisionsrisiken sind vermerkt,
die Liste ist aber nicht vollständig.

| # | Name | Idee | Aussprache DE/EN | Stärken | Risiken (unvollständig) |
| --- | --- | --- | --- | --- | --- |
| 1 | **Leavo** | von „leave“ – die Losgeh-Zeit als Kern | „Lie-wo“ / „LEE-vo“ | USP im Namen, kurz, `.app` plausibel | Ähnlichkeit zu Urlaubs-/HR-Tools („leave management“) |
| 2 | **Nowly** | „now“ – „JETZT los“ | „Nau-li“ / „NOW-lee“ | freundlich, international | generisch klingend; ähnliche App-Namen wahrscheinlich |
| 3 | **Huddl** | „huddle“ – zusammenkommen | „Haddl“ / „HUD-l“ | sozial, merkfähig | „Huddle“ ist eine Slack-Funktion und Name mehrerer Firmen → hohes Risiko |
| 4 | **Timbo** | freundlicher Charakter-Name, auch für das Maskottchen | „Tim-bo“ | Marke + Buddy in einem, kindgerecht für Familien | Personenname; Verwechslung mit bestehenden Marken möglich |
| 5 | **Rendezvoo** | Wortspiel aus „rendezvous“ | „Ron-de-wu“ | international verstanden, verspielt, Domain eher frei | lang, Schreibweise fehleranfällig |

**Empfehlung:** Für den DACH-Launch **PLANLOS** als Marke mit internationalem Zusatz prüfen lassen
(z. B. Bild-/Wortmarke „planlos.“ mit Punkt, was die Unterscheidungskraft erhöht). Als internationaler Name hat
**Leavo** die stärkste Verbindung zum USP. Entscheidung durch PO nach Prüfung.

Rename-Fähigkeit: Name, Claims, Store-Texte, Bundle-IDs (nur einmalig vor Erst-Release änderbar!) und Assets
liegen in `packages/brand`. **Die Bundle-/Package-ID muss vor dem ersten Store-Upload final sein** → neutrale ID
vorschlagen (z. B. `app.planlos.mobile` erst nach Namensentscheid; bis dahin nur Dev-Builds).

## 2. Markenkern

**Mission:** Menschen, denen Planung schwerfällt, so entlasten, dass sie entspannt und rechtzeitig ankommen und
mehr Zeit miteinander verbringen.

**Werte**
1. **Entlastend:** Wir nehmen Arbeit ab, statt neue zu machen.
2. **Warm:** Wir sind auf deiner Seite, auch wenn du zu spät bist.
3. **Ehrlich:** Keine Tricks, keine versteckten Kosten, keine Datensammelei.
4. **Verspielt mit Haltung:** Spaß ja, aber nie auf Kosten von Klarheit.
5. **Für alle Köpfe:** Neurodivergenz und Barrierefreiheit sind von Anfang an mitgedacht.

**Persönlichkeit:** die gut organisierte, lustige Freundin, die nie urteilt.

## 3. Stimme & Ton

| Wir sind | Wir sind nicht |
| --- | --- |
| locker, warm, augenzwinkernd | albern, kumpelhaft-anbiedernd |
| konkret („In 10 Min. los“) | vage („Bald ist dein Termin“) |
| ermutigend („3× pünktlich 💪“) | belehrend, beschämend („Du bist schon wieder zu spät“) |
| kurz | ausschweifend |

- **Du-Form** im Deutschen. Englisch: natürlich und umgangssprachlich, **keine wörtliche Übersetzung**.
  Beispiel: DE „Na, schon losgegangen? 😉“ → EN „Heading out yet? 😉“ (nicht „Well, already gone?“).
- Emojis sparsam: max. 1 pro Nachricht, nie in Fehlermeldungen zu Datenschutz, Zahlung oder Löschung.
- **Ernst-Modus:** Datenschutz, Kündigung, Account-Löschung, Sicherheitswarnungen und Moderation sind sachlich und klar.
- Erinnerungs-Ton ist nutzerseitig einstellbar (sanft · locker · nachdrücklich). Nachdrücklich heißt deutlicher,
  **nie** beleidigend.

**Claims (Entwurf):** „Du chillst. Wir planen.“ · „Endlich pünktlich. Ohne Stress.“ · EN „You show up. We handle the rest.“

## 4. Visuelle Richtung (Kurzfassung – Details in [design-system.md](../design/design-system.md))

- **Markenzeichen:** „Lime auf Dunkel“. Signal-Lime `#C8F031` auf Tinte `#0D0E12`.
- **Sekundär:** Violett für Aktivität/Fokus; Pastelle (Mint, Cyan, Flieder, Pfirsich, Sonne, Koralle) für Event-Kategorien.
- **Heller Modus:** warmes Creme `#F7F3EA` statt Reinweiß. Lime dort **nur als Fläche** mit dunkler Schrift.
- **Typografie:** Display = Bricolage Grotesque (OFL), Text = Inter (OFL). Lizenzen in Phase 1 final prüfen.
- **Formen:** große Radien, Pills, runde Icon-Buttons, Bento-Kacheln, Karten mit Status-Reiter, Avatar-Stapel.

## 5. Logo-Idee

- **Bildmarke:** ein Kreis (Ziffernblatt), in dem der Zeiger zu einem Pfeil nach rechts wird, wie ein Schritt
  aus der Tür. Sinnbild für „Losgeh-Zeit“. Lime-Kreis, Tinte-Pfeil. Funktioniert als App-Icon in 1 Farbe.
- **Wortmarke:** „planlos.“ kleingeschrieben in Bricolage Grotesque Bold, der Punkt in Lime („alles ist geplant“).
- **Varianten:** Icon allein (App-Icon, Favicon), horizontal, gestapelt; jeweils Hell/Dunkel; Monochrom.
- Schutzraum = Höhe des Punkts × 2; Mindestgröße Icon 24 px.
- Erste Skizzen folgen als **Mockup** in Phase 1 unter `docs/design/concept/`.

## 6. Maskottchen („Organisations-Buddy“) – optional

Vorschlag: **„Tick“**, eine kleine runde Figur mit Uhr-Gesicht und zwei Zeigern als Antennen. Erscheint in
Leerzuständen, Onboarding und (optional, abschaltbar) in Erinnerungen. Emotionen: entspannt, aufgeregt, stolz,
schläfrig, „hopp hopp“. Eigenständig gestaltet – keine Anlehnung an bestehende Figuren.
Nie in Ernst-Modus-Screens. Entscheidung, ob es ein Maskottchen gibt: PO.

## 7. Do / Don’t

| Do | Don’t |
| --- | --- |
| Lime als **ein** Signal pro Screen (primäre Aktion, aktiver Zustand) | Lime-Text auf Creme/Weiß (Kontrast 1,19 : 1) |
| Große Zahlen für Zeit („19:32 los“) | Zeit nur in kleiner Fließtextzeile |
| Positive Pünktlichkeits-Formulierung | Rankings, Vergleiche, Schamsprache |
| Pastelle mit dunkler Schrift | Weißer Text auf Pastell |
| Bewegung, die Bedeutung trägt (Abhaken, Zusage) | Dauer-Animationen ohne Anlass |

## 8. Brand-Book-Struktur (wächst ab Phase 1)

`docs/brand/` → `brand-foundation.md` (dieses Dokument) · `logo.md` · `voice-examples.md` (DE/EN-Textpaare) ·
`illustrations.md` · `mascot.md` · `example-screens.md` (nur echte Screenshots oder gekennzeichnete Mockups).
