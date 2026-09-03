import {
  handleOptions,
  jsonResponse,
  type VercelRequest,
  type VercelResponse,
} from "./_lib.js";

export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (handleOptions(req, res)) return;
  jsonResponse(req, res, { status: "ok" });
}
