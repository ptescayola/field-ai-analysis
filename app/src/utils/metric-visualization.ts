export type MetricTone = "low" | "neutral" | "high";

export interface ParsedMetric {
  metric: string;
  label: string;
  displayValue: string;
  numeric: number;
  max: number;
  unit: string;
  fillPct: number;
  tone: MetricTone;
}

const METRIC_LABELS: Record<string, string> = {
  soil_moisture: "Soil moisture",
  temperature: "Temperature",
  humidity: "Humidity",
  rainfall_last_7_days: "Rainfall (7 days)",
  ndvi: "NDVI",
  rain_forecast_next_48h: "Rain forecast (48h)",
};

function metricLabel(metric: string): string {
  const key = metric.trim().toLowerCase();
  return METRIC_LABELS[key] ?? metric.replaceAll("_", " ");
}

function assessmentTone(assessment: string): MetricTone {
  const key = assessment.trim().toLowerCase().replaceAll("_", " ");
  if (["low", "moderately low", "decreasing"].includes(key)) return "low";
  if (["high", "moderately high", "increasing", "anomalous"].includes(key)) {
    return "high";
  }
  return "neutral";
}

function clampPct(value: number, max: number): number {
  return Math.min(100, Math.max(0, (value / max) * 100));
}

export function parseObservationMetric(
  metric: string,
  value: string,
  assessment: string,
): ParsedMetric | null {
  const match = value.match(/([\d.]+)/);
  if (!match) return null;

  const numeric = Number.parseFloat(match[1]);
  if (Number.isNaN(numeric)) return null;

  const key = metric.trim().toLowerCase();
  const tone = assessmentTone(assessment);

  if (key.includes("ndvi")) {
    const ndvi = numeric <= 1 ? numeric : numeric / 100;
    return {
      metric: key,
      label: metricLabel(metric),
      displayValue: ndvi.toFixed(2),
      numeric: ndvi,
      max: 1,
      unit: "",
      fillPct: clampPct(ndvi, 1),
      tone,
    };
  }

  if (key.includes("moisture") || key.includes("humidity")) {
    return {
      metric: key,
      label: metricLabel(metric),
      displayValue: `${numeric}%`,
      numeric,
      max: 100,
      unit: "%",
      fillPct: clampPct(numeric, 100),
      tone,
    };
  }

  if (key.includes("temperature")) {
    return {
      metric: key,
      label: metricLabel(metric),
      displayValue: `${numeric}°C`,
      numeric,
      max: 40,
      unit: "°C",
      fillPct: clampPct(numeric, 40),
      tone,
    };
  }

  if (key.includes("rain")) {
    return {
      metric: key,
      label: metricLabel(metric),
      displayValue: `${numeric} mm`,
      numeric,
      max: 80,
      unit: "mm",
      fillPct: clampPct(numeric, 80),
      tone,
    };
  }

  return {
    metric: key,
    label: metricLabel(metric),
    displayValue: value,
    numeric,
    max: 100,
    unit: "",
    fillPct: clampPct(numeric, 100),
    tone,
  };
}

export function healthScoreTone(score: number): MetricTone {
  if (score >= 75) return "neutral";
  return "high";
}
