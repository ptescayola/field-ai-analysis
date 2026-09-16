import type { FieldRepository } from "../../domain/ports/field.repository.js"
import type { AnalysisOutput } from "../../domain/analysis/analysis.schema.js"
import { EnrichFieldWeatherService } from "../services/enrich-field-weather.service.js"
import { FieldAnalysisOrchestrator } from "../services/field-analysis.orchestrator.js"

export class AnalyzeFieldUseCase {
  constructor(
    private readonly fieldRepository: FieldRepository,
    private readonly enrichFieldWeather: EnrichFieldWeatherService,
    private readonly orchestrator: FieldAnalysisOrchestrator,
  ) {}

  async execute(fileName: string): Promise<AnalysisOutput> {
    const field = await this.fieldRepository.getByFileName(fileName)

    console.error("Fetching live weather forecast...")
    const enrichedField = await this.enrichFieldWeather.enrich(field)

    console.error("Running analysis pipeline...")
    return this.orchestrator.run(enrichedField)
  }
}
