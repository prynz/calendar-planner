# Logo – Entwürfe

> **Status:** 2026-11-10 · **Entwurf v1 – vom PO vorläufig angenommen**, wird bald durch ein finales Logo ersetzt.
> Austausch = neue Geometrie in `packages/brand/src/logo.ts` + `pnpm brand:assets`. Arbeitsname Nowish (ADR 0007).

**Idee:** Ein Ziffernblatt, das sich rechts öffnet – der Minutenzeiger wird zum Pfeil, der aus dem Kreis tritt:
„Zeit zu gehen“, die Losgeh-Zeit als Bild. Einfarbig konstruiert, funktioniert daher auch als Android-Themed-Icon
und in Schwarz-Weiß. Wortmarke „nowish.“ in Bricolage Grotesque Bold; der Punkt in Lime macht aus „-ish“ ein
präzises „jetzt“.

| Datei | Verwendung |
| --- | --- |
| `mark-lime.svg`, `mark-ink.svg` | Vektorquellen der Bildmarke |
| `mark-app-icon.png` | App-Icon-Vorschau (Lime auf Tinte) |
| `mark-mono-ink.png` | Monochrom auf Creme |
| `lockup-dark.png`, `lockup-light.png` | Bild- + Wortmarke, dunkel/hell (hell: Punkt in `limeInk` wegen Kontrast) |

Quelle der Geometrie: `packages/brand/src/logo.ts` (getestet: Lücke rechts, optisch zentriert, nichts abgeschnitten).
Neu rendern inkl. App-Icons: `pnpm brand:assets`.

Offen für die finale Ausarbeitung (Phase 10, ggf. mit Designer): optische Feinkorrektur der Strichenden,
Mindestgrößen-Test bei 16 px, Schutzraum-Raster, Animation (Zeiger wird Pfeil) für Splash.
