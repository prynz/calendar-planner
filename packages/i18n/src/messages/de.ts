/**
 * German (default) – source of truth for message keys. ICU MessageFormat syntax.
 * Tone: casual, warm, "du" (docs/brand/brand-foundation.md §3).
 */
export const de = {
  'tabs.today': 'Heute',
  'tabs.events': 'Events',
  'tabs.settings': 'Einstellungen',

  'common.loading': 'Lädt …',
  'common.retry': 'Nochmal versuchen',
  'common.error.title': 'Da ist was schiefgelaufen',
  'common.error.body': 'Keine Sorge, deine Daten sind sicher. Versuch es bitte gleich nochmal.',

  'demo.badge': 'Demo',
  'demo.banner': 'Beispielwelt: Alle Personen und Termine sind erfunden. Du siehst, wie Nowish sich anfühlt.',

  'today.eyebrow': '{date}',
  'today.title': '{isToday, select, true {Dein Tag} other {{weekday}}}',
  'today.count': '{count, plural, =0 {Keine Termine} one {# Termin} other {# Termine}}',
  'today.empty.title': 'Nichts geplant',
  'today.empty.body': 'Ein freier Tag. Genieß ihn ☀️',
  'today.backToToday': 'Zurück zu heute',
  'today.dayA11y':
    '{date}{isToday, select, true {, heute} other {}}{hasEvents, select, true {, mit Terminen} other {}}',

  'event.status.in': 'in {duration}',
  'event.status.running': 'läuft gerade',
  'event.status.done': 'vorbei',
  'event.status.allDay': 'ganztägig',
  'event.time.range': '{start} – {end}',
  'event.time.allDay': 'Ganztägig',
  'event.people': '{count, plural, one {# Person} other {# Personen}}: {names}',
  'event.hostedBy': 'mit {host}',

  'duration.minutes': '{n} Min.',
  'duration.hours': '{n} Std.',
  'duration.days': '{n, plural, one {# Tag} other {# Tagen}}',

  'events.title': 'Events',
  'events.eyebrow': 'Was ansteht',
  'events.rsvp': '{yes} dabei · {maybe} vielleicht · {open} offen',
  'events.empty.title': 'Noch keine Pläne?',
  'events.empty.body': 'Sobald du eingeladen wirst oder selbst etwas startest, erscheint es hier.',
  'events.readOnlyHint': 'Event anlegen und Details kommen in Phase 4. Hier siehst du die Beispielwelt.',

  'settings.title': 'Einstellungen',
  'settings.language': 'Sprache',
  'settings.language.system': 'System',
  'settings.language.de': 'Deutsch',
  'settings.language.en': 'English',
  'settings.theme': 'Darstellung',
  'settings.theme.system': 'System',
  'settings.theme.dark': 'Dunkel',
  'settings.theme.light': 'Hell',
  'settings.saveError': 'Konnte nicht gespeichert werden. Die Einstellung gilt bis zum nächsten Start.',
  'settings.backend': 'Server',
  'settings.backend.demo': 'Nicht verbunden: Die App läuft im Demo-Modus mit Beispieldaten.',
  'settings.backend.configured': 'Konfiguriert für {host}. Die Anmeldung folgt in Phase 2.',
  'settings.backend.invalid': 'Konfiguration ungültig: {reason}',
  'settings.about': 'Über diesen Prototyp',
  'settings.about.body':
    '{name} ist ein Arbeitsname. Dieser Prototyp ist nicht veröffentlicht und speichert nur Einstellungen auf deinem Gerät.',
  'settings.version': 'Version {version} · {variant}',
} as const;

export type MessageKey = keyof typeof de;
export type Messages = Record<MessageKey, string>;
