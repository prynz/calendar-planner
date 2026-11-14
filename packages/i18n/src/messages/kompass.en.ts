import type { kompassDe } from './kompass.de';

export const kompassEn: Record<keyof typeof kompassDe, string> = {
  'composer.ask': 'What’s coming up?',
  'composer.a11y': 'New plan: write it in one line',
  'account.open': 'Me: profile and settings',
  'account.initial': 'Me',
  'now.sentence': '{duration} left, then off to: {title}.',
  'now.sentenceStart': '{duration} until: {title}.',
  'orb.topStart': 'starts in',
  'orb.top': 'leave in',
  'orb.topNow': 'now',
  'orb.bottom': 'min · {time}',
  'orb.bottomHours': 'h · {time}',
  'orb.bottomNow': 'go · {time}',
  'calendar.view.year': 'Year',
  'calendar.view.day': 'Day',
  'calendar.zoomHint': 'Spread two fingers to zoom in, pinch to zoom out.',
  'calendar.heat.free': 'free',
  'calendar.heat.full': 'full',
  'calendar.heat.a11y': 'Colour shows how full a day is: light is free, strong is full.',
  'calendar.openDay': 'Open {date}',
  'personal.accent.sunrise': 'Sunrise',
};
