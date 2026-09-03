import {
  agronomistOutputSchema,
  analysisOutputSchema,
  coordinatorOutputSchema,
  dataAnalystOutputSchema,
  riskAnalystOutputSchema,
} from "../../domain/analysis/analysis.schema.js";
import type { FieldData } from "../../domain/field/field.schema.js";
import type { AgentPort } from "../../domain/ports/agent.port.js";
import type { PipelineMeta, PipelineResult } from "../../domain/pipeline/pipeline.schema.js";
import { buildPipelineMetrics } from "./analysis-metrics.service.js";

const IRRIGATION_QUESTION =
  "Should I irrigate this field during the next 48 hours?";

export class FieldAnalysisOrchestrator {
  constructor(private readonly agentPort: AgentPort) {}

  async run(
    field: FieldData,
    promptVersions: Record<string, string>
  ): Promise<PipelineResult> {
    const pipelineStartedAt = performance.now();

    console.error("  → Data Analyst + Risk Analyst (parallel)");
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
    ]);

    console.error("  → Agronomist");
    const agronomistRun = await this.agentPort.run({
      agentName: "agronomist",
      input: {
        field_data: field,
        data_analyst: dataAnalystRun.output,
      },
      outputSchema: agronomistOutputSchema,
      responseName: "agronomist_output",
    });

    console.error("  → Coordinator");
    const coordinatorRun = await this.agentPort.run({
      agentName: "coordinator",
      input: {
        field_data: field,
        data_analyst: dataAnalystRun.output,
        agronomist: agronomistRun.output,
        risk_analyst: riskAnalystRun.output,
        question: IRRIGATION_QUESTION,
      },
      outputSchema: coordinatorOutputSchema,
      responseName: "coordinator_output",
    });

    const traces = [
      dataAnalystRun.trace,
      riskAnalystRun.trace,
      agronomistRun.trace,
      coordinatorRun.trace,
    ];

    const analysis = analysisOutputSchema.parse({
      field_id: field.field.id,
      field_name: field.field.name,
      ...coordinatorRun.output,
      agents: {
        data_analyst: dataAnalystRun.output,
        agronomist: agronomistRun.output,
        risk_analyst: riskAnalystRun.output,
      },
    });

    const totalDurationMs = Math.round(performance.now() - pipelineStartedAt);

    const meta: PipelineMeta = {
      prompt_versions: promptVersions,
      trace: traces,
      metrics: buildPipelineMetrics(traces, totalDurationMs),
    };

    return { analysis, meta };
  }
}
