import type { FilterSpecification, LayerSpecification } from "maplibre-gl"

export type BasemapMode = "standard" | "satellite"

export const FIELD_BOUNDARIES_SOURCE_ID = "field-boundaries"

export const FIELD_MAP_SOURCE_IDS = [FIELD_BOUNDARIES_SOURCE_ID]

const BOUNDARY_FILL_LAYER_ID = "fields-boundary-fill"
const BOUNDARY_LINE_LAYER_ID = "fields-boundary-line"
const BOUNDARY_SELECTED_FILL_LAYER_ID = "fields-boundary-selected-fill"
const BOUNDARY_SELECTED_LINE_LAYER_ID = "fields-boundary-selected-line"

export const FIELD_MAP_LAYER_IDS = [
  BOUNDARY_FILL_LAYER_ID,
  BOUNDARY_LINE_LAYER_ID,
  BOUNDARY_SELECTED_FILL_LAYER_ID,
  BOUNDARY_SELECTED_LINE_LAYER_ID,
]

export const SELECTED_FIELD_LAYER_IDS = [
  BOUNDARY_SELECTED_FILL_LAYER_ID,
  BOUNDARY_SELECTED_LINE_LAYER_ID,
]

export const INTERACTIVE_FIELD_LAYER_IDS = [
  BOUNDARY_FILL_LAYER_ID,
  BOUNDARY_LINE_LAYER_ID,
  BOUNDARY_SELECTED_FILL_LAYER_ID,
  BOUNDARY_SELECTED_LINE_LAYER_ID,
]

interface ParcelPalette {
  fill: string
  outline: string
  selectedFill: string
  selectedOutline: string
}

const PALETTES: Record<BasemapMode, ParcelPalette> = {
  standard: {
    fill: "#74c69d",
    outline: "#1b4332",
    selectedFill: "#40916c",
    selectedOutline: "#081c15",
  },
  satellite: {
    fill: "#f4a261",
    outline: "#023047",
    selectedFill: "#e76f51",
    selectedOutline: "#001219",
  },
}

export function selectedFieldFilter(file: string): FilterSpecification {
  return ["==", ["get", "file"], file]
}

export function fieldMapLayers(
  mode: BasemapMode,
  selectedFile: string,
): LayerSpecification[] {
  const palette = PALETTES[mode]
  const selected = selectedFieldFilter(selectedFile)

  return [
    {
      id: BOUNDARY_FILL_LAYER_ID,
      type: "fill",
      source: FIELD_BOUNDARIES_SOURCE_ID,
      paint: {
        "fill-color": palette.fill,
        "fill-opacity": 0.35,
      },
    },
    {
      id: BOUNDARY_LINE_LAYER_ID,
      type: "line",
      source: FIELD_BOUNDARIES_SOURCE_ID,
      paint: {
        "line-color": palette.outline,
        "line-width": 2.5,
      },
    },
    {
      id: BOUNDARY_SELECTED_FILL_LAYER_ID,
      type: "fill",
      source: FIELD_BOUNDARIES_SOURCE_ID,
      filter: selected,
      paint: {
        "fill-color": palette.selectedFill,
        "fill-opacity": 0.55,
      },
    },
    {
      id: BOUNDARY_SELECTED_LINE_LAYER_ID,
      type: "line",
      source: FIELD_BOUNDARIES_SOURCE_ID,
      filter: selected,
      paint: {
        "line-color": palette.selectedOutline,
        "line-width": 4,
      },
    },
  ]
}
