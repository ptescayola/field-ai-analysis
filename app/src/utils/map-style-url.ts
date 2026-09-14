export const DEFAULT_MAP_STYLE_URL = "https://demotiles.maplibre.org/style.json"

const MAPTILER_SATELLITE_MAP_ID = "hybrid"

function parseUrl(raw: string | undefined): URL | null {
  const trimmed = raw?.trim()
  if (!trimmed) return null

  try {
    return new URL(trimmed)
  } catch {
    return null
  }
}

export function withMapApiKey(
  styleUrl: string | undefined,
  apiKey: string | undefined,
): string | undefined {
  const base = styleUrl?.trim()
  if (!base) return undefined

  const key = apiKey?.trim()
  if (!key) return base

  const url = parseUrl(base)
  if (!url) return base

  url.searchParams.set("key", key)
  return url.toString()
}

export function resolveMapStyleUrl(
  raw: string | undefined,
  mapTilerHost: string | undefined,
): string {
  const url = parseUrl(raw)
  if (!url) return DEFAULT_MAP_STYLE_URL

  const host = mapTilerHost?.trim()
  const isMapTilerMap =
    Boolean(host) && url.hostname === host && url.pathname.includes("/maps/")
  if (isMapTilerMap && !url.pathname.endsWith("style.json")) {
    url.pathname = url.pathname.replace(/\/?$/, "/style.json")
  }

  return url.toString()
}

export function resolveMapSatelliteStyleUrl(
  mapStyleUrl: string | undefined,
  satelliteStyleUrl: string | undefined,
  mapTilerHost: string | undefined,
  mapApiKey: string | undefined,
): string | null {
  if (satelliteStyleUrl?.trim()) {
    return resolveMapStyleUrl(satelliteStyleUrl, mapTilerHost)
  }

  const host = mapTilerHost?.trim()
  const key = mapApiKey?.trim()
  if (!host || !key) return null

  const mapUrl = parseUrl(mapStyleUrl)
  if (mapUrl && mapUrl.hostname !== host) return null

  const encodedKey = encodeURIComponent(key)
  return `https://${host}/maps/${MAPTILER_SATELLITE_MAP_ID}/style.json?key=${encodedKey}`
}
