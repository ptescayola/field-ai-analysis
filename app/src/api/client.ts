import type {
  FieldData,
  FieldListItem,
  PipelineResult,
  WeatherForecast,
} from "../types";

/** Same-origin relative paths — works in dev (Vite proxy) and prod (Vercel). */
function apiUrl(path: string): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
  if (configured) return `${configured}${path}`;
  return path;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? `Error ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function fetchFields(): Promise<FieldListItem[]> {
  return request<FieldListItem[]>(apiUrl("/api/fields"));
}

export function fetchField(file: string): Promise<FieldData> {
  return request<FieldData>(apiUrl(`/api/fields/${file}`));
}

export function fetchWeather(lat: number, lng: number): Promise<WeatherForecast> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  });
  return request<WeatherForecast>(apiUrl(`/api/weather?${params}`));
}

export function analyzeField(file: string): Promise<PipelineResult> {
  return request<PipelineResult>(apiUrl("/api/analyze"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file }),
  });
}
