<script setup lang="ts">
import WeatherIcon from "./WeatherIcon.vue";
import { getWeatherDescription } from "../utils/wmo-weather";
import type { WeatherForecast } from "../types";

defineProps<{
  forecast: WeatherForecast | null;
  loading: boolean;
  error: string | null;
  title?: string;
}>();

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${date}T12:00:00`));
}

function formatRain(mm: number): string {
  if (mm === 0) return "0 mm";
  if (mm < 1) return `${mm.toFixed(1)} mm`;
  return `${Math.round(mm)} mm`;
}
</script>

<template>
  <div class="forecast">
    <div class="forecast-header">
      <h3>{{ title ?? "7-day forecast" }}</h3>
    </div>

    <p v-if="loading" class="forecast-state">Loading live weather…</p>
    <p v-else-if="error" class="forecast-state error">{{ error }}</p>
    <ul v-else-if="forecast" class="forecast-strip">
      <li
        v-for="day in forecast.days"
        :key="day.date"
        class="forecast-day"
        :title="getWeatherDescription(day.weather_code)"
      >
        <span class="forecast-date">{{ formatDate(day.date) }}</span>
        <WeatherIcon :weather-code="day.weather_code" size="md" />
        <span class="forecast-stats">
          <span class="forecast-rain">{{ formatRain(day.rain_mm) }}</span>
          <span class="forecast-temp">{{ day.max_temperature_c }}°C</span>
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.forecast-header {
  margin-bottom: 0.65rem;
}

h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.forecast-state {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.forecast-state.error {
  color: var(--red);
}

.forecast-strip {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  align-items: stretch;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.forecast-day {
  flex: 1 1 0;
  min-width: 4.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0.3rem;
  padding: 0.35rem 0.5rem;
  text-align: center;
  border-right: 1px solid var(--border);
}

.forecast-day:last-child {
  border-right: none;
}

.forecast-date {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-muted);
  line-height: 1.2;
  white-space: nowrap;
}

.forecast-stats {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  font-size: 0.78rem;
  line-height: 1.2;
}

.forecast-rain {
  color: #3b82c4;
  font-weight: 500;
}

.forecast-temp {
  color: var(--text);
  font-weight: 600;
}
</style>
