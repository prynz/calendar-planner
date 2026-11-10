# Milestone-Report Phase 2 – Kalender-Kern + Anti-Chaos-Basis

> **Status:** 2026-11-10 · Phase 2 umgesetzt · **Stopp – wartet auf Review und Freigabe durch den PO.**

## 1. Ergebnis in einem Satz

Die App ist jetzt ein echter persönlicher Kalender mit dem Kern des USP: Termine anlegen, bearbeiten,
wiederholen und löschen, Ansichten für Woche, Monat und Liste, eine **Losgeh-Zeit** pro Termin mit großer
Lime-Karte in den 3 Stunden davor und **echte Erinnerungen** auf dem Gerät. Alles läuft lokal, ohne Konto
(ADR 0010), und fühlt sich mit Feder-Animationen und Haptik modern an.

## 2. Was fertig ist

| Bereich | Ergebnis |
| --- | --- |
| Lokale Datenschicht | Termine in SQLite hinter einer Repository-Schnittstelle (später austauschbar gegen Server); Beispielwelt wird einmal eingespielt; „Beispielwelt zurücksetzen“; defekte Datensätze werden übersprungen statt die App zu blockieren; optimistische Änderungen mit Rücknahme bei Fehlern |
| Wiederholungen | täglich, wöchentlich an gewählten Tagen, monatlich, jährlich, Intervall, Anzahl, Enddatum; bleibt über die Sommerzeit auf derselben Uhrzeit; „nur diesen Termin löschen“ |
| Kalender-Tab | Woche, Monat (Raster mit Kategorie-Punkten, Tag antippen), Liste (30 Tage); Blättern und „Heute“ |
| Editor | Titel, Kategorie, Datum/Uhrzeit (native Picker), ganztägig, Wiederholung, Ort, Verkehrsmittel, Wegzeit, Fertigmachen, Früher-da-sein; **Live-Vorschau „Du musst um … los.“**; Prüfung mit verständlichen Meldungen; Nachfrage beim Verwerfen |
| Losgeh-Zeit | Rückwärts-Rechnung (Start − Früher-da − Wegzeit − Trödel-Puffer); große Karte nur in den 3 Stunden vor dem Losgehen (Design-Entscheidung §12), sonst kompakte Zeile „→ los um 18:33“ |
| Detailansicht | Kopf in Kategoriefarbe, Plan als Zeitstrahl (fertig machen · in 10 Min. los · jetzt los · ankommen), Erinnerungsstatus, Teilnehmer der Beispielwelt, Bearbeiten/Löschen |
| Erinnerungen | echte lokale Benachrichtigungen (sanft 2 / normal 3 / nachdrücklich 4 Stufen), Berechtigung erst nach Tipp auf „Erinnerungen erlauben“ mit Erklärung, max. 48 geplant (iOS-Grenze 64), Neuplanung bei jeder Änderung |
| Einstellungen | Erinnerungsstärke, Trödel-Puffer (0–30 Min.), Beispielwelt zurücksetzen |
| Gefühl & Bewegung | Karten und Knöpfe geben unter dem Finger nach und federn zurück; Haptik bei Auswahl und Speichern; sanftes Einblenden; Datumsleiste rastet ein; „+“-Knopf an der Tab-Leiste; bei „Bewegung reduzieren“ ruhig |

## 3. Prüfergebnisse

| Prüfung | Ergebnis |
| --- | --- |
| `pnpm check` (typecheck · lint · format · Tests) | ✅ 344 Tests: i18n 188, ui 57, domain 43, App 34, brand 8, demo 8, config 6 |
| Metro-Bundle Android + iOS | ✅ lokal und in CI |
| CI (Qualität, Datenbank, Secret-Scan) | ✅ |
| Android-Build + Emulator | ✅ 10 Screenshots, Berechtigungsprüfung grün |
| iOS-Simulator-Build | ✅ 10 Screenshots, ohne Apple-Konto |

## 4. Screenshots (echt, aus CI vom 2026-11-10)

Android-Emulator (Pixel 6, API 34) und iOS-Simulator (iPhone 17 Pro, iOS 26.5), Preview-Build. Das Gerät startet
auf Englisch und dunkel. Die Beispielwelt richtet sich nach „heute“, deshalb zeigen die Bilder die Uhrzeit des Laufs.

