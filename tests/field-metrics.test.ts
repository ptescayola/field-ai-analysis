import assert from "node:assert/strict"
import { it } from "node:test"
import { deriveFieldMetrics } from "../backend/domain/field/field-metrics.js"
import { fieldSchema } from "../backend/domain/field/field.schema.js"

const field = fieldSchema.parse({
  field: {
    id: "FIELD-001",
    name: "Test field",
    location: { lat: 39.62, lng: 2.91 },
    area_hectares: 4.2,
  },
  crop: {
    type: "tomato",
    variety: "ramallet",
    planting_date: "2026-04-15",
    growth_stage: "fruit_development",
  },
  soil: {
    type: "loam",
    moisture_percent: 31,
    temperature_c: 24.8,
    ph: 6.7,
  },
  weather: {
    temperature_c: 29,
    humidity_percent: 68,
    rain_last_7_days_mm: 3,
    forecast: [
      { day: "2026-06-01", rain_mm: 0.4, max_temperature_c: 31 },
      { day: "2026-06-02", rain_mm: 2.1, max_temperature_c: 34 },
      { day: "2026-06-03", rain_mm: 8, max_temperature_c: 28 },
    ],
  },
  vegetation: { ndvi: 0.72, ndvi_previous_week: 0.76 },
  observations: [],
})

it("derives metrics agents would otherwise have to compute", () => {
  const metrics = deriveFieldMetrics(field, new Date("2026-06-01T00:00:00Z"))

  assert.equal(metrics.days_since_planting, 47)
  assert.equal(metrics.ndvi_delta, -0.04)
  assert.equal(metrics.ndvi_trend, "falling")
  assert.equal(metrics.rain_next_48h_mm, 2.5)
  assert.equal(metrics.rain_next_7_days_mm, 10.5)
  assert.equal(metrics.max_temperature_next_48h_c, 34)
  assert.equal(metrics.forecast_days_available, 3)
})

it("reports a stable NDVI trend for small changes and handles an empty forecast", () => {
  const metrics = deriveFieldMetrics({
    ...field,
    weather: { ...field.weather, forecast: [] },
    vegetation: { ndvi: 0.75, ndvi_previous_week: 0.76 },
  })

  assert.equal(metrics.ndvi_trend, "stable")
  assert.equal(metrics.rain_next_48h_mm, 0)
  assert.equal(metrics.max_temperature_next_48h_c, null)
  assert.equal(metrics.forecast_days_available, 0)
})
