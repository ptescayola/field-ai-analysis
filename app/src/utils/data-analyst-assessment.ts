import { formatLabel, normalizeUnderscoreKey } from "./string"

export type AssessmentTone = "low" | "neutral" | "high"

const ASSESSMENT_COPY: Record<string, { label: string; hint: string }> = {
  low: { label: "Low", hint: "Below typical levels for this metric" },
  moderate: { label: "Moderate", hint: "Within a normal range" },
  high: { label: "High", hint: "Above typical levels for this metric" },
  "moderately high": {
    label: "Moderately high",
    hint: "Slightly above normal",
  },
  "moderately low": { label: "Moderately low", hint: "Slightly below normal" },
  normal: { label: "Normal", hint: "Within the expected range" },
  decreasing: {
    label: "Decreasing",
    hint: "Trending downward compared to recent values",
  },
  increasing: {
    label: "Increasing",
    hint: "Trending upward compared to recent values",
  },
  stable: { label: "Stable", hint: "No significant change detected" },
  expected: { label: "Expected", hint: "Matches the forecast for this period" },
  anomalous: {
    label: "Unusual",
    hint: "Outside typical patterns for this field",
  },
}

export function formatAssessment(assessment: string): {
  label: string
  hint: string
} {
  const key = normalizeUnderscoreKey(assessment)
  const copy = ASSESSMENT_COPY[key]
  if (copy) return copy

  return { label: formatLabel(assessment), hint: "Assessment from field data analysis" }
}

export function assessmentTone(assessment: string): AssessmentTone {
  const key = normalizeUnderscoreKey(assessment)
  if (["low", "moderately low", "decreasing"].includes(key)) return "low"
  if (["high", "moderately high", "increasing", "anomalous"].includes(key)) {
    return "high"
  }
  return "neutral"
}

export function getAssessmentDisplay(assessment: string): {
  label: string
  hint: string
  tone: AssessmentTone
} {
  const { label, hint } = formatAssessment(assessment)
  return { label, hint, tone: assessmentTone(assessment) }
}

export type DataAnalystObservation = {
  metric: string
  value: string
  assessment: string
}

function metricKey(metric: string): string {
  return normalizeUnderscoreKey(metric)
}

const TILE_METRIC_CANDIDATES: Record<string, string[]> = {
  "soil-moisture": ["soil_moisture"],
  temperature: ["temperature"],
  humidity: ["humidity"],
  ndvi: ["ndvi", "ndvi trend"],
  rain: ["rain_forecast_next_48h", "rainfall_last_7_days", "rainfall"],
}

export function observationForSnapshotTile(
  tileId: string,
  observations: DataAnalystObservation[],
  options?: { rainPrefersForecast?: boolean },
): DataAnalystObservation | undefined {
  let candidates = TILE_METRIC_CANDIDATES[tileId] ?? []
  if (tileId === "rain" && options?.rainPrefersForecast === false) {
    candidates = ["rainfall_last_7_days", "rainfall", "rain_forecast_next_48h"]
  }

  for (const candidate of candidates) {
    const wanted = metricKey(candidate)
    const hit = observations.find((obs) => metricKey(obs.metric) === wanted)
    if (hit) return hit
  }

  for (const candidate of candidates) {
    const wanted = metricKey(candidate)
    const hit = observations.find(
      (obs) =>
        metricKey(obs.metric).includes(wanted) ||
        wanted.includes(metricKey(obs.metric)),
    )
    if (hit) return hit
  }

  return undefined
}
