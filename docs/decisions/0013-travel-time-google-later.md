# ADR 0013 – Wegzeit per Google: Adresse rein, Wegzeit raus – angeschlossen, sobald das Konto steht

> **Status:** akzeptiert · 2026-11-11 · PO-Entscheidung („Wegzeit per Google Maps über Adresseingabe“, Schlüssel: „erst später“)

## Kontext

Der PO möchte die Wegzeit nicht mehr von Hand eintragen, sondern über Google Maps aus der Adresse berechnen lassen
(ADR 0005: Google Places + Routes). Dafür sind ein Google-Cloud-Projekt mit Zahlungsmittel und ein API-Schlüssel nötig.
Beides legt der PO an (CLAUDE.md: Konten und Dienste nur nach Rücksprache). Der PO hat entschieden, das **später**
anzulegen; bis dahin wird alles andere gebaut.

## Entscheidung

1. **Ablauf, sobald das Konto steht:** Im Editor tippt man den Ort, Places-Autocomplete schlägt Adressen vor, und
   die Routes API liefert die Wegzeit für das gewählte Verkehrsmittel (zu Fuß, Rad, ÖPNV, Auto) zur Ankunftszeit.
   Die Wegzeit ist dann als „von Google berechnet“ gekennzeichnet und bleibt von Hand änderbar.
2. **Schlüssel nie in der App** (Regel 3). Empfohlen ist eine kleine Server-Funktion (Vercel `fra1` im Prototyp,
   später Supabase Edge Function, privacy.md), die den Schlüssel hält. Sie leitet nur Adresse/Koordinaten und das
   Verkehrsmittel weiter, ohne Nutzer-ID, mit gerundeten Koordinaten.
3. **Startpunkt:** Ohne Standortfreigabe ist der Start eine im Profil hinterlegte Heimatadresse; Standort nur
   opt-in (Regel 5). Das wird mit dem Anschluss umgesetzt.
4. **Bis dahin:** Die Wegzeit bleibt manuell und ist überall als „Wegzeit von dir eingetragen“ gekennzeichnet. Es gibt
   keinen Knopf, der eine Google-Berechnung vortäuscht.

## Konsequenzen

- Nötig vom PO: Google-Cloud-Projekt (Places API New, Routes API, Abrechnungskonto mit Budget-Warnung) und – für
  den empfohlenen Weg – ein Vercel-Konto. Das Testvolumen liegt im monatlichen Freikontingent.
- privacy.md listet Google Maps Platform bereits (Aufruf nur serverseitig); beim Anschluss wird der Eintrag
  konkretisiert (Datenfelder, Aufbewahrung, Attribution nach Google-Bedingungen).
