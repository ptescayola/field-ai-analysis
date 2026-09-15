/** Calendar date `YYYY-MM-DD` at local noon (avoids UTC day shifts). */
export function calendarDateToLocalDate(isoDate: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim())
  if (!match) {
    throw new Error(`Expected ISO calendar date YYYY-MM-DD, got "${isoDate}"`)
  }
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

const formatterCache = new Map<string, Intl.DateTimeFormat>()

function formatterCacheKey(
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return `${locale}\0${JSON.stringify(options)}`
}

export function getDateTimeFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = formatterCacheKey(locale, options)
  let formatter = formatterCache.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options)
    formatterCache.set(key, formatter)
  }
  return formatter
}

export const DEFAULT_DATE_LOCALE = "en-GB"

export const forecastDayFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
} satisfies Intl.DateTimeFormatOptions

export const shortDateFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
} satisfies Intl.DateTimeFormatOptions

export function formatCalendarDate(
  isoDate: string,
  locale: string = DEFAULT_DATE_LOCALE,
  options: Intl.DateTimeFormatOptions = forecastDayFormatOptions,
): string {
  return getDateTimeFormatter(locale, options).format(
    calendarDateToLocalDate(isoDate),
  )
}

export function formatForecastDay(
  isoDate: string,
  locale: string = DEFAULT_DATE_LOCALE,
): string {
  return formatCalendarDate(isoDate, locale, forecastDayFormatOptions)
}

export function formatShortDate(
  isoDate: string,
  locale: string = DEFAULT_DATE_LOCALE,
): string {
  return formatCalendarDate(isoDate, locale, shortDateFormatOptions)
}
