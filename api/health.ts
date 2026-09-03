import { handleOptions, jsonResponse } from "./_lib.js";

export default async function handler(request: Request): Promise<Response> {
  const options = handleOptions(request);
  if (options) return options;

  return jsonResponse(request, { status: "ok" });
}
