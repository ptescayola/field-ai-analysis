import type { AgentTrace, PipelineMetrics, TokenUsage } from "../../domain/pipeline/pipeline.schema.js";

const GPT4O_MINI_INPUT_USD = 0.15;
const GPT4O_MINI_OUTPUT_USD = 0.6;

function estimateCostUsd(usage: TokenUsage): number {
  const input = (usage.prompt_tokens / 1_000_000) * GPT4O_MINI_INPUT_USD;
  const output = (usage.completion_tokens / 1_000_000) * GPT4O_MINI_OUTPUT_USD;
  return Math.round((input + output) * 1_000_000) / 1_000_000;
}

export function buildPipelineMetrics(
  traces: AgentTrace[],
  totalDurationMs: number
): PipelineMetrics {
  const agents = traces.map((trace) => ({
    agent: trace.agent,
    duration_ms: trace.duration_ms,
    usage: trace.usage,
  }));

  const totalTokens = traces.reduce(
    (sum, trace) => sum + trace.usage.total_tokens,
    0
  );

  const estimatedCostUsd = traces.reduce(
    (sum, trace) => sum + estimateCostUsd(trace.usage),
    0
  );

  return {
    total_duration_ms: totalDurationMs,
    agents,
    total_tokens: totalTokens,
    estimated_cost_usd: Math.round(estimatedCostUsd * 1_000_000) / 1_000_000,
  };
}
