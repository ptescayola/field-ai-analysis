import type { FieldData } from "../../domain/field/field.schema.js";
import type { WeatherForecastPort } from "../../domain/ports/weather.port.js";

export class EnrichFieldWeatherService {
  constructor(private readonly weatherPort: WeatherForecastPort) {}

  async enrich(field: FieldData): Promise<FieldData> {
    const { lat, lng } = field.field.location;

    try {
      const live = await this.weatherPort.getForecast(lat, lng);

      return {
        ...field,
        weather: {
          ...field.weather,
          forecast: live.days.map((day) => ({
            day: day.date,
            rain_mm: day.rain_mm,
            max_temperature_c: day.max_temperature_c,
          })),
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `Live weather unavailable (${message}); using field snapshot forecast`
      );
      return field;
    }
  }
}
