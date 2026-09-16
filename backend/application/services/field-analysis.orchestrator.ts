import {
  agronomistOutputSchema,
  analysisOutputSchema,
  coordinatorOutputSchema,
  dataAnalystOutputSchema,
  riskAnalystOutputSchema,
} from "../../domain/analysis/analysis.schema.js"
import { deriveFieldMetrics } from "../../domain/field/field-metrics.js"
import type { ImageAnalystOutput } from "../../domain/analysis/image-analyst.schema.js"
import type { FieldData } from "../../domain/field/field.schema.js"
import type { AnalysisOutput } from "../../domain/analysis/analysis.schema.js"
import type { AgentPort } from "../../domain/ports/agent.port.js"
const IRRIGATION_QUESTION =
  "Should I irrigate this field during the next 48 hours?"

export class FieldAnalysisOrchestrator {
  constructor(private readonly agentPort: AgentPort) {}

  async run(
    field: FieldData,
    imageAnalysis?: ImageAnalystOutput,
  ): Promise<AnalysisOutput> {
    const derivedMetrics = deriveFieldMetrics(field)
    const imageInput = imageAnalysis ? { image_analyst: imageAnalysis } : {}

    console.error("  → Data Analyst + Risk Analyst")
    const [dataAnalystRun, riskAnalystRun] = await Promise.all([
      this.agentPort.run({
        agentName: "data-analyst",
        input: { field_data: field },
        outputSchema: dataAnalystOutputSchema,
        responseName: "data_analyst_output",
      }),
      this.agentPort.run({
        agentName: "risk-analyst",
        input: { field_data: field },
        outputSchema: riskAnalystOutputSchema,
        responseName: "risk_analyst_output",
      }),
    ])

    console.error("  → Agronomist")
    const agronomistRun = await this.agentPort.run({
      agentName: "agronomist",
      input: {
        field_data: field,
        derived_metrics: derivedMetrics,
        data_analyst: dataAnalystRun.output,
        risk_analyst: riskAnalystRun.output,
        ...imageInput,
      },
      outputSchema: agronomistOutputSchema,
      responseName: "agronomist_output",
    })

    console.error("  → Coordinator")
    const coordinatorRun = await this.agentPort.run({
      agentName: "coordinator",
      input: {
        field_data: field,
        derived_metrics: derivedMetrics,
        data_analyst: dataAnalystRun.output,
        agronomist: agronomistRun.output,
        risk_analyst: riskAnalystRun.output,
        ...imageInput,
        question: IRRIGATION_QUESTION,
      },
      outputSchema: coordinatorOutputSchema,
      responseName: "coordinator_output",
    })

    return analysisOutputSchema.parse({
      field_id: field.field.id,
      field_name: field.field.name,
      ...coordinatorRun.output,
      agents: {
        data_analyst: dataAnalystRun.output,
        agronomist: agronomistRun.output,
        risk_analyst: riskAnalystRun.output,
        ...imageInput,
      },
    })
  }
}
