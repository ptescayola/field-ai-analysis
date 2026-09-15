import assert from "node:assert/strict"
import { it } from "node:test"
import {
  calendarDateToLocalDate,
  formatCalendarDate,
  formatForecastDay,
  formatShortDate,
  forecastDayFormatOptions,
  getDateTimeFormatter,
} from "../app/src/utils/intl-dates.ts"

it("calendarDateToLocalDate parses YYYY-MM-DD at local noon", () => {
  const date = calendarDateToLocalDate("2024-06-15")
  assert.equal(date.getFullYear(), 2024)
  assert.equal(date.getMonth(), 5)
  assert.equal(date.getDate(), 15)
  assert.equal(date.getHours(), 12)
})

it("calendarDateToLocalDate rejects invalid input", () => {
  assert.throws(() => calendarDateToLocalDate("15/06/2024"), /YYYY-MM-DD/)
})

it("getDateTimeFormatter returns cached formatters for the same locale and options", () => {
  const a = getDateTimeFormatter("en-GB", forecastDayFormatOptions)
  const b = getDateTimeFormatter("en-GB", forecastDayFormatOptions)
  assert.equal(a, b)
})

it("formatForecastDay formats with en-GB weekday, day, and month", () => {
  assert.equal(formatForecastDay("2024-06-15"), "Sat 15 Jun")
})

it("formatShortDate includes year", () => {
  assert.equal(formatShortDate("2024-06-15"), "15 Jun 2024")
})

it("formatCalendarDate respects locale", () => {
  const formatted = formatCalendarDate("2024-06-15", "de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  assert.match(formatted, /2024/)
  assert.match(formatted, /15/)
})
