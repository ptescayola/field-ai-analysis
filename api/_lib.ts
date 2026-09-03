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

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin");
  const allowed = getAllowedOrigins();
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (origin && allowed.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

export function jsonResponse(
  request: Request,
  data: unknown,
  status = 200
): Response {
  return Response.json(data, {
    status,
    headers: corsHeaders(request),
  });
}

export function errorResponse(
  request: Request,
  message: string,
  status: number
): Response {
  return jsonResponse(request, { error: message }, status);
}

export function handleOptions(request: Request): Response | null {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }
  return null;
}
