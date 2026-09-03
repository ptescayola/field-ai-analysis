import {
  errorResponse,
  getApplication,
  handleOptions,
  isValidFieldFile,
  jsonResponse,
  type VercelRequest,
  type VercelResponse,
} from "./_lib.js";

export const config = {
  maxDuration: 60,
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    errorResponse(req, res, "Method not allowed", 405);
    return;
  }

  let file = "field-001.json";
  if (req.body && typeof req.body === "object" && "file" in req.body) {
    file = String((req.body as { file?: string }).file ?? file);
  }

  if (!isValidFieldFile(file)) {
    errorResponse(req, res, "Invalid field", 400);
    return;
  }

  try {
    const result = await getApplication().analyzeField.execute(file);
    jsonResponse(req, res, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    errorResponse(req, res, message, 500);
  }
}
