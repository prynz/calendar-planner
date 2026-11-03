# Modul 15 – Profil, Accounts & Einstellungen

> **Status:** v0.1 · 2026-11-03 · Spezifikation (Entwurf). Accounts: Phase 2; Einstellungen wachsen mit jeder Phase.

## Accounts & Anmeldung

| ID | Als … | möchte ich … | damit … |
| --- | --- | --- | --- |
| ACC-01 | Nutzer | mich mit Apple, Google, Microsoft, E-Mail (Magic Link oder Passwort) oder Passkey anmelden | es bequem ist |
| ACC-02 | Nutzer | mehrere Login-Methoden verknüpfen und trennen (mind. eine bleibt) | ich nicht ausgesperrt werde |
| ACC-03 | Nutzer | meine E-Mail ändern (Bestätigung an alte **und** neue Adresse) | Übernahmen erschwert werden |
| ACC-04 | Nutzer | optional 2FA (TOTP/Passkey) aktivieren | mein Konto sicherer ist |
| ACC-05 | Nutzer | meine Geräte/Sitzungen sehen und „Überall abmelden“ | ich Kontrolle habe |
| ACC-06 | Nutzer | meinen Account in der App löschen | ich gehen kann (Store-Pflicht) |
| ACC-07 | Nutzer | meine Daten exportieren (JSON + ICS, Art. 20 DSGVO) | ich sie mitnehmen kann |
| ACC-08 | Neuer Nutzer | bestätigen, dass ich mindestens 16 bin (kein Geburtsdatum) | die Altersgrenze eingehalten ist |

**Akzeptanzkriterien**
- Sign in with Apple wird angeboten, sobald Google/Microsoft angeboten werden (App Review 4.8).
- Passwort: min. 10 Zeichen, Prüfung gegen bekannte geleakte Passwörter (k-Anonymity-Abfrage, z. B. HIBP-Range-API, oder
  lokale Top-Liste), Stärkeanzeige.
- Rate-Limits: Login 5 Fehlversuche/15 Min. pro Konto + IP-Bucket, Magic Links 3/Stunde.
- Löschung: sofortige Deaktivierung, endgültige Löschung nach **30 Tagen** (Widerruf möglich), Chat-Nachrichten
  werden anonymisiert („Gelöschter Nutzer“), gehostete Events: Übergabe an Co-Host anbieten, sonst absagen.
  Hinweis, dass laufende Store-Abos separat im Store gekündigt werden müssen.
- Export asynchron (Edge Function), Download-Link per signierter URL (24 h gültig).

## Profil

Anzeigename, optional Avatar (neu kodiert, EXIF entfernt), optional Pronomen, Status-Emoji. Kein Geburtsdatum,
keine Telefonnummer als Pflicht.

## Einstellungen

- **Sprache:** Deutsch / Englisch / Systemsprache – unabhängig von der Systemsprache umschaltbar.
- **Theme:** Hell (Creme) / Dunkel / System.
- **Region & Zeit:** 12/24 h, Wochenstart, Standard-Zeitzone.
- **Erinnerungsstil:** Ton (sanft/locker/nachdrücklich), Stufen, Ruhezeiten, Trödel-Puffer (lernend/fest/aus).
- **Fokus-Modus** an/aus + Optionen (Zeitbalken, Mikroschritte, Body-Doubling).
- **Barrierefreiheit:** Reduced Motion (folgt System, überschreibbar), Haptik an/aus, größere Touch-Ziele.
- **Datenschutz-Center:** Was speichern wir (Liste pro Kategorie mit Zähler), Export, Löschung, Einwilligungen
  (z. B. Crash-Reports, Live-ETA, KI später), verbundene Konten mit Scopes, Standortfreigaben.
- **Verbundene Konten** (Kalender-Sync) mit Status und Trennen.
- **Abo:** Stufe, Quelle, Verlängerung, „Im Store verwalten“, Käufe wiederherstellen.
- **Rechtliches:** Impressum, Datenschutzerklärung, AGB, Open-Source-Lizenzen.

## Zustände

Jede Einstellung speichert sofort (optimistisch) mit Rückmeldung; bei Fehler Rücksprung + Hinweis.
Datenschutz-Center lädt Zähler asynchron (Skeleton).
