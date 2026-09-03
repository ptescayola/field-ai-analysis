import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type {
  LoadedPrompt,
  PromptRepository,
} from "../../domain/ports/agent.port.js";

export class FilePromptRepository implements PromptRepository {
  constructor(private readonly agentsDir: string) {}

  async getAllVersions(): Promise<Record<string, string>> {
    const raw = await readFile(
      join(this.agentsDir, "manifest.json"),
      "utf-8"
    );
    return JSON.parse(raw) as Record<string, string>;
  }

  async getPrompt(agentName: string): Promise<LoadedPrompt> {
    const [content, manifest] = await Promise.all([
      readFile(join(this.agentsDir, `${agentName}.md`), "utf-8"),
      this.getAllVersions(),
    ]);

    const version = manifest[agentName];
    if (!version) {
      throw new Error(
        `Missing prompt version for agent "${agentName}" in agents/manifest.json`
      );
    }

    return { content, version };
  }
}
