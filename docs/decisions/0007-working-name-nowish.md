# ADR 0007 – Arbeitsname „Nowish“, Alternative „Gleichda“

> **Status:** akzeptiert (Arbeitsname) · 2026-11-09 · Markenprüfung offen

## Kontext

Der Arbeitstitel „PLANLOS“ ist ein deutsches Alltagswort. Er ist als Marke kaum schützbar und international
unverständlich. In Phase 0 und im Review wurden über 15 Alternativen bewertet ([brand-foundation.md §1](../brand/brand-foundation.md)).

## Entscheidung (PO, 2026-11-09)

- **Arbeitsname: Nowish.** Alle Dokumente, Code-Identifier ab Phase 1 und Konzept-Mockups verwenden ihn.
- **Gleichda** bleibt Alternative und wird in der Markenprüfung parallel betrachtet (DACH-Name oder Kampagnenbegriff).
- `MASTER_PROMPT.md` bleibt unverändert als Ursprungsdokument (dort weiterhin „PLANLOS“).

## Konsequenzen

- Der Name wird ausschließlich aus `packages/brand` gelesen (Anzeige, Store-Texte, Deep-Link-Schema), damit ein
  Wechsel zu Gleichda oder einem anderen Namen eine Ein-Stellen-Änderung bleibt.
- **Bundle-/Package-ID und Deep-Link-Schema bleiben neutral**, bis die Markenprüfung abgeschlossen ist; sie sind
  nach dem ersten Store-Upload nicht mehr änderbar.
- Offene Risiken: mögliche gleichnamige To-do-App „Nowish“, Unterscheidungskraft des Umgangsworts. Prüfung durch
  den PO (DPMA, EUIPO, USPTO, Domains, App-Store-/Play-Namen) vor Phase 8 (Store-Listings).
- Das Repo heißt weiterhin `calendar-planner`. Eine Umbenennung ist eine Remote-Änderung und nur auf ausdrücklichen
  Wunsch des PO möglich.
