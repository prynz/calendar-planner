# Logo – Entwürfe

> **Status:** 2026-11-11 · **v1.1 – Kandidat für das finale Logo (Phase 7), Freigabe durch den PO offen.** v1 wurde am
> 2026-11-10 vorläufig angenommen.
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

**v1.1 (Phase 7):** Mindestgrößen-Test bei 16 px ergab, dass der Stundenzeiger mit dem Ring verschmolz (0,5 px Luft)
und die Pfeilspitze den Ring fast berührte. Korrektur: Zeiger kürzer (Ende y 28 → 31,5), Öffnung rechts etwas
weiter (Halbwinkel 45° → 47°). Jetzt bleibt bei 16 px überall ≥ 1 px Luft; drei Tests sichern das ab. Die
Animation „Zeiger wird Pfeil“ läuft im ersten Onboarding-Schritt (bei „Bewegung reduzieren“ sofort fertig).

**Schutzraum:** rundum mindestens die halbe Strichstärke × 2 (= 11 % der Markenbreite); in der Wortmarke trennt
der Abstand von einer Strichstärke Bild- und Wortmarke. **Mindestgröße:** 16 px digital.

Offen (ggf. mit Designer vor dem Launch, Block B5): Splash-Animation nativ, Markenprüfung des Namens.
