import type { FieldGeoJsonProperties } from "../types/fields-geojson"

export function fieldPopupHtml(properties: FieldGeoJsonProperties): string {
  const lines = [
    `<strong>${properties.name}</strong>`,
    `${properties.crop} · ${properties.growth_stage}`,
    `${properties.area_hectares} ha · ${properties.id}`,
    properties.boundary_source === "estimated"
      ? "Parcel shape estimated from area"
      : "Surveyed parcel boundary",
  ]

  return `<div class="field-map-popup">${lines.join("<br />")}</div>`
}
