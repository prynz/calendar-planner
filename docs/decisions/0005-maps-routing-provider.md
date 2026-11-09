# ADR 0005 – Karten-, Geocoding- und Routing-Anbieter

> **Status:** akzeptiert · 2026-11-09 · PO-Entscheidung: **Google** für Ortssuche und Routing.

## Kontext

Wir brauchen drei getrennte Fähigkeiten:
1. **Kartenanzeige** (Treffpunkt-Pin, Mini-Karte),
2. **Ortssuche/Geocoding** (Autocomplete beim Event-Anlegen),
3. **Routing mit Verkehr und ÖPNV** (Wegzeit für die Losgeh-Zeit, USP).

Routing ist der Kosten- und Datenschutztreiber: Jede Losgeh-Berechnung ist ein API-Aufruf mit Start- und Zielpunkt.

## Vorschlag

| Fähigkeit | Vorschlag | Begründung |
| --- | --- | --- |
| Kartenanzeige | `react-native-maps` (Apple Maps auf iOS, Google Maps auf Android) | gewohnte Optik, auf iOS keine Kosten; Android: Google-Maps-SDK-Key nötig |
| Navigation | Übergabe an die native Karten-App bzw. ÖPNV-App per Deep-Link | kein eigenes Turn-by-Turn |
| Geocoding & Routing | **Kandidaten vergleichen:** Google Routes/Places API · HERE (EU-Unternehmen, NL/DE) · TomTom (EU, NL) · Mapbox · für ÖPNV zusätzlich offene Daten (z. B. regionale HAFAS-/GTFS-Angebote) | EU-Anbieter bevorzugt, aber ÖPNV-Qualität in DACH ist entscheidend |

Bewertungskriterien in Phase 6: ÖPNV-Abdeckung DACH, Verkehrsdaten, Preis pro 1.000 Anfragen, Free-Tier,
Lizenzbedingungen (Caching erlaubt? Anzeige auf fremder Karte erlaubt?), Datenort/AV-Vertrag.

## Entscheidung (PO, 2026-11-09)

**Google Maps Platform**: Places API (Autocomplete, Details) und Routes API (Wegzeit mit Verkehr, ÖPNV, Rad, zu Fuß).
Kartenanzeige weiterhin mit `react-native-maps` (iOS Apple Maps, Android Google Maps). Begründung: beste
ÖPNV- und Verkehrsabdeckung in DACH, eine Plattform, gute Doku. Die Google-Nutzungsbedingungen zur Anzeige von
Places-Daten (Attribution, Caching-Grenzen) werden in Phase 6 umgesetzt.

Folgen für den Datenschutz: Google ist Auftragsverarbeiter mit Drittlandbezug; Start- und Zielkoordinaten gehen an
Google. Gegenmaßnahmen: Aufruf nur über unsere Edge Function (keine Nutzer-ID an Google), Koordinaten auf ca. 100 m
gerundet, manuelle Wegzeit bleibt immer möglich. Im Prototyp: eigenes Google-Cloud-Projekt mit Budget-Alarm.

## Kostenschutz (unabhängig vom Anbieter)

- Alle Aufrufe über Edge Function `places-*` (Key bleibt serverseitig, Caching, Kontingente).
- Wegzeit für ein Event pro Nutzer höchstens alle 5 Minuten neu berechnen, nur in den 3 Stunden vor `leave_at`.
- Manuelle Wegzeit ist immer möglich und der Free-Fallback, falls Kontingente erschöpft sind.

## Konsequenzen

- Bis Phase 6 arbeitet die Anti-Chaos-Basis mit **manueller Wegzeit** (kein Anbieter nötig).
- Lizenzbedingungen können erzwingen, dass Routing-Ergebnisse nur auf der Karte desselben Anbieters angezeigt
  werden → kann Kartenwahl beeinflussen.
