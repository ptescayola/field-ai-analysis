import type { WeatherForecast } from "../weather/weather.schema.js";

export interface WeatherForecastPort {
  getForecast(latitude: number, longitude: number): Promise<WeatherForecast>;
}
