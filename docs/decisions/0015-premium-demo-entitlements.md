# ADR 0015 – Premium im Prototyp: Entitlements als Daten, Demo-Kauf, lokales Konto

> **Status:** akzeptiert · 2026-11-11 · Phase 6 (Freigabe durch den PO am 2026-11-11)

## Kontext

Phase 6 bringt Onboarding, Profil, Datenschutz-Center, Paywall mit **Demo-Kauf**, House-Ad-Vorschau, Premium-Cover,
Kosten-Split mit PayPal-Link und Wetter/Plan B (simuliert). Der Prototyp hat weiter keine Konten und keinen Server
([ADR 0010](0010-local-first-prototype.md)); echte Abos kommen über RevenueCat erst in Block B4
([ADR 0003](0003-subscriptions-revenuecat.md)).

## Entscheidung

1. **`packages/entitlements`** (rein, getestet): Stufen, Preise in Cent inkl. MwSt., Limits als Daten, Testphase,
   Demo-Abo (Verlängern, Kündigen zum Periodenende), Werbe-Tabuzonen `AD_FORBIDDEN_SURFACES`, Slots und Caps,
   Regeln für Premium-Hinweise. In Block B4 bleibt das Paket die Quelle der Matrix; die **effektive Stufe** kommt dann
   vom Server (Regel 1), die App zeigt sie nur an.
2. **Lokales Konto** (`AccountProvider`, ein validiertes JSON-Dokument): Onboarding-Status, **Alters-Bestätigung 16+
   ohne Geburtsdatum** ([ADR 0004](0004-minimum-age.md)), Anzeigename, Status-Emoji, PayPal.me-Name, Tarif,
   Hinweis- und Anzeigen-Zähler. Unlesbare Daten → frischer Start statt Absturz.
3. **Jeder neue Start bekommt 14 Tage Plus als Testphase (Demo)**, ohne Zahlungsdaten; danach Free ohne Datenverlust.
   In den Einstellungen lässt sich Free sofort ausprobieren („Testphase beenden“ / „Free ausprobieren (Demo)“), damit
   der PO die Grenzen sehen kann.
4. **Demo-Kauf** auf der Paywall: vollständige Vergleichstabelle aus denselben Daten, die die App durchsetzt; nur der
   Zeitraum (jährlich) ist vorausgewählt, kein Tarif; kein Countdown; Kündigung zum Periodenende. Überall steht
   „Demo – es wird nichts berechnet“.
5. **Grenzen erklären statt nerven:** An einer Grenze steht immer ein kurzer Hinweis mit „Tarife ansehen“
   (`LimitNotice`) – nie ein Pop-up. Bestehendes bleibt nutzbar, nur Neues über der Grenze wird verhindert.
   Durchgesetzt im Prototyp: laufende eigene Events (5), Gruppen (1), Erwachsene/Kinderprofile, Erinnerungsstufen
   (Free: eine Erinnerung zur Losgeh-Zeit, lockerer Ton), Puffer-Lernen, Bereit-Check, Kosten nach Anteilen/exakt,
   Premium-Cover. **Fokus-Modus ist in allen Stufen frei** (Barrierefreiheit).
6. **House Ads:** nur eigene Inhalte, nur Free, nie am Onboarding-Tag, gekennzeichnet „Anzeige“, sofort schließbar,
   Zähler nur auf dem Gerät. Slots im Prototyp: `settings_card`, `events_overview_banner`. Die Tabuzonen sind im Code
   fest und per Test abgesichert.
7. **Kosten-Split** im Event-Dokument (Cent-Ganzzahlen, Rundungsreste deterministisch, Ausgleichsliste mit höchstens
   n − 1 Überweisungen). **PayPal nur als `paypal.me`-Link** – ohne API, ohne Zahlung in der App. Demo-Personen haben
   keinen PayPal-Namen; die App sagt das, statt einen erfundenen Link zu öffnen. „Bezahlt“ zählt erst, wenn beide
   Seiten bestätigen (Demo-Person bestätigt simuliert).
8. **Wetter ist eine erfundene, gekennzeichnete Demo-Vorhersage** (deterministisch, nur 7 Tage voraus) – kein
   Wetterdienst. Plan B legt die gastgebende Person fest; Umschalten schreibt einen Hinweis in den Event-Chat.
9. **Cover-Themes** als Design-Tokens (`coverThemes`) und SVG-Band; „Kategorie“ und „Streifen“ sind Basis, die
   übrigen Premium.
10. **Datenschutz-Center:** zeigt Gespeichertes mit Zählern und Nicht-Gespeichertes, exportiert alles als JSON (Art. 20
    DSGVO) über das Teilen-Menü und löscht alles auf dem Gerät (danach Onboarding).

## Konsequenzen

- Keine neuen Abhängigkeiten (SVG, Teilen und Dateien sind schon da).
- Korrigiert ADR 0014 Punkt 10: Kinderprofile zählen **nicht** zu den 6 Family-Erwachsenen (monetization.md §2).
- Offen für Block B4: echte Store-Käufe, „Käufe wiederherstellen“, Comp-Abos, serverseitige Entitlements,
  Anzeigen-Steuerung im Admin, proaktive Hinweise (die Häufigkeitsregeln sind im Paket bereits getestet).
