import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { PipelineResult } from "../../domain/pipeline/pipeline.schema.js";
import type { TraceRepository } from "../../domain/ports/trace.repository.js";

export class FileTraceRepository implements TraceRepository {
  constructor(private readonly tracesDir: string) {}

  async save(result: PipelineResult): Promise<string> {
    await mkdir(this.tracesDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `${timestamp}-${result.analysis.field_id}.json`;
    const filePath = join(this.tracesDir, fileName);

    await writeFile(filePath, JSON.stringify(result, null, 2), "utf-8");
    return filePath;
  }
}
