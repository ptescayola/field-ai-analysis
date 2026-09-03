import { zodResponseFormat } from "openai/helpers/zod";
import type {
  AgentPort,
  AgentRunParams,
  AgentRunResult,
  PromptRepository,
} from "../../domain/ports/agent.port.js";
import type { TokenUsage } from "../../domain/pipeline/pipeline.schema.js";
import { getModel, getOpenAIClient } from "./openai.client.js";
import { validateAgentOutput } from "./validate-output.js";

export class OpenAIAgentAdapter implements AgentPort {
  constructor(private readonly promptRepository: PromptRepository) {}

  async run<T>(params: AgentRunParams<T>): Promise<AgentRunResult<T>> {
    const { agentName, input, outputSchema, responseName } = params;
    const { content: systemPrompt, version: promptVersion } =
      await this.promptRepository.getPrompt(agentName);
    const client = getOpenAIClient();
    const model = getModel();
    const startedAt = performance.now();

    const completion = await client.chat.completions.parse({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            "Analyze the following input.",
            "Return structured JSON only. No markdown or text outside the JSON object.",
            JSON.stringify(input, null, 2),
          ].join("\n"),
        },
      ],
      response_format: zodResponseFormat(outputSchema, responseName),
    });

    const durationMs = Math.round(performance.now() - startedAt);
    const parsed = completion.choices[0]?.message?.parsed;
    if (!parsed) {
      throw new Error(`${agentName} did not return a valid JSON response.`);
    }

    const output = validateAgentOutput(
      outputSchema,
      parsed,
      agentName.replaceAll("-", " ")
    );

    const usage: TokenUsage = {
      prompt_tokens: completion.usage?.prompt_tokens ?? 0,
      completion_tokens: completion.usage?.completion_tokens ?? 0,
      total_tokens: completion.usage?.total_tokens ?? 0,
    };

    return {
      output,
      trace: {
        agent: agentName,
        model,
        prompt_version: promptVersion,
        duration_ms: durationMs,
        usage,
        input,
        output,
      },
    };
  }
}
