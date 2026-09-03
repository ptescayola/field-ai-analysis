import assert from "node:assert/strict";
import { it } from "node:test";
import type { PipelineResult } from "../backend/domain/pipeline/pipeline.schema.js";
import { toAnalysisResponse } from "../backend/presentation/http/analysis-response.js";

it("omits full agent traces from the public analysis response", () => {
  const result = {
    analysis: { field_id: "FIELD-001" },
    meta: {
      prompt_versions: { coordinator: "1.0.0" },
      metrics: {
        total_duration_ms: 100,
        total_tokens: 200,
        estimated_cost_usd: 0.001,
        agents: [],
      },
      trace: [{ input: { private: true }, output: { internal: true } }],
    },
  } as unknown as PipelineResult;

  const response = toAnalysisResponse(result);

  assert.deepEqual(response.analysis, result.analysis);
  assert.deepEqual(response.meta.metrics, result.meta.metrics);
  assert.deepEqual(response.meta.prompt_versions, result.meta.prompt_versions);
  assert.equal("trace" in response.meta, false);
});
