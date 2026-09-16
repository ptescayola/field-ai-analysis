import { readFile } from "node:fs/promises"
import { join } from "node:path"
import type {
  LoadedPrompt,
  PromptRepository,
} from "../../domain/ports/agent.port.js"

export class FilePromptRepository implements PromptRepository {
  constructor(private readonly agentsDir: string) {}

  async getPrompt(agentName: string): Promise<LoadedPrompt> {
    const [content, manifestRaw] = await Promise.all([
      readFile(join(this.agentsDir, `${agentName}.md`), "utf-8"),
      readFile(join(this.agentsDir, "manifest.json"), "utf-8"),
    ])
    const manifest = JSON.parse(manifestRaw) as Record<string, string>

    const version = manifest[agentName]
    if (!version) {
      throw new Error(
        `Missing prompt version for agent "${agentName}" in agents/manifest.json`,
      )
    }

    return { content, version }
  }
}
