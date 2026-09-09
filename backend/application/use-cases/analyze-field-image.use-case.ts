import { imageAnalystOutputSchema } from "../../domain/analysis/image-analyst.schema.js";
import { parseCoordinatesFromFilename } from "../../domain/field/coordinates-from-filename.js";
import type { AgentImageInput, AgentPort, PromptRepository } from "../../domain/ports/agent.port.js";
import type { PipelineResult } from "../../domain/pipeline/pipeline.schema.js";
import {
  mergeImageIntoField,
  synthesizeFieldFromImage,
} from "../services/merge-image-field.service.js";
import { buildPipelineMetrics } from "../services/analysis-metrics.service.js";
import { EnrichFieldWeatherService } from "../services/enrich-field-weather.service.js";
import { FieldAnalysisOrchestrator } from "../services/field-analysis.orchestrator.js";

export class AnalyzeFieldImageUseCase {
  constructor(
    private readonly enrichFieldWeather: EnrichFieldWeatherService,
    private readonly orchestrator: FieldAnalysisOrchestrator,
    private readonly agentPort: AgentPort,
    private readonly promptRepository: PromptRepository
  ) {}

  async execute(
    image: AgentImageInput,
    fileName: string
  ): Promise<PipelineResult> {
    const coordinates = parseCoordinatesFromFilename(fileName);
    if (!coordinates) {
      throw new Error(
        "Invalid image filename. Use lat,lng.ext (e.g. 39.060664,1.397765.png)"
      );
    }

    const pipelineStartedAt = performance.now();

    console.error("Running image analyst (vision)...");
    const imageAnalystRun = await this.agentPort.run({
      agentName: "image-analyst",
      input: {
        context: {
          coordinates,
          file_name: fileName,
        },
      },
      outputSchema: imageAnalystOutputSchema,
      responseName: "image_analyst_output",
      image,
    });

    const baseField = synthesizeFieldFromImage(
      imageAnalystRun.output,
      coordinates
    );
    const mergedField = mergeImageIntoField(baseField, imageAnalystRun.output);

    console.error(
      `Fetching live weather forecast for ${coordinates.latitude}, ${coordinates.longitude}...`
    );
    const enrichedField = await this.enrichFieldWeather.enrich(mergedField);
    const promptVersions = await this.promptRepository.getAllVersions();

    console.error("Running analysis pipeline...");
    const result = await this.orchestrator.run(
      enrichedField,
      promptVersions,
      imageAnalystRun.output
    );

    const traces = [imageAnalystRun.trace, ...result.meta.trace];
    const totalDurationMs = Math.round(performance.now() - pipelineStartedAt);

    return {
      analysis: result.analysis,
      meta: {
        prompt_versions: result.meta.prompt_versions,
        trace: traces,
        metrics: buildPipelineMetrics(traces, totalDurationMs),
      },
    };
  }
}
