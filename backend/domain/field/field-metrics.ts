import type { FieldData } from "./field.schema.js"

export type FieldMetrics = {
  days_since_planting: number | null
  ndvi_delta: number
  ndvi_trend: "rising" | "stable" | "falling"
  rain_next_48h_mm: number
  rain_next_7_days_mm: number
  max_temperature_next_48h_c: number | null
  forecast_days_available: number
}

const NDVI_STABLE_THRESHOLD = 0.02
const MS_PER_DAY = 86_400_000

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function daysSincePlanting(plantingDate: string, now: Date): number | null {
  const planted = new Date(plantingDate)
  if (Number.isNaN(planted.getTime())) return null

  return Math.floor((now.getTime() - planted.getTime()) / MS_PER_DAY)
}

function ndviTrend(delta: number): FieldMetrics["ndvi_trend"] {
  if (delta > NDVI_STABLE_THRESHOLD) return "rising"
  if (delta < -NDVI_STABLE_THRESHOLD) return "falling"
  return "stable"
}

function sumRain(days: FieldData["weather"]["forecast"]): number {
  return round(
    days.reduce((total, day) => total + day.rain_mm, 0),
    1,
  )
}

export function deriveFieldMetrics(
  field: FieldData,
  now = new Date(),
): FieldMetrics {
  const forecast = field.weather.forecast
  const next48h = forecast.slice(0, 2)
  const delta = round(
    field.vegetation.ndvi - field.vegetation.ndvi_previous_week,
    3,
  )

  return {
    days_since_planting: daysSincePlanting(field.crop.planting_date, now),
    ndvi_delta: delta,
    ndvi_trend: ndviTrend(delta),
    rain_next_48h_mm: sumRain(next48h),
    rain_next_7_days_mm: sumRain(forecast),
    max_temperature_next_48h_c: next48h.length
      ? Math.max(...next48h.map((day) => day.max_temperature_c))
      : null,
    forecast_days_available: forecast.length,
  }
}
