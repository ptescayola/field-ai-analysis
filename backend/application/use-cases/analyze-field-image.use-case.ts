import { imageAnalystOutputSchema } from "../../domain/analysis/image-analyst.schema.js"
import { parseCoordinatesFromFilename } from "../../domain/field/coordinates-from-filename.js"
import type {
  AgentImageInput,
  AgentPort,
} from "../../domain/ports/agent.port.js"
import type { AnalysisOutput } from "../../domain/analysis/analysis.schema.js"
import {
  mergeImageIntoField,
  synthesizeFieldFromImage,
} from "../services/merge-image-field.service.js"
import { EnrichFieldWeatherService } from "../services/enrich-field-weather.service.js"
import { FieldAnalysisOrchestrator } from "../services/field-analysis.orchestrator.js"

export class AnalyzeFieldImageUseCase {
  constructor(
    private readonly enrichFieldWeather: EnrichFieldWeatherService,
    private readonly orchestrator: FieldAnalysisOrchestrator,
    private readonly agentPort: AgentPort,
  ) {}

  async execute(
    image: AgentImageInput,
    fileName: string,
  ): Promise<AnalysisOutput> {
    const coordinates = parseCoordinatesFromFilename(fileName)
    if (!coordinates) {
      throw new Error(
        "Invalid image filename. Use lat,lng.ext (e.g. 39.060664,1.397765.png)",
      )
    }

    console.error("Running image analyst (vision)...")
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
    })

    const baseField = synthesizeFieldFromImage(
      imageAnalystRun.output,
      coordinates,
    )
    const mergedField = mergeImageIntoField(baseField, imageAnalystRun.output)

    console.error(
      `Fetching live weather forecast for ${coordinates.latitude}, ${coordinates.longitude}...`,
    )
    const enrichedField = await this.enrichFieldWeather.enrich(mergedField)

    console.error("Running analysis pipeline...")
    return this.orchestrator.run(enrichedField, imageAnalystRun.output)
  }
}
