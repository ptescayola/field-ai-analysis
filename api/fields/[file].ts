import {
  errorResponse,
  getApplication,
  handleOptions,
  isValidFieldFile,
  jsonResponse,
} from "../_lib.js";

export default async function handler(request: Request): Promise<Response> {
  const options = handleOptions(request);
  if (options) return options;

  if (request.method !== "GET") {
    return errorResponse(request, "Method not allowed", 405);
  }

  const url = new URL(request.url);
  const file = decodeURIComponent(url.pathname.split("/").pop() ?? "");

  if (!isValidFieldFile(file)) {
    return errorResponse(request, "Invalid field", 400);
  }

  try {
    const field = await getApplication().getField.execute(file);
    return jsonResponse(request, field);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Field not found";
    return errorResponse(request, message, 404);
  }
}
