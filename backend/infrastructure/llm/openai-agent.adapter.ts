import { zodResponseFormat } from "openai/helpers/zod"
import type {
  AgentPort,
  AgentRunParams,
  AgentRunResult,
  PromptRepository,
} from "../../domain/ports/agent.port.js"
import { getModel, getOpenAIClient } from "./openai.client.js"
import { validateAgentOutput } from "./validate-output.js"

export class OpenAIAgentAdapter implements AgentPort {
  constructor(private readonly promptRepository: PromptRepository) {}

  async run<T>(params: AgentRunParams<T>): Promise<AgentRunResult<T>> {
    const { agentName, input, outputSchema, responseName } = params
    const systemPrompt = await this.promptRepository.getPrompt(agentName)
    const client = getOpenAIClient()
    const model = getModel()

    const textPrompt = [
      "Analyze the following input.",
      "Return structured JSON only. No markdown or text outside the JSON object.",
      JSON.stringify(input, null, 2),
    ].join("\n")

    const userContent = params.image
      ? [
          { type: "text" as const, text: textPrompt },
          {
            type: "image_url" as const,
            image_url: {
              url: `data:${params.image.mimeType};base64,${params.image.base64}`,
            },
          },
        ]
      : textPrompt

    const completion = await client.chat.completions.parse({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: zodResponseFormat(outputSchema, responseName),
    })

    const parsed = completion.choices[0]?.message?.parsed
    if (!parsed) {
      throw new Error(`${agentName} did not return a valid JSON response.`)
    }

    const output = validateAgentOutput(
      outputSchema,
      parsed,
      agentName.replaceAll("-", " "),
    )

    return { output }
  }
}
