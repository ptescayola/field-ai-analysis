import { join } from "node:path";

export interface AppConfig {
  dataDir: string;
  agentsDir: string;
  tracesDir: string;
}

export function loadConfig(): AppConfig {
  const root = process.cwd();
  return {
    dataDir: process.env.DATA_DIR ?? join(root, "data"),
    agentsDir: process.env.AGENTS_DIR ?? join(root, "agents"),
    tracesDir: process.env.TRACES_DIR ?? join(root, "traces"),
  };
}
