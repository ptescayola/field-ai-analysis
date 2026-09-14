/** Mirrors the payload of GET /api/fields/geojson (backend/domain/field/fields-geojson.ts). */
export interface FieldGeoJsonProperties {
  file: string
  id: string
  name: string
  crop: string
  crop_type: string
  growth_stage: string
  area_hectares: number
  boundary_source: "defined" | "estimated"
}

export interface FieldPointFeature {
  type: "Feature"
  geometry: {
    type: "Point"
    coordinates: [number, number]
  }
  properties: FieldGeoJsonProperties
}

export interface FieldBoundaryFeature {
  type: "Feature"
  geometry: {
    type: "Polygon"
    coordinates: [number, number][][]
  }
  properties: FieldGeoJsonProperties
}

export type FieldMapFeature = FieldPointFeature | FieldBoundaryFeature

export interface FieldsFeatureCollection {
  type: "FeatureCollection"
  features: FieldMapFeature[]
}

function isBoundaryFeature(
  feature: FieldMapFeature,
): feature is FieldBoundaryFeature {
  return feature.geometry.type === "Polygon"
}

export function splitFieldMapFeatures(collection: FieldsFeatureCollection): {
  boundaries: FieldBoundaryFeature[]
  points: FieldPointFeature[]
} {
  const boundaries: FieldBoundaryFeature[] = []
  const points: FieldPointFeature[] = []

  for (const feature of collection.features) {
    if (isBoundaryFeature(feature)) {
      boundaries.push(feature)
    } else {
      points.push(feature)
    }
  }

  return { boundaries, points }
}
