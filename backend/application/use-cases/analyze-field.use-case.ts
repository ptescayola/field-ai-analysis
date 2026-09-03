import type { FieldRepository } from "../../domain/ports/field.repository.js";
import type { PromptRepository } from "../../domain/ports/agent.port.js";
import type { PipelineResult } from "../../domain/pipeline/pipeline.schema.js";
import { EnrichFieldWeatherService } from "../services/enrich-field-weather.service.js";
import { FieldAnalysisOrchestrator } from "../services/field-analysis.orchestrator.js";

export class AnalyzeFieldUseCase {
  constructor(
    private readonly fieldRepository: FieldRepository,
    private readonly enrichFieldWeather: EnrichFieldWeatherService,
    private readonly orchestrator: FieldAnalysisOrchestrator,
    private readonly promptRepository: PromptRepository
  ) {}

  async execute(fileName: string): Promise<PipelineResult> {
    const field = await this.fieldRepository.getByFileName(fileName);

    console.error("Fetching live weather forecast...");
    const enrichedField = await this.enrichFieldWeather.enrich(field);
    const promptVersions = await this.promptRepository.getAllVersions();

    console.error("Running analysis pipeline...");
    return this.orchestrator.run(enrichedField, promptVersions);
  }
}
