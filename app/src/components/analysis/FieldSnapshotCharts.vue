<script setup lang="ts">
import { computed } from "vue";
import type { FieldData } from "../../types";

const props = defineProps<{
  field: FieldData;
}>();

const ndviDelta = computed(
  () => props.field.vegetation.ndvi - props.field.vegetation.ndvi_previous_week,
);

const forecastDays = computed(() =>
  props.field.weather.forecast.slice(0, 7).map((day) => ({
    label: day.day.slice(0, 3),
    rain: day.rain_mm,
    temp: day.max_temperature_c,
  })),
);

const maxRain = computed(() =>
  Math.max(1, ...forecastDays.value.map((day) => day.rain)),
);
</script>

<template>
  <section class="snapshot">
    <h3 class="snapshot-title">Field snapshot</h3>
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

      <div class="snapshot-card">
        <span class="snapshot-label">Soil moisture</span>
        <div class="soil-gauge">
          <div
            class="soil-gauge-fill"
            :style="{ height: `${field.soil.moisture_percent}%` }"
          />
        </div>
        <strong class="soil-value">{{ field.soil.moisture_percent }}%</strong>
      </div>

      <div v-if="forecastDays.length" class="snapshot-card snapshot-card--wide">
        <span class="snapshot-label">Rain forecast</span>
        <div class="rain-chart">
          <div
            v-for="day in forecastDays"
            :key="day.label"
            class="rain-day"
            :title="`${day.rain} mm · ${day.temp}°C`"
          >
            <div
              class="rain-bar"
              :style="{ height: `${(day.rain / maxRain) * 100}%` }"
            />
            <span class="rain-label">{{ day.label }}</span>
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
}

.snapshot-title {
  margin: 0 0 0.85rem;
  font-size: 1rem;
  color: var(--green);
}

.snapshot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.85rem;
}

.snapshot-card {
  background: var(--surface-muted);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.snapshot-card--wide {
  grid-column: 1 / -1;
}

.snapshot-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
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

.soil-gauge {
  align-self: center;
  width: 2.5rem;
  height: 4.5rem;
  border-radius: 6px;
  background: var(--border);
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.soil-gauge-fill {
  width: 100%;
  background: linear-gradient(to top, #3d5a80, #5b8fd4);
  border-radius: 0 0 6px 6px;
  min-height: 4%;
  transition: height 0.35s ease;
}

.soil-value {
  align-self: center;
  font-size: 1.1rem;
}

.rain-chart {
  display: flex;
  align-items: flex-end;
  gap: 0.35rem;
  height: 4.5rem;
  padding-top: 0.25rem;
}

.rain-day {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
  min-width: 0;
  height: 100%;
}

.rain-bar {
  width: 100%;
  max-width: 1.75rem;
  min-height: 2px;
  border-radius: 3px 3px 0 0;
  background: #3b82c4;
  transition: height 0.35s ease;
}

.rain-label {
  font-size: 0.62rem;
  color: var(--text-muted);
  text-transform: uppercase;
}
</style>
