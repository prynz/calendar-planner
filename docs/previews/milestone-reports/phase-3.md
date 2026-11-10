# Milestone-Report Phase 3 – Events & Zusammenarbeit (simuliert)

> **Status:** 2026-11-10 · Phase 3 umgesetzt · **Stopp – wartet auf Review und Freigabe durch den PO.**

## 1. Ergebnis in einem Satz

Aus dem Kalender wird ein Social Planner: Du kannst Events anlegen (auch aus Vorlagen), Leute einladen, auf
Einladungen antworten, per **Swipe abstimmen**, die **Mitbringliste** und **Aufgaben** verteilen und im **Chat**
schreiben. Die anderen Personen sind erfunden und antworten nach festen, nachvollziehbaren Regeln. Alles läuft lokal
auf dem Gerät, ohne Konto und Server ([ADR 0012](../../decisions/0012-simulated-collaboration.md)).

## 2. Was fertig ist

| Bereich | Ergebnis |
| --- | --- |
| Events-Tab | „Event erstellen“ und „Vorlage wählen“; **offene Einladungen** oben, dann alles Weitere; pro Event dein Status („Noch offen“, „Zugesagt“, „Du lädst ein“) und die Zahlen |
| Event anlegen | Editor mit Schritt **„Wer?“** (Demo-Kontakte); 6 **Vorlagen** (Geburtstag, Grillen, Spieleabend, Kindergeburtstag, Umzug, Festival) füllen Titel, Kategorie, Uhrzeit, Vorbereitung, Aufgaben (mit Fälligkeit relativ zum Termin) und Mitbringliste vor; alles einzeln abwählbar |
| Event-Detail | Deine Antwort (**Bin dabei · Vielleicht · Kann nicht**, +1), Hinweis zur Frist für „Vielleicht“; **Bento-Kacheln**: Gäste (erwartete Personen, Avatare), Umfrage, Mitbringliste und Aufgaben mit Fortschritt, Chat mit letzter Nachricht |
| Gäste | Liste nach Zusagen, „Vielleicht“, offen, abgelaufen, Absagen; als Gastgeber: weitere Personen einladen, Frist für „Vielleicht“ (keine / 1 Tag / 2 Tage vorher). Ein abgelaufenes „Vielleicht“ zählt als „noch offen“, nie automatisch als Absage |
| Umfrage | **Swipe-Kartenstapel**: rechts = passt, links = passt nicht, hoch = wenn nötig; daneben gleichwertige Knöpfe. Danach Zwischenstand mit Balken und Stimme ändern. Frist, Entscheidung durch Mehrheit oder Gastgeber, Gleichstand entscheidet der Gastgeber (nie Zufall). Termin-Gewinner wird mit einem Tipp **zur neuen Event-Zeit**. Als Gastgeber: neue Umfrage (Termin oder Auswahl) |
| Mitbringliste | Wer bringt wie viel (Teilmengen, z. B. 2 von 6), eigener Anteil per −/+; nie mehr als gebraucht; neue Dinge mit Hinweis auf Ähnliches („Salate“ → „Salat gibt es schon“) |
| Aufgaben | „Ich übernehme das“ (wer zuerst kommt; sonst „Schon übernommen von …“), Abhaken mit Haptik, abgeben, neue Aufgaben, Fortschritt |
| Chat | Nachrichten, Systemhinweise („Tom ist dabei 🎉“, „Neue Umfrage“, „Mia hat … erledigt ✅“); eine Demo-Person antwortet nach 4–8 s |
| Simulation | Eingeladene antworten nach 5–25 s, stimmen nach 6–30 s ab; Regeln deterministisch (immer gleiche Reaktion), Kinderprofile handeln nie selbst. Beim ersten Start sagt Tom nach ca. 12 s für deinen Filmabend zu und Alex ab |
| Beispielwelt | Neuer Filmabend, den du selbst ausrichtest (Umfrage „Welcher Film?“, Aufgaben, Mitbringliste); Toms Feier wartet auf deine Antwort; beim Grillabend ist deine Stimme offen |
| Speicher | Ein geprüftes Dokument pro Event in SQLite (Schema v2), im Web in `localStorage`. Geräte mit dem Phase-2-Prototyp bekommen die Daten einmalig nachgeliefert, eigene Termine bleiben erhalten |
| Web-Vorschau | Alles oben auch unter https://prynz.github.io/calendar-planner/ (ADR 0011) |

## 3. Prüfergebnisse

| Prüfung | Ergebnis |
| --- | --- |
| `pnpm check` (typecheck · lint · format · Tests) | ✅ 578 Tests: i18n 374, domain 63, ui 57, App 56, demo 14, brand 8, config 6 |
| Metro-Bundle Android + iOS, Web-Export | ✅ lokal |
| Web-Vorschau im Browser (Events, Detail, Umfrage, Mitbringliste, Aufgaben, Gäste, Chat, Vorlagen, Editor) | ✅ lokal durchgeklickt, keine Fehler in der Konsole; Simulation sichtbar |
| CI (Qualität, Datenbank, Secret-Scan), Android, iOS | siehe Abschnitt 4 |

## 4. Screenshots (echt, aus CI)

Die Bilder entstehen im CI-Lauf auf dem Android-Emulator und im iOS-Simulator (Präfix `2026-11-10-phase-03`).
Die Bilder 01–10 zeigen weiterhin den Kalender-Kern aus Phase 2, 11–19 sind neu.

