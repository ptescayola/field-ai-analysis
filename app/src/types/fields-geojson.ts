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

export interface FieldBoundaryFeature {
  type: "Feature"
  geometry: {
    type: "Polygon"
    coordinates: [number, number][][]
  }
  properties: FieldGeoJsonProperties
}

export type FieldMapFeature = FieldBoundaryFeature

export interface FieldsFeatureCollection {
  type: "FeatureCollection"
  features: FieldMapFeature[]
}

export function boundaryFeatures(
  collection: FieldsFeatureCollection,
): FieldBoundaryFeature[] {
  return collection.features
}
