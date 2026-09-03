import { z } from "zod";

export const severitySchema = z.enum(["low", "medium", "high"]);

export const riskSchema = z.object({
  type: z.string(),
  severity: severitySchema,
  evidence: z.string(),
  confidence: z.number().min(0).max(1),
});

export const observationSchema = z.object({
  metric: z.string(),
  value: z.string(),
  assessment: z.string(),
});

export const dataAnalystOutputSchema = z.object({
  observations: z.array(observationSchema),
});

export const agronomistOutputSchema = z.object({
  irrigation_assessment: z.string(),
  crop_stress: z.string(),
  crop_development: z.string(),
  plant_health: z.string(),
  reasoning: z.string(),
});

export const riskAnalystOutputSchema = z.object({
  risks: z.array(riskSchema),
});

export const analysisOutputSchema = z.object({
  field_id: z.string(),
  field_name: z.string(),
  summary: z.string(),
  field_health_score: z.number().min(0).max(100),
  main_recommendation: z.string(),
  irrigation: z.object({
    should_irrigate_next_48h: z.boolean(),
    rationale: z.string(),
  }),
  risks: z.array(riskSchema),
  explanation: z.string(),
  confidence: z.number().min(0).max(1),
  agents: z.object({
    data_analyst: dataAnalystOutputSchema,
    agronomist: agronomistOutputSchema,
    risk_analyst: riskAnalystOutputSchema,
  }),
});

export const coordinatorOutputSchema = analysisOutputSchema.omit({
  field_id: true,
  field_name: true,
  agents: true,
});

export type Severity = z.infer<typeof severitySchema>;
export type Risk = z.infer<typeof riskSchema>;
export type Observation = z.infer<typeof observationSchema>;
export type DataAnalystOutput = z.infer<typeof dataAnalystOutputSchema>;
export type AgronomistOutput = z.infer<typeof agronomistOutputSchema>;
export type RiskAnalystOutput = z.infer<typeof riskAnalystOutputSchema>;
export type AnalysisOutput = z.infer<typeof analysisOutputSchema>;
export type CoordinatorOutput = z.infer<typeof coordinatorOutputSchema>;
