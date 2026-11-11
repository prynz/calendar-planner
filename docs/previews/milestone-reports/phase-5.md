# Milestone-Report Phase 5 – Familie & Gruppen

> **Status:** 2026-11-11 · Phase 5 umgesetzt · **Stopp – wartet auf Review und Freigabe durch den PO.**
> Änderungswünsche zu allen Phasen nimmt der PO erst am Ende aller Phasen gesammelt auf (Wunsch vom 2026-11-11).

## 1. Ergebnis in einem Satz

Aus „Events“ wird der Tab **„Gemeinsam“** mit **Events · Gruppen · Familie**: ein Familienbereich mit Kinderprofilen,
**Fahrdiensten** samt Konfliktwarnung, gemeinsamer **Einkaufsliste**, fair rotierenden **Ämtchen** und einer
**Familienwoche** auf einen Blick, dazu **Gruppen** mit Chat und wiederkehrenden Treffen (z. B. **„jeden 1. Freitag“**,
Antwort pro Termin) und **Kalender-Dateien (ICS)** zum Importieren und Exportieren. Alles lokal, andere Personen sind
Demo.

## 2. Was fertig ist

| Bereich | Ergebnis |
| --- | --- |
| Tab „Gemeinsam“ | Segmente Events · Gruppen · Familie; die Tab-Leiste bleibt bei vier Einträgen ([ADR 0014](../../decisions/0014-family-groups-local.md)) |
| Familienbereich | Mitglieder (Du, Sam, Lena 🦊, Paul 🐢), „Verwalten“, **Familienwoche** (ein Punkt pro Termin in der Farbe der Person, volle Tage in Lime, Zahl immer dabei und vorgelesen) |
| Kinderprofile | Nur Name, Farbe, Symbol – **kein Geburtstag, kein Foto, kein Konto**. Anlegen, bearbeiten, löschen (mit Nachfrage; Zuordnungen und Ämtchen gehen mit). *Nachtrag Phase 6: Kinderprofile zählen nicht zu den Erwachsenen (monetization.md §2)* |
| Erwachsene einladen | Demo: die eingeladene Person nimmt nach ein paar Sekunden an (klar so beschriftet) |
| Für wen? | Im Editor jedem Termin Familienmitglieder zuordnen; im Termin-Detail steht „Für Lena“ mit dem Fahrdienst-Stand |
| Fahrdienste | Für Kindertermine mit Ort (ohne begleitenden Erwachsenen): **Hinbringen / Abholen** mit „Ich fahre“, „Sam fragen“, „Abgeben“. **Warnung**, wenn der Fahrer da einen eigenen Termin hat („Achtung: Du hast da „Wohnungsbesichtigung“ (10:00).“). Sam sagt zu, wenn er frei ist (Demo-Regel) |
| Einkaufsliste | Hinzufügen mit Menge/Notiz, abhaken (wer hat's besorgt), „Erledigte entfernen“. Sam hakt manchmal etwas ab (Demo) |
| Ämtchen | Täglich oder wöchentlich, Reihenfolge wechselt streng reihum („Lena ist dran“), heute abhaken, „Als Nächstes bist du dran: 18. Nov.“, neue Ämtchen anlegen, löschen mit Nachfrage |
| Gruppen | Liste mit Mitgliedern und nächstem Treffen („2 dabei · 1 diesmal nicht · 1 offen“), Gruppe anlegen (Name, Symbol, Leute), privat ohne Suche |
| Gruppen-Treffen | „Treffen planen“ öffnet den Editor, **alle Mitglieder werden eingeladen**. Neu: Wiederholung **„Jeden 1. Freitag“ / „letzten Montag“**. Pro Termin „Bin dabei“ / „Diesmal nicht“ – unabhängig vom nächsten Mal |
| Gruppenchat | Wie der Event-Chat, mit Systemhinweisen („Tom hat ein Treffen geplant: Stammtisch“); ein Mitglied antwortet (Demo) |
| Rollen | Admins fügen hinzu, entfernen, machen zu Admins; die letzte Admin-Rolle bleibt immer besetzt; „Gruppe verlassen“ (eigene Nachrichten bleiben) |
| Kalender-Datei (ICS) | Unter „Ich“: **Datei importieren** (System-Dateiauswahl, Vorschau „neu / schon vorhanden / nicht importierbar“ mit Grund pro Eintrag) und **Alle Termine exportieren** (Teilen-Menü; im Browser Download). Eigene Exporte werden beim Re-Import erkannt, nicht verdoppelt |
| Beispielwelt | Neue Demo-Termine: Schwimmkurs Lena, Kinderarzt mit Paul, Stammtisch (jeden 1. Freitag), Lauftreff (samstags); ältere Prototyp-Installationen bekommen das einmalig dazu |
| Speicher | SQLite Schema v4 (`household`, `circle`), geprüft beim Lesen (zod), Web-Vorschau in `localStorage` |

## 3. Prüfergebnisse

| Prüfung | Ergebnis |
| --- | --- |
| `pnpm check` (typecheck · lint · format · Tests) | ✅ 953 Tests: i18n 669, domain 102, App 90, ui 57, demo 21, brand 8, config 6 |
| Metro-Bundle Android + iOS (`export:native`) | ✅ lokal |
| Web-Vorschau im Browser (Familie, Fahrdienste inkl. Anfrage an Sam, Einkauf, Ämtchen, Mitglieder, Gruppen, Treffen, Gruppenchat, Editor mit „jeden n-ten Wochentag“, Detail mit Familienkarte, ICS-Karte) | ✅ lokal mit fester Uhrzeit durchgeklickt, keine Fehler in der Konsole |
| CI (Qualität, Datenbank, Secret-Scan), Android, iOS | siehe Abschnitt 4 |

## 4. Screenshots (echt, aus CI)

Präfix `2026-11-11-phase-05`. Bilder 01–24 wie in Phase 4, neu sind 25–33.

| Ablauf | Android | iOS |
| --- | --- | --- |
| Kalender-Datei (ICS) unter „Ich“ | [Android](../screenshots/2026-11-11-phase-05-android-25-calendar-file.png) | [iOS](../screenshots/2026-11-11-phase-05-ios-25-calendar-file.png) |
| Familie: Mitglieder und Familienwoche | [Android](../screenshots/2026-11-11-phase-05-android-26-family.png) | [iOS](../screenshots/2026-11-11-phase-05-ios-26-family.png) |
| Fahrdienste mit Konfliktwarnung | [Android](../screenshots/2026-11-11-phase-05-android-27-rides-conflict.png) | [iOS](../screenshots/2026-11-11-phase-05-ios-27-rides-conflict.png) |
| Sam übernimmt die Fahrt (Demo) | [Android](../screenshots/2026-11-11-phase-05-android-28-rides-sam.png) | [iOS](../screenshots/2026-11-11-phase-05-ios-28-rides-sam.png) |
| Einkaufsliste | [Android](../screenshots/2026-11-11-phase-05-android-29-shopping.png) | [iOS](../screenshots/2026-11-11-phase-05-ios-29-shopping.png) |
| Ämtchen mit Rotation | [Android](../screenshots/2026-11-11-phase-05-android-30-chores.png) | [iOS](../screenshots/2026-11-11-phase-05-ios-30-chores.png) |
| Gruppen | [Android](../screenshots/2026-11-11-phase-05-android-31-groups.png) | [iOS](../screenshots/2026-11-11-phase-05-ios-31-groups.png) |
| Treffen „Bin dabei“ | [Android](../screenshots/2026-11-11-phase-05-android-32-group-meeting.png) | [iOS](../screenshots/2026-11-11-phase-05-ios-32-group-meeting.png) |
| Gruppenchat mit Demo-Antwort | [Android](../screenshots/2026-11-11-phase-05-android-33-group-chat.png) | [iOS](../screenshots/2026-11-11-phase-05-ios-33-group-chat.png) |

## 5. Was nicht fertig ist / bewusst offen (ehrlich)

- **Einladen per Link** (Familie und Gruppen) und **Beitrittsanfragen**: brauchen Server und echte Konten (Block B2).
  Im Prototyp lädt man Demo-Personen ein; nichts tut so, als ginge ein Link raus.
- **Ferien und Feiertage importieren** (FAM-08): braucht eine geprüfte Datenquelle mit Lizenz. Bis dahin geht es über
  eine ICS-Datei, die man selbst importiert.
- **Hinweis 24 h vorher bei offener Fahrt** an alle Erwachsenen: braucht Push an andere Personen (Block B2).
- **Echtzeit** der Einkaufsliste zwischen Geräten: kommt mit dem Server (Block B1/B2); im Prototyp simuliert.
- **ICS-Export** schreibt Zeitzonen als IANA-Namen ohne VTIMEZONE-Blöcke (große Kalender lesen das); die vollständige
  Ausgabe folgt mit dem Kalender-Sync (Block B3). Im Termin selbst gibt es noch keinen einzelnen Export.
- **Free-Limits** (2 Erwachsene, 2 Kinder, 1 Gruppe) greifen erst mit den Entitlements in Phase 6 (*Nachtrag: umgesetzt*).
- Austritt eines Erwachsenen aus dem Familienbereich und Admin-Wechsel in der Familie sind noch nicht in der App.

## 6. Funde & Risiken

| Fund | Status |
| --- | --- |
| Familienbrunch hätte als „Fahrt nötig“ gegolten, obwohl alle zusammen fahren | ✅ Regel geschärft: nur ohne begleitenden Erwachsenen (getestet) |
| Gruppen-Treffen lud beim ersten Öffnen niemanden ein, wenn die Daten noch luden | ✅ beim Speichern werden immer alle Mitglieder eingeladen (getestet) |
| Alte Chat-Nachrichten zeigten nur die Uhrzeit | ✅ Datum ergänzt, wenn nicht von heute |
| Die Konfliktwarnung kennt nur Termine, die im eigenen Kalender stehen | Bewusst: Sams Kalender ist im Prototyp unbekannt; mit echten Konten (B1) prüft der Server |
| Dateiauswahl je nach Gerät/Datei-App unterschiedlich (MIME-Typen von .ics) | Risiko, auf echten Geräten prüfen; unlesbare Dateien bekommen eine klare Meldung |

## 7. Offene Fragen an den PO

1. ~~Kinderprofile und das 6-Personen-Limit~~ – *Nachtrag Phase 6:* war schon entschieden (monetization.md §2:
   Kinderprofile zählen nicht); in Phase 6 korrigiert.
2. **Nächste Phase:** (*freigegeben am 2026-11-11*) Weiter mit **Phase 6 – Profil, Premium & Feinschliff** (Onboarding, Profil, Datenschutz-Center,
   Paywall mit **Demo-Kauf**, House-Ad-Vorschau, Premium-Themes, Kosten-Split mit PayPal-Link, Wetter/Plan B simuliert)?

## 8. Nächster Schritt

Nach Freigabe Phase 6 (Block A, weiter lokal ohne Konten). Deine gesammelten Änderungswünsche setze ich am Ende aller
Phasen um.