| Ablauf | Android | iOS |
| --- | --- | --- |
| Heute · Systemsprache Englisch · dunkel · Losgeh-Karte | [Android](../screenshots/2026-11-10-phase-02-android-01-today-en-dark.png) | [iOS](../screenshots/2026-11-10-phase-02-ios-01-today-en-dark.png) |
| Detail: Rückwärts-Plan und Erinnerungen | [Android](../screenshots/2026-11-10-phase-02-android-02-detail-leave-plan.png) | [iOS](../screenshots/2026-11-10-phase-02-ios-02-detail-leave-plan.png) |
| Kalender · Monat mit Kategorie-Punkten | [Android](../screenshots/2026-11-10-phase-02-android-03-calendar-month.png) | [iOS](../screenshots/2026-11-10-phase-02-ios-03-calendar-month.png) |
| Kalender · Woche | [Android](../screenshots/2026-11-10-phase-02-android-04-calendar-week.png) | [iOS](../screenshots/2026-11-10-phase-02-ios-04-calendar-week.png) |
| Kalender · Liste (30 Tage) | [Android](../screenshots/2026-11-10-phase-02-android-05-calendar-list.png) | [iOS](../screenshots/2026-11-10-phase-02-ios-05-calendar-list.png) |
| Editor: Rad, 20 Min. → Live-Vorschau der Losgeh-Zeit | [Android](../screenshots/2026-11-10-phase-02-android-06-editor-leave-preview.png) | [iOS](../screenshots/2026-11-10-phase-02-ios-06-editor-leave-preview.png) |
| Liste nach dem Speichern („Physio“ mit „los um …“) | [Android](../screenshots/2026-11-10-phase-02-android-07-list-after-save.png) | [iOS](../screenshots/2026-11-10-phase-02-ios-07-list-after-save.png) |
| Einstellungen: Deutsch, hell, Erinnerungen, Trödel-Puffer, Beispielwelt | [Android](../screenshots/2026-11-10-phase-02-android-08-settings-de-light.png) | [iOS](../screenshots/2026-11-10-phase-02-ios-08-settings-de-light.png) |
| Heute · Deutsch · hell | [Android](../screenshots/2026-11-10-phase-02-android-09-today-de-light.png) | [iOS](../screenshots/2026-11-10-phase-02-ios-09-today-de-light.png) |
| Nach Neustart: Sprache, Theme und neuer Termin bleiben | [Android](../screenshots/2026-11-10-phase-02-android-10-after-relaunch-plan-kept.png) | [iOS](../screenshots/2026-11-10-phase-02-ios-10-after-relaunch-plan-kept.png) |

## 5. Was nicht fertig ist / bewusst offen (ehrlich)

- **Bearbeiten wirkt immer auf die ganze Serie.** Nur einen Termin einer Serie ändern (Ausnahme mit eigenen Werten)
  kommt später; Löschen eines einzelnen Termins geht bereits.
- **Keine Zeitzonen-Auswahl im Editor** und keine Warnung bei überschneidenden Terminen (Kalender-Spezifikation CAL-07/CAL-08).
- **Wegzeit nur manuell** (so gekennzeichnet). Echte Routenzeiten brauchen später einen Google-API-Schlüssel (Block B3).
- **Bereit-Check, „Ich verspäte mich“, Puffer-Lernen, Pünktlichkeits-Bilanz, Fokus-Modus** folgen in Phase 4.
- **Erinnerungen auf echten Geräten** wurden noch nicht beobachtet: Im Simulator/Emulator wird nur die Planung
  geprüft. Auf Android ohne Berechtigung für exakte Alarme können Erinnerungen um 1–2 Minuten abweichen.
- **Dunkle Statusleiste in der Detailansicht** (Kopf in Pastell): nach dem letzten Lauf behoben; die Bestätigung per
  Screenshot folgt mit dem nächsten CI-Lauf.
- Barrierefreiheit: Labels, Rollen, Touch-Ziele und Reduced Motion sind umgesetzt; ein manueller Test mit
  VoiceOver/TalkBack auf echten Geräten steht weiter aus (Phase 7).

## 6. Funde & Risiken

| Fund | Status |
| --- | --- |
| Erinnerungsplanung nutzte die Systemzeit statt der App-Uhr → in Tests Pläne in der Vergangenheit | ✅ behoben, durch Test gefunden |
| iOS-Statusleiste im hellen Modus folgte dem System | ✅ behoben (Phase-1-Fund), per Screenshot bestätigt |
| Tab-Leiste mit „Einstellungen“ zu breit für kleine Bildschirme | ✅ Tab heißt „Ich“ |
| iOS fasst Karten für Screenreader zu einem Satz zusammen – gewollt; Testablauf angepasst | ✅ |
| CI-Emulator zeigt gelegentlich „Pixel Launcher isn't responding“ | ✅ Dialog wird automatisch geschlossen |
| Mehrere CI-Läufe nötig, bis der iOS-Ablauf stabil war (je ca. 30 Min.) | akzeptiert |

## 7. Offene Fragen an den PO

1. **Gefühl:** Passen Tempo und Stärke der Feder-Animationen und der Haptik? (Am besten auf der Android-Test-App
   ausprobieren: Artefakt `nowish-preview-apk` im letzten Android-Lauf.)
2. **Losgeh-Karte:** Ist der Text bei Verspätung („2 Minuten später als geplant. Kein Stress, jetzt los.“) im
   richtigen Ton?
3. **Nächste Phase:** Weiter mit **Phase 3 – Events & Zusammenarbeit (simuliert)**: Event anlegen, Demo-Personen
   einladen, simulierte Zusagen, Swipe-Abstimmung, Mitbringliste, Aufgaben, Chat?

## 8. Nächster Schritt

Nach Freigabe: Phase 3 (Block A, weiter lokal ohne Konten).
