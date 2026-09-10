<script setup lang="ts">
import { computed } from "vue";
import { useWeatherForecast } from "../../composables/useWeatherForecast";
import type { FieldData } from "../../types";

const props = defineProps<{
  field: FieldData;
}>();

const latitude = computed(() => props.field.field.location.lat);
const longitude = computed(() => props.field.field.location.lng);

const { rainNext7Days } = useWeatherForecast(latitude, longitude);

const ndviDelta = computed(
  () => props.field.vegetation.ndvi - props.field.vegetation.ndvi_previous_week,
);

const rain7dMm = computed(
  () => rainNext7Days.value ?? props.field.weather.rain_last_7_days_mm,
);

const rain7dIsLive = computed(() => rainNext7Days.value !== null);

function formatLabel(value: string): string {
  return value.replaceAll("_", " ");
}

function clampPct(value: number, max: number): number {
  return Math.min(100, Math.max(0, (value / max) * 100));
}

function phFillPct(ph: number): number {
  return clampPct(ph - 4, 6);
}

const keyMetrics = computed(() => [
  {
    label: "Air temp",
    value: `${props.field.weather.temperature_c}°C`,
    fillPct: clampPct(props.field.weather.temperature_c, 40),
    tone: "temp",
  },
  {
    label: "Humidity",
    value: `${props.field.weather.humidity_percent}%`,
    fillPct: props.field.weather.humidity_percent,
    tone: "humidity",
  },
  {
    label: "Rain (7d)",
    value: `${rain7dMm.value} mm`,
    fillPct: clampPct(rain7dMm.value, 80),
    tone: "rain",
    sub: rain7dIsLive.value ? "live forecast" : "field snapshot",
  },
  {
    label: "Soil pH",
    value: String(props.field.soil.ph),
    fillPct: phFillPct(props.field.soil.ph),
    tone: "ph",
  },
]);

</script>

<template>
  <section class="snapshot">
    <header class="snapshot-header">
      <div>
        <h3 class="snapshot-title">{{ field.field.name }}</h3>
        <p class="snapshot-meta">
          {{ formatLabel(field.crop.variety) }} ·
          {{ formatLabel(field.crop.growth_stage) }} ·
          {{ field.field.area_hectares }} ha
        </p>
      </div>
      <div class="snapshot-chips">
        <span class="chip">{{ formatLabel(field.crop.type) }}</span>
        <span class="chip">{{ formatLabel(field.soil.type) }}</span>
        <span class="chip">{{ field.field.id }}</span>
      </div>
    </header>

    <div class="key-metrics">
      <div v-for="metric in keyMetrics" :key="metric.label" class="key-metric">
        <div class="key-metric-head">
          <span class="snapshot-label">{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
        </div>
        <div class="key-metric-track">
          <div
            class="key-metric-fill"
            :class="`key-metric-fill--${metric.tone}`"
            :style="{ width: `${metric.fillPct}%` }"
          />
        </div>
        <span v-if="metric.sub" class="key-metric-sub">{{ metric.sub }}</span>
      </div>
    </div>

    <div class="snapshot-grid">
      <div class="snapshot-card">
        <span class="snapshot-label">NDVI trend</span>
        <div class="ndvi-compare">
          <div class="ndvi-bar-wrap">
            <span class="ndvi-bar-label">Prev</span>
            <div class="ndvi-track">
              <div
                class="ndvi-fill ndvi-fill--prev"
                :style="{
                  width: `${field.vegetation.ndvi_previous_week * 100}%`,
                }"
              />
            </div>
            <span class="ndvi-value">{{
              field.vegetation.ndvi_previous_week.toFixed(2)
            }}</span>
          </div>
          <div class="ndvi-bar-wrap">
            <span class="ndvi-bar-label">Now</span>
            <div class="ndvi-track">
              <div
                class="ndvi-fill ndvi-fill--now"
                :style="{ width: `${field.vegetation.ndvi * 100}%` }"
              />
            </div>
            <span class="ndvi-value">{{ field.vegetation.ndvi.toFixed(2) }}</span>
          </div>
        </div>
        <span
          class="ndvi-delta"
          :class="ndviDelta >= 0 ? 'ndvi-delta--up' : 'ndvi-delta--down'"
        >
          {{ ndviDelta >= 0 ? "+" : "" }}{{ ndviDelta.toFixed(2) }} vs last week
        </span>
      </div>

      <div class="snapshot-card snapshot-card--soil">
        <span class="snapshot-label">Soil</span>
        <div class="soil-metrics">
          <div class="soil-metric">
            <div class="soil-metric-label-row">
              <svg class="soil-icon soil-icon--moisture" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 2.5c-3.2 4.5-6 8.2-6 11.8a6 6 0 1 0 12 0c0-3.6-2.8-7.3-6-11.8z"
                  fill="currentColor"
                />
              </svg>
              <span class="soil-metric-label">Moisture</span>
            </div>
            <div class="soil-gauge">
              <div
                class="soil-gauge-fill soil-gauge-fill--moisture"
                :style="{ height: `${field.soil.moisture_percent}%` }"
              />
            </div>
            <strong class="soil-value">{{ field.soil.moisture_percent }}%</strong>
          </div>
          <div class="soil-metric">
            <div class="soil-metric-label-row">
              <svg class="soil-icon soil-icon--temp" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M14 14.5V6a2 2 0 1 0-4 0v8.5a4 4 0 1 0 4 0z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linejoin="round"
                />
                <line
                  x1="12"
                  y1="3"
                  x2="12"
                  y2="5"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                />
              </svg>
              <span class="soil-metric-label">Temp</span>
            </div>
            <div class="soil-gauge">
              <div
                class="soil-gauge-fill soil-gauge-fill--temp"
                :style="{
                  height: `${clampPct(field.soil.temperature_c, 35)}%`,
                }"
              />
            </div>
            <strong class="soil-value">{{ field.soil.temperature_c }}°C</strong>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.snapshot {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.1rem 1.25rem;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.snapshot-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.snapshot-title {
  margin: 0;
  font-size: 1.05rem;
  color: var(--green);
}

.snapshot-meta {
  margin: 0.2rem 0 0;
  font-size: 0.82rem;
  color: var(--text-muted);
  text-transform: capitalize;
}

.snapshot-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.chip {
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: var(--surface-muted);
  border: 1px solid var(--border);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: capitalize;
  color: var(--text-muted);
}

.key-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
}

