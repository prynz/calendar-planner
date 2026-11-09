import type { Messages } from './de';

/** English – natural, not a literal translation (docs/brand/brand-foundation.md §3). */
export const en: Messages = {
  'tabs.today': 'Today',
  'tabs.events': 'Events',
  'tabs.settings': 'Settings',

  'common.loading': 'Loading …',
  'common.retry': 'Try again',
  'common.error.title': 'Something went wrong',
  'common.error.body': "Don't worry, your data is safe. Please try again in a moment.",

  'demo.badge': 'Demo',
  'demo.banner': 'Example world: every person and plan here is made up. This is how Nowish feels.',

  'today.eyebrow': '{date}',
  'today.title': '{isToday, select, true {Your day} other {{weekday}}}',
  'today.count': '{count, plural, =0 {No plans} one {# plan} other {# plans}}',
  'today.empty.title': 'Nothing planned',
  'today.empty.body': 'A free day. Enjoy it ☀️',
  'today.backToToday': 'Back to today',
  'today.dayA11y': '{date}{isToday, select, true {, today} other {}}{hasEvents, select, true {, has plans} other {}}',

  'event.status.in': 'in {duration}',
  'event.status.running': 'happening now',
  'event.status.done': 'done',
  'event.status.allDay': 'all day',
  'event.time.range': '{start} – {end}',
  'event.time.allDay': 'All day',
  'event.people': '{count, plural, one {# person} other {# people}}: {names}',
  'event.hostedBy': 'with {host}',

  'duration.minutes': '{n} min',
  'duration.hours': '{n} h',
  'duration.days': '{n, plural, one {# day} other {# days}}',

  'events.title': 'Events',
  'events.eyebrow': 'Coming up',
  'events.rsvp': '{yes} going · {maybe} maybe · {open} pending',
  'events.empty.title': 'No plans yet?',
  'events.empty.body': "Once you're invited or start something yourself, it shows up here.",
  'events.readOnlyHint': 'Creating events and event details arrive in phase 4. This is the example world.',

  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.language.system': 'System',
  'settings.language.de': 'Deutsch',
  'settings.language.en': 'English',
  'settings.theme': 'Appearance',
  'settings.theme.system': 'System',
  'settings.theme.dark': 'Dark',
  'settings.theme.light': 'Light',
  'settings.saveError': "Couldn't save. The setting applies until the app restarts.",
  'settings.backend': 'Server',
  'settings.backend.demo': 'Not connected: the app runs in demo mode with example data.',
  'settings.backend.configured': 'Configured for {host}. Sign-in arrives in phase 2.',
  'settings.backend.invalid': 'Invalid configuration: {reason}',
  'settings.about': 'About this prototype',
  'settings.about.body':
    '{name} is a working name. This prototype is not published and only stores settings on your device.',
  'settings.version': 'Version {version} · {variant}',
};
