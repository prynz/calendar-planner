# Milestone-Report Phase 6 – Profil, Premium & Feinschliff

> **Status:** 2026-11-11 · Phase 6 vom PO freigegeben (mit dem Go für Phase 7).
> Änderungswünsche zu allen Phasen nimmt der PO erst am Ende aller Phasen gesammelt auf.

## 1. Ergebnis in einem Satz

Nowish hat jetzt einen **ersten Start** (mit „mindestens 16“ statt Geburtsdatum und 14 Tagen Plus als Demo), ein
**Profil**, ein **Datenschutz-Center** mit Export und Löschen, eine **transparente Paywall mit Demo-Kauf**, echte
**Tarif-Grenzen mit Erklärung**, eine **Vorschau hauseigener Anzeigen**, **Premium-Cover**, einen **Kosten-Split mit
PayPal-Link** und eine **Demo-Wettervorhersage mit Plan B**. Alles lokal, nichts wird berechnet.

## 2. Was fertig ist

| Bereich | Ergebnis |
| --- | --- |
| Onboarding | 4 Schritte: „Sei einfach **pünktlich** da.“ (eingerahmtes Schlüsselwort), Name (optional) + **„Ich bin mindestens 16 Jahre alt.“** (Pflicht, kein Geburtsdatum), was die App kann inkl. Demo-Hinweis und „Erinnerungen erlauben“, **14 Tage Plus geschenkt (Demo)** ohne Zahlungsdaten |
| Profil | Anzeigename, Status-Emoji, PayPal.me-Name (geprüft: nur Buchstaben/Ziffern) – nur auf dem Gerät |
| Datenschutz-Center | „Gespeichert“ mit Zählern (Termine, Events, Verlauf, Familie, Gruppen, Profil), „Nicht gespeichert“ (Geburtsdatum, Standort, Tracking, Kontakte), Einwilligungen, **Daten exportieren** (JSON über Teilen), **Alle Daten löschen** (mit Nachfrage, danach Neustart), Hinweis „Rechtstexte sind Entwürfe“ |
| Tarif unter „Ich“ | Stufe, Testphase „noch 13 Tage“, Hinweis 3 Tage vor Ende, Verlängerungsdatum, **Kündigen** (läuft bis Periodenende), **Free ausprobieren (Demo)**, Hinweis zur Store-Kündigung in 2 Taps |
| Paywall | Plus · Pro · Family mit Preisen inkl. MwSt. (monatlich/jährlich, „spart 30 %“), **vollständige Vergleichstabelle** aus denselben Daten, die die App durchsetzt, Demo-Hinweis, kein Countdown, kein vorausgewählter Tarif, Kündigungshinweis |
| Grenzen (Free) | Immer erklärt, nie als Pop-up, nichts geht verloren: 5 laufende eigene Events, 1 Gruppe, 2 Erwachsene + 2 Kinderprofile (Family: 6 Erwachsene, Kinder zählen nicht), **eine Erinnerung** zur Losgeh-Zeit, Puffer-Lernen und Bereit-Check sind Plus, Kosten nur gleich aufteilen, Basis-Cover. **Fokus-Modus bleibt in allen Tarifen frei** |
| House Ads (Vorschau) | Nur in Free, nie am ersten Tag, gekennzeichnet „Anzeige“, sofort schließbar, nur eigene Inhalte (Plus, Vorlagen, Family), Zähler nur auf dem Gerät. Slots: Einstellungen, Event-Übersicht. Tabuzonen (Chat, Formulare, Bereit-Check, Fokus, Onboarding, Datenschutz, Paywall …) fest im Code und getestet |
| Kosten-Split | Neue Kachel „Kosten“ im Event: Ausgaben eintragen (gleich · Anteile · exakt), „Wer bekommt, wer zahlt“, **Ausgleichsliste** („3 Überweisungen statt vieler kleiner“), **PayPal.me-Link teilen**, wenn dir jemand etwas schuldet; „Ich habe bezahlt“ → die Gegenseite bestätigt (Demo). Cent-genau, Rundung immer gleich |
| Wetter & Plan B | Bei Events draußen: **Demo-Vorhersage** („Regen 🌧️ · 14 °C · Regen 70 %“, klar als erfunden markiert), Vorschlag „Plan B bereithalten?“, Gastgeber:in legt den Ausweichort fest und stellt um – alle sehen es im Chat |
| Cover | 6 Cover im Editor (Kategorie, Streifen; Premium: Sonnenuntergang, Nacht, Konfetti, Wald) als gekachelte Vorschau; im Termin-Detail als Band. Demo: Toms Feier (Konfetti), Filmabend (Nacht) |
| Pakete | Neu: `packages/entitlements` (rein, getestet); neue UI-Bausteine `CoverBand`, `CheckRow` |

## 3. Prüfergebnisse

| Prüfung | Ergebnis |
| --- | --- |
| `pnpm check` (typecheck · lint · format · Tests) | ✅ 1210 Tests: i18n 888, domain 111, App 110, ui 57, demo 21, entitlements 9, brand 8, config 6 |
| Web-Vorschau im Browser (Onboarding, Einstellungen, Paywall, Datenschutz-Center, Profil, Kosten, Plan B, Cover, Free mit Grenzen und Anzeige) | ✅ lokal durchgeklickt, keine Fehler in der Konsole |
| CI (Qualität, Datenbank, Secret-Scan), Android, iOS | ✅ grün auf `5e682a6`: CI 43099655603, Android 43099655596, iOS 43099655593 (je 42 Screenshots) |

## 4. Screenshots (echt, aus CI)

Präfix `2026-11-11-phase-06`. Bilder 01–33 wie in Phase 5, neu sind 34–42. Der CI-Lauf startet frisch und zeigt
deshalb Plus in der Testphase; Free mit Grenzen und Anzeigen ist in den App-Tests und der Web-Vorschau geprüft.

