import { errorResponse, getApplication, handleOptions, jsonResponse } from "./_lib.js";

export default async function handler(request: Request): Promise<Response> {
  const options = handleOptions(request);
  if (options) return options;

  if (request.method !== "GET") {
    return errorResponse(request, "Method not allowed", 405);
  }

  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return errorResponse(request, "Invalid coordinates", 400);
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return errorResponse(request, "Coordinates out of range", 400);
  }

  try {
    const forecast = await getApplication().getWeatherForecast.execute(lat, lng);
    return jsonResponse(request, forecast);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Weather fetch failed";
    return errorResponse(request, message, 502);
  }
}
