import type {
  PipelineMeta,
  PipelineResult,
} from "../../domain/pipeline/pipeline.schema.js";

export interface AnalysisResponse {
  analysis: PipelineResult["analysis"];
  meta: Pick<PipelineMeta, "metrics" | "prompt_versions">;
}

/**
 * Builds the public API response. Full agent inputs and outputs remain internal
 * and are available through the CLI trace workflow only.
 */
export function toAnalysisResponse(result: PipelineResult): AnalysisResponse {
  return {
    analysis: result.analysis,
    meta: {
      metrics: result.meta.metrics,
      prompt_versions: result.meta.prompt_versions,
    },
  };
}