| Ablauf | Android | iOS |
| --- | --- | --- |
| Events: offene Einladungen zuerst | [Android](../screenshots/2026-11-10-phase-03-android-11-events-invitations.png) | [iOS](../screenshots/2026-11-10-phase-03-ios-11-events-invitations.png) |
| Detail: Zusage und Bento-Kacheln | [Android](../screenshots/2026-11-10-phase-03-android-12-detail-rsvp-bento.png) | [iOS](../screenshots/2026-11-10-phase-03-ios-12-detail-rsvp-bento.png) |
| Umfrage: Swipe-Karte mit Knöpfen | [Android](../screenshots/2026-11-10-phase-03-android-13-poll-swipe.png) | [iOS](../screenshots/2026-11-10-phase-03-ios-13-poll-swipe.png) |
| Umfrage: Zwischenstand | [Android](../screenshots/2026-11-10-phase-03-android-14-poll-results.png) | [iOS](../screenshots/2026-11-10-phase-03-ios-14-poll-results.png) |
| Mitbringliste | [Android](../screenshots/2026-11-10-phase-03-android-15-bring-list.png) | [iOS](../screenshots/2026-11-10-phase-03-ios-15-bring-list.png) |
| Chat mit Demo-Antwort | [Android](../screenshots/2026-11-10-phase-03-android-16-chat-demo-reply.png) | [iOS](../screenshots/2026-11-10-phase-03-ios-16-chat-demo-reply.png) |
| Vorlagen | [Android](../screenshots/2026-11-10-phase-03-android-17-templates.png) | [iOS](../screenshots/2026-11-10-phase-03-ios-17-templates.png) |
| Editor: Vorlage „Grillen“ mit „Wer?“ | [Android](../screenshots/2026-11-10-phase-03-android-18-editor-template-who.png) | [iOS](../screenshots/2026-11-10-phase-03-ios-18-editor-template-who.png) |
| Gäste aus Sicht des Gastgebers | [Android](../screenshots/2026-11-10-phase-03-android-19-guests-host.png) | [iOS](../screenshots/2026-11-10-phase-03-ios-19-guests-host.png) |

## 5. Was nicht fertig ist / bewusst offen (ehrlich)

- **Shared-Element-Übergang** Karte → Detail (in der Roadmap für Phase 3 genannt): nicht umgesetzt. Die
  Shared-Element-Übergänge von Reanimated 4 sind noch experimentell; Vorschlag: in Phase 7 (Erlebnis-Politur) prüfen.
- **Co-Hosts, Kapazität/Warteliste, Absagen mit Nachricht, Änderungs-Diff für Gäste** fehlen noch (Events-Spezifikation
  EVT-06/07/09/10).
- **Chat:** keine Antworten mit Zitat, Reaktionen, Bilder, Anheften, Stummschalten, Bearbeiten/Löschen. **Melden und
  Blockieren** sind vor jeder Veröffentlichung Pflicht (Store-Richtlinien) und kommen spätestens mit echten Personen (B2).
- **Umfragen:** keine anonymen Umfragen, keine Ortsumfrage, keine Mehrfachauswahl, keine Erinnerung an Nichtwähler.
- **Keine Erinnerungen** an die „Vielleicht“-Frist, Umfrage-Fristen oder fällige Aufgaben (Benachrichtigungen gibt es
  bisher nur für die Losgeh-Zeit).
- **Aufgaben:** Fälligkeit nur aus Vorlagen, nicht beim manuellen Anlegen; Fortschritt als Balken statt Ring.
- **Mitbringliste:** keine Kategorien; Vorschläge brauchen keine Freigabe durch den Gastgeber; Übernahme in den
  Bereit-Check folgt mit Phase 4.
- **Bearbeiten im Editor** ändert bei Events nur Zeit, Ort usw.; Gäste lädt man über die Gästeliste ein.
- Die Gesten der Swipe-Karte sind im Browser und per Unit-Test nur über die Knöpfe geprüft; ob sich das Wischen gut
  anfühlt, zeigt erst das echte Gerät (Android-APK, später TestFlight).

## 6. Funde & Risiken

| Fund | Status |
| --- | --- |
| Gesture Handler 3 bindet sich beim Import an die Worklets-Laufzeit, die es in Jest nicht gibt → alle Test-Suites brachen ab | ✅ gezielt in `jest.pre-setup.ts` gemockt; Gesten selbst testen die Knöpfe |
| Aufgaben-Zeile: Titel wurde neben dem Knopf zerquetscht („Popcor n“) | ✅ beim Durchklicken im Browser gefunden, Knopf unter den Text |
| Geräte mit Phase-2-Daten hätten keine Zusammenarbeits-Daten | ✅ einmalige Nachlieferung (`collab_seeded`), getestet |
| Simulation braucht einen Takt pro Sekunde | akzeptiert: schreibt nur, wenn etwas fällig ist |
| Neue Abhängigkeit: `zod` direkt in der App (war über `@nowish/config` schon im Bundle) | begründet im Commit; keine Netzwerk- oder Tracking-Funktion |

## 7. Offene Fragen an den PO

1. **Gefühl:** Passt das Swipe-Abstimmen (Tempo, Schwelle, Kippen der Karte)? Am besten in der Android-Test-App oder
   später über TestFlight ausprobieren.
2. **Simulation:** Antworten die Demo-Personen in einem guten Tempo (5–25 s), oder lieber schneller bzw. langsamer?
3. **Shared-Element-Übergang:** Einverstanden, ihn in Phase 7 (Politur) zu prüfen statt jetzt?
4. **Nächste Phase:** Weiter mit **Phase 4 – Anti-Chaos-Engine komplett** (Bereit-Check mit deinen Mitbringseln,
   „Ich verspäte mich“, Ton der Erinnerungen, Puffer-Lernen, Pünktlichkeits-Bilanz, Fokus-Modus)?

## 8. Nächster Schritt

Nach Freigabe: Phase 4 (Block A, weiter lokal ohne Konten).
