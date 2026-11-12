# Milestone-Report Phase 7 – Erlebnis-Politur & Test

> **Status:** 2026-11-12 · Phase 7 vom PO freigegeben – **Block A abgeschlossen**. PO-Entscheidungen: Logo v1.1 bleibt
> für die Demo, eine Überarbeitung folgt (nicht final); Usability-Test nach den Änderungswünschen.
> Letzte Phase von Block A. Deine gesammelten Änderungswünsche sind der nächste Schritt.

## 1. Ergebnis in einem Satz

Der Prototyp ist jetzt **für alle bedienbar und schneller**: Jeder Screen ist automatisch auf Screenreader-Tauglichkeit
geprüft, große Schrift (200 %) passt in ihre Formen, Vibration ist abschaltbar, volle Kalender rechnen bis zu 18-mal
schneller, das Logo ist bei 16 px lesbar und zeichnet sich im Onboarding selbst, und ein Usability-Test liegt zum
Selbst-Durchführen bereit.

## 2. Was fertig ist

| Bereich | Ergebnis |
| --- | --- |
| Screenreader (VoiceOver/TalkBack) | Automatischer Audit über **alle 28 Screens**: jedes tippbare Element hat Rolle und Vorlese-Namen, fest bemaßte Ziele ≥ 48 dp. Ergebnis: keine Lücke. Ein Gegentest beweist, dass der Audit Fehler findet |
| Große Schrift 200 % | Neuer CI-Ablauf mit 200 % Schrift (Android `font_scale 2.0`, iOS „AX2“), Screenshots 43–46. Gefunden und behoben: Segment-Beschriftungen brachen mitten im Wort („Gruppe-n“), Knopf-Texte stießen an den Rand, Initialen und Datums-Ziffern liefen aus ihren Formen |
| Bewegung | Alle Animationen respektieren „Bewegung reduzieren“ (geprüft). Neu: Die Bildmarke zeichnet sich im ersten Onboarding-Schritt selbst – Ziffernblatt, dann wird der Zeiger zum Pfeil; bei reduzierter Bewegung sofort fertig |
| Haptik | Neuer Schalter **„Vibration bei Aktionen“** in den Einstellungen (gespeichert, getestet). Erinnerungen vibrieren unabhängig davon |
| Performance | Gemessen mit einem sehr vollen Kalender (1.500 Termine + 40 Serien seit zwei Jahren): Tagesansicht **213 → 12 ms**, Monatsansicht **226 → 22 ms**. Wiederkehrende Termine werden nicht mehr ab ihrem allerersten Datum umgerechnet. Tests sichern Tempo (Anzahl teurer Zeitzonen-Aufrufe) und unveränderte Ergebnisse |
| Logo v1.1 | Mindestgrößen-Test: Bei 16 px verschmolz der Zeiger mit dem Ring. Zeiger etwas kürzer, Öffnung etwas weiter – jetzt ≥ 1 px Luft (3 Tests). App-Icons, Splash und Logo-Dateien neu erzeugt. Schutzraum und Mindestgröße dokumentiert ([Logo-README](../../brand/logo/README.md)) |
| Usability-Test | [Leitfaden zum Selbst-Durchführen](../../product/usability-test.md): wer (3–5 Personen nach Personas), Ablauf (30 Min.), 10 Aufgaben zu den Kernversprechen, Beobachtungsbogen, Abschlussfragen, Zielwerte für „überzeugt“, Datenschutz beim Test |

## 3. Prüfergebnisse

| Prüfung | Ergebnis |
| --- | --- |
| `pnpm check` (typecheck · lint · format · Tests) | ✅ 1257 Tests: i18n 890, App 149, domain 114, ui 57, demo 21, brand 11, entitlements 9, config 6 |
| Web-Vorschau | ✅ Onboarding mit Animation (normal und reduzierte Bewegung) im Browser geprüft |
| CI (Qualität, Datenbank, Secret-Scan), Android, iOS | ✅ grün: CI 43127908114, Android 43127793627, iOS 43127793718 (je 46 Screenshots inkl. 200 %) |

## 4. Screenshots (echt, aus CI)

Präfix `2026-11-11-phase-07`. Bilder 01–42 wie in Phase 6 (jetzt mit Logo v1.1 im Onboarding), neu sind 43–46 mit
200 % Schrift.

