# Personas

> **Status:** v0.1 · 2026-11-03 · Hypothesen aus Phase 0, **nicht durch Interviews validiert**
> (Empfehlung: 2 Interviews pro Persona vor Phase 4).

Jede Persona hat Jobs-to-be-done (JTBD), Pain Points, die wichtigsten Funktionen und eine
Erfolgsmetrik. Die Metriken werden aggregiert und ohne personenbezogenes Tracking erhoben.

---

## 1. Chaos-Chris (22–35)

Spontan, sozial, viele Freundeskreise. Kommt meistens 10–15 Minuten zu spät, nicht aus Desinteresse,
sondern weil „noch schnell“ immer länger dauert.

**JTBD**
- Wenn ich verabredet bin, will ich **rechtzeitig wissen, wann ich los muss**, damit ich nicht wieder hetze.
- Wenn ich eingeladen werde, will ich **alle Infos an einem Ort** finden, ohne 200 Chatnachrichten zu scrollen.
- Wenn ich doch zu spät bin, will ich das **mit einem Tap** sagen, ohne zu tippen.

**Pain Points:** unterschätzt Wegzeiten · vergisst Mitbringsel · verpasst Infos im Gruppenchat ·
fühlt sich bei Kritik schnell bloßgestellt.

**Wichtigste Funktionen:** Losgeh-Zeit, gestufte Erinnerungen, Bereit-Check, „Ich verspäte mich“,
Event-Infokarte.

**Erfolgsmetrik:** Anteil der Events, bei denen die Losgeh-Erinnerung bestätigt wurde (Tap auf
„Bin unterwegs“) vor der berechneten Losgeh-Zeit.

**Design-Hinweis:** Pünktlichkeits-Bilanz nur privat und positiv („3× pünktlich in Folge 🎉“), nie
Vergleich mit anderen.

---

## 2. Orga-Olivia (25–40)

Die eine Person im Freundeskreis, die alles organisiert: Geburtstage, Urlaube, JGA. Hat Excel-Listen,
Doodle, WhatsApp-Gruppe und Splitwise gleichzeitig offen.

**JTBD**
- Wenn ich ein Event plane, will ich **verlässliche Zusagen bis zu einem Datum**, damit ich Essen,
  Plätze und Kosten planen kann.
- Wenn wir einen Termin suchen, will ich, dass **die Abstimmung von selbst endet**.
- Wenn jemand etwas mitbringen soll, will ich **nicht hinterherschreiben** müssen.

**Pain Points:** „Vielleicht“ bis zum Schluss · Geld eintreiben ist unangenehm · Infos über 5 Apps
verteilt · Gäste ohne App ausgeschlossen.

**Wichtigste Funktionen:** RSVP mit Frist, Umfragen mit Deadline, Mitbringliste, Aufgaben,
Kosten-Tracking, Gast-Web-Link, Vorlagen, Co-Hosts.

**Erfolgsmetrik:** Anteil der Events, bei denen 48 h vor Start ≥ 90 % der Eingeladenen eine
endgültige Antwort (Ja/Nein) gegeben haben.

**Monetarisierung:** Kern-Zielgruppe für **Pro**.

---

## 3. Familien-Frank (30–50)

Zwei Kinder (7 und 11), Job in Teilzeit-Homeoffice, Partnerin im Schichtdienst. Fußball, Musikschule,
Elternabend, Zahnarzt.

**JTBD**
- Wenn die Woche beginnt, will ich **auf einen Blick sehen, wer wen wohin bringt**.
- Wenn ein Termin für ein Kind dazukommt, will ich **Konflikte sofort sehen**.
- Wenn jemand einkaufen geht, will ich, dass **die Liste aktuell ist**.

**Pain Points:** Doppelbuchungen · „Ich dachte, du holst sie ab“ · Schulferien manuell eintragen ·
Kinder sollen kein eigenes Social-Konto haben.

**Wichtigste Funktionen:** Familienbereich, Kinderprofile ohne Account, Fahrdienste, Einkaufsliste,
Haushaltsaufgaben, Ferienkalender-Import, Heatmap „Familienwoche“.

**Erfolgsmetrik:** Anteil der Kinder-Termine mit zugewiesenem Fahrdienst 24 h vorher.

**Monetarisierung:** Kern-Zielgruppe für **Family**.

---

## 4. ADHS-Alex (alle Altersgruppen)

Neurodivergent (ADHS, ggf. Autismus). Zeitblindheit: „In 2 Stunden“ fühlt sich an wie „irgendwann“.
Viele Benachrichtigungen führen zu Abstumpfung oder Panik.

**JTBD**
- Wenn ein Termin näher rückt, will ich **die verbleibende Zeit sehen**, nicht nur eine Uhrzeit lesen.
- Wenn ich mich fertig machen muss, will ich **konkrete Mikroschritte**, nicht „Vorbereiten“.
- Wenn ich überfordert bin, will ich **eine ruhige Oberfläche** mit nur dem Nächsten.

**Pain Points:** Einzelnes „Pling“ wird ignoriert · Listen mit 20 Punkten lähmen · Schuldgefühle bei
verpassten Terminen · grelle, hektische UI.

**Wichtigste Funktionen:** Fokus-Modus (reduzierte UI, nur „Jetzt“ und „Als Nächstes“), visuelle
Zeitbalken, Mikroschritte im Bereit-Check, Body-Doubling-Timer, einstellbarer Erinnerungston,
Reduced Motion.

**Erfolgsmetrik:** Wiederkehrende Nutzung des Fokus-Modus (Anteil der Fokus-Nutzer, die ihn in
≥ 3 von 4 Wochen aktiv haben).

**Ethik-Hinweis:** Keine Diagnose-Abfrage. Der Fokus-Modus ist für alle zugänglich und wird nie mit
Gesundheitsdaten verknüpft (vermeidet Art.-9-DSGVO-Daten).

---

## 5. Gast-Gabi (alle Altersgruppen ab 16)

Wird eingeladen, nutzt die App nicht, will keine weitere App installieren.

**JTBD**
- Wenn ich einen Einladungslink bekomme, will ich **in unter 30 Sekunden zusagen** und sehen, was ich mitbringen soll.
- Wenn abgestimmt wird, will ich **ohne Account mitstimmen**.
- Wenn sich etwas ändert, will ich **informiert werden**, ohne Account (optional per E-Mail).

**Pain Points:** Registrierungszwang · Datenhunger · App-Store-Umweg · unübersichtliche Web-Seiten.

**Wichtigste Funktionen:** Gast-Web-Ansicht (Zusage, Vote, Mitbringliste, Infos, Kalender-Export
als ICS), optionaler E-Mail-Updatekanal, später Umwandlung in vollen Account.

**Erfolgsmetrik:** Median-Zeit vom Link-Öffnen bis zur Zusage < 30 s; Anteil Gäste, die zusagen.

**Wachstum:** Gast-Funktionen sind **immer kostenlos**. Die App wird angeboten, nie erzwungen.
