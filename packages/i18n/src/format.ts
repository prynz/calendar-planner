import { intlTag, type Locale } from './locale';

/** 24-hour clock for both locales (DACH market decision, roadmap.md §6). */
export function formatTime(date: Date, locale: Locale, timeZone?: string): string {
  return new Intl.DateTimeFormat(intlTag[locale], {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
}

export function formatLongDate(date: Date, locale: Locale, timeZone?: string): string {
  return new Intl.DateTimeFormat(intlTag[locale], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
}

export function formatWeekday(date: Date, locale: Locale, style: 'short' | 'long', timeZone?: string): string {
  return new Intl.DateTimeFormat(intlTag[locale], { weekday: style, ...(timeZone ? { timeZone } : {}) })
    .format(date)
    .replace(/\.$/, '');
}

export function formatDayNumber(date: Date, locale: Locale, timeZone?: string): string {
  return new Intl.DateTimeFormat(intlTag[locale], { day: 'numeric', ...(timeZone ? { timeZone } : {}) })
    .format(date)
    .replace(/\.$/, '');
}

export function formatMonthYear(date: Date, locale: Locale, timeZone?: string): string {
  return new Intl.DateTimeFormat(intlTag[locale], {
    month: 'long',
    year: 'numeric',
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
}

export function formatShortDate(date: Date, locale: Locale, timeZone?: string): string {
  return new Intl.DateTimeFormat(intlTag[locale], {
    day: 'numeric',
    month: 'short',
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
}

/** Integer minor units (cents) → "12,40 €" / "€12.40"; prices always incl. VAT (monetization.md §1.4). */
export function formatMoney(cents: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(intlTag[locale], { style: 'currency', currency }).format(cents / 100);
}
