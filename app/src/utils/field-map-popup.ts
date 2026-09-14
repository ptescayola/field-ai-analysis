import type { FieldGeoJsonProperties } from "../types/fields-geojson"

export interface FieldPopupMetrics {
  healthScore: number | null
  irrigateNext48h: boolean | null
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char)
}

function humanize(value: string): string {
  return escapeHtml(value.replaceAll("_", " "))
}

export function fieldPopupHtml(
  properties: FieldGeoJsonProperties,
  metrics: FieldPopupMetrics,
): string {
  const lines = [
    `<strong>${escapeHtml(properties.name)}</strong>`,
    `${humanize(properties.crop)} · ${humanize(properties.growth_stage)}`,
    `${properties.area_hectares} ha · ${escapeHtml(properties.id)}`,
    properties.boundary_source === "estimated"
      ? "Parcel shape estimated from area"
      : "Surveyed parcel boundary",
  ]

  if (metrics.healthScore != null) {
    lines.push(`Health score: ${metrics.healthScore}/100`)
  }
  if (metrics.irrigateNext48h != null) {
    lines.push(`Irrigate (48h): ${metrics.irrigateNext48h ? "Yes" : "No"}`)
  }

  return `<div class="field-map-popup">${lines.join("<br />")}</div>`
}
