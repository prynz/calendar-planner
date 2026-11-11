# Milestone-Report Phase 4 – Anti-Chaos-Engine komplett

> **Status:** 2026-11-11 · Phase 4 umgesetzt · **Stopp – wartet auf Review und Freigabe durch den PO.**
> Änderungswünsche zu Phase 1–4 nimmt der PO jetzt gesammelt auf (Wunsch vom 2026-11-11).

## 1. Ergebnis in einem Satz

Der USP ist komplett erlebbar: Die App erinnert in deinem **Ton**, lernt deinen **Trödel-Puffer** aus deinem echten
Losgehen, hat einen **Bereit-Check** (auch Schritt für Schritt), sagt mit einem Tipp **„Ich verspäte mich“** im
Event-Chat Bescheid, zeigt eine private **Pünktlichkeits-Bilanz** und hat einen ruhigen **Fokus-Modus** mit
Begleit-Timer. Alles bleibt auf dem Gerät.

## 2. Was fertig ist

| Bereich | Ergebnis |
| --- | --- |
| Losgeh-Karte | Auf „Heute“ unter der großen Lime-Karte und in jedem Termin: **„Bin unterwegs“** (in den 3 Stunden vor dem Losgehen) und **„Ich verspäte mich“** mit +5 · +10 · +15 · +30 Min. Danach: „Unterwegs seit 18:35 · 2 Min. später als geplant – passt schon.“ |
| „Ich verspäte mich“ | Bei Events mit anderen Personen erscheint im Chat ein freundlicher Hinweis („Chris kommt ca. 10 Min. später – kein Stress 🙂“), die Gastgeberin antwortet (Demo) nach ein paar Sekunden. Ohne Schuldzuweisung, ohne Druck |
| Erinnerungen | **Ton** sanft · locker · nachdrücklich (zusätzlich zur Anzahl der Stufen). Jede Erinnerung hat die Knöpfe **„Bin unterwegs“** (speichert das Losgehen, ohne die App zu öffnen) und **„Ich verspäte mich“** (öffnet die Auswahl). Nach „Bin unterwegs“ kommen keine weiteren Stufen, nach einer Verspätungs-Meldung kein „Alles okay?“ |
| Puffer-Lernen | Aus „Bin unterwegs“ lernt die App deinen Puffer (Formel aus der Spezifikation: gleitender Mittelwert, 0–20 Min., in 5er-Schritten, ab 3 Mal Losgehen). Positiv formuliert: „Wir planen 10 Min. Puffer für dich ein – gelernt aus 10 Mal Losgehen. Du kannst das jederzeit ändern.“ Abschaltbar |
| Bereit-Check | Deine Mitbringsel aus der Mitbringliste, passende Dinge zur Kategorie (Arzt: Versichertenkarte, Ausweis · Feier: Geschenk · Sport: Sportsachen, Wasser) und Schlüssel, Handy, Geldbörse. Als **Liste** oder **Schritt für Schritt** (ein Teil pro Bildschirm, großer Knopf „Hab ich“) |
| Fokus-Modus | Über das Ziel-Symbol auf „Heute“: nur **Jetzt** („In 1 Std. los“, Zeitbalken) und **Als Nächstes**, dazu die Losgeh-Knöpfe und ein ruhiger **25-Minuten-Begleit-Timer** („Ich bleibe bei dir“), der ohne Netz läuft |
| Pünktlichkeits-Bilanz | Unter „Ich“: „Diesen Monat 7 von 9 Mal pünktlich 💪“ und eine Monats-Heatmap in Lime-Tönen (mit Vorlesetext pro Tag). Nur für dich, nie geteilt, kein Vergleich. Abschaltbar, **Verlauf löschen** mit Nachfrage |
| Beispielwelt | Ein erfundener Verlauf der letzten drei Wochen, damit Bilanz und Puffer-Lernen sofort etwas zeigen |
| Speicher | Privater Verlauf in einer eigenen Tabelle (Schema v3), geprüft beim Lesen; Geräte mit älterem Prototyp bekommen den Demo-Verlauf einmalig dazu |
| Web-Vorschau | Alles außer Benachrichtigungen und Haptik auch im Browser |

## 3. Prüfergebnisse

| Prüfung | Ergebnis |
| --- | --- |
| `pnpm check` (typecheck · lint · format · Tests) | ✅ 695 Tests: i18n 466, domain 73, App 70, ui 57, demo 15, brand 8, config 6 |
| Web-Vorschau im Browser (Heute, Fokus, Detail mit Verspätung, Bereit-Check, Einstellungen) | ✅ lokal mit fester Uhrzeit 17:00 durchgeklickt, keine Fehler in der Konsole |
| CI (Qualität, Datenbank, Secret-Scan), Web-Vorschau | ✅ grün (Lauf 43023945923) |
| Android-Emulator (API 34, Pixel 6) mit Maestro | ✅ grün, 24 Screenshots (Lauf 43023945961) |
| iOS-Simulator mit Maestro | ✅ grün, 24 Screenshots (Lauf 43023946165) |

