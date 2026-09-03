import assert from "node:assert/strict";
import { it } from "node:test";
import type {
  AgentPort,
  AgentRunParams,
  AgentRunResult,
} from "../backend/domain/ports/agent.port.js";
import type { AgentTrace } from "../backend/domain/pipeline/pipeline.schema.js";
import { fieldSchema } from "../backend/domain/field/field.schema.js";
import { FieldAnalysisOrchestrator } from "../backend/application/services/field-analysis.orchestrator.js";

const field = fieldSchema.parse({
  field: {
    id: "FIELD-001",
    name: "Test field",
    location: { lat: 39.62, lng: 2.91 },
    area_hectares: 4.2,
  },
  crop: {
    type: "tomato",
    variety: "ramallet",
    planting_date: "2026-04-15",
    growth_stage: "fruit_development",
  },
  soil: {
    type: "loam",
    moisture_percent: 31,
    temperature_c: 24.8,
    ph: 6.7,
  },
  weather: {
    temperature_c: 29,
    humidity_percent: 68,
    rain_last_7_days_mm: 3,
    forecast: [],
  },
  vegetation: { ndvi: 0.72, ndvi_previous_week: 0.76 },
  observations: [],
});

const outputs: Record<string, unknown> = {
  "data-analyst": {
    observations: [
      { metric: "soil_moisture", value: "31%", assessment: "low" },
    ],
  },
  "risk-analyst": {
    risks: [
      {
        type: "water_stress",
        severity: "medium",
        evidence: "Low soil moisture",
        confidence: 0.8,
      },
    ],
  },
  agronomist: {
    irrigation_assessment: "Irrigation is advisable",
    crop_stress: "Moderate",
    crop_development: "On track",
    plant_health: "Generally healthy",
    reasoning: "Soil moisture is low",
  },
  coordinator: {
    summary: "The field needs irrigation.",
    field_health_score: 72,
    main_recommendation: "Irrigate within 24 hours.",
    irrigation: {
      should_irrigate_next_48h: true,
      rationale: "Low soil moisture and little rain expected.",
    },
    risks: [
      {
        type: "water_stress",
        severity: "medium",
        evidence: "Low soil moisture",
        confidence: 0.8,
      },
    ],
    explanation: "The agents agree that water stress is the main concern.",
    confidence: 0.86,
  },
};

function traceFor(agent: string): AgentTrace {
  return {
    agent,
    model: "test-model",
    prompt_version: "1.0.0",
    duration_ms: 10,
    usage: {
      prompt_tokens: 10,
      completion_tokens: 5,
      total_tokens: 15,
    },
    input: {},
    output: outputs[agent],
  };
}

it("runs independent analysts in parallel and passes their outputs downstream", async () => {
  const calls: AgentRunParams<unknown>[] = [];
  let releaseAnalysts!: () => void;
  const analystsGate = new Promise<void>((resolve) => {
    releaseAnalysts = resolve;
  });

  const agentPort: AgentPort = {
    async run<T>(params: AgentRunParams<T>): Promise<AgentRunResult<T>> {
      calls.push(params as AgentRunParams<unknown>);
      if (
        params.agentName === "data-analyst" ||
        params.agentName === "risk-analyst"
      ) {
        await analystsGate;
      }

      return {
        output: outputs[params.agentName] as T,
        trace: traceFor(params.agentName),
      };
    },
  };

  const runPromise = new FieldAnalysisOrchestrator(agentPort).run(field, {
    coordinator: "1.0.0",
  });

  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(
    calls.map((call) => call.agentName),
    ["data-analyst", "risk-analyst"]
  );

  releaseAnalysts();
  const result = await runPromise;

  assert.deepEqual(
    calls.map((call) => call.agentName),
    ["data-analyst", "risk-analyst", "agronomist", "coordinator"]
  );
  assert.deepEqual(
    (calls[2]?.input as { data_analyst: unknown }).data_analyst,
    outputs["data-analyst"]
  );
  assert.deepEqual(
    (calls[3]?.input as { risk_analyst: unknown }).risk_analyst,
    outputs["risk-analyst"]
  );
  assert.equal(result.analysis.field_id, "FIELD-001");
  assert.equal(result.analysis.irrigation.should_irrigate_next_48h, true);
  assert.equal(result.meta.metrics.total_tokens, 60);
  assert.equal(result.meta.trace.length, 4);
});
