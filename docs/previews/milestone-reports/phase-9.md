# Milestone-Report Phase 9 – Gesten & neuer Aufbau überall

> **Status:** 2026-11-12 · Phase 9 umgesetzt · **Stopp – wartet auf Review und Freigabe durch den PO.**
> Auftrag (PO, 2026-11-12): Events-Liste, Familie und Gruppen bekommen den neuen Aufbau; Wischgesten und Abhaken jetzt.

## 1. Ergebnis in einem Satz

Termine lassen sich **abhaken** und **wischen** (rechts = erledigt, links = später), und **jeder Screen** hat jetzt
dieselben ruhigen weißen Karten – Events, Familie, Gruppen und die Kacheln im Tab „Gemeinsam“ eingeschlossen.

## 2. Was fertig ist

| Bereich | Ergebnis |
| --- | --- |
| Abhaken | Runder Haken vor jedem Termin in „Dein Tag“; erledigte Termine werden gedimmt und vorgelesen („erledigt“). Gespeichert pro Vorkommen nur auf dem Gerät (30 Tage), sichtbar im Datenschutz-Center, im Export und von „Alle Daten löschen“ erfasst |
| Wischen | Nach rechts: erledigt/wieder offen. Nach links: **Verschieben** (+15 Min., +1 Std., morgen) für eigene einmalige Termine. Bei fremden Events oder Serien erklärt das Blatt, warum, und öffnet den Termin. Leichte Vibration an der Schwelle; vertikales Scrollen bleibt ungestört |
| Barrierefrei | Beide Wisch-Aktionen gibt es auch als Knopf und als **Screenreader-Aktion** auf der Zeile (VoiceOver/TalkBack „Aktionen“) |
| Events-Liste | Abschnitte **Offene Einladungen · Diese Woche · Später** mit Anzahl; Zeilen mit Avatar der Gastgeber:in, Datum/Uhrzeit und Antwortstand; „Antwort offen“ steht als Wort da, nicht nur als Farbe |
| Familie | Oben drei Zahlen: offene Fahrten, Einkaufsliste, Ämtchen heute; darunter die Bereiche als weiße Karten |
| Gruppen & „Gemeinsam“ | `Card` und `Tile` sind jetzt überall die weiße Karte mit weichem Schatten; Felder, Schalterleisten und Stepper in Karten haben einen Sand-Hintergrund, damit sie sichtbar bleiben |

## 3. Prüfergebnisse

| Prüfung | Ergebnis |
| --- | --- |
| `pnpm check` | ✅ 1585 Tests: i18n 1024, ui 215, App 167, domain 132, demo 21, brand 11, entitlements 9, config 6 |
| Neue Tests | Abhaken speichern/zurücknehmen, Screenreader-Aktionen = Wisch-Aktionen, Verschieben um 1 Std., fremdes Event nicht verschiebbar, Datenschutz zählt abgehakte Termine |
| Web-Vorschau | ✅ Heute (abgehakt), Events, Familie, Termin „Gemeinsam“ geprüft |
| CI Android / iOS | wird eingetragen, sobald die Läufe grün sind |

## 4. Screenshots (echt, aus CI)

Präfix `2026-11-12-phase-09`. Neu: 52 (abgehakt), 53 (Verschieben per Wischen); 11 (Events), 26 (Familie), 31
(Gruppen) und 12 (Gemeinsam) zeigen den neuen Aufbau.

| Ablauf | Android | iOS |
| --- | --- | --- |
| Abgehakter Termin | [Android](../screenshots/2026-11-12-phase-09-android-52-today-ticked.png) | [iOS](../screenshots/2026-11-12-phase-09-ios-52-today-ticked.png) |
| Verschieben (Wischen) | [Android](../screenshots/2026-11-12-phase-09-android-53-later-sheet.png) | [iOS](../screenshots/2026-11-12-phase-09-ios-53-later-sheet.png) |
| Events-Liste | [Android](../screenshots/2026-11-12-phase-09-android-11-events-invitations.png) | [iOS](../screenshots/2026-11-12-phase-09-ios-11-events-invitations.png) |
| Familie | [Android](../screenshots/2026-11-12-phase-09-android-26-family.png) | [iOS](../screenshots/2026-11-12-phase-09-ios-26-family.png) |
| Gruppen | [Android](../screenshots/2026-11-12-phase-09-android-31-groups.png) | [iOS](../screenshots/2026-11-12-phase-09-ios-31-groups.png) |
| Termin · Gemeinsam | [Android](../screenshots/2026-11-12-phase-09-android-12-detail-rsvp-bento.png) | [iOS](../screenshots/2026-11-12-phase-09-ios-12-detail-rsvp-bento.png) |

## 5. Was nicht fertig ist / bewusst offen (ehrlich)

- Wischen und Abhaken gibt es in **„Dein Tag“** auf „Heute“, noch nicht im Kalender und in der Events-Liste.
- „Erledigt“ ist eine persönliche Liste auf dem Gerät; es ändert keine Zusage und wird nicht geteilt.
- Verschieben fremder Events bleibt eine Anfrage (Demo) über den Helfer; echte Nachrichten kommen mit Konten (B2).
- Die Wisch-Animation wurde im Emulator/Simulator geprüft, nicht auf einem echten Gerät (Gefühl, Schwelle).

## 6. Funde & Risiken

| Fund | Status |
| --- | --- |
| Weiße Karten machten weiße Bedienelemente darin unsichtbar | ✅ Bedienelemente in Karten mit Sand-Hintergrund |
| Events-Zeilen liefen über drei Zeilen | ✅ Ort aus der Zeile genommen (steht im Termin) |
| Abgehakte Termine sind persönliche Daten | ✅ im Datenschutz-Center gezählt, exportiert und löschbar |

## 7. Offene Fragen an den PO

1. **Freigabe Phase 9?**
2. Abhaken/Wischen auch im **Kalender** und in der **Events-Liste**?
3. Danach wie vereinbart der **Usability-Test** ([Leitfaden](../../product/usability-test.md)).
