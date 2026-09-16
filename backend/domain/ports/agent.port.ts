import type { ZodType } from "zod"

export interface LoadedPrompt {
  content: string
  version: string
}

export interface PromptRepository {
  getPrompt(agentName: string): Promise<LoadedPrompt>
}

export interface AgentRunResult<T> {
  output: T
}

export interface AgentImageInput {
  base64: string
  mimeType: string
}

export interface AgentRunParams<T> {
  agentName: string
  input: unknown
  outputSchema: ZodType<T>
  responseName: string
  image?: AgentImageInput
}

export interface AgentPort {
  run<T>(params: AgentRunParams<T>): Promise<AgentRunResult<T>>
}
