// Centralized date/time formatting for the entire application.
// All components must use these helpers instead of raw Date methods.

type AppLocale = 'uk' | 'en'

const LOCALE_MAP: Record<AppLocale, string> = {
  uk: 'uk-UA',
  en: 'en-US',
}

function resolveLocale(appLocale: string): string {
  return LOCALE_MAP[appLocale as AppLocale] || appLocale
}

// 24h time: "08:00", "14:30"
export function formatTime24(date: string | Date, appLocale: string): string {
  return new Intl.DateTimeFormat(resolveLocale(appLocale), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(date))
}

// Short date: "7 квіт.", "Apr 7"
export function formatDateShort(date: string | Date, appLocale: string): string {
  return new Intl.DateTimeFormat(resolveLocale(appLocale), {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date))
}

// Full date: "7 квітня 2026", "April 7, 2026"
export function formatDateFull(date: string | Date, appLocale: string): string {
  return new Intl.DateTimeFormat(resolveLocale(appLocale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

// Day + month + year short: "7 квіт. 2026", "Apr 7, 2026"
export function formatDateMedium(date: string | Date, appLocale: string): string {
  return new Intl.DateTimeFormat(resolveLocale(appLocale), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

// Day header for calendar: "пн, 7 квіт.", "Mon, Apr 7"
export function formatDayHeader(date: Date, appLocale: string): string {
  return new Intl.DateTimeFormat(resolveLocale(appLocale), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date)
}

// Week range label: "7 квіт. – 13 квіт. 2026"
export function formatWeekRange(start: Date, end: Date, appLocale: string): string {
  const locale = resolveLocale(appLocale)
  const startStr = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  }).format(start)
  const endStr = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(end)
  return `${startStr} – ${endStr}`
}

// ISO date string "2026-04-07" from a Date object
export function toISODateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Format Date to datetime-local input value: "2026-04-07T08:00"
export function toDatetimeLocalValue(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${min}`
}

// Add minutes to a Date
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000)
}
