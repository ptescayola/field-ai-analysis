import { z } from "zod";

export const forecastDaySchema = z.object({
  date: z.string(),
  rain_mm: z.number().min(0),
  max_temperature_c: z.number(),
  weather_code: z.number().int(),
});

export const weatherForecastSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  source: z.literal("open-meteo"),
  days: z.array(forecastDaySchema).length(7),
});

export type ForecastDay = z.infer<typeof forecastDaySchema>;
export type WeatherForecast = z.infer<typeof weatherForecastSchema>;
