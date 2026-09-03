import type { WeatherForecast } from "../../domain/weather/weather.schema.js";
import type { WeatherForecastPort } from "../../domain/ports/weather.port.js";

export class GetWeatherForecastUseCase {
  constructor(private readonly weatherPort: WeatherForecastPort) {}

  execute(latitude: number, longitude: number): Promise<WeatherForecast> {
    return this.weatherPort.getForecast(latitude, longitude);
  }
}
