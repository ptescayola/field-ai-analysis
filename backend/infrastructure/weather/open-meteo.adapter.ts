import {
  weatherForecastSchema,
  type WeatherForecast,
} from "../../domain/weather/weather.schema.js";
import type { WeatherForecastPort } from "../../domain/ports/weather.port.js";
import { z } from "zod";

const openMeteoResponseSchema = z.object({
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: z.array(z.number()),
    precipitation_sum: z.array(z.number()),
    weather_code: z.array(z.number()),
  }),
});

export class OpenMeteoAdapter implements WeatherForecastPort {
  async getForecast(
    latitude: number,
    longitude: number
  ): Promise<WeatherForecast> {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set(
      "daily",
      "temperature_2m_max,precipitation_sum,weather_code"
    );
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "7");

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error (${response.status})`);
    }

    const data = openMeteoResponseSchema.parse(await response.json());
    const { time, temperature_2m_max, precipitation_sum, weather_code } =
      data.daily;

    const days = time.map((date, index) => ({
      date,
      rain_mm: Math.round(precipitation_sum[index] * 10) / 10,
      max_temperature_c: Math.round(temperature_2m_max[index] * 10) / 10,
      weather_code: weather_code[index],
    }));

    return weatherForecastSchema.parse({
      latitude,
      longitude,
      source: "open-meteo",
      days,
    });
  }
}
