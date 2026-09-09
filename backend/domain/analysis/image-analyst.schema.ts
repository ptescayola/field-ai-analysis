import { z } from "zod";

const imageSeveritySchema = z.enum(["low", "medium", "high"]);

export const vegetationTypeSchema = z.enum([
  "tree",
  "vine",
  "shrub",
  "herbaceous",
  "mixed",
  "unknown",
]);

export const speciesCandidateSchema = z.object({
  common_name: z.string(),
  scientific_name: z.string().nullable(),
  confidence: z.number().min(0).max(1),
});

export const imageAnalystOutputSchema = z.object({
  summary: z.string(),
  vegetation_type: vegetationTypeSchema,
  species_candidates: z.array(speciesCandidateSchema),
  variety_guess: z.string().nullable(),
  crop_detected: z
    .object({
      type: z.string(),
      confidence: z.number().min(0).max(1),
    })
    .nullable(),
  growth_stage: z.string(),
  visual_observations: z.array(
    z.object({
      category: z.string(),
      observation: z.string(),
      severity: imageSeveritySchema.nullable(),
    })
  ),
  estimated_plant_health: z.enum(["poor", "fair", "good", "excellent"]),
  irrigation_signals: z.string(),
  limitations: z.string(),
});

export type VegetationType = z.infer<typeof vegetationTypeSchema>;
export type SpeciesCandidate = z.infer<typeof speciesCandidateSchema>;
export type ImageAnalystOutput = z.infer<typeof imageAnalystOutputSchema>;
