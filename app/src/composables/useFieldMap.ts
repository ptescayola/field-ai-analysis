import maplibregl, {
  type GeoJSONSource,
  type LngLatLike,
  type Map,
  type MapLayerMouseEvent,
  type Popup,
  type StyleSpecification,
} from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import {
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from "vue"
import { fetchFieldsGeoJson } from "../api/client"
import {
  boundaryFeatures,
  type FieldGeoJsonProperties,
  type FieldBoundaryFeature,
  type FieldsFeatureCollection,
} from "../types/fields-geojson"
import {
  fieldMapLayers,
  FIELD_BOUNDARIES_SOURCE_ID,
  FIELD_MAP_LAYER_IDS,
  FIELD_MAP_SOURCE_IDS,
  INTERACTIVE_FIELD_LAYER_IDS,
  SELECTED_FIELD_LAYER_IDS,
  selectedFieldFilter,
  type BasemapMode,
} from "../utils/field-map-layers"
import { fieldPopupHtml } from "../utils/field-map-popup"
import { boundsForBoundaries } from "../utils/map-bounds"
import fieldBasemapStyle from "../map/styles/field-basemap.json"
import fieldSatelliteStyle from "../map/styles/field-satellite.json"

const BUNDLED_BASEMAP_STYLE = fieldBasemapStyle as StyleSpecification
const BUNDLED_SATELLITE_STYLE = fieldSatelliteStyle as StyleSpecification
const REMOTE_MAP_STYLE_FALLBACK = "https://demotiles.maplibre.org/style.json"

type MapStyle = string | StyleSpecification

const ENV_BASEMAP_STYLE_URL = import.meta.env.VITE_MAP_STYLE_URL?.trim()
const ENV_SATELLITE_STYLE_URL =
  import.meta.env.VITE_MAP_SATELLITE_STYLE_URL?.trim()

const INITIAL_CENTER: LngLatLike = [-3.7, 40.4]
const INITIAL_ZOOM = 5
const FIT_BOUNDS_OPTIONS = { padding: 48, maxZoom: 17, duration: 800 }

const EMPTY_COLLECTION: FieldsFeatureCollection = {
  type: "FeatureCollection",
  features: [],
}

export interface UseFieldMapOptions {
  selectedFile: MaybeRefOrGetter<string>
  onSelectField: (file: string) => void
}

export function useFieldMap(options: UseFieldMapOptions) {
  const containerRef = ref<HTMLElement | null>(null)
  const mapRef = shallowRef<Map | null>(null)
  const popupRef = shallowRef<Popup | null>(null)
  const fieldsGeoJson = ref<FieldsFeatureCollection | null>(null)
  const loading = ref(true)
  const loadError = ref<string | null>(null)
  const basemapMode = ref<BasemapMode>("standard")
  let usedFallbackStyle = false

  function activeStyle(): MapStyle {
    if (basemapMode.value === "satellite") {
      return ENV_SATELLITE_STYLE_URL || BUNDLED_SATELLITE_STYLE
    }
    return ENV_BASEMAP_STYLE_URL || BUNDLED_BASEMAP_STYLE
  }

  function mapFeatures(): FieldBoundaryFeature[] {
    return boundaryFeatures(fieldsGeoJson.value ?? EMPTY_COLLECTION)
  }

  function setSourceData(
    map: Map,
    sourceId: string,
    features: FieldBoundaryFeature[],
  ): void {
    const source = map.getSource(sourceId) as GeoJSONSource | undefined
    source?.setData({ type: "FeatureCollection", features })
  }

  function showPopup(
    properties: FieldGeoJsonProperties,
    lngLat: LngLatLike,
  ): void {
    const map = mapRef.value
    if (!map) return

    popupRef.value?.remove()
    popupRef.value = new maplibregl.Popup({
      closeButton: true,
      maxWidth: "260px",
    })
      .setLngLat(lngLat)
      .setHTML(fieldPopupHtml(properties))
      .addTo(map)
  }

  function onFieldClick(event: MapLayerMouseEvent): void {
    const properties = event.features?.[0]?.properties
    if (!properties?.file) return

    options.onSelectField(String(properties.file))
    showPopup(properties as FieldGeoJsonProperties, event.lngLat)
  }

  function onFieldEnter(event: MapLayerMouseEvent): void {
    event.target.getCanvas().style.cursor = "pointer"
  }

  function onFieldLeave(event: MapLayerMouseEvent): void {
    event.target.getCanvas().style.cursor = ""
  }

  function bindLayerInteractions(map: Map): void {
    for (const layerId of INTERACTIVE_FIELD_LAYER_IDS) {
      map.off("click", layerId, onFieldClick)
      map.off("mouseenter", layerId, onFieldEnter)
      map.off("mouseleave", layerId, onFieldLeave)
      map.on("click", layerId, onFieldClick)
      map.on("mouseenter", layerId, onFieldEnter)
      map.on("mouseleave", layerId, onFieldLeave)
    }
  }

  function installOverlay(map: Map): void {
    for (const layerId of FIELD_MAP_LAYER_IDS) {
      if (map.getLayer(layerId)) map.removeLayer(layerId)
    }
    for (const sourceId of FIELD_MAP_SOURCE_IDS) {
      if (map.getSource(sourceId)) map.removeSource(sourceId)
      map.addSource(sourceId, { type: "geojson", data: EMPTY_COLLECTION })
    }
    for (const layer of fieldMapLayers(
      basemapMode.value,
      toValue(options.selectedFile),
    )) {
      map.addLayer(layer)
    }

    bindLayerInteractions(map)
  }

  function syncOverlayData(map: Map): void {
    const boundaries = mapFeatures()
    setSourceData(map, FIELD_BOUNDARIES_SOURCE_ID, boundaries)

    const filter = selectedFieldFilter(toValue(options.selectedFile))
    for (const layerId of SELECTED_FIELD_LAYER_IDS) {
      if (map.getLayer(layerId)) map.setFilter(layerId, filter)
    }
  }

  function frameSelection(map: Map): void {
    const boundaries = mapFeatures()
    const selectedFile = toValue(options.selectedFile)
    const selected = boundaries.filter(
      (feature) => feature.properties.file === selectedFile,
    )
    const bounds = boundsForBoundaries(
      selected.length > 0 ? selected : boundaries,
    )
    if (!bounds) return

    map.fitBounds(bounds, FIT_BOUNDS_OPTIONS)
  }

  function applyStyleFallback(map: Map, message: string): void {
    if (usedFallbackStyle) return
    if (!/style/i.test(message)) return
    usedFallbackStyle = true
    void map.setStyle(REMOTE_MAP_STYLE_FALLBACK, { diff: false })
  }

  function createMap(): void {
    const container = containerRef.value
    if (!container || mapRef.value) return

    const map = new maplibregl.Map({
      container,
      style: activeStyle(),
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      attributionControl: {},
    })

    map.addControl(new maplibregl.NavigationControl(), "top-right")

    map.on("style.load", () => {
      installOverlay(map)
      syncOverlayData(map)
      frameSelection(map)
    })

    map.on("error", (event) => {
      applyStyleFallback(map, event.error?.message ?? "")
    })

    mapRef.value = map
  }

  function setBasemapMode(mode: BasemapMode): void {
    if (mode === basemapMode.value) return
    basemapMode.value = mode
    usedFallbackStyle = false
    void mapRef.value?.setStyle(activeStyle(), { diff: false })
  }

  async function loadFields(): Promise<void> {
    loading.value = true
    loadError.value = null
    try {
      fieldsGeoJson.value = await fetchFieldsGeoJson()
    } catch (e) {
      loadError.value =
        e instanceof Error ? e.message : "Could not load field locations"
    } finally {
      loading.value = false
    }
  }

  onMounted(async () => {
    await loadFields()
    if (!loadError.value) createMap()
  })

  watch(
    () => [toValue(options.selectedFile), fieldsGeoJson.value] as const,
    () => {
      const map = mapRef.value
      if (!map?.isStyleLoaded()) return
      syncOverlayData(map)
      frameSelection(map)
    },
  )

  onBeforeUnmount(() => {
    popupRef.value?.remove()
    popupRef.value = null
    mapRef.value?.remove()
    mapRef.value = null
  })

  return {
    containerRef,
    loading,
    loadError,
    basemapMode,
    setBasemapMode,
  }
}
