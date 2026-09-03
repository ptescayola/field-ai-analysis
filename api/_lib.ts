import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApplication, type Application } from "../backend/composition-root.js";
import {
  getAllowedOrigins,
  getErrorMessage,
  isValidFieldFile,
  parseCoordinates,
} from "../backend/presentation/http/request-utils.js";

let application: Application | undefined;

export function getApplication(): Application {
  application ??= createApplication();
  return application;
}

function applyCors(req: VercelRequest, res: VercelResponse): void {
  const origin = req.headers.origin;
  const allowed = getAllowedOrigins();

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (typeof origin === "string" && allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
}

export function jsonResponse(
  req: VercelRequest,
  res: VercelResponse,
  data: unknown,
  status = 200
): void {
  applyCors(req, res);
  res.status(status).json(data);
}

export function errorResponse(
  req: VercelRequest,
  res: VercelResponse,
  message: string,
  status: number
): void {
  jsonResponse(req, res, { error: message }, status);
}

export function handleOptions(
  req: VercelRequest,
  res: VercelResponse
): boolean {
  if (req.method === "OPTIONS") {
    applyCors(req, res);
    res.status(204).end();
    return true;
  }
  return false;
}

export type { VercelRequest, VercelResponse };
export {
  getErrorMessage,
  isValidFieldFile,
  parseCoordinates,
};
