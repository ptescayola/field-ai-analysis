export interface FieldListItem {
  file: string;
  id: string;
  name: string;
}

export interface FieldData {
  field: {
    id: string;
    name: string;
    location: { lat: number; lng: number };
    area_hectares: number;
  };
  crop: {
    type: string;
    variety: string;
    planting_date: string;
    growth_stage: string;
  };
  soil: {
    type: string;
    moisture_percent: number;
    temperature_c: number;
    ph: number;
  };
  weather: {
    temperature_c: number;
    humidity_percent: number;
    rain_last_7_days_mm: number;
    forecast: Array<{
      day: string;
      rain_mm: number;
      max_temperature_c: number;
    }>;
  };
  vegetation: {
    ndvi: number;
    ndvi_previous_week: number;
  };
  observations: string[];
}

export interface ForecastDay {
  date: string;
  rain_mm: number;
  max_temperature_c: number;
  weather_code: number;
}

export interface WeatherForecast {
  latitude: number;
  longitude: number;
  source: "open-meteo";
  days: ForecastDay[];
}

export interface Risk {
  type: string;
  severity: "low" | "medium" | "high";
  evidence: string;
  confidence: number;
}

export interface AnalysisOutput {
  field_id: string;
  field_name: string;
  summary: string;
  field_health_score: number;
  main_recommendation: string;
  irrigation: {
    should_irrigate_next_48h: boolean;
    rationale: string;
  };
  risks: Risk[];
  explanation: string;
  confidence: number;
  agents: {
    data_analyst: {
      observations: Array<{
        metric: string;
        value: string;
        assessment: string;
      }>;
    };
    agronomist: {
      irrigation_assessment: string;
      crop_stress: string;
      crop_development: string;
      plant_health: string;
      reasoning: string;
    };
    risk_analyst: { risks: Risk[] };
  };
}

export interface PipelineResult {
  analysis: AnalysisOutput;
  meta: {
    prompt_versions: Record<string, string>;
    metrics: {
      total_duration_ms: number;
      total_tokens: number;
      estimated_cost_usd: number;
      agents: Array<{
        agent: string;
        duration_ms: number;
        usage: { total_tokens: number };
      }>;
    };
  };
}
