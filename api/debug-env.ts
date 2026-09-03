import {
  handleOptions,
  jsonResponse,
  type VercelRequest,
  type VercelResponse,
} from "./_lib.js";

/** Temporary endpoint to verify runtime env vars in Vercel (no secrets exposed). */
export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (handleOptions(req, res)) return;

  if (req.method !== "GET") {
    jsonResponse(req, res, { error: "Method not allowed" }, 405);
    return;
  }

  console.log("debug-env check", {
    VERCEL_ENV: process.env.VERCEL_ENV,
    OPENAI_API_KEY_exists: Boolean(process.env.OPENAI_API_KEY),
    OPENAI_MODEL: process.env.OPENAI_MODEL ?? null,
  });

  jsonResponse(req, res, {
    vercel_env: process.env.VERCEL_ENV ?? null,
    node_env: process.env.NODE_ENV ?? null,
    openai_api_key_exists: Boolean(process.env.OPENAI_API_KEY),
    openai_api_key_prefix: process.env.OPENAI_API_KEY
      ? process.env.OPENAI_API_KEY.slice(0, 7)
      : null,
    openai_model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  });
}
