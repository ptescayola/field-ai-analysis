export { isValidFieldFile } from "../../domain/field/field-file.js";

const LOCAL_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
] as const;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export function parseCoordinates(
  latitude: string | undefined,
  longitude: string | undefined
): Coordinates | null {
  if (latitude === undefined || longitude === undefined) return null;

  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);
  const isValid =
    Number.isFinite(parsedLatitude) &&
    Number.isFinite(parsedLongitude) &&
    parsedLatitude >= -90 &&
    parsedLatitude <= 90 &&
    parsedLongitude >= -180 &&
    parsedLongitude <= 180;

  return isValid
    ? { latitude: parsedLatitude, longitude: parsedLongitude }
    : null;
}

export function getAllowedOrigins(
  environment: NodeJS.ProcessEnv = process.env
): string[] {
  const origins = new Set<string>(LOCAL_ORIGINS);

  for (const value of [
    environment.APP_URL,
    environment.ALLOWED_ORIGIN,
    environment.VERCEL_PROJECT_PRODUCTION_URL,
    environment.VERCEL_BRANCH_URL,
    environment.VERCEL_URL,
  ]) {
    if (!value) continue;
    origins.add(value.startsWith("http") ? value : `https://${value}`);
  }

  return [...origins];
}

export function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  return error instanceof Error ? error.message : fallback;
}
