export interface FieldListItem {
  file: string
  id: string
  name: string
}

export interface FieldData {
  field: {
    id: string
    name: string
    location: { lat: number; lng: number }
    area_hectares: number
    boundary?: {
      type: "Polygon"
      coordinates: [number, number][][]
    }
  }
  crop: {
    type: string
    variety: string
    planting_date: string
    growth_stage: string
  }
  soil: {
    type: string
    moisture_percent: number
    temperature_c: number
    ph: number
  }
  weather: {
    temperature_c: number
    humidity_percent: number
    rain_last_7_days_mm: number
    forecast: Array<{
      day: string
      rain_mm: number
      max_temperature_c: number
    }>
  }
  vegetation: {
    ndvi: number
    ndvi_previous_week: number
  }
  observations: string[]
}

export interface ForecastDay {
  date: string
  rain_mm: number
  max_temperature_c: number
  weather_code: number
}

export interface WeatherForecast {
  latitude: number
  longitude: number
  source: "open-meteo"
  days: ForecastDay[]
}

export interface Risk {
  type: string
  severity: "low" | "medium" | "high"
  evidence: string
}

export interface SelectedImage {
  base64: string
  mimeType: string
  previewUrl: string
  fileName: string
  coordinates: {
    latitude: number
    longitude: number
  }
}

export type VegetationType =
  "tree" | "vine" | "shrub" | "herbaceous" | "mixed" | "unknown"

export interface SpeciesCandidate {
  common_name: string
  scientific_name: string | null
  confidence: number
}

export interface ImageAnalystOutput {
  summary: string
  vegetation_type: VegetationType
  species_candidates: SpeciesCandidate[]
  variety_guess: string | null
  crop_detected: { type: string; confidence: number } | null
  growth_stage: string
  visual_observations: Array<{
    category: string
    observation: string
    severity: "low" | "medium" | "high" | null
  }>
  estimated_plant_health: "poor" | "fair" | "good" | "excellent"
  irrigation_signals: string
  limitations: string
}

export type IrrigationStatus = "deficit" | "adequate" | "excess" | "unknown"
export type StressLevel = "none" | "mild" | "moderate" | "severe"
export type StageAssessment = "behind" | "on_track" | "ahead" | "unknown"
export type PlantHealthRating = "poor" | "fair" | "good" | "excellent"

export interface AgronomicAction {
  action: string
  window: string
  priority: "low" | "medium" | "high"
  rationale: string
}

export interface AgronomistOutput {
  irrigation: {
    status: IrrigationStatus
    recommended_mm: number | null
    timing: string
    assessment: string
  }
  crop_stress: {
    level: StressLevel
    drivers: string[]
    assessment: string
  }
  crop_development: {
    stage_assessment: StageAssessment
    assessment: string
  }
  plant_health: {
    rating: PlantHealthRating
    assessment: string
  }
  actions: AgronomicAction[]
  data_gaps: string[]
  reasoning: string
}

export interface AnalysisOutput {
  field_id: string
  field_name: string
  field_health_score: number
  recommendation_health_uplift_pct: number
  main_recommendation: string
  irrigation: {
    should_irrigate_next_48h: boolean
    rationale: string
  }
  risks: Risk[]
  agents: {
    data_analyst: {
      observations: Array<{
        metric: string
        value: string
        assessment: string
      }>
    }
    agronomist: AgronomistOutput
    risk_analyst: { risks: Risk[] }
    image_analyst?: ImageAnalystOutput
  }
}
