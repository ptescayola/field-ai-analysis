<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { fetchWeather } from "../api/client";
import WeatherIcon from "./WeatherIcon.vue";
import type { FieldData, WeatherForecast } from "../types";

const props = defineProps<{
  field: FieldData;
}>();

const forecast = ref<WeatherForecast | null>(null);
const loadingForecast = ref(false);
const forecastError = ref<string | null>(null);

const rainNext7Days = computed(() => {
  if (!forecast.value) return null;
  const total = forecast.value.days.reduce((sum, day) => sum + day.rain_mm, 0);
  return Math.round(total * 10) / 10;
});

function formatGrowthStage(stage: string): string {
  return stage.replaceAll("_", " ");
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${date}T12:00:00`));
}

async function loadForecast(): Promise<void> {
  const { lat, lng } = props.field.field.location;
  loadingForecast.value = true;
  forecastError.value = null;
  forecast.value = null;

  try {
    forecast.value = await fetchWeather(lat, lng);
  } catch (error) {
    forecastError.value =
      error instanceof Error ? error.message : "Failed to load weather forecast";
  } finally {
    loadingForecast.value = false;
  }
}

watch(
  () => [props.field.field.location.lat, props.field.field.location.lng] as const,
  () => {
    void loadForecast();
  },
  { immediate: true }
);
</script>

<template>
  <section class="panel">
    <h2>Field data</h2>
    <div class="grid">
      <div class="stat">
        <span class="label">Crop</span>
        <strong>{{ field.crop.type }} · {{ field.crop.variety }}</strong>
        <span class="sub">{{ formatGrowthStage(field.crop.growth_stage) }}</span>
      </div>
      <div class="stat">
        <span class="label">Area</span>
        <strong>{{ field.field.area_hectares }} ha</strong>
      </div>
      <div class="stat">
        <span class="label">Soil moisture</span>
        <strong>{{ field.soil.moisture_percent }}%</strong>
      </div>
      <div class="stat">
        <span class="label">NDVI</span>
        <strong>{{ field.vegetation.ndvi }}</strong>
        <span class="sub">prev. {{ field.vegetation.ndvi_previous_week }}</span>
      </div>
      <div class="stat">
        <span class="label">Temperature</span>
        <strong>{{ field.weather.temperature_c }}°C</strong>
        <span class="sub">field snapshot</span>
      </div>
      <div class="stat">
        <span class="label">Rain (7 days)</span>
        <strong v-if="rainNext7Days !== null">{{ rainNext7Days }} mm</strong>
        <strong v-else>{{ field.weather.rain_last_7_days_mm }} mm</strong>
        <span v-if="rainNext7Days !== null" class="sub">live forecast</span>
        <span v-else class="sub">field snapshot</span>
      </div>
    </div>

    <div class="forecast">
      <div class="forecast-header">
        <h3>7-day forecast</h3>
        <span v-if="forecast" class="source">
          {{ field.field.location.lat.toFixed(2) }}°,
          {{ field.field.location.lng.toFixed(2) }}° · Open-Meteo
        </span>
      </div>

      <p v-if="loadingForecast" class="forecast-state">Loading live weather…</p>
      <p v-else-if="forecastError" class="forecast-state error">
        {{ forecastError }}
      </p>
      <ul v-else-if="forecast" class="forecast-days">
        <li v-for="day in forecast.days" :key="day.date" class="forecast-day">
          <WeatherIcon :weather-code="day.weather_code" :rain-mm="day.rain_mm" />
          <span class="forecast-date">{{ formatDate(day.date) }}</span>
          <span class="forecast-metrics">{{ day.rain_mm }} mm · {{ day.max_temperature_c }}°C</span>
        </li>
      </ul>
    </div>

    <div v-if="field.observations.length" class="farmer-notes">
      <div class="farmer-notes-header">
        <h3>Notes</h3>
        <span class="source">Field observations from the grower</span>
      </div>
      <ul class="farmer-notes-list">
        <li v-for="(note, i) in field.observations" :key="i" class="farmer-note">
          {{ note }}
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem 1.5rem;
  box-shadow: var(--shadow);
}

h2 {
  margin: 0 0 1rem;
  font-size: 1.25rem;
}

h3 {
  margin: 0;
  font-size: 1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
}

.stat {
  background: var(--surface-muted);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

.stat strong {
  font-size: 1.05rem;
}

.sub {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.forecast {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.forecast-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
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

.forecast-days,
.farmer-notes-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.forecast-days {
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

.farmer-notes {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.farmer-notes-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.farmer-notes-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.farmer-note {
  font-size: 0.9rem;
  color: var(--text);
  padding: 0.65rem 0.85rem;
  background: var(--surface-muted);
  border-radius: 8px;
  border-left: 3px solid var(--green-light);
  line-height: 1.4;
}
</style>
