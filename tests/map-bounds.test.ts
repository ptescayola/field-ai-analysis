import assert from "node:assert/strict"
import { it } from "node:test"
import type { FieldBoundaryFeature } from "../app/src/types/fields-geojson.ts"
import { boundsForBoundaries } from "../app/src/utils/map-bounds.ts"

function boundary(
  file: string,
  ring: [number, number][],
): FieldBoundaryFeature {
  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [ring] },
    properties: {
      file,
      id: file,
      name: file,
      crop: "grape",
      crop_type: "grape",
      growth_stage: "ripening",
      area_hectares: 1,
      boundary_source: "defined",
    },
  }
}

it("boundsForBoundaries returns the south-west and north-east corners", () => {
  const bounds = boundsForBoundaries([
    boundary("field-001.json", [
      [-8.79, 42.52],
      [-8.78, 42.53],
      [-8.785, 42.525],
      [-8.79, 42.52],
    ]),
  ])

  assert.deepEqual(bounds, [
    [-8.79, 42.52],
    [-8.78, 42.53],
  ])
})

it("boundsForBoundaries covers every parcel", () => {
  const bounds = boundsForBoundaries([
    boundary("field-001.json", [
      [-8.79, 42.52],
      [-8.78, 42.53],
      [-8.79, 42.52],
    ]),
    boundary("field-002.json", [
      [1.397, 39.06],
      [1.398, 39.061],
      [1.397, 39.06],
    ]),
  ])

  assert.deepEqual(bounds, [
    [-8.79, 39.06],
    [1.398, 42.53],
  ])
})

it("boundsForBoundaries returns null without coordinates", () => {
  assert.equal(boundsForBoundaries([]), null)
  assert.equal(boundsForBoundaries([boundary("field-003.json", [])]), null)
})