| Ablauf | Android | iOS |
| --- | --- | --- |
| Onboarding mit Bildmarke | [Android](../screenshots/2026-11-11-phase-07-android-34-onboarding.png) | [iOS](../screenshots/2026-11-11-phase-07-ios-34-onboarding.png) |
| 200 %: Heute | [Android](../screenshots/2026-11-11-phase-07-android-43-large-text-today.png) | [iOS](../screenshots/2026-11-11-phase-07-ios-43-large-text-today.png) |
| 200 %: Events | [Android](../screenshots/2026-11-11-phase-07-android-44-large-text-events.png) | [iOS](../screenshots/2026-11-11-phase-07-ios-44-large-text-events.png) |
| 200 %: Einstellungen/Tarif | [Android](../screenshots/2026-11-11-phase-07-android-45-large-text-settings.png) | [iOS](../screenshots/2026-11-11-phase-07-ios-45-large-text-settings.png) |
| 200 %: Tarife | [Android](../screenshots/2026-11-11-phase-07-android-46-large-text-paywall.png) | [iOS](../screenshots/2026-11-11-phase-07-ios-46-large-text-paywall.png) |

## 5. Was nicht fertig ist / bewusst offen (ehrlich)

- **Usability-Test selbst** ist nicht durchgeführt – das braucht echte Testpersonen (Sache des PO, Leitfaden liegt
  bereit). Ob der Prototyp „überzeugt“, entscheidet dieser Test.
- **VoiceOver/TalkBack von Hand**: Der Audit prüft Rollen, Namen und Größen, nicht die Lesereihenfolge oder ob
  Ansagen verständlich sind. Das geht nur am echten Gerät (gut als Teil des Usability-Tests mit einer Person, die
  einen Screenreader nutzt).
- **Performance auf echten Geräten** ist nicht gemessen (kein Gerät in der CI); die Messung lief auf dem
  Entwicklungsrechner. Schwächere Handys sind etwa 3–5-mal langsamer – auch dann läge die Tagesansicht bei etwa 40–60 ms statt bisher rund einer Sekunde.
- **200 %** ist für vier Screens mit Screenshots belegt; die übrigen Screens nutzen dieselben Bausteine, sind aber nicht
  einzeln fotografiert.
- **Logo v1.1** ist ein Kandidat – final wird es mit deiner Freigabe (und ggf. einem Designer vor dem Launch, B5).
  Die Splash-Animation beim App-Start (nativ) fehlt noch; die Animation läuft im Onboarding.
- Weiterhin offen aus früheren Phasen: TestFlight (wartet auf die Secrets), Google-Wegzeit (wartet auf das Konto).

## 6. Funde & Risiken

| Fund | Status |
| --- | --- |
| 200 %: „Gruppe-n“, Knopf-Texte am Rand, Initialen/Datums-Ziffern zu groß | ✅ zentral in `packages/ui` behoben, neue Screenshots |
| Web-Vorschau wäre mit dem Vibrations-Schalter abgestürzt (Web-Variante fehlte eine Funktion) | ✅ behoben; neuer Test hält Web- und App-Varianten aller Module gleich |
| Volle Kalender: 213 ms pro Tagesansicht | ✅ 12 ms, getestet |
| Logo bei 16 px: Zeiger verschmolz mit dem Ring | ✅ v1.1 |
| iOS-CI: Taps direkt unter der Statusleiste wurden verschluckt (Wechsel zu „Gruppen“) | ✅ Ablauf scrollt bis zur Überschrift |
| CI-Ablauf: Scrollen schob „Tarife vergleichen“ aus dem Bild; bei 200 % ist die Tarif-Karte höher als der Bildschirm | ✅ Knopf wird direkt bzw. zentriert angesteuert |
| CI-Rechner konnte einmal ein Android-Werkzeug (NDK) nicht laden | Einmalig, Neustart reichte |

## 7. Offene Fragen an den PO

1. **Freigabe Phase 7** und damit Abschluss von Block A?
2. **Deine gesammelten Änderungswünsche:** Jetzt ist der vereinbarte Zeitpunkt – schick sie mir gern als Liste.
3. **Logo v1.1** als finales Logo freigeben?
4. **Usability-Test:** Machst du ihn vor oder nach den Änderungswünschen? (Empfehlung: danach, damit die Testpersonen
   die verbesserte Version sehen.)

## 8. Nächster Schritt

Nach deiner Freigabe: deine Änderungswünsche umsetzen. Danach entscheidest du, ob und wann Block B (Backend &
Konten, B1) startet – dafür werden die ersten Konten nötig (Supabase).
