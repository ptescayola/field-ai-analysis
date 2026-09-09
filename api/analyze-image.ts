import {
  errorResponse,
  getApplication,
  getErrorMessage,
  handleOptions,
  jsonResponse,
  type VercelRequest,
  type VercelResponse,
} from "./_lib.js";
import { toAnalysisResponse } from "../backend/presentation/http/analysis-response.js";
import { parseImagePayload } from "../backend/presentation/http/image-request-utils.js";

export const config = {
  maxDuration: 60,
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    errorResponse(req, res, "Method not allowed", 405);
    return;
  }

  const parsedImage = parseImagePayload(req.body);
  if ("error" in parsedImage) {
    errorResponse(req, res, parsedImage.error, 400);
    return;
  }

  try {
    const result = await getApplication().analyzeFieldImage.execute(
      parsedImage,
      parsedImage.fileName
    );
    jsonResponse(req, res, toAnalysisResponse(result));
  } catch (error) {
    console.error("Image analysis failed", error);
    const message = getErrorMessage(error, "Image analysis failed");
    const status = message.includes("Invalid image filename") ? 400 : 500;
    errorResponse(req, res, message, status);
  }
}
