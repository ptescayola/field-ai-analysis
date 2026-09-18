import assert from "node:assert/strict"
import { it } from "node:test"
import type {
  AgentPort,
  AgentRunParams,
  AgentRunResult,
} from "../backend/domain/ports/agent.port.js"
import { fieldSchema } from "../backend/domain/field/field.schema.js"
import { FieldAnalysisOrchestrator } from "../backend/application/services/field-analysis.orchestrator.js"

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
})

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
      },
    ],
  },
  agronomist: {
    irrigation: {
      status: "deficit",
      recommended_mm: 18,
      timing: "Within the next 24h",
      assessment: "Soil moisture sits below the loam comfort range.",
    },
    crop_stress: {
      level: "moderate",
      drivers: ["low soil moisture"],
      assessment: "Fruit development is sensitive to deficit.",
    },
    crop_development: {
      stage_assessment: "on_track",
      assessment: "Canopy matches the expected stage.",
    },
    plant_health: {
      rating: "good",
      assessment: "No disease signs reported.",
    },
    actions: [
      {
        action: "Apply 18 mm of irrigation",
        window: "next 24h",
        priority: "high",
        rationale: "Deficit plus no rain in the forecast.",
      },
    ],
    data_gaps: [],
    reasoning: "Soil moisture is low",
  },
  coordinator: {
    field_health_score: 72,
    recommendation_health_uplift_pct: 10,
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
      },
    ],
  },
}

it("runs independent analysts in parallel and passes their outputs downstream", async () => {
  const calls: AgentRunParams<unknown>[] = []
  let releaseAnalysts!: () => void
  const analystsGate = new Promise<void>((resolve) => {
    releaseAnalysts = resolve
  })

  const agentPort: AgentPort = {
    async run<T>(params: AgentRunParams<T>): Promise<AgentRunResult<T>> {
      calls.push(params as AgentRunParams<unknown>)
      if (
        params.agentName === "data-analyst" ||
        params.agentName === "risk-analyst"
      ) {
        await analystsGate
      }

      return {
        output: outputs[params.agentName] as T,
      }
    },
  }

  const runPromise = new FieldAnalysisOrchestrator(agentPort).run(field)

  await new Promise((resolve) => setImmediate(resolve))
  assert.deepEqual(
    calls.map((call) => call.agentName),
    ["data-analyst", "risk-analyst"],
  )

  releaseAnalysts()
  const result = await runPromise

  assert.deepEqual(
    calls.map((call) => call.agentName),
    ["data-analyst", "risk-analyst", "agronomist", "coordinator"],
  )
  const agronomistInput = calls[2]?.input as {
    data_analyst: unknown
    risk_analyst: unknown
    derived_metrics: { ndvi_trend: string }
  }
  assert.deepEqual(agronomistInput.data_analyst, outputs["data-analyst"])
  assert.deepEqual(agronomistInput.risk_analyst, outputs["risk-analyst"])
  assert.equal(agronomistInput.derived_metrics.ndvi_trend, "falling")
  assert.deepEqual(
    (calls[3]?.input as { agronomist: unknown }).agronomist,
    outputs["agronomist"],
  )
  assert.equal(result.field_id, "FIELD-001")
  assert.equal(result.irrigation.should_irrigate_next_48h, true)
})
