import {
  errorResponse,
  handleOptions,
  jsonResponse,
  type VercelRequest,
  type VercelResponse,
} from "./_lib.js";

export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (handleOptions(req, res)) return;

  if (req.method !== "GET") {
    errorResponse(req, res, "Method not allowed", 405);
    return;
  }

  jsonResponse(req, res, { status: "ok" });
}
