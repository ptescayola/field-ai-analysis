import assert from "node:assert/strict"
import { it } from "node:test"
import { resolveFieldBoundary } from "../backend/domain/field/field-boundary.js"
import { fieldSchema } from "../backend/domain/field/field.schema.js"

const baseField = fieldSchema.parse({
  field: {
    id: "FIELD-002",
    name: "Demo",
    location: { lat: 38.98, lng: 1.3 },
    area_hectares: 3.4,
  },
  crop: {
    type: "tomato",
    variety: "demo",
    planting_date: "2026-01-01",
    growth_stage: "vegetative",
  },
  soil: {
    type: "loam",
    moisture_percent: 30,
    temperature_c: 20,
    ph: 6.5,
  },
  weather: {
    temperature_c: 25,
    humidity_percent: 60,
    rain_last_7_days_mm: 2,
    forecast: [],
  },
  vegetation: { ndvi: 0.7, ndvi_previous_week: 0.72 },
  observations: [],
})

it("resolveFieldBoundary returns a closed polygon ring", () => {
  const boundary = resolveFieldBoundary(baseField, "field-002.json")
  const ring = boundary.coordinates[0]!
  assert.equal(ring.length >= 4, true)
  assert.deepEqual(ring[0], ring[ring.length - 1])
})

it("resolveFieldBoundary uses explicit field boundary when provided", () => {
  const customRing: [number, number][] = [
    [1.29, 38.97],
    [1.31, 38.97],
    [1.31, 38.99],
    [1.29, 38.99],
    [1.29, 38.97],
  ]
  const field = fieldSchema.parse({
    ...baseField,
    field: {
      ...baseField.field,
      boundary: { type: "Polygon", coordinates: [customRing] },
    },
  })

  const boundary = resolveFieldBoundary(field, "field-002.json")
  assert.deepEqual(boundary.coordinates[0], customRing)
})
