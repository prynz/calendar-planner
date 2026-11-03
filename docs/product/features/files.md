# Modul 9 – Dateien

> **Status:** v0.1 · 2026-11-03 · Spezifikation (Entwurf). Umsetzung: Phase 5.

## User Stories

| ID | Als … | möchte ich … | damit … |
| --- | --- | --- | --- |
| FIL-01 | Teilnehmer | Tickets, PDFs, Bilder und Links an ein Event hängen | alles an einem Ort ist |
| FIL-02 | Teilnehmer | eine Datei offline verfügbar machen (z. B. Ticket) | ich sie am Einlass habe |
| FIL-03 | Teilnehmer | Dateien im Bereit-Check verknüpfen („Ticket dabei?“ → öffnet Ticket) | nichts fehlt |
| FIL-04 | Nutzer | meinen Speicherverbrauch sehen und Dateien löschen | ich Kontrolle habe |
| FIL-05 | Nutzer | Dokumenten-Checklisten für Behördengänge (aus Vorlagen) | ich alles mitnehme |

## Akzeptanzkriterien

- **Private Buckets**, Zugriff nur über kurzlebige signierte URLs (≤ 10 Min.), ausgestellt nach RLS-Prüfung.
- Erlaubte Typen (Allowlist nach Magic Bytes, nicht nur Endung): JPEG, PNG, HEIC, WebP, PDF, PKPASS. Max. 25 MB pro Datei.
- Bilder werden serverseitig **neu kodiert** (EXIF/GPS entfernt, max. 4096 px). PDFs werden nicht verändert, aber
  auf Typ geprüft. Ein Malware-Scan ist geplant (Anbieter-Entscheidung Phase 5, z. B. ClamAV in Edge-Worker oder
  externer EU-Dienst) – bis dahin werden nur die erlaubten Typen angenommen, und die UI behauptet keinen Virenscan.
- Upload-Rate-Limit (z. B. 50 Dateien/Tag/Nutzer).
- Speicher zählt beim **Hochladenden**; Family-Speicher ist geteilt.

## Zustände

Leer: „Tickets, PDFs, Pläne – alles hier rein 📎“. Über Limit: klare Größenangabe + Optionen. Upload-Fehler: Retry.

## Free / Premium

Speicher: Free 100 MB · Plus 5 GB · Pro 25 GB · Family 25 GB geteilt.
