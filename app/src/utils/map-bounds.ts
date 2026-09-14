import type { FieldBoundaryFeature } from "../types/fields-geojson"

/** [[west, south], [east, north]] — the tuple shape MapLibre accepts as bounds. */
export type LngLatBoundsTuple = [[number, number], [number, number]]

export function boundsForBoundaries(
  boundaries: readonly FieldBoundaryFeature[],
): LngLatBoundsTuple | null {
  let west = Number.POSITIVE_INFINITY
  let south = Number.POSITIVE_INFINITY
  let east = Number.NEGATIVE_INFINITY
  let north = Number.NEGATIVE_INFINITY

  for (const boundary of boundaries) {
    for (const ring of boundary.geometry.coordinates) {
      for (const [lng, lat] of ring) {
        west = Math.min(west, lng)
        south = Math.min(south, lat)
        east = Math.max(east, lng)
        north = Math.max(north, lat)
      }
    }
  }

  if (west > east || south > north) return null

  return [
    [west, south],
    [east, north],
  ]
}
