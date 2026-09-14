import type { FieldData } from "./field.schema.js"

export type FieldBoundaryPolygon = {
  type: "Polygon"
  coordinates: [number, number][][]
}

const METERS_PER_DEGREE_LAT = 111_320

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function rectangleRing(
  lng: number,
  lat: number,
  widthM: number,
  heightM: number,
  bearingDeg: number,
): [number, number][] {
  const bearing = toRadians(bearingDeg)
  const cos = Math.cos(bearing)
  const sin = Math.sin(bearing)
  const halfWidth = widthM / 2
  const halfHeight = heightM / 2
  const metersPerDegreeLng = METERS_PER_DEGREE_LAT * Math.cos(toRadians(lat))

  const corners: [number, number][] = [
    [-halfWidth, -halfHeight],
    [halfWidth, -halfHeight],
    [halfWidth, halfHeight],
    [-halfWidth, halfHeight],
    [-halfWidth, -halfHeight],
  ]

  return corners.map(([x, y]) => [
    lng + (x * cos - y * sin) / metersPerDegreeLng,
    lat + (x * sin + y * cos) / METERS_PER_DEGREE_LAT,
  ])
}

function rectangleBoundaryFromArea(
  lng: number,
  lat: number,
  areaHectares: number,
  seed: string,
): FieldBoundaryPolygon {
  const areaM2 = areaHectares * 10_000
  const aspectRatio = 1.35 + (hashString(seed) % 10) / 20
  const heightM = Math.sqrt(areaM2 / aspectRatio)
  const widthM = areaM2 / heightM
  const bearing = (hashString(`${seed}-bearing`) % 120) - 60

  return {
    type: "Polygon",
    coordinates: [rectangleRing(lng, lat, widthM, heightM, bearing)],
  }
}

export function resolveFieldBoundary(
  field: FieldData,
  file: string,
): FieldBoundaryPolygon {
  if (field.field.boundary) return field.field.boundary

  const { lng, lat } = field.field.location
  return rectangleBoundaryFromArea(
    lng,
    lat,
    field.field.area_hectares,
    field.field.id || file,
  )
}
