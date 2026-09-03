import type { ZodType } from "zod";
import type { AgentTrace } from "../pipeline/pipeline.schema.js";

export interface LoadedPrompt {
  content: string;
  version: string;
}

export interface PromptRepository {
  getPrompt(agentName: string): Promise<LoadedPrompt>;
  getAllVersions(): Promise<Record<string, string>>;
}

export interface AgentRunResult<T> {
  output: T;
  trace: AgentTrace;
}

export interface AgentRunParams<T> {
  agentName: string;
  input: unknown;
  outputSchema: ZodType<T>;
  responseName: string;
}

export interface AgentPort {
  run<T>(params: AgentRunParams<T>): Promise<AgentRunResult<T>>;
}
