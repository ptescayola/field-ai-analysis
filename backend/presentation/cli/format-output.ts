import type { PipelineResult } from "../../domain/pipeline/pipeline.schema.js";

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatRiskList(
  risks: PipelineResult["analysis"]["risks"]
): string {
  if (risks.length === 0) {
    return "  None identified";
  }

  return risks
    .map(
      (risk) =>
        `  • ${formatLabel(risk.type)} (${risk.severity}, confidence ${formatPercent(risk.confidence)})\n    ${risk.evidence}`
    )
    .join("\n");
}

function formatMeta(meta: PipelineResult["meta"]): string[] {
  return [
    "",
    "Metrics",
    "-------",
    `Total duration: ${meta.metrics.total_duration_ms}ms`,
    `Total tokens: ${meta.metrics.total_tokens}`,
    `Estimated cost: $${meta.metrics.estimated_cost_usd.toFixed(6)} USD`,
    ...meta.metrics.agents.map(
      (agent) =>
        `  • ${agent.agent}: ${agent.duration_ms}ms, ${agent.usage.total_tokens} tokens`
    ),
    "",
    "Prompt versions",
    "---------------",
    ...Object.entries(meta.prompt_versions).map(
      ([agent, version]) => `  • ${agent}: ${version}`
    ),
  ];
}

export function formatAnalysis(result: PipelineResult): string {
  const { analysis, meta } = result;

  const lines = [
    "AI Agronomic Copilot",
    "====================",
    "",
    `Field: ${analysis.field_name} (${analysis.field_id})`,
    `Field health: ${analysis.field_health_score}/100`,
    `Confidence: ${formatPercent(analysis.confidence)}`,
    "",
    "Summary",
    "-------",
    analysis.summary,
    "",
    "Irrigate in the next 48h?",
    "-------------------------",
    analysis.irrigation.should_irrigate_next_48h ? "YES" : "NO",
    analysis.irrigation.rationale,
    "",
    "Main recommendation",
    "-------------------",
    analysis.main_recommendation,
    "",
    "Risks",
    "-----",
    formatRiskList(analysis.risks),
    "",
    "Explanation",
    "-----------",
    analysis.explanation,
    "",
    "Observations — Data Analyst",
    "----------------------------",
    ...analysis.agents.data_analyst.observations.map(
      (item) => `  • ${item.metric}: ${item.value} (${item.assessment})`
    ),
    "",
    "Interpretation — Agronomist",
    "---------------------------",
    `  Irrigation: ${analysis.agents.agronomist.irrigation_assessment}`,
    `  Stress: ${analysis.agents.agronomist.crop_stress}`,
    `  Development: ${analysis.agents.agronomist.crop_development}`,
    `  Health: ${analysis.agents.agronomist.plant_health}`,
    "",
    "Risks — Risk Analyst",
    "--------------------",
    formatRiskList(analysis.agents.risk_analyst.risks),
    ...formatMeta(meta),
  ];

  return lines.join("\n");
}

export function formatJson(result: PipelineResult): string {
  return JSON.stringify(result, null, 2);
}
