import assert from "node:assert/strict"
import { it } from "node:test"
import type { FieldGeoJsonProperties } from "../app/src/types/fields-geojson.ts"
import { fieldPopupHtml } from "../app/src/utils/field-map-popup.ts"

const properties: FieldGeoJsonProperties = {
  file: "field-001.json",
  id: "FIELD-001",
  name: "Viña en Cuíña",
  crop: "unspecified",
  crop_type: "grape",
  growth_stage: "fruit_filling",
  area_hectares: 3.7,
  boundary_source: "defined",
}

it("fieldPopupHtml describes the parcel and its boundary source", () => {
  const html = fieldPopupHtml(properties)

  assert.match(html, /<strong>Viña en Cuíña<\/strong>/)
  assert.match(html, /fruit filling/)
  assert.match(html, /3\.7 ha · FIELD-001/)
  assert.match(html, /Surveyed parcel boundary/)
  assert.doesNotMatch(html, /Health score/)
  assert.doesNotMatch(html, /Irrigate/)
})

it("fieldPopupHtml escapes values coming from field data", () => {
  const html = fieldPopupHtml({
    ...properties,
    name: '<img src=x onerror="alert(1)">',
  })

  assert.doesNotMatch(html, /<img/)
  assert.match(html, /&lt;img/)
})
