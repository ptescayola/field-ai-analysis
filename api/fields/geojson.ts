import {
  errorResponse,
  getApplication,
  handleOptions,
  jsonResponse,
  type VercelRequest,
  type VercelResponse,
} from "../_lib.js"

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (handleOptions(req, res)) return

  if (req.method !== "GET") {
    errorResponse(req, res, "Method not allowed", 405)
    return
  }

  try {
    const geojson = await getApplication().listFieldsGeoJson.execute()
    jsonResponse(req, res, geojson)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load field map data"
    errorResponse(req, res, message, 500)
  }
}
