# Brand Foundation

> **Status:** v0.2 · 2026-11-09 · Entwurf Phase 0. Arbeitsname **Nowish** (PO-Entscheidung), Logo und Maskottchen **nicht final**.
> Marken- und Domainprüfung erfolgt durch den PO. Umsetzung zentral in `packages/brand` (ab Phase 1).

## 1. Name

> **PO-Entscheidung 2026-11-09:** Arbeitsname **Nowish**. Alternative **Gleichda** bleibt im Blick.
> „PLANLOS“ ist damit nur noch Ursprungsname im [MASTER_PROMPT](../../MASTER_PROMPT.md).
> Begründung und Konsequenzen: [ADR 0007](../decisions/0007-working-name-nowish.md).

### Arbeitsname: **Nowish**

„now-ish“ heißt „so ungefähr jetzt“. Das ist die Zeitrechnung chaotischer Menschen, und Nowish macht daraus
ein echtes „jetzt“. Selbstironisch wie PLANLOS, aber international verständlich und aussprechbar
(DE/EN „NAU-isch“).

- **Stärken:** Humor statt Belehrung; Zeit-Bezug passt zum USP (Losgeh-Zeit); kurz; funktioniert in DE und EN.
- **Risiken:** Bei einer kurzen Websuche (2026-11-09) tauchte eine kleine To-do-App „Nowish“ auf
  ([mergeek.com](https://mergeek.com/latest/jv07EWYDNzPAkPRl), kein offizielles Store-Listing gefunden).
  „nowish“ ist ein englisches Umgangswort → Unterscheidungskraft als Wortmarke prüfen; eine Bild-/Wortmarke
  stärkt sie. Domains (`nowish.app`, `.de`, `.com`) und Store-Namen ungeprüft.

### Alternative im Blick: **Gleichda**

Von „Bin gleich da!“, der Lieblingsausrede aller Zuspätkommer; die App macht aus der Ausrede ein Versprechen.
Stark für DACH, international nicht verständlich. Kurze Websuche (2026-11-09): keine gleichnamige App gefunden.
Mögliche Nutzung: Name für den DACH-Markt **oder** Kampagnen-/Claim-Begriff („Mit Nowish bist du wirklich gleich da.“).

### Verworfene bzw. zurückgestellte Vorschläge

| Name | Grund |
| --- | --- |
| PLANLOS | Alltagswort, als Marke kaum schützbar, international unverständlich |
| Leavo | keine Kollision gefunden, aber abstrakt; Reserve |
| Allda | DE-only; Reserve |
| Doorly | bereits von zwei Apps belegt |
| Huddl | Kollision mit Slack „Huddles“ |
| Nowly, Timbo, Rendezvoo, Hopphopp, Fastda, OMW, Tick | schwächer im Konzeptbezug oder generisch |

**Wichtig:** Keine Markenprüfung (DPMA, EUIPO, USPTO, WIPO), keine Domain- und Store-Namensprüfung erfolgt.
Das erledigt der PO, idealerweise mit Markenanwalt, für **Nowish und Gleichda parallel**.

### Rename-Fähigkeit

Name, Claims, Store-Texte, Deep-Link-Schema und Assets liegen in `packages/brand`. **Bundle-/Package-ID und
Deep-Link-Schema müssen vor dem ersten Store-Upload final sein.** Bis zur Markenfreigabe verwenden Dev-Builds eine
neutrale ID (z. B. `dev.calendarplanner.app`); `app.nowish.mobile` / `nowish://` erst nach Freigabe.

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

**Claims (Entwurf):** „Du chillst. Wir planen.“ · „Endlich pünktlich. Ohne Stress.“ · „Aus ‚gleich‘ wird jetzt.“ ·
EN „You show up. We handle the rest.“ · „From now-ish to right on time.“

## 4. Visuelle Richtung (Kurzfassung – Details in [design-system.md](../design/design-system.md))

- **Markenzeichen:** „Lime auf Dunkel“. Signal-Lime `#C8F031` auf Tinte `#0D0E12`.
- **Sekundär:** Violett für Aktivität/Fokus; Pastelle (Mint, Cyan, Flieder, Pfirsich, Sonne, Koralle) für Event-Kategorien.
- **Heller Modus:** warmes Creme `#F7F3EA` statt Reinweiß. Lime dort **nur als Fläche** mit dunkler Schrift.
- **Typografie:** Display = Bricolage Grotesque (OFL), Text = Inter (OFL). Lizenzen in Phase 1 final prüfen.
- **Formen:** große Radien, Pills, runde Icon-Buttons, Bento-Kacheln, Karten mit Status-Reiter, Avatar-Stapel.

## 5. Logo-Idee

- **Bildmarke:** ein Kreis (Ziffernblatt), in dem der Zeiger zu einem Pfeil nach rechts wird, wie ein Schritt
  aus der Tür. Sinnbild für „Losgeh-Zeit“. Lime-Kreis, Tinte-Pfeil. Funktioniert als App-Icon in 1 Farbe.
- **Wortmarke:** „nowish.“ kleingeschrieben in Bricolage Grotesque Bold, der Punkt in Lime („-ish“ wird zum Punkt: jetzt, genau).
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
