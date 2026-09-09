<script setup lang="ts">
import { computed } from "vue";
import { useWeatherForecast } from "../composables/useWeatherForecast";
import CropIcon from "./CropIcon.vue";
import WeatherForecastView from "./WeatherForecastView.vue";
import type { FieldData } from "../types";

const props = defineProps<{
  field: FieldData;
}>();

const latitude = computed(() => props.field.field.location.lat);
const longitude = computed(() => props.field.field.location.lng);

const { forecast, loading, error, rainNext7Days } = useWeatherForecast(
  latitude,
  longitude
);

function formatCropName(value: string): string {
  return value.replaceAll("_", " ");
}
</script>

<template>
  <section class="panel">
    <h2>Field data</h2>
    <div class="grid">
      <div class="stat">
        <span class="label">Crop</span>
        <div class="crop-value">
          <CropIcon :crop="field.crop.type" />
          <strong>{{ formatCropName(field.crop.variety) }}</strong>
        </div>
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

    <div class="forecast-section">
      <WeatherForecastView
        :forecast="forecast"
        :loading="loading"
        :error="error"
        :latitude="latitude"
        :longitude="longitude"
      />
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

.crop-value {
  min-height: 2.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.crop-value strong {
  text-transform: capitalize;
}

.sub {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.forecast-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.source {
  font-size: 0.75rem;
  color: var(--text-muted);
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
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.farmer-note {
  font-size: 0.9rem;
  color: var(--text);
  line-height: 1.4;
}
</style>
