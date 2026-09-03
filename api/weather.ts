import {
  errorResponse,
  getApplication,
  handleOptions,
  jsonResponse,
  type VercelRequest,
  type VercelResponse,
} from "./_lib.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (handleOptions(req, res)) return;

  if (req.method !== "GET") {
    errorResponse(req, res, "Method not allowed", 405);
    return;
  }

  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    errorResponse(req, res, "Invalid coordinates", 400);
    return;
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    errorResponse(req, res, "Coordinates out of range", 400);
    return;
  }

  try {
    const forecast = await getApplication().getWeatherForecast.execute(lat, lng);
    jsonResponse(req, res, forecast);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Weather fetch failed";
    errorResponse(req, res, message, 502);
  }
}
