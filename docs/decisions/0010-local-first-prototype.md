# ADR 0010 – Prototyp lokal und simuliert: erst Erlebnis, dann Infrastruktur

> **Status:** akzeptiert · 2026-11-10 · PO-Entscheidung, erweitert ADR 0008

## Kontext

Der PO will die App zuerst in Optik, Haptik, Gefühl und Funktion ausbauen und testen, **bevor** Anmeldungen,
Konten oder Server nötig werden. Alles soll auf Simulationen, Beispieldaten und Test-Apps beruhen. Infrastruktur
wird erst schrittweise nachgebaut, wenn das Erlebnis überzeugt.

## Entscheidung

1. **Kein Login, keine Konten, kein Server im Prototyp.** Die App startet direkt als Demo-Person „Chris“.
   Die Phase „Accounts & Sicherheit“ wandert in den Ausbau-Block nach dem Prototyp.
2. **Alles läuft lokal auf dem Gerät:** Termine, Events, Listen, Einstellungen liegen in SQLite. Was man anlegt,
   ändert oder löscht, bleibt nach einem Neustart erhalten. Ein Menüpunkt setzt die Beispielwelt zurück.
3. **Andere Personen werden simuliert:** Demo-Personen antworten auf Einladungen, stimmen ab und schreiben im Chat,
   und zwar sichtbar als „Demo“ und nach festen, nachvollziehbaren Regeln (z. B. Antwort nach einigen Sekunden).
   Nichts verlässt das Gerät.
4. **Echte Gerätefunktionen, wo sie ohne Konto gehen:** lokale Benachrichtigungen (Losgeh-Erinnerungen), Haptik,
   Animationen, Kalender-Ansichten. Die Wegzeit ist zunächst **manuell oder geschätzt** (gekennzeichnet); Google-Routing
   folgt erst, wenn ein API-Schlüssel nötig wird.
5. **Architektur bleibt servertauglich:** Die Screens sprechen nur mit **Repository-Schnittstellen**
   (`EventRepository`, `PeopleRepository` …). Heute steckt dahinter SQLite + Simulation, später Supabase. Die
   Datenformen folgen dem Datenmodell (`data-model.md`), damit der spätere Umstieg kein Umbau wird.
6. **Wird doch ein Konto oder Dienst nötig**, z. B. ein Google-API-Schlüssel, ein Apple-Konto fürs echte iPhone oder
   ein gehostetes Gast-Web, kläre ich das vorher mit dem PO, und wir legen es gemeinsam an.

## Konsequenzen

- Die Sicherheitsgrundlagen (Migration, pgTAP, CI) bleiben bestehen und werden im Ausbau-Block weitergeführt.
  RLS-Policies für die fachlichen Tabellen entstehen erst zusammen mit dem Backend.
- Simulierte Antworten und Kennzahlen müssen in der UI immer als „Demo“ erkennbar sein (CLAUDE.md Regel 8).
- Testbar ist der Prototyp über die Android-Test-App (APK), Emulator- und Simulator-Screenshots aus CI und den
  Simulator. Ein echtes iPhone braucht weiterhin ein Apple-Developer-Konto.
