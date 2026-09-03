import {
  errorResponse,
  getApplication,
  getErrorMessage,
  handleOptions,
  jsonResponse,
  parseCoordinates,
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

  const coordinates = parseCoordinates(
    typeof req.query.lat === "string" ? req.query.lat : undefined,
    typeof req.query.lng === "string" ? req.query.lng : undefined
  );
  if (!coordinates) {
    errorResponse(req, res, "Invalid coordinates", 400);
    return;
  }

  try {
    const forecast = await getApplication().getWeatherForecast.execute(
      coordinates.latitude,
      coordinates.longitude
    );
    jsonResponse(req, res, forecast);
  } catch (error) {
    errorResponse(req, res, getErrorMessage(error, "Weather fetch failed"), 502);
  }
}
