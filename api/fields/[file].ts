import {
  errorResponse,
  getApplication,
  handleOptions,
  isValidFieldFile,
  jsonResponse,
  type VercelRequest,
  type VercelResponse,
} from "../_lib.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (handleOptions(req, res)) return;

  if (req.method !== "GET") {
    errorResponse(req, res, "Method not allowed", 405);
    return;
  }

  const file = decodeURIComponent(String(req.query.file ?? ""));

  if (!isValidFieldFile(file)) {
    errorResponse(req, res, "Invalid field", 400);
    return;
  }

  try {
    const field = await getApplication().getField.execute(file);
    jsonResponse(req, res, field);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Field not found";
    errorResponse(req, res, message, 404);
  }
}
