import { z } from "zod";
import type { AnalysisOutput } from "../analysis/analysis.schema.js";

export const tokenUsageSchema = z.object({
  prompt_tokens: z.number().int().nonnegative(),
  completion_tokens: z.number().int().nonnegative(),
  total_tokens: z.number().int().nonnegative(),
});

export const agentTraceSchema = z.object({
  agent: z.string(),
  model: z.string(),
  prompt_version: z.string(),
  duration_ms: z.number().nonnegative(),
  usage: tokenUsageSchema,
  input: z.unknown(),
  output: z.unknown(),
});

export const pipelineMetricsSchema = z.object({
  total_duration_ms: z.number().nonnegative(),
  agents: z.array(
    z.object({
      agent: z.string(),
      duration_ms: z.number().nonnegative(),
      usage: tokenUsageSchema,
    })
  ),
  total_tokens: z.number().int().nonnegative(),
  estimated_cost_usd: z.number().nonnegative(),
});

export const pipelineMetaSchema = z.object({
  prompt_versions: z.record(z.string(), z.string()),
  trace: z.array(agentTraceSchema),
  metrics: pipelineMetricsSchema,
});

export type TokenUsage = z.infer<typeof tokenUsageSchema>;
export type AgentTrace = z.infer<typeof agentTraceSchema>;
export type PipelineMetrics = z.infer<typeof pipelineMetricsSchema>;
export type PipelineMeta = z.infer<typeof pipelineMetaSchema>;

export interface PipelineResult {
  analysis: AnalysisOutput;
  meta: PipelineMeta;
}
