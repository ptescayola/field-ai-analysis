import type { ImageAnalystOutput } from "../../domain/analysis/image-analyst.schema.js";
import type { ParsedCoordinates } from "../../domain/field/coordinates-from-filename.js";
import type { FieldData } from "../../domain/field/field.schema.js";

function formatObservation(category: string, observation: string): string {
  const label = category.replaceAll("_", " ");
  return `[Image] ${label}: ${observation}`;
}

export function mergeImageIntoField(
  field: FieldData,
  imageAnalysis: ImageAnalystOutput
): FieldData {
  const imageObservations = imageAnalysis.visual_observations.map((item) =>
    formatObservation(item.category, item.observation)
  );

  const mergedObservations = [
    `Image analysis summary: ${imageAnalysis.summary}`,
    `Irrigation signals from image: ${imageAnalysis.irrigation_signals}`,
    ...imageObservations,
    ...field.observations,
  ];

  const cropType =
    imageAnalysis.crop_detected &&
    imageAnalysis.crop_detected.confidence >= 0.5
      ? imageAnalysis.crop_detected.type
      : field.crop.type;

  return {
    ...field,
    crop: {
      ...field.crop,
      type: cropType,
      growth_stage:
        imageAnalysis.growth_stage !== "unknown"
          ? imageAnalysis.growth_stage
          : field.crop.growth_stage,
    },
    observations: mergedObservations,
  };
}

export function synthesizeFieldFromImage(
  imageAnalysis: ImageAnalystOutput,
  coordinates: ParsedCoordinates
): FieldData {
  const imageObservations = imageAnalysis.visual_observations.map((item) =>
    formatObservation(item.category, item.observation)
  );

  return {
    field: {
      id: "IMAGE-FIELD",
      name: `Field at ${coordinates.latitude}, ${coordinates.longitude}`,
      location: {
        lat: coordinates.latitude,
        lng: coordinates.longitude,
      },
      area_hectares: 1,
    },
    crop: {
      type: imageAnalysis.crop_detected?.type ?? "unknown",
      variety: "unknown",
      planting_date: "unknown",
      growth_stage: imageAnalysis.growth_stage,
    },
    soil: {
      type: "unknown",
      moisture_percent: 50,
      temperature_c: 20,
      ph: 6.5,
    },
    weather: {
      temperature_c: 20,
      humidity_percent: 50,
      rain_last_7_days_mm: 0,
      forecast: [],
    },
    vegetation: {
      ndvi: 0.5,
      ndvi_previous_week: 0.5,
    },
    observations: [
      `Image analysis summary: ${imageAnalysis.summary}`,
      `Estimated plant health from image: ${imageAnalysis.estimated_plant_health}`,
      `Irrigation signals from image: ${imageAnalysis.irrigation_signals}`,
      `Image limitations: ${imageAnalysis.limitations}`,
      ...imageObservations,
    ],
  };
}
