# Milestone-Report Phase 8 – Redesign & persönlicher Helfer

> **Status:** 2026-11-12 · Phase 8 umgesetzt · **Stopp – wartet auf Review und Freigabe durch den PO.**
> Grundlage: deine gesammelten Änderungswünsche nach Block A, Konzept v2 + 5 Ideen
> ([Mockup](../../design/concept/phase-8-redesign/README.md)), [ADR 0016](../../decisions/0016-redesign-helper-personalisation.md).

## 1. Ergebnis in einem Satz

Nowish ist **ruhiger, übersichtlicher und persönlicher**: klar getrennte Bereiche auf warmem Weiß, ein **Helfer**, der
Konflikte und freie Zeit erkennt und fertige Lösungen anbietet, ein **Schnell-Eintrag in einer Zeile** und eine
**Personalisierung** von Farbe, Dichte, Reihenfolge und Start-Ansicht.

## 2. Was fertig ist

| Bereich | Ergebnis |
| --- | --- |
| Optik | Warmes Weiß, weiße Karten mit weichem Schatten, Kategorie nur noch als Punkt/Icon. Eine kräftige Farbe pro Screen (die Akzentfarbe). Jeder Bereich mit Überschrift; Listen zeigen 3 Einträge + „Alle ansehen“ |
| Heute | Begrüßung („Guten Morgen“, mit Namen aus dem Profil), **„Dein Tag in 10 Sekunden“** (abends „Morgen im Blick“), nächster Aufbruch, **Helfer-Karte**, „Dein Tag“ mit Icon-Filter und **freien Lücken** („3 Std. frei · Planen“), **„Diese Woche“** mit bis zu 3 wählbaren Kacheln (Termine, freie Abende, Pünktlichkeit, Fahrdienste, offene Zusagen, vollster Tag) |
| Helfer | Erkennt **Überschneidungen** und **knappe Übergänge** (Losgehen vor dem Ende des vorigen Termins). Lösungen: eigenen Termin verschieben (echt), bei fremden Events „Olivia fragen (Demo)“, „Passt so“. Markiert die betroffene Zeile mit „knapp“. Ohne KI, regelbasiert |
| Schnell-Eintrag | Plus öffnet ein Blatt von unten: „Freitag 19 Uhr Grillen bei Tom“ → Was/Wann/Wo sofort sichtbar; DE und EN; „Eintragen“ oder „Mehr Details“ (Editor vorausgefüllt) |
| Kalender | **Personen-Chips** (Alle, Du, Sam, Lena, Paul) filtern Monat, Woche und Liste; ruhige Listenzeilen |
| Termin | Gemeinsame Events in den Tabs **Plan** und **Gemeinsam** statt einer langen Seite |
| Personalisieren | Unter „Ich“: 4 Akzentfarben mit Vorschau (alle kontrastgeprüft), Luftig/Kompakt, „Heute“ per Pfeil anordnen und Bausteine ausblenden, Start-Ansicht |
| Bewegung | Blatt gleitet hoch, aktive Chips wachsen weich auf, Listen blenden ein; bei „Bewegung reduzieren“ alles ohne Bewegung |
| Demo-Welt | Neuer Termin „Friseur“ (17:45–18:40) läuft in den Spieleabend – der Helfer hat in der Demo immer etwas zu zeigen |

## 3. Prüfergebnisse

| Prüfung | Ergebnis |
| --- | --- |
| `pnpm check` (typecheck · lint · format · Tests) | ✅ 1557 Tests: i18n 1001, ui 215, App 162, domain 132, demo 21, brand 11, entitlements 9, config 6 |
| Neue Tests | Helfer-Regeln (18), Helfer/Schnell-Eintrag/Kacheln/Anordnung in der App (8), Personalisieren (3), Personen-Filter (1), alle Akzent × Hell/Dunkel-Kontraste |
| Barrierefreiheit | Audit jetzt über 29 Screens (inkl. Personalisieren): jedes tippbare Element mit Rolle und Vorlese-Namen |
| Web-Vorschau | ✅ Heute, Schnell-Eintrag, Kalender, Personalisieren im Browser geprüft |
| CI Android | ✅ 51 Screenshots (Lauf 43302684769) |
| CI iOS | wird eingetragen, sobald der Lauf grün ist |

## 4. Screenshots (echt, aus CI)

