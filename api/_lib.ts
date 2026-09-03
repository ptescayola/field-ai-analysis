import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApplication, type Application } from "../backend/composition-root.js";

let application: Application | undefined;

export function getApplication(): Application {
  application ??= createApplication();
  return application;
}

export function isValidFieldFile(file: string): boolean {
  return file.endsWith(".json") && !file.includes("..");
}

function getAllowedOrigins(): string[] {
  const origins = new Set<string>([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]);

  for (const value of [
    process.env.APP_URL,
    process.env.ALLOWED_ORIGIN,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_URL,
  ]) {
    if (!value) continue;
    origins.add(value.startsWith("http") ? value : `https://${value}`);
  }

  return [...origins];
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
