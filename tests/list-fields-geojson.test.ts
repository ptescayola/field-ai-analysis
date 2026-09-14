import assert from "node:assert/strict"
import { it } from "node:test"
import { ListFieldsGeoJsonUseCase } from "../backend/application/use-cases/list-fields-geojson.use-case.js"
import { fieldSchema } from "../backend/domain/field/field.schema.js"
import type { FieldRepository } from "../backend/domain/ports/field.repository.js"

const field = fieldSchema.parse({
  field: {
    id: "FIELD-001",
    name: "Test field",
    location: { lat: 42.51, lng: -8.81 },
    area_hectares: 6.8,
  },
  crop: {
    type: "grape",
    variety: "albarino",
    planting_date: "2019-03-18",
    growth_stage: "ripening",
  },
  soil: {
    type: "sandy_loam",
    moisture_percent: 67,
    temperature_c: 18.4,
    ph: 5.8,
  },
  weather: {
    temperature_c: 21,
    humidity_percent: 84,
    rain_last_7_days_mm: 36,
    forecast: [],
  },
  vegetation: { ndvi: 0.79, ndvi_previous_week: 0.8 },
  observations: [],
})

const repository: FieldRepository = {
  async list() {
    return [{ file: "field-001.json", id: "FIELD-001", name: "Test field" }]
  },
  async getByFileName() {
    return field
  },
}

it("listFieldsGeoJson returns a boundary per field", async () => {
  const useCase = new ListFieldsGeoJsonUseCase(repository)
  const geojson = await useCase.execute()

  assert.equal(geojson.type, "FeatureCollection")
  assert.equal(geojson.features.length, 1)

  const boundary = geojson.features[0]
  assert.equal(boundary.geometry.type, "Polygon")
  assert.equal(boundary.properties.file, "field-001.json")
  assert.equal(boundary.properties.boundary_source, "estimated")
})
