# Design System

> **Status:** v0.2 · 2026-11-09 · **Tokens implementiert** in `packages/ui/src/tokens.ts`; alle Theme-Farbpaare werden
> in `packages/ui/test/contrast.test.ts` gegen WCAG AA geprüft. Komponenten: siehe §7 (Phase-1-Stand markiert).

## 1. Herleitung aus den Referenzen

Die Referenz-Shots des PO (`docs/design/references/`, alle 5 vorhanden und gesichtet) liefern Prinzipien,
**keine** Vorlagen zum Kopieren:

| Ref. | Prinzip | Wo bei uns |
| --- | --- | --- |
| R1 Claims (Schwarz + Lime) | Dark-first, ein Akzent, Bento-Kacheln, runde Icon-Buttons, Filter-Chips, Fortschrittsring | Event-Detail als Bento-Grid, Filter in Agenda |
| R2 My Tasks (Navy-Timeline) | Datumsleiste mit Pill-Auswahl, Zeitspalte links, Pastellkarten mit Status-Reiter, Avatar-Stapel, Fortschrittsbalken | Tagesansicht/Timeline, Event-Karten |
| R3 Activity Planner (Violett + Lime) | Riesige Display-Typo mit eingerahmtem Schlüsselwort, schwebende Pill-Tab-Bar, große Zahlen „24/30“, gestreifte Balken | Onboarding, Navigation, Zusagen-Zähler |
| R4 Heat Map | Monatsraster mit Lime-Intensität, Kennzahl-Karten | Auslastung, Pünktlichkeits-Bilanz, Familienwoche |
| R5 Swipe (Creme) | Heller Modus in Creme, schwarze Pills, Kartenstapel mit Swipe | Hell-Theme, **Swipe-Voting** |

**Eigenständigkeit:** Wir übernehmen keine Layouts, Illustrationen oder Icons. Unterscheidungsmerkmale:
Uhr-/Pfeil-Bildmarke, „Losgeh-Zeit“ als zentrale große Zahl, Status-Reiter mit Zeitbezug („in 2 Std.“, „läuft“, „vorbei“).

## 2. Farb-Tokens

### 2.1 Primitive (Palette)

| Token | Hex | Rolle |
| --- | --- | --- |
| `ink.900` | `#0D0E12` | Hintergrund dunkel |
| `ink.800` | `#16181E` | Fläche dunkel (Karten) |
| `ink.700` | `#1F222A` | erhöhte Fläche |
| `ink.600` | `#2A2E38` | Trenner, Chip-Hintergrund |
| `ink.400` | `#5C6270` | nur Rahmen/Deko (3,16 : 1 → **kein Text**) |
| `ink.300` | `#8A90A0` | Platzhalter, deaktiviert |
| `cream.50` | `#F7F3EA` | Hintergrund hell |
| `cream.100` | `#EFE9DC` | Fläche hell |
| `cream.200` | `#DDD5C4` | Trennlinien hell (nur dekorativ) |
| `lime.400` | `#C8F031` | **Markenfarbe** (Signal) |
| `lime.ink` | `#4A5E00` | Lime-Ton für Text/Icons auf hellem Grund |
| `violet.500` | `#7C5CFF` | Sekundär – **nur Fläche/Deko oder großer Text** |
| `violet.300` | `#B9A8FF` | Violett-Text auf Dunkel |
| `violet.700` | `#4B2FD6` | Violett-Fläche mit weißer Schrift, Violett-Text auf Hell |
| `pastel.mint` | `#BDEBC8` | Kategorie |
| `pastel.cyan` | `#8EDBEA` | Kategorie |
| `pastel.lilac` | `#D3C6EE` | Kategorie |
| `pastel.peach` | `#FFCFAE` | Kategorie |
| `pastel.sun` | `#FFE38A` | Kategorie |
| `pastel.coral` | `#FF8A7A` | Kategorie |
| `red.400` | `#FF5A5F` | Fehler auf Dunkel |
| `red.700` | `#B3261E` | Fehler auf Hell |

### 2.2 Semantische Tokens (pro Theme)

