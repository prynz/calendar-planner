# ADR 0004 – Mindestalter 16+, Kinderprofile ohne Account

> **Status:** vorgeschlagen · 2026-11-09 · Für den Prototyp nicht blockierend (keine echten Nutzer). Wird technisch
> als Bestätigungs-Häkchen 16+ umgesetzt; **rechtliche Prüfung vor Veröffentlichung (Phase 10)**.

## Kontext

Die App enthält Chat mit Fremden (Gäste per Link), Standortfunktionen und Abos. Familien wollen Kinder-Termine
planen. Art. 8 DSGVO setzt für einwilligungsbasierte Dienste der Informationsgesellschaft gegenüber Kindern eine
Altersgrenze; Deutschland hat keine abweichende nationale Grenze festgelegt, es gilt also 16 Jahre.
Wichtige Funktionen beruhen zwar auf Vertragserfüllung (Art. 6 (1) b), einige jedoch auf Einwilligung
(Live-ETA, Standort, Crash-Reports, später KI). Mehrere EU-Länder haben niedrigere Grenzen (13–15).

## Entscheidung (Vorschlag)

- **Mindestalter 16 Jahre** für eigene Accounts, EU-weit einheitlich (einfacher, schützt vor Länderchaos).
- Abfrage als **Bestätigung** („Ich bin mindestens 16 Jahre alt“) – **kein Geburtsdatum** (Datensparsamkeit).
  Gespeichert wird nur `age_confirmed_at`.
- **Kinderprofile ohne Account** im Haushalt eines Erwachsenen: Anzeigename, Farbe, Emoji. Kein Login, keine
  Kontaktdaten, keine Fotos. Kinder werden nicht eingeladen und können nicht chatten.
- Store-Altersfreigabe entsprechend Chat-/UGC-Funktionen wählen (in Phase 10 festlegen).

## Alternativen

- **13+ mit Elternfreigabe:** größerer Markt (Schüler), aber Elternzustimmung nachweisbar zu machen ist aufwendig
  und fehleranfällig → später möglich (z. B. „Teen-Profile“ v2).
- **18+:** rechtlich am einfachsten, schließt aber 16–17-Jährige (Partys, Ausbildung) unnötig aus.

## Konsequenzen

- Gast-Web: Gäste bestätigen nichts (keine Registrierung). Hosts sind für ihre Einladungen verantwortlich.
  Ob für Gäste ein Hinweis nötig ist, klärt die Rechtsprüfung.
- Ein späterer Teen-Modus braucht eine neue ADR.
