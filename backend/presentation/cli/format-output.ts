import type { AnalysisOutput } from "../../domain/analysis/analysis.schema.js"

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

function formatLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatRiskList(risks: AnalysisOutput["risks"]): string {
  if (risks.length === 0) {
    return "  None identified"
  }

  return risks
    .map(
      (risk) =>
        `  • ${formatLabel(risk.type)} (${risk.severity}, confidence ${formatPercent(risk.confidence)})\n    ${risk.evidence}`,
    )
    .join("\n")
}

export function formatAnalysis(analysis: AnalysisOutput): string {
  const lines = [
    "Field AI Analysis",
    "=================",
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
      (item) => `  • ${item.metric}: ${item.value} (${item.assessment})`,
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
  ]

  return lines.join("\n")
}

export function formatJson(analysis: AnalysisOutput): string {
  return JSON.stringify(analysis, null, 2)
}