| Token | Dunkel | Hell |
| --- | --- | --- |
| `bg.canvas` | `ink.900` | `cream.50` |
| `bg.surface` | `ink.800` | `cream.100` |
| `bg.elevated` | `ink.700` | `#FFFFFF` |
| `text.primary` | `#F3F4F6` | `ink.900` |
| `text.secondary` | `#A3A9B7` | `#5B5F69` |
| `accent.fill` | `lime.400` | `lime.400` |
| `accent.onFill` | `ink.900` | `ink.900` |
| `accent.text` | `lime.400` | `lime.ink` |
| `secondary.fill` | `violet.700` | `violet.700` |
| `secondary.text` | `violet.300` | `violet.700` |
| `danger.text` | `red.400` | `red.700` |
| `category.*.fill` | Pastelle | Pastelle |
| `category.*.onFill` | `ink.900` | `ink.900` |

### 2.3 Kontrast-Matrix (berechnet, WCAG AA: Text ≥ 4,5 : 1, großer Text/UI ≥ 3 : 1)

| Vordergrund auf Hintergrund | Verhältnis | Ergebnis |
| --- | --- | --- |
| Lime `#C8F031` auf ink.900 | 14,66 | ✅ AAA |
| ink.900 auf Lime | 14,66 | ✅ AAA |
| Lime auf cream.50 | **1,19** | ❌ verboten → `lime.ink` (6,56 ✅) |
| text.primary dunkel auf ink.900 | 17,53 | ✅ |
| text.secondary dunkel auf ink.900 / ink.800 | 8,19 / 7,53 | ✅ |
| text.secondary hell auf cream.50 | 5,77 | ✅ |
| ink.900 auf cream.50 | 17,42 | ✅ |
| violet.500 auf ink.900 | **4,44** | ⚠️ nur großer Text (≥ 24 px / 18,66 px fett) → Text nutzt `violet.300` (9,28 ✅) |
| Weiß auf violet.500 | **4,35** | ⚠️ nur großer Text → Flächen mit Text nutzen `violet.700` (7,85 ✅) |
| violet.700 auf cream.50 | 7,08 | ✅ |
| ink.900 auf Mint / Cyan / Flieder / Pfirsich / Sonne / Koralle | 14,59 / 12,37 / 12,02 / 13,58 / 15,25 / 8,42 | ✅ |
| red.400 auf ink.900 | 6,32 | ✅ |
| red.700 auf cream.50 | 5,90 | ✅ |
| ink.400 auf ink.900 | 3,16 | nur UI-Rahmen (≥ 3 ✅), **kein Text** |

Regel im Code: Komponenten erhalten nur **Paare** (`fill` + `onFill`), nie freie Vordergrundfarben.
Ein Unit-Test in `packages/ui` rechnet alle definierten Paare nach und schlägt unter 4,5 : 1 fehl.
Farbe ist nie einziger Informationsträger: Status-Reiter tragen Text, Kategorien zusätzlich ein Icon.

## 3. Typografie

| Rolle | Schrift | Größe / Zeilenhöhe | Gewicht | Nutzung |
| --- | --- | --- | --- | --- |
| `display.xl` | Bricolage Grotesque | 56 / 60 | 700 | Onboarding, „19:32 los“ |
| `display.l` | Bricolage Grotesque | 40 / 44 | 700 | Screen-Titel groß, Zahlen „24/30“ |
| `title.l` | Bricolage Grotesque | 28 / 34 | 600 | Screen-Titel |
| `title.m` | Inter | 20 / 26 | 600 | Kartentitel |
| `body.l` | Inter | 17 / 24 | 400 | Fließtext |
| `body.m` | Inter | 15 / 22 | 400 | Sekundärtext |
| `label` | Inter | 13 / 18 | 600 | Chips, Reiter |
| `numeric` | Inter (tabular-nums) | erbt | 600 | Uhrzeiten, Beträge |

- Beide Schriften stehen unter der **SIL Open Font License** (laut Google Fonts; in Phase 1 Lizenzdatei
  ins Repo, eingebettet statt zur Laufzeit geladen).
- **Dynamische Schrift:** alle Größen skalieren mit der Systemeinstellung (max. Faktor 2,0 für Body; Display
  begrenzt auf 1,4, damit Layouts nicht brechen). Layouts werden bei 200 % geprüft.
- Display-Gimmick „eingerahmtes Schlüsselwort“ (R3): Pill-Rahmen um ein Wort, nur im Onboarding/Marketing.

## 4. Abstände, Radien, Schatten, Elevation

