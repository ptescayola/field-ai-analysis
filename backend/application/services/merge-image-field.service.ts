import type { ImageAnalystOutput } from "../../domain/analysis/image-analyst.schema.js";
import type { ParsedCoordinates } from "../../domain/field/coordinates-from-filename.js";
import type { FieldData } from "../../domain/field/field.schema.js";

function formatObservation(category: string, observation: string): string {
  const label = category.replaceAll("_", " ");
  return `[Image] ${label}: ${observation}`;
}

function resolveCropType(imageAnalysis: ImageAnalystOutput): string {
  if (
    imageAnalysis.crop_detected &&
    imageAnalysis.crop_detected.confidence >= 0.5
  ) {
    return imageAnalysis.crop_detected.type;
  }

  const topCandidate = imageAnalysis.species_candidates[0];
  if (topCandidate && topCandidate.confidence >= 0.5) {
    return topCandidate.common_name;
  }

  return "unknown";
}

function resolveVariety(imageAnalysis: ImageAnalystOutput): string {
  if (imageAnalysis.variety_guess) return imageAnalysis.variety_guess;
  return "unknown";
}

function buildSpeciesObservations(imageAnalysis: ImageAnalystOutput): string[] {
  const lines: string[] = [
    `Vegetation type from image: ${imageAnalysis.vegetation_type}`,
  ];

  if (imageAnalysis.species_candidates.length > 0) {
    const candidates = imageAnalysis.species_candidates
      .map((candidate) => {
        const scientific = candidate.scientific_name
          ? ` (${candidate.scientific_name})`
          : "";
        return `${candidate.common_name}${scientific} ${Math.round(candidate.confidence * 100)}%`;
      })
      .join("; ");
    lines.push(`Species candidates from image: ${candidates}`);
  }

  if (imageAnalysis.variety_guess) {
    lines.push(`Variety guess from image: ${imageAnalysis.variety_guess}`);
  }

  return lines;
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
    ...buildSpeciesObservations(imageAnalysis),
    `Irrigation signals from image: ${imageAnalysis.irrigation_signals}`,
    ...imageObservations,
    ...field.observations,
  ];

  const cropType = resolveCropType(imageAnalysis);
  const resolvedCropType = cropType !== "unknown" ? cropType : field.crop.type;

  return {
    ...field,
    crop: {
      ...field.crop,
      type: resolvedCropType,
      variety:
        imageAnalysis.variety_guess &&
        imageAnalysis.variety_guess !== "unknown"
          ? imageAnalysis.variety_guess
          : field.crop.variety,
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
      type: resolveCropType(imageAnalysis),
      variety: resolveVariety(imageAnalysis),
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
      ...buildSpeciesObservations(imageAnalysis),
      `Estimated plant health from image: ${imageAnalysis.estimated_plant_health}`,
      `Irrigation signals from image: ${imageAnalysis.irrigation_signals}`,
      `Image limitations: ${imageAnalysis.limitations}`,
      ...imageObservations,
    ],
  };
}
