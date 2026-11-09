# ADR 0008 – Prototyp zuerst, Veröffentlichung erst ganz am Ende

> **Status:** akzeptiert · 2026-11-09 · PO-Entscheidung

## Kontext

Der PO möchte alle Funktionen zuerst als **voll funktionsfähigen Prototyp mit Beispieldaten** sehen und
bewerten. Eine Veröffentlichung (App Store, Play Store, öffentliches Gast-Web) erfolgt erst, wenn das Produkt
überzeugt. Damit verschieben sich alle Schritte, die nur für echte Nutzer nötig sind, ans Ende.

## Entscheidung

1. **Phasen 1–9 bauen einen Prototyp**, der echt funktioniert (echte Logik, echte Datenbank, echte
   Benachrichtigungen auf Testgeräten), aber nicht veröffentlicht wird.
2. **Demo-Modus mit Beispielwelt:** Ein Seed-Datensatz (Personas Chris, Olivia, Frank mit Familie, Alex, Gast
   Gabi; Events wie Geburtstag, Grillabend, Arzttermin, Fußballtraining) macht jede Funktion sofort erlebbar.
   Alles Beispielhafte ist in der UI als **„Demo“** gekennzeichnet (Regel: nichts vortäuschen).
3. **Simuliertes wird gekennzeichnet:** Käufe in der Paywall laufen im Prototyp über einen **Demo-Kauf** (Stufe
   wechseln ohne Store), sichtbar als „Demo – kein echter Kauf“. Echte Store-Abos (RevenueCat) folgen in
   Phase 10. Die Server-Logik für Entitlements ist trotzdem echt.
4. **Verteilung des Prototyps** (keine Veröffentlichung):
   - Android: installierbare Test-App (APK über EAS Build, internal distribution).
   - iOS: **kein Apple-Developer-Konto vorhanden (Stand 2026-11-09)** → Simulator-Builds, Screenshots und
     Bildschirmvideos aus CI (macOS-Runner). Auf einem echten iPhone erst, wenn ein Konto angelegt ist
     (Ad-hoc/TestFlight intern – auch das ist **keine** Veröffentlichung).
   - Gast-Web und Admin: **Vercel** (Region Frankfurt), nur Demo-Daten, URLs nicht beworben, `noindex`.
5. **Backend:** lokal mit Supabase CLI; für Tests auf Geräten ein **Supabase-Entwicklungsprojekt in Frankfurt**
   (Free Tier) **nur mit Demo-Daten**. Keine echten Personendaten im Prototyp.
6. **Erst in Phase 10 (Launch-Readiness):** Store-Konten, echte Abos, Google-OAuth-Verifizierung für Kalender-Sync,
   Markenprüfung, Rechtsprüfung (Mindestalter, Datenschutzerklärung, PayPal-Links, AGB, Impressum),
   Pen-Test, Store-Listings.

## Konsequenzen

- Sicherheit (RLS, Tests) wird trotzdem von Anfang an **richtig** gebaut. Ein Prototyp mit schwacher Sicherheit
  lässt sich später nicht billig härten.
- Drittanbieter mit Kosten (Google Maps/Routes) werden im Prototyp mit niedrigen Kontingenten und einem
  Budget-Alarm betrieben. Ohne API-Key funktioniert alles mit manueller Wegzeit.
- Kalender-Sync mit Google funktioniert im Prototyp für eingetragene **Testnutzer** des Google-Projekts, ohne
  Verifizierung (Google erlaubt das für Apps im Teststatus).
- Jeder Milestone-Report enthält echte Screenshots des Prototyps und eine Liste aller Demo-/Simulations-Stellen.