- **Spacing** (4-pt-Raster): `0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.
- **Radien:** `sm 12` · `md 16` · `lg 24` · `xl 32` · `pill 999`. Karten `lg`, Bento-Kacheln `xl`, Buttons `pill`.
- **Schatten:** Im Dunkelmodus Elevation über Flächenhelligkeit (`ink.800 → ink.700`), kein Schwarz-Schatten.
  Im Hellmodus weiche Schatten `0 8 24 rgba(13,14,18,0.08)`.
- **Glas** (R3): `bg.elevated` mit 72 % Deckkraft + Blur 20, nur für schwebende Elemente (Tab-Bar, Overlays);
  Fallback ohne Blur auf schwachen Android-Geräten und bei „Transparenz reduzieren“.
- **Touch-Ziele:** min. **48 × 48 dp**, primäre CTA-Höhe 56 dp, Icon-Buttons 48 dp Kreis.

## 5. Motion & Haptik

| Token | Wert | Nutzung |
| --- | --- | --- |
| `duration.instant` | 100 ms | Farbwechsel, Press-State |
| `duration.fast` | 180 ms | Chips, Toggles |
| `duration.base` | 260 ms | Screen-Elemente ein/aus |
| `duration.slow` | 420 ms | Shared-Element-Übergang |
| `easing.standard` | cubic-bezier(0.2, 0, 0, 1) | allgemein |
| `easing.exit` | cubic-bezier(0.3, 0, 1, 1) | Ausblenden |
| `spring.snappy` | damping 18, stiffness 260, mass 1 | Datumsleiste-Snap, Pill-Auswahl |
| `spring.gentle` | damping 22, stiffness 140, mass 1 | Karten, Sheets |
| `spring.bouncy` | damping 12, stiffness 180, mass 1 | Erfolg (Zusage, Abhaken) – sparsam |

**Signature-Interaktionen:** Swipe-Voting-Stapel · Datumsleiste mit Spring-Snap · Event-Karte → Detail
(Shared Element) · Fortschrittsring füllt sich beim Abhaken · Heatmap blendet zellenweise ein (Stagger 12 ms) ·
Konfetti **nur** bei echten Erfolgen (Event bestätigt, alle Aufgaben erledigt), max. 1× pro Event.

**Reduced Motion:** Springs → `duration.fast` Crossfade, keine Parallaxe, kein Konfetti, kein Stagger.
**Haptik-Tokens:** `selection` (Datumsleiste), `light` (Toggle), `success` (Zusage, Abhaken), `warning`
(Konflikt), `heavy` (Swipe-Entscheidung). Global abschaltbar.

Ziel: 60 fps (120 fps auf ProMotion), Animationen nur auf UI-Thread (Reanimated Worklets).

## 6. Iconografie & Illustration

- Ein einheitliches Icon-Set mit abgerundeten Strichen: **Lucide** (ISC, ADR 0009). Keine Mischung mehrerer Sets.
- Illustrationen: flächig, organische Blob-Formen (R1), Pastelle + Lime, ohne Verläufe, abstrakt (kein Maskottchen, PO-Entscheidung).

## 7. Komponenteninventar (`packages/ui`)

Phase-1-Stand: ✅ = in `packages/ui` umgesetzt.

| Komponente | Varianten | Notizen |
| --- | --- | --- |
| ✅ `Button` | primary (Lime), secondary (outline), tertiary (text), danger; sm/md/lg; Icon links/rechts | Loading-State eingebaut |
| `IconButton` | filled, tonal, ghost | Kreis 48 dp, Pflicht-`accessibilityLabel` |
| `Chip` / `FilterChip` | default, selected, mit Zähler | |
| ✅ `PillTabs` (als `SegmentedControl`) | 2–4 Segmente | R1/R5 |
| ✅ `FloatingTabBar` | 3–5 Ziele + zentrale „+“-Aktion | R3, Glas |
| ✅ `DateStrip` | Tag-Pills, horizontal, Spring-Snap | R2 |
| `TimelineDay` | Zeitspalte + Event-Karten | R2 |
| ✅ `EventCard` | Kategorie-Farbe, Status-Reiter, Avatar-Stapel, Fortschritt | Shared-Element-Quelle |
| `BentoGrid` / `BentoTile` | 1×1, 2×1, 2×2 | Event-Detail |
| ✅ `AvatarStack` | max. N + „+X“ | |
| `ProgressRing` / `ProgressBar` | solid, striped | R1/R3 |
| `HeatmapCalendar` | Intensität 0–4 | R4, mit Text-Alternative |
| `SwipeDeck` | Karte, Ja/Nein/Vielleicht-Buttons | R5, Button-Alternative Pflicht |
| `BigNumber` | „19:32“, „24/30“ | Display-Typo, tabular |
| `Sheet` / `Modal` / `Dialog` | | Fokus-Falle, Escape/Back |
| `TextField`, `TextArea`, `DateTimePicker`, `Select`, `Switch`, `Checkbox`, `Stepper` | | Fehlertext unter Feld |
| `Toast` / `Banner` | info, success, warning, error, offline | |
| ✅ `EmptyState` | Illustration + Titel + Text + 1 Aktion | |
| ✅ `Skeleton` | Zeile, Karte, Raster | |
| ✅ `ErrorState` | mit Retry | |
| `HouseAdSlot` | Karte, Banner, Interstitial | prüft Tabu-Zonen zur Laufzeit + Test |
| `PaywallTable` | Vergleichstabelle | Preise aus Store |

## 8. Theming & dynamische Event-Farben

- Themes `dark` (Standard) / `light` / `system`. Tokens als TS-Objekt in `packages/ui/src/tokens.ts`;
  ESLint-Regel verbietet Hex-Literale, Radien und Schriftgrößen in `apps/*/features` und `apps/*/app`.
- Event-Cover mit Nutzerbild: Text immer auf einer Scrim-Fläche (`ink.900` 60 %), nie direkt auf dem Bild.
- Premium-Themes = alternative Akzent-/Pastellsätze, die die Kontrastmatrix bestehen müssen (gleicher Test).

## 9. Layout & Internationalisierung

- Logische Eigenschaften (`marginStart`, `paddingEnd`), Icons mit Richtung spiegeln bei RTL.
- Textlängen: Englisch ist kürzer, Deutsch bis zu +35 % → kein fester Text in festen Breiten.

## 10. Fokus-Modus (Design-Variante)

Ein Screen, ein Ziel: nur „Jetzt“ und „Als Nächstes“, `display.xl`-Zeit, Zeitbalken, gedämpfte Farben
(Pastelle 70 % Sättigung), keine Badges/Zähler, keine House Ads, Animationen auf Minimum.

## 11. Design-QA-Checkliste (jeder Screen vor „fertig“)

- [ ] Nur Tokens und `packages/ui`-Komponenten, keine Roh-Werte (Lint grün)
- [ ] Hell **und** Dunkel geprüft, Kontrast-Paare aus der Matrix
- [ ] Zustände: Laden, Leer, Fehler, Offline vorhanden und erreichbar
- [ ] Dynamische Schrift 200 % ohne abgeschnittenen Text
- [ ] Screenreader (VoiceOver + TalkBack): Reihenfolge, Labels, Rollen, Hinweise
- [ ] Touch-Ziele ≥ 48 dp, Abstand zwischen Zielen ≥ 8 dp
- [ ] Reduced Motion geprüft
- [ ] DE + EN, lange deutsche Strings geprüft
- [ ] Farbe nicht einziger Informationsträger
- [ ] Gesten haben Button-Alternativen
- [ ] Keine House Ads in Tabu-Zonen
- [ ] iOS **und** Android, kleines (iPhone SE / 360 dp) und großes Gerät
- [ ] Echte Screenshots unter `docs/previews/screenshots/` (keine Mockups als Screenshot)

## 12. Entscheidung: Gewicht der Losgeh-Zeit auf „Heute“ (2026-11-10, vom PO delegiert)

Die große Lime-Karte („19:32 los“) erscheint **nur, wenn sie hilft**: für den nächsten Termin mit Ort, sobald die
Losgeh-Zeit innerhalb der nächsten **3 Stunden** liegt, oder sobald die Vorbereitungs-Erinnerung fällig ist. Sonst
zeigt die Event-Karte die Losgeh-Zeit als kompakte Zeile („los um 19:32“). Begründung: Ein dauerhaft großer
Block würde zur Tapete und verliert seine Signalwirkung. Lime bleibt das **eine** Signal pro Screen
(Brand Do/Don’t). Im Fokus-Modus ist die Karte immer groß.
