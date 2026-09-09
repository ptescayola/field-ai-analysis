import { z } from "zod";

const imageSeveritySchema = z.enum(["low", "medium", "high"]);

export const imageAnalystOutputSchema = z.object({
  summary: z.string(),
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

export type ImageAnalystOutput = z.infer<typeof imageAnalystOutputSchema>;
