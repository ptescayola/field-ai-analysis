<script setup lang="ts">
import WeatherIcon from "./WeatherIcon.vue";
import type { WeatherForecast } from "../types";

defineProps<{
  forecast: WeatherForecast | null;
  loading: boolean;
  error: string | null;
  latitude: number;
  longitude: number;
  title?: string;
}>();

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${date}T12:00:00`));
}
</script>

<template>
  <div class="forecast">
    <div class="forecast-header">
      <h3>{{ title ?? "7-day forecast" }}</h3>
      <span v-if="forecast" class="source">
        {{ latitude.toFixed(4) }}°, {{ longitude.toFixed(4) }}° · Open-Meteo
      </span>
    </div>

    <p v-if="loading" class="forecast-state">Loading live weather…</p>
    <p v-else-if="error" class="forecast-state error">{{ error }}</p>
    <ul v-else-if="forecast" class="forecast-days">
      <li v-for="day in forecast.days" :key="day.date" class="forecast-day">
        <WeatherIcon :weather-code="day.weather_code" :rain-mm="day.rain_mm" />
        <span class="forecast-date">{{ formatDate(day.date) }}</span>
        <span class="forecast-metrics">
          {{ day.rain_mm }} mm · {{ day.max_temperature_c }}°C
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.forecast-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

h3 {
  margin: 0;
  font-size: 1rem;
}

.source {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.forecast-state {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.forecast-state.error {
  color: var(--red);
}

.forecast-days {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.forecast-day {
  flex: 1 1 0;
  min-width: 5.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 0.4rem;
  background: var(--surface-muted);
  border-radius: 8px;
  text-align: center;
}

.forecast-date {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  line-height: 1.2;
}

.forecast-metrics {
  font-size: 0.8rem;
  line-height: 1.3;
}
</style>