@media (max-width: 720px) {
  .key-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.key-metric {
  background: var(--surface-muted);
  border-radius: 8px;
  padding: 0.6rem 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.key-metric-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.35rem;
}

.key-metric-head strong {
  font-size: 0.88rem;
  font-variant-numeric: tabular-nums;
}

.key-metric-track {
  height: 0.35rem;
  border-radius: 999px;
  background: var(--border);
  overflow: hidden;
}

.key-metric-fill {
  height: 100%;
  border-radius: inherit;
}

.key-metric-fill--temp {
  background: #e07a5f;
}

.key-metric-fill--humidity {
  background: #3b82c4;
}

.key-metric-fill--rain {
  background: #2563eb;
}

.key-metric-fill--ph {
  background: #8b5e3c;
}

.key-metric-sub {
  font-size: 0.62rem;
  color: var(--text-muted);
}

.snapshot-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

.snapshot-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

@media (max-width: 560px) {
  .snapshot-grid {
    grid-template-columns: 1fr;
  }
}

.snapshot-card {
  background: var(--surface-muted);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.ndvi-compare {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.ndvi-bar-wrap {
  display: grid;
  grid-template-columns: 2.2rem 1fr 2.2rem;
  align-items: center;
  gap: 0.35rem;
}

.ndvi-bar-label {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.ndvi-track {
  height: 0.5rem;
  border-radius: 999px;
  background: var(--border);
  overflow: hidden;
}

.ndvi-fill {
  height: 100%;
  border-radius: inherit;
}

.ndvi-fill--prev {
  background: #94a3b8;
}

.ndvi-fill--now {
  background: var(--green);
}

.ndvi-value {
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.ndvi-delta {
  font-size: 0.75rem;
  font-weight: 600;
}

.ndvi-delta--up {
  color: var(--green);
}

.ndvi-delta--down {
  color: var(--red);
}

.soil-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  align-items: start;
}

.soil-metric {
  display: grid;
  grid-template-rows: auto 4rem auto;
  justify-items: center;
  gap: 0.45rem;
}

.soil-metric-label-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  min-height: 1.1rem;
  width: 100%;
}

.soil-metric-label {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.soil-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.soil-icon--moisture {
  color: #3b82c4;
}

.soil-icon--temp {
  color: #e07a5f;
}

.soil-gauge {
  width: 2.75rem;
  height: 4rem;
  border-radius: 6px;
  background: var(--border);
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.soil-gauge-fill {
  width: 100%;
  border-radius: 0 0 6px 6px;
  min-height: 4%;
  transition: height 0.35s ease;
}

.soil-gauge-fill--moisture {
  background: linear-gradient(to top, #3d5a80, #5b8fd4);
}

.soil-gauge-fill--temp {
  background: linear-gradient(to top, #c45c3e, #e07a5f);
}

.soil-value {
  font-size: 0.95rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  min-height: 1.15rem;
  text-align: center;
}

</style>
