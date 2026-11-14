# Milestone-Report Phase 11 – Kompass-Fundament

> **Status:** 2026-11-14 · Phase 11 umgesetzt · **Stopp – wartet auf Review und Freigabe durch den PO.**
> Auftrag (PO, 2026-11-14): „Setze die App-Idee um“ – gewählt: **Kompass komplett**, in Phasen
> ([ADR 0017](../../decisions/0017-kompass.md)).

## 1. Ergebnis in einem Satz

Die App hat den Kompass-Look und beantwortet auf der Startseite zuerst **„Wie viel Zeit habe ich noch?“** – mit der
Jetzt-Kugel, einem Satz in Klartext und der Schreibleiste statt des Plus-Knopfs.

## 2. Was fertig ist

| Bereich | Ergebnis |
| --- | --- |
| Look | Kühles Nebelweiß, Indigo-Tinte, weiße Karten; dunkles Thema als Indigo-Nacht. Sonnenaufgang (Orange) nur für „jetzt“ und die Hauptaktion; Auswahl (Tabs, Segmente, Datumspillen, Monatstag) ist Tinte |
| Jetzt-Kugel | Ersetzt die Losgeh-Karte: Minuten bis zum Aufbruch (ab 1 Std. als `1:40`), ruhig blau, in den letzten 30 Min. Sonnenaufgang. Darüber ein Satz („Noch 25 Min., dann los: Zahnarzt.“). Tippen öffnet den Termin. Atmet langsam; bei „Bewegung reduzieren“ still |
| Kugel außerhalb des 3-Stunden-Fensters | Zählt ruhig blau zum nächsten Termin von heute oder morgen (zum Losgehen, sonst zum Beginn) |
| Schreibleiste | Dock unten: drei Symbol-Tabs + Feld „Was steht an?“; öffnet den Schnell-Eintrag in einer Zeile |
| Drei Tabs | **Jetzt · Kalender · Leute**. „Ich“ liegt hinter dem Avatar oben rechts in jedem Tab |
| Ruhe zuerst | Tageszusammenfassung und Wochen-Kacheln sind standardmäßig aus (unter „Personalisieren“ einschaltbar) |
| Akzentfarbe | „Sonnenaufgang“ neu als Standard; Lime, Ozean, Koralle, Lavendel bleiben wählbar |

## 3. Prüfergebnisse

| Prüfung | Ergebnis |
| --- | --- |
| `pnpm check` | ✅ 1654 Tests: i18n 1037, ui 267, App 171, domain 132, demo 21, brand 11, entitlements 9, config 6 |
| Kontrast | ✅ alle Textpaare WCAG AA für 5 Akzentfarben × Hell/Dunkel (Test) |
| Neue Tests | Ruhige Kugel für den nächsten Termin, Satz, Tippen öffnet den Termin, Avatar öffnet „Ich“, `nextUp` |
| Web-Vorschau | ✅ Jetzt (hell/dunkel), Schreibleiste, Kalender, Leute, Ich geprüft |
| CI Android / iOS | wird eingetragen, sobald die Läufe grün sind |

## 4. Screenshots (echt, aus CI)

Präfix `2026-11-14-phase-11` – werden nach den CI-Läufen ergänzt.

## 5. Was nicht fertig ist / bewusst offen (ehrlich)

- **Nur das Fundament.** Kalender, Termin, Editor, Leute und Ich haben den neuen Look, aber noch den alten Aufbau.
  Zoom-Kalender (Phase 12), Lückentext-Editor und Tag als Faden (13), Leute-Seite/Einladungskarten/Wärmekarten-Umfrage
  (14), Morgen-Briefing/Puffer-Coach/Ruhe-Modus (15) folgen.
- Die Schreibleiste öffnet den bestehenden Schnell-Eintrag. „mit Mia“ (Personen erkennen) und Fragen wie
  „Wann habe ich frei?“ gibt es noch nicht.
- **Schrift:** weiter Bricolage Grotesque + Inter. Sora (wie im Konzept) wäre eine neue Abhängigkeit – Entscheidung offen.
- „Ich“ ist kein Tab mehr: auf der Seite ist in der Leiste kein Tab aktiv; zurück geht es über einen Tab.
- Die Kugel wurde in der Web-Vorschau geprüft, nicht auf einem echten Gerät (Atmen, Schatten).
- Die Tabellen in `design-system.md` §2 zeigen noch die alten Farben (Hinweis oben im Dokument; Neufassung in Phase 12).

## 6. Funde & Risiken

| Fund | Status |
| --- | --- |
| Kugel erschien nur 3 Std. vor dem Aufbruch – die Seite wirkte sonst leer | ✅ ruhige Kugel für den nächsten Termin |
| Orange an Segmenten und Datumspillen verwässerte „Orange = jetzt“ | ✅ Auswahl-Zustände auf Tinte umgestellt |
| Der Avatar existiert in jedem der drei Tabs (gleiche Test-ID) | Beobachten in der CI; Abläufe scrollen vor dem Tippen zum Kopf |

## 7. Offene Fragen an den PO

1. **Freigabe Phase 11?**
2. Schrift: bei Bricolage bleiben oder **Sora** für Zahlen und Überschriften aufnehmen (neue Abhängigkeit)?
3. Weiter mit **Phase 12 – Zoom-Kalender**?