Präfix `2026-11-12-phase-08`. Neu: 47–51.

| Ablauf | Android | iOS |
| --- | --- | --- |
| Heute mit Helfer | [Android](../screenshots/2026-11-12-phase-08-android-47-today-helper.png) | [iOS](../screenshots/2026-11-12-phase-08-ios-47-today-helper.png) |
| Schnell-Eintrag | [Android](../screenshots/2026-11-12-phase-08-android-48-quick-entry.png) | [iOS](../screenshots/2026-11-12-phase-08-ios-48-quick-entry.png) |
| Personalisieren | [Android](../screenshots/2026-11-12-phase-08-android-49-personalize.png) | [iOS](../screenshots/2026-11-12-phase-08-ios-49-personalize.png) |
| Akzentfarbe Ozean | [Android](../screenshots/2026-11-12-phase-08-android-50-personalize-ocean.png) | [iOS](../screenshots/2026-11-12-phase-08-ios-50-personalize-ocean.png) |
| Kalender: nur Lena | [Android](../screenshots/2026-11-12-phase-08-android-51-calendar-people.png) | [iOS](../screenshots/2026-11-12-phase-08-ios-51-calendar-people.png) |
| Heute (Start) | [Android](../screenshots/2026-11-12-phase-08-android-01-today-en-dark.png) | [iOS](../screenshots/2026-11-12-phase-08-ios-01-today-en-dark.png) |
| Termin mit Tabs | [Android](../screenshots/2026-11-12-phase-08-android-12-detail-rsvp-bento.png) | [iOS](../screenshots/2026-11-12-phase-08-ios-12-detail-rsvp-bento.png) |

## 5. Was nicht fertig ist / bewusst offen (ehrlich)

- **Wischgesten** (Wischen zum Erledigen/Verschieben) und **Abhaken** von Terminen fehlen noch; im Konzept v2 waren
  sie nicht mehr enthalten.
- **Termin-Tabs**: zwei Tabs (Plan · Gemeinsam) statt vier wie im Konzept; Chat und Kosten sind Kacheln im Tab
  „Gemeinsam“.
- **Events-Liste, Familie, Gruppen** haben das neue Grundgerüst (Farben, Karten), aber noch nicht den neuen
  Aufbau mit Abschnitten und Filtern.
- **Helfer**: „Fragen“ bei fremden Events ist simuliert (Demo). Wiederkehrende eigene Termine verschiebt er nicht
  (sonst würde die ganze Serie wandern) – dort bleibt „Passt so“.
- **Schnell-Eintrag**: ohne Uhrzeit nimmt er die nächste volle Stunde – spätabends also z. B. 23:00. Erkennt keine
  Dauer („2 Stunden“) und keine Wiederholung („jeden Montag“).
- Die Erkennung „frei“ berücksichtigt nur Termine in Nowish, nicht Schlafenszeit oder Arbeitszeiten.

## 6. Funde & Risiken

| Fund | Status |
| --- | --- |
| Web-Vorschau wäre mit fehlender Funktion in der Web-Variante abgestürzt (Phase 7) – Test hält Varianten gleich | ✅ weiter grün |
| Konzept-Dateien im Repo ließen die Formatprüfung der CI scheitern | ✅ von der Formatierung ausgenommen |
| Im Schnell-Eintrag konnte die Tastatur „Mehr Details“ verdecken | ✅ Blatt-Inhalt scrollt |
| CI-Abläufe: Taps unter der schwebenden Tab-Leiste, Tastatur im Blatt, längere Einstellungen | ✅ angepasst |
| iOS-CI: Testwerkzeug startete auf dem Mac-Rechner zweimal nicht rechtzeitig | Neustart des Laufs |

## 7. Offene Fragen an den PO

1. **Freigabe Phase 8?**
2. Sollen **Events-Liste, Familie und Gruppen** als Nächstes ebenfalls den neuen Aufbau bekommen (Abschnitte,
   Filter, 3 + „Alle ansehen“)?
3. **Wischgesten und Abhaken** nachziehen – oder erst nach dem Usability-Test entscheiden?
4. Danach wie vereinbart: **Usability-Test** mit dem [Leitfaden](../../product/usability-test.md).

## 8. Nächster Schritt

Nach deiner Freigabe: die Punkte aus §7 nach deiner Antwort, dann der Usability-Test.
