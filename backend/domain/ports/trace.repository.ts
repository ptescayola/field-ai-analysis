import type { PipelineResult } from "../pipeline/pipeline.schema.js";

export interface TraceRepository {
  save(result: PipelineResult): Promise<string>;
}