| Ablauf | Android | iOS |
| --- | --- | --- |
| Onboarding Start | [Android](../screenshots/2026-11-11-phase-06-android-34-onboarding.png) | [iOS](../screenshots/2026-11-11-phase-06-ios-34-onboarding.png) |
| Onboarding Testphase | [Android](../screenshots/2026-11-11-phase-06-android-35-onboarding-trial.png) | [iOS](../screenshots/2026-11-11-phase-06-ios-35-onboarding-trial.png) |
| Konto und Tarif | [Android](../screenshots/2026-11-11-phase-06-android-36-account-plan.png) | [iOS](../screenshots/2026-11-11-phase-06-ios-36-account-plan.png) |
| Paywall (Demo-Kauf) | [Android](../screenshots/2026-11-11-phase-06-android-37-paywall.png) | [iOS](../screenshots/2026-11-11-phase-06-ios-37-paywall.png) |
| Vergleichstabelle | [Android](../screenshots/2026-11-11-phase-06-android-38-paywall-compare.png) | [iOS](../screenshots/2026-11-11-phase-06-ios-38-paywall-compare.png) |
| Datenschutz-Center | [Android](../screenshots/2026-11-11-phase-06-android-39-privacy.png) | [iOS](../screenshots/2026-11-11-phase-06-ios-39-privacy.png) |
| Kosten-Split | [Android](../screenshots/2026-11-11-phase-06-android-40-costs.png) | [iOS](../screenshots/2026-11-11-phase-06-ios-40-costs.png) |
| Wetter (Demo) & Plan B | [Android](../screenshots/2026-11-11-phase-06-android-41-weather-plan-b.png) | [iOS](../screenshots/2026-11-11-phase-06-ios-41-weather-plan-b.png) |
| Cover im Editor | [Android](../screenshots/2026-11-11-phase-06-android-42-covers.png) | [iOS](../screenshots/2026-11-11-phase-06-ios-42-covers.png) |

## 5. Was nicht fertig ist / bewusst offen (ehrlich)

- **Echte Abos** (App Store/Play Store über RevenueCat), „Käufe wiederherstellen“, Comp-Abos und die Steuerung von
  Anzeigen/Paywall-Texten im Admin: Block B4. Bis dahin ist alles ein klar markierter Demo-Kauf.
- **Echte Konten**, Anmeldung, Account-Löschung auf dem Server, Geräte/Sitzungen: Block B1. „Alle Daten löschen“
  betrifft heute nur das Gerät.
- **Echtes Wetter** braucht eine Anbieter-Entscheidung (Kosten, Datenschutz) – bis dahin erfundene Demo-Werte.
- **PayPal**: Demo-Personen haben keinen PayPal-Namen; einen Link gibt es nur für deinen eigenen Namen. Belegfotos und
  CSV-Export beim Kosten-Split fehlen noch. Rechtliche und Store-Prüfung der PayPal-Links vor Veröffentlichung (B5).
- **Proaktive Premium-Hinweise** (z. B. „Du organisierst richtig viel“) sind als Regeln im Paket fertig und getestet,
  in der App erscheinen Hinweise aber bewusst nur an echten Grenzen.
- Anzeigen-Slots `agenda_feed`, `post_event_create`, `empty_state` sind definiert, aber noch nicht platziert.
- Rechtstexte (Impressum, Datenschutzerklärung, AGB) sind Entwürfe und nicht in der App verlinkt.

## 6. Funde & Risiken

| Fund | Status |
| --- | --- |
| Phase 5 hatte festgelegt, dass Kinderprofile zu den 6 Personen zählen – monetization.md hatte das schon anders entschieden | ✅ korrigiert (Kinder zählen nicht), ADR 0014 und Report 5 nachgetragen |
| Grenz-Texte sagten „in Free“, auch wenn man Plus hatte | ✅ neutral formuliert („passen in deinen Tarif“) |
| Cover-Muster wurden auf breiten Bildschirmen verzerrt | ✅ Zeichenfläche wird jetzt beschnitten statt gestreckt |
| Vergleichstabelle brach Wörter in schmalen Spalten um | ✅ kürzere Zeilen, „∞“ in der Tabelle (vorgelesen als „unbegrenzt“) |
| „Testphase: noch 15 Tage“ direkt nach dem Start: Konto und Anzeige nutzten verschiedene Uhren | ✅ Konto nutzt jetzt die App-Uhr (getestet) |
| Einstellungen sind durch die Tarif-Karte länger; der CI-Ablauf tippte daneben | ✅ Ablauf scrollt die Schalter erst in die Mitte |
| iOS behielt beim Wechsel zwischen Events/Gruppen/Familie die alte Scroll-Position (leere Fläche) | ✅ jeder Bereich startet oben |
| Bestehende Installationen sehen das Onboarding beim nächsten Start einmal | Gewollt: Altersbestätigung und Testphase brauchen jeden einmal |

## 7. Offene Fragen an den PO

1. **Nächste Phase:** Weiter mit **Phase 7 – Erlebnis-Politur & Test** (Motion- und Haptik-Feinschliff, Barrierefreiheit
   mit VoiceOver/TalkBack und 200 % Schrift, Performance, Usability-Test mit Testpersonen, finales Logo)?
2. Für den Usability-Test in Phase 7: Hast du 3–5 Testpersonen im Kopf, oder soll ich einen Testleitfaden zum
   Selbst-Durchführen vorbereiten?

## 8. Nächster Schritt

Nach Freigabe Phase 7 (letzte Phase von Block A). Deine gesammelten Änderungswünsche setze ich am Ende aller Phasen um.
