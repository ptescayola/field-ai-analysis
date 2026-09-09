export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export interface ParsedImagePayload {
  base64: string;
  mimeType: AllowedImageMimeType;
  fileName: string;
}

export function parseImagePayload(
  body: unknown
): ParsedImagePayload | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Request body must be a JSON object" };
  }

  const { image, mimeType, fileName } = body as {
    image?: unknown;
    mimeType?: unknown;
    fileName?: unknown;
  };

  if (typeof image !== "string" || image.length === 0) {
    return { error: "Image is required (base64-encoded string)" };
  }

  if (
    typeof mimeType !== "string" ||
    !ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as AllowedImageMimeType)
  ) {
    return { error: "mimeType must be image/jpeg, image/png, or image/webp" };
  }

  const normalized = image.replace(/^data:[^;]+;base64,/, "");
  let decodedBytes: number;
  try {
    decodedBytes = Buffer.from(normalized, "base64").byteLength;
  } catch {
    return { error: "Invalid base64 image data" };
  }

  if (decodedBytes === 0) {
    return { error: "Image data is empty" };
  }

  if (decodedBytes > MAX_IMAGE_BYTES) {
    return { error: "Image exceeds 4 MB limit" };
  }

  if (typeof fileName !== "string" || fileName.trim().length === 0) {
    return { error: "fileName is required (e.g. 39.060664,1.397765.png)" };
  }

  return {
    base64: normalized,
    mimeType: mimeType as AllowedImageMimeType,
    fileName: fileName.trim(),
  };
}
