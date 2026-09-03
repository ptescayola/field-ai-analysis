export interface AppConfig {
  dataDir: string;
  agentsDir: string;
  tracesDir: string;
}

export function loadConfig(): AppConfig {
  return {
    dataDir: process.env.DATA_DIR ?? "./data",
    agentsDir: process.env.AGENTS_DIR ?? "./agents",
    tracesDir: process.env.TRACES_DIR ?? "./traces",
  };
}
