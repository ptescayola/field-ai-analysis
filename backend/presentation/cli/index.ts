import "dotenv/config";
import { createApplication } from "../../composition-root.js";
import { getModel } from "../../infrastructure/llm/openai.client.js";
import { formatAnalysis, formatJson } from "./format-output.js";

const DEFAULT_FIELD_FILE = "field-001.json";

function parseArgs(argv: string[]): {
  fieldFile: string;
  json: boolean;
  saveTrace: boolean;
} {
  const args = argv.slice(2);
  let fieldFile = DEFAULT_FIELD_FILE;
  let json = false;
  let trace = false;

  for (const arg of args) {
    if (arg === "--json") {
      json = true;
      continue;
    }
    if (arg === "--trace") {
      trace = true;
      continue;
    }
    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }
    fieldFile = arg.endsWith(".json") ? arg : `${arg}.json`;
  }

  return { fieldFile, json, saveTrace: trace };
}

async function main(): Promise<void> {
  const { fieldFile, json, saveTrace: shouldSaveTrace } = parseArgs(
    process.argv
  );

  console.error(`Analyzing field: ${fieldFile}`);
  console.error(`Model: ${getModel()}`);

  const app = createApplication();
  const result = await app.analyzeField.execute(fieldFile);

  if (shouldSaveTrace) {
    const tracePath = await app.traceRepository.save(result);
    console.error(`Trace saved to ${tracePath}`);
  }

  console.log(json ? formatJson(result) : formatAnalysis(result));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exit(1);
});
