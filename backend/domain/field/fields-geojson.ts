import { resolveFieldBoundary } from "./field-boundary.js"
import type { FieldData } from "./field.schema.js"

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

function baseProperties(
  file: string,
  field: FieldData,
): FieldGeoJsonProperties {
  return {
    file,
    id: field.field.id,
    name: field.field.name,
    crop: field.crop.variety,
    crop_type: field.crop.type,
    growth_stage: field.crop.growth_stage,
    area_hectares: field.field.area_hectares,
    boundary_source: field.field.boundary ? "defined" : "estimated",
  }
}

function fieldToBoundaryFeature(
  file: string,
  field: FieldData,
): FieldBoundaryFeature {
  return {
    type: "Feature",
    geometry: resolveFieldBoundary(field, file),
    properties: baseProperties(file, field),
  }
}

function fieldToPointFeature(
  file: string,
  field: FieldData,
): FieldPointFeature {
  const { location } = field.field
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [location.lng, location.lat],
    },
    properties: baseProperties(file, field),
  }
}

/** Parcel shape plus its centroid: the polygon carries the map, the point anchors labels and popups. */
export function fieldToMapFeatures(
  file: string,
  field: FieldData,
): FieldMapFeature[] {
  return [fieldToBoundaryFeature(file, field), fieldToPointFeature(file, field)]
}
