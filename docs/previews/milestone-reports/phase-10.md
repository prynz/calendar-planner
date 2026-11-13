# Milestone-Report Phase 10 – Gesten auch in Kalender & Events

> **Status:** 2026-11-12 · Phase 10 umgesetzt · **Stopp – wartet auf Review und Freigabe durch den PO.**
> Auftrag (PO, 2026-11-12, Freigabe Phase 9): Abhaken und Wischen auch im Kalender und in der Events-Liste.

## 1. Ergebnis in einem Satz

Abhaken und Wischen funktionieren jetzt **überall gleich** – auf „Heute“, in allen drei Kalender-Ansichten (Woche,
Monat, Liste) und in der Events-Liste –, und ein Häkchen gilt überall: was auf „Heute“ abgehakt ist, ist es auch im
Kalender.

## 2. Was fertig ist

| Bereich | Ergebnis |
| --- | --- |
| Gemeinsame Logik | Ein Baustein `useRowActions` (`features/today/row-actions.tsx`) für alle Listen: runder Haken, nach rechts = erledigt, nach links = Verschieben-Blatt, Screenreader-Aktionen. „Heute“ nutzt ihn ebenfalls – keine zweite Variante |
| Kalender | Jede Zeile in Woche, Monat und Liste hat Haken und Wischgesten; Verschieben wie auf „Heute“ (+15 Min., +1 Std., morgen) |
| Events-Liste | Haken und Wischen in „Offene Einladungen“, „Diese Woche“ und „Später“. Events anderer lassen sich nicht verschieben – das Blatt sagt das und öffnet das Event |
| Barrierefrei | Häkchen-Zustand wird überall vorgelesen („erledigt“); Wisch-Aktionen auch als Screenreader-Aktion |

## 3. Prüfergebnisse

| Prüfung | Ergebnis |
| --- | --- |
| `pnpm check` | ✅ 1587 Tests: i18n 1024, ui 215, App 169, domain 132, demo 21, brand 11, entitlements 9, config 6 |
| Neue Tests | Häkchen von „Heute“ erscheinen im Kalender, Abhaken und Verschieben im Kalender, Abhaken und „Später“ in der Events-Liste |
| CI Android / iOS | wird eingetragen, sobald die Läufe grün sind |

## 4. Screenshots (echt, aus CI)

Präfix `2026-11-12-phase-10`. Neu: 54 (Kalender mit dem auf „Heute“ abgehakten Zahnarzt); alle Kalender- und
Events-Screenshots zeigen jetzt die Haken.

| Ablauf | Android | iOS |
| --- | --- | --- |
| Kalender, abgehakt | [Android](../screenshots/2026-11-12-phase-10-android-54-calendar-ticked.png) | [iOS](../screenshots/2026-11-12-phase-10-ios-54-calendar-ticked.png) |
| Events-Liste | [Android](../screenshots/2026-11-12-phase-10-android-11-events-invitations.png) | [iOS](../screenshots/2026-11-12-phase-10-ios-11-events-invitations.png) |

## 5. Was nicht fertig ist / bewusst offen (ehrlich)

- Der Wisch-Hinweis („Nach rechts wischen: erledigt …“) steht nur auf „Heute“, damit Kalender und Events ruhig bleiben.
- Abhaken ist weiter eine persönliche Liste auf dem Gerät – es ändert keine Zusage. Ob in der Events-Liste nach links
  lieber „Zusagen/Absagen“ stehen sollte, ist eine gute Frage für den Usability-Test.
- Wischen weiterhin nur im Emulator/Simulator geprüft, nicht auf einem echten Gerät.

## 6. Funde & Risiken

| Fund | Status |
| --- | --- |
| Mit Haken + Avatar + „Antwort offen“ brach in der Events-Liste der Titel mitten im Wort um („Geburtstag­sfeier“) | ✅ Hinweis rechts entfernt – der Antwortstand steht als Wort in der Zeile darunter („Noch offen · …“) und wird vorgelesen |

## 7. Offene Fragen an den PO

1. **Freigabe Phase 10?**
2. Danach wie vereinbart: deine gesammelten Änderungswünsche, dann der **Usability-Test** ([Leitfaden](../../product/usability-test.md)).
