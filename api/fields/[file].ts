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
    console.error("Field lookup failed", error);
    errorResponse(req, res, "Field not found", 404);
  }
}
