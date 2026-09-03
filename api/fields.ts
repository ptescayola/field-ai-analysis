import {
  errorResponse,
  getApplication,
  handleOptions,
  jsonResponse,
  type VercelRequest,
  type VercelResponse,
} from "./_lib.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (handleOptions(req, res)) return;

  if (req.method !== "GET") {
    errorResponse(req, res, "Method not allowed", 405);
    return;
  }

  try {
    const fields = await getApplication().listFields.execute();
    jsonResponse(req, res, fields);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list fields";
    errorResponse(req, res, message, 500);
  }
}
