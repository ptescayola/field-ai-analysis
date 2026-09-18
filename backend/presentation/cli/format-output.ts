import type { AnalysisOutput } from "../../domain/analysis/analysis.schema.js"
import { formatLabel } from "../../domain/string.js"

function formatRiskList(risks: AnalysisOutput["risks"]): string {
  if (risks.length === 0) {
    return "  None identified"
  }

  return risks
    .map(
      (risk) =>
        `  • ${formatLabel(risk.type)} (${risk.severity})\n    ${risk.evidence}`,
    )
    .join("\n")
}

function formatAgronomist(
  agronomist: AnalysisOutput["agents"]["agronomist"],
): string[] {
  const dose =
    agronomist.irrigation.recommended_mm === null
      ? ""
      : ` — ${agronomist.irrigation.recommended_mm}mm`
  const drivers = agronomist.crop_stress.drivers.join(", ")

  const lines = [
    `  Irrigation: ${formatLabel(agronomist.irrigation.status)}${dose} (${agronomist.irrigation.timing})`,
    `    ${agronomist.irrigation.assessment}`,
    `  Stress: ${formatLabel(agronomist.crop_stress.level)}${drivers ? ` — ${drivers}` : ""}`,
    `  Development: ${formatLabel(agronomist.crop_development.stage_assessment)}`,
    `  Health: ${formatLabel(agronomist.plant_health.rating)}`,
  ]

  if (agronomist.actions.length > 0) {
    lines.push(
      "",
      "  Actions",
      ...agronomist.actions.map(
        (action) =>
          `    • [${action.priority}] ${action.action} (${action.window})\n      ${action.rationale}`,
      ),
    )
  }

  if (agronomist.data_gaps.length > 0) {
    lines.push(
      "",
      "  Data gaps",
      ...agronomist.data_gaps.map((gap) => `    • ${gap}`),
    )
  }

  return lines
}

export function formatAnalysis(analysis: AnalysisOutput): string {
  const lines = [
    "Field AI Analysis",
    "=================",
    "",
    `Field: ${analysis.field_name} (${analysis.field_id})`,
    `Field health: ${Math.round(analysis.field_health_score)}%` +
      (analysis.recommendation_health_uplift_pct > 0
        ? ` (+${analysis.recommendation_health_uplift_pct}% est. if recommendation followed)`
        : ""),
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
    "Observations — Data Analyst",
    "----------------------------",
    ...analysis.agents.data_analyst.observations.map(
      (item) => `  • ${item.metric}: ${item.value} (${item.assessment})`,
    ),
    "",
    "Interpretation — Agronomist",
    "---------------------------",
    ...formatAgronomist(analysis.agents.agronomist),
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
