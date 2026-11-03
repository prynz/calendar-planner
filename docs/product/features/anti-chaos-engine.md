# Modul 10 – Erinnerungen & Anti-Chaos-Engine (USP)

> **Status:** v0.1 · 2026-11-03 · Spezifikation (Entwurf). Basis (manuelle Wegzeit, Stufen lokal,
> Bereit-Check): **Vorschlag Phase 3** · Voll (Routing, Puffer-Lernen, Live-ETA, Widgets): Phase 6.

**Ziel:** Die App plant **rückwärts** vom Termin. Nicht „Party um 20:00“, sondern „**Losgehen um 19:32**“.

## 1. Rechenmodell (Paket `packages/domain/anti-chaos`)

```
arrive_by  = event.start − arrival_margin        (Standard 0 Min., z. B. 10 Min. für Arzttermine)
leave_at   = arrive_by − travel_time − dawdle_buffer
prep_start = leave_at − prep_time
```

| Größe | Quelle | Standard |
| --- | --- | --- |
| `travel_time` | Routing-API (Phase 6) oder manuell / zuletzt genutzter Wert | manuell: 15 Min. |
| `dawdle_buffer` | persönlicher Trödel-Puffer, **lernend** (abschaltbar) oder fest | 5 Min. |
| `prep_time` | pro Termin oder Kategorie (z. B. „Party: 45 Min.“) | 30 Min. |
| `arrival_margin` | pro Kategorie (Arzt, Flug, Kino) | 0 / 10 / 90 / 15 Min. |

Reine, deterministische Funktionen mit Tests: Sommerzeitwechsel, Termine über Mitternacht, negative
Ergebnisse (Termin zu nah → sofortige „JETZT los“-Stufe), ganztägige Termine (keine Losgeh-Zeit).

### Puffer-Lernen

- Signal: Zeitpunkt, zu dem der Nutzer „**Bin unterwegs**“ antippt (oder die Losgeh-Erinnerung bestätigt), im
  Verhältnis zu `leave_at`. Optional (Phase 6, opt-in): automatische Erkennung über Geofence „Zuhause verlassen“.
- `dawdle_buffer = clamp(EWMA(Verspätung beim Losgehen, α = 0,3), 0, 20 Min.)`, gerundet auf 5 Min.
- Nur positive, private Darstellung: „Wir planen 10 Min. Puffer für dich ein – du kannst das ändern.“
- Daten privat (nur Eigentümer, RLS), löschbar, Lernen abschaltbar. Kein Teilen, kein Ranking.

## 2. Eskalierende Erinnerungen

| Stufe | Zeitpunkt (Standard) | Beispiel (Ton „locker“) |
| --- | --- | --- |
| 0 – Vorbereitung | Vortag 18:00, wenn Aufgaben/Mitbringsel offen sind | „Morgen ist Toms Geburtstag. Geschenk noch offen 🎁“ |
| 1 – Fertig machen | `prep_start` | „In 60 Min. musst du los. Zeit, dich fertig zu machen.“ |
| 2 – Gleich los | `leave_at − 10 Min.` | „In 10 Min. losgehen. Bereit-Check?“ |
| 3 – Jetzt | `leave_at` | „JETZT los 🏃 – Ankunft 19:58“ |
| 4 – Nachfass | `leave_at + 5 Min.`, falls nicht „Bin unterwegs“ | „Alles okay? Sag kurz Bescheid, wenn du später kommst.“ → „Ich verspäte mich“ |

- **Ton** einstellbar: sanft · locker · nachdrücklich. **Intensität:** Anzahl der Stufen, Ton/Vibration,
  „Critical Alerts“ nur wenn Apple es erlaubt (in der Regel nicht → wird nicht versprochen).
- Stufen werden **lokal** geplant (offline-fähig). Server-Push ergänzt bei Änderungen (Zeit/Ort/Verkehr).
- **iOS-Limit 64 ausstehende lokale Notifications:** Scheduler plant nur die nächsten N (z. B. 48) und plant beim
  App-Start, bei Background-Fetch und bei Silent Push nach. **Android:** exakte Alarme brauchen
  `SCHEDULE_EXACT_ALARM` bzw. sind eingeschränkt → Fallback auf inexakte Alarme mit 1–2 Min. Toleranz, in der UI erklärt.
- Verkehr ändert sich: Phase 6 – Server berechnet ca. 60/20 Min. vor `leave_at` neu und schickt bei Abweichung
  ≥ 5 Min. eine aktualisierte Erinnerung (Silent Push → lokale Neuplanung).
- **Keine House Ads, kein Upselling** in Erinnerungen.

## 3. Bereit-Check

Checkliste vor dem Losgehen: automatisch aus Mitbringliste (eigene Claims), Dateien (Ticket), Vorlage
(z. B. „Ausweis, Versichertenkarte“) und eigenen Standard-Items (Schlüssel, Handy, Ladekabel).
Im Fokus-Modus als **Mikroschritte** nacheinander (ein Item pro Bildschirm, großer Haken).

## 4. „Ich verspäte mich“

- 1 Tap in Notification-Aktion, Event-Screen und Widget.
- Auswahl: „+5 · +10 · +15 · +30 Min.“ oder **berechnete ETA** (aus Wegzeit, Phase 6).
- Optional: Live-ETA teilen (siehe [places-maps.md](places-maps.md)).
- Nachricht an die Event-Teilnehmer (Systemnachricht im Chat + Push an Host), freundlich formuliert, ohne Schuldzuweisung.

## 5. Pünktlichkeits-Bilanz

Privat, positiv, optional: „Diesen Monat 7 von 9 Mal pünktlich 💪“, als Heatmap (Lime-Intensität).
Nie öffentlich, nie im Gruppenvergleich. Abschaltbar.

## 6. Fokus-Modus (Integration)

Visueller Zeitbalken „Zeit bis Losgehen“, nur „Jetzt“ + „Als Nächstes“, Body-Doubling-Timer
(„Ich bleibe 25 Min. bei dir“ – sichtbarer ruhiger Countdown, keine Netzwerkverbindung nötig).

## Akzeptanzkriterien (Auswahl)

- Ohne Standortfreigabe, Account-Sync oder Netz funktionieren Losgeh-Zeit und Stufen mit manueller Wegzeit.
- Jede Erinnerung hat eine Aktion „Bin unterwegs“ und „Ich verspäte mich“.
- Änderung der Event-Zeit plant alle Stufen innerhalb von 1 Min. (online) neu.
- Benachrichtigungs-Berechtigung wird erst angefragt, wenn der Nutzer die erste Erinnerung aktiviert (mit Erklärung vorab).

## Free / Premium

| | Free | Plus/Pro/Family |
| --- | --- | --- |
| Losgeh-Zeit (manuell + Routing) | ✅ | ✅ |
| Stufen | 1 (Stufe 3 „Jetzt los“) | alle 5, konfigurierbar |
| Puffer-Lernen | – (fester Puffer) | ✅ |
| Bereit-Check | – (Vorschau) | ✅ |
| „Ich verspäte mich“ | ✅ | ✅ |
| Fokus-Modus | ✅ | ✅ |