## 4. Screenshots (echt, aus CI)

Präfix `2026-11-11-phase-04`. Bilder 01–19 wie in Phase 3, neu sind 20–24. Die Losgeh-Knöpfe erscheinen nur in den
3 Stunden vor dem Losgehen. Ob sie auf den CI-Bildern zu sehen sind, hängt also von der Uhrzeit des Laufs ab.

| Ablauf | Android | iOS |
| --- | --- | --- |
| Bereit-Check (Liste) | [Android](../screenshots/2026-11-11-phase-04-android-20-ready-check.png) | [iOS](../screenshots/2026-11-11-phase-04-ios-20-ready-check.png) |
| Bereit-Check (Schritt für Schritt) | [Android](../screenshots/2026-11-11-phase-04-android-21-ready-steps.png) | [iOS](../screenshots/2026-11-11-phase-04-ios-21-ready-steps.png) |
| Fokus-Modus mit Begleit-Timer | [Android](../screenshots/2026-11-11-phase-04-android-22-focus.png) | [iOS](../screenshots/2026-11-11-phase-04-ios-22-focus.png) |
| Ton der Erinnerungen und Puffer-Lernen | [Android](../screenshots/2026-11-11-phase-04-android-23-tone-learning.png) | [iOS](../screenshots/2026-11-11-phase-04-ios-23-tone-learning.png) |
| Pünktlichkeits-Bilanz mit Heatmap | [Android](../screenshots/2026-11-11-phase-04-android-24-punctuality.png) | [iOS](../screenshots/2026-11-11-phase-04-ios-24-punctuality.png) |

## 5. Was nicht fertig ist / bewusst offen (ehrlich)

- **Wegzeit per Google aus der Adresse** ([ADR 0013](../../decisions/0013-travel-time-google-later.md)): wartet auf
  dein Google-Cloud-Konto (und für den empfohlenen sicheren Weg ein Vercel-Konto). Bis dahin bleibt die Wegzeit
  manuell und ist so gekennzeichnet. Keine Kartenanzeige.
- **Erinnerungs-Knöpfe auf echten Geräten nicht beobachtet:** Im Simulator/Emulator prüfen wir nur die Planung. Ob
  „Bin unterwegs“ aus der Benachrichtigung heraus (App geschlossen) zuverlässig gespeichert wird, zeigt erst ein
  echtes Gerät (Android-APK, später TestFlight). Wird die App dafür nicht geweckt, holt sie das beim nächsten Start nach.
- **Stufe 0 „Vortag“** (z. B. „Geschenk noch offen“), berechnete Ankunftszeit und Live-Standort teilen fehlen noch.
- Der Fokus-Modus hat noch keinen Bildschirm, der wach bleibt, und kein Widget.
- Puffer-Lernen und Bereit-Check sind laut Abo-Matrix Premium; im Prototyp sind sie für alle an (Demo-Kauf: Phase 6).

## 6. Funde & Risiken

| Fund | Status |
| --- | --- |
| Geräte mit älterem Prototyp hätten keinen Verlauf → Bilanz leer | ✅ Demo-Verlauf wird einmalig nachgeliefert (getestet) |
| Fokus-Modus zeigte bei „Als Nächstes“ keinen Tag, wenn der Termin morgen ist | ✅ beim Durchklicken im Browser gefunden, Datum ergänzt |
| Hinweis unter „Trödel-Puffer“ sagte noch „Lernen kommt in Phase 4“ | ✅ auf den CI-Bildern gefunden, Text angepasst (Bilder zeigen noch den alten Text) |
| Maestro-Ablauf verpasste auf Android Tipps nach Übergängen bzw. unter der Kopfzeile | ✅ Ablauf wartet und wiederholt Tipps, scrollt vor dem Öffnen nach oben |
| Ältere Tests liefen mit gelerntem statt festem Puffer | ✅ Testdaten bilden jetzt bewusst „ohne Verlauf“ ab |
| Benachrichtigungs-Aktionen hängen vom Betriebssystem ab (iOS weckt die App kurz, Android ebenso) | Risiko, auf echten Geräten prüfen |

## 7. Offene Fragen an den PO

1. **Deine gesammelten Änderungswünsche** zu Phase 1–4: Gib sie mir gern jetzt gesammelt, ich setze sie vor Phase 5 um.
2. **Google-Wegzeit:** Wann magst du das Google-Cloud-Projekt (und ggf. Vercel) anlegen? Ich führe dich Schritt für
   Schritt durch, ohne dass Schlüssel in den Chat müssen.
3. **Nächste Phase:** Weiter mit **Phase 5 – Familie & Gruppen** (Familienbereich, Kinderprofile, Fahrdienste,
   Einkaufsliste, Ämtchen, Gruppen mit wiederkehrenden Treffen, ICS-Import/-Export)?

## 8. Nächster Schritt

Deine Änderungswünsche umsetzen, dann nach Freigabe Phase 5 (Block A, weiter lokal ohne Konten).
