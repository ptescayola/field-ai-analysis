import type { FieldsFeatureCollection } from "../types/fields-geojson"
import type {
  FieldData,
  FieldListItem,
  AnalysisOutput,
  WeatherForecast,
} from "../types"

function apiUrl(path: string): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "")
  if (configured) return `${configured}${path}`
  return path
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(body?.error ?? `Error ${response.status}`)
  }
  return response.json() as Promise<T>
}

export function fetchFields(): Promise<FieldListItem[]> {
  return request<FieldListItem[]>(apiUrl("/api/fields"))
}

export function fetchFieldsGeoJson(): Promise<FieldsFeatureCollection> {
  return request<FieldsFeatureCollection>(apiUrl("/api/fields/geojson"))
}

export function fetchField(file: string): Promise<FieldData> {
  return request<FieldData>(apiUrl(`/api/fields/${file}`))
}

export function fetchWeather(
  lat: number,
  lng: number,
): Promise<WeatherForecast> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  })
  return request<WeatherForecast>(apiUrl(`/api/weather?${params}`))
}

export function analyzeField(file: string): Promise<AnalysisOutput> {
  return request<AnalysisOutput>(apiUrl("/api/analyze"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file }),
  })
}

export function analyzeFieldImage(
  imageBase64: string,
  mimeType: string,
  fileName: string,
): Promise<AnalysisOutput> {
  return request<AnalysisOutput>(apiUrl("/api/analyze-image"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image: imageBase64,
      mimeType,
      fileName,
    }),
  })
}
