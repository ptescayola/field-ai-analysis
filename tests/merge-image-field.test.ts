import assert from "node:assert/strict";
import { it } from "node:test";
import type { ImageAnalystOutput } from "../backend/domain/analysis/image-analyst.schema.js";
import { fieldSchema } from "../backend/domain/field/field.schema.js";
import {
  mergeImageIntoField,
  synthesizeFieldFromImage,
} from "../backend/application/services/merge-image-field.service.js";

const imageAnalysis: ImageAnalystOutput = {
  summary: "Vines show moderate vigor with some leaf yellowing.",
  crop_detected: { type: "grape", confidence: 0.82 },
  growth_stage: "veraison",
  visual_observations: [
    {
      category: "water_stress",
      observation: "Slight leaf curl on outer rows",
      severity: "low" as const,
    },
  ],
  estimated_plant_health: "good",
  irrigation_signals: "No severe wilting observed",
  limitations: "Soil moisture cannot be measured from the image",
};

const field = fieldSchema.parse({
  field: {
    id: "FIELD-001",
    name: "Test field",
    location: { lat: 42.51, lng: -8.81 },
    area_hectares: 6.8,
  },
  crop: {
    type: "grape",
    variety: "albarino",
    planting_date: "2019-03-18",
    growth_stage: "ripening",
  },
  soil: {
    type: "sandy_loam",
    moisture_percent: 67,
    temperature_c: 18.4,
    ph: 5.8,
  },
  weather: {
    temperature_c: 21,
    humidity_percent: 84,
    rain_last_7_days_mm: 36,
    forecast: [],
  },
  vegetation: { ndvi: 0.79, ndvi_previous_week: 0.8 },
  observations: ["Existing farmer note"],
});

it("mergeImageIntoField appends image observations and updates growth stage", () => {
  const merged = mergeImageIntoField(field, imageAnalysis);

  assert.equal(merged.crop.type, "grape");
  assert.equal(merged.crop.growth_stage, "veraison");
  assert.match(merged.observations[0], /Image analysis summary/);
  assert.ok(
    merged.observations.some((item) => item.includes("water stress"))
  );
  assert.ok(merged.observations.includes("Existing farmer note"));
});

it("synthesizeFieldFromImage creates a minimal field snapshot", () => {
  const synthesized = synthesizeFieldFromImage(imageAnalysis, {
    latitude: 39.060664,
    longitude: 1.397765,
  });

  assert.equal(synthesized.field.id, "IMAGE-FIELD");
  assert.equal(synthesized.field.location.lat, 39.060664);
  assert.equal(synthesized.field.location.lng, 1.397765);
  assert.equal(synthesized.crop.type, "grape");
  assert.ok(synthesized.observations.length >= 3);
});
