import { loadConfig } from "./config.js";
import { EnrichFieldWeatherService } from "./application/services/enrich-field-weather.service.js";
import { FieldAnalysisOrchestrator } from "./application/services/field-analysis.orchestrator.js";
import { AnalyzeFieldUseCase } from "./application/use-cases/analyze-field.use-case.js";
import { GetFieldUseCase } from "./application/use-cases/get-field.use-case.js";
import { GetWeatherForecastUseCase } from "./application/use-cases/get-weather-forecast.use-case.js";
import { ListFieldsUseCase } from "./application/use-cases/list-fields.use-case.js";
import { OpenAIAgentAdapter } from "./infrastructure/llm/openai-agent.adapter.js";
import { JsonFieldRepository } from "./infrastructure/persistence/json-field.repository.js";
import { FileTraceRepository } from "./infrastructure/persistence/file-trace.repository.js";
import { FilePromptRepository } from "./infrastructure/prompts/file-prompt.repository.js";
import { OpenMeteoAdapter } from "./infrastructure/weather/open-meteo.adapter.js";

export interface Application {
  analyzeField: AnalyzeFieldUseCase;
  getField: GetFieldUseCase;
  listFields: ListFieldsUseCase;
  getWeatherForecast: GetWeatherForecastUseCase;
  traceRepository: FileTraceRepository;
}

export function createApplication(): Application {
  const config = loadConfig();

  const fieldRepository = new JsonFieldRepository(config.dataDir);
  const weatherPort = new OpenMeteoAdapter();
  const promptRepository = new FilePromptRepository(config.agentsDir);
  const agentPort = new OpenAIAgentAdapter(promptRepository);
  const traceRepository = new FileTraceRepository(config.tracesDir);

  const enrichFieldWeather = new EnrichFieldWeatherService(weatherPort);
  const orchestrator = new FieldAnalysisOrchestrator(agentPort);

  return {
    analyzeField: new AnalyzeFieldUseCase(
      fieldRepository,
      enrichFieldWeather,
      orchestrator,
      promptRepository
    ),
    getField: new GetFieldUseCase(fieldRepository),
    listFields: new ListFieldsUseCase(fieldRepository),
    getWeatherForecast: new GetWeatherForecastUseCase(weatherPort),
    traceRepository,
  };
}
