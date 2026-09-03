import { errorResponse, getApplication, handleOptions, jsonResponse } from "./_lib.js";

export default async function handler(request: Request): Promise<Response> {
  const options = handleOptions(request);
  if (options) return options;

  if (request.method !== "GET") {
    return errorResponse(request, "Method not allowed", 405);
  }

  try {
    const fields = await getApplication().listFields.execute();
    return jsonResponse(request, fields);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list fields";
    return errorResponse(request, message, 500);
  }
}
