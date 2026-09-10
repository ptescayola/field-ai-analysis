import WMO4677Meteocons from "weather-i18n/wmo_4677/icons/meteocons";
import WMO4677I18n from "weather-i18n/wmo_4677/data/i18n/en.json";
import { METEOCONS_ICON_URLS } from "./meteocons-icon-urls";

type WMO4677Code = Parameters<typeof WMO4677Meteocons>[0];
export type DayPhase = NonNullable<Parameters<typeof WMO4677Meteocons>[1]>;

const WEATHER_LABELS = WMO4677I18n as Record<
  string,
  { day: string; night: string }
>;

export const METEOCONS_FALLBACK_SLUG = "not-available";

export function getMeteoconsSlug(
  weatherCode: number,
  dayPhase: DayPhase = "day",
): string {
  return (
    WMO4677Meteocons(weatherCode as WMO4677Code, dayPhase, {
      variant: "flat",
      format: "svg-static",
    }) ?? METEOCONS_FALLBACK_SLUG
  );
}

export function getMeteoconsIconUrl(
  weatherCode: number,
  dayPhase: DayPhase = "day",
): string {
  const slug = getMeteoconsSlug(weatherCode, dayPhase);
  return (
    METEOCONS_ICON_URLS[slug] ??
    METEOCONS_ICON_URLS[METEOCONS_FALLBACK_SLUG]!
  );
}

export function getWeatherDescription(
  weatherCode: number,
  dayPhase: DayPhase = "day",
): string {
  return WEATHER_LABELS[String(weatherCode)]?.[dayPhase] ?? "Unknown";
}
