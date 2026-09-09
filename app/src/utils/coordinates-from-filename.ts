export interface ParsedCoordinates {
  latitude: number;
  longitude: number;
}

const COORDINATES_FILENAME_PATTERN =
  /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\.(?:jpe?g|png|webp)$/i;

export function parseCoordinatesFromFilename(
  fileName: string
): ParsedCoordinates | null {
  const baseName = fileName.split(/[/\\]/).pop()?.trim() ?? "";
  const match = COORDINATES_FILENAME_PATTERN.exec(baseName);
  if (!match) return null;

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  const isValid =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  return isValid ? { latitude, longitude } : null;
}
