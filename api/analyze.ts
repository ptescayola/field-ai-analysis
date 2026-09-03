import {
  errorResponse,
  getApplication,
  handleOptions,
  isValidFieldFile,
  jsonResponse,
} from "./_lib.js";

export const config = {
  maxDuration: 60,
};

export default async function handler(request: Request): Promise<Response> {
  const options = handleOptions(request);
  if (options) return options;

  if (request.method !== "POST") {
    return errorResponse(request, "Method not allowed", 405);
  }

  let file = "field-001.json";
  try {
    const body = (await request.json()) as { file?: string };
    if (body.file) file = body.file;
  } catch {
    return errorResponse(request, "Invalid JSON body", 400);
  }

  if (!isValidFieldFile(file)) {
    return errorResponse(request, "Invalid field", 400);
  }

  try {
    const result = await getApplication().analyzeField.execute(file);
    return jsonResponse(request, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    return errorResponse(request, message, 500);
  }
}
