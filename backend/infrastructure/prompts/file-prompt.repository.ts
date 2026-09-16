import { readFile } from "node:fs/promises"
import { join } from "node:path"
import type { PromptRepository } from "../../domain/ports/agent.port.js"

export class FilePromptRepository implements PromptRepository {
  constructor(private readonly agentsDir: string) {}

  async getPrompt(agentName: string): Promise<string> {
    return readFile(join(this.agentsDir, `${agentName}.md`), "utf-8")
  }
}
