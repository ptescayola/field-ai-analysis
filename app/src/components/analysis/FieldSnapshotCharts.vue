<script setup lang="ts">
import { computed } from "vue"
import { useWeatherForecast } from "../../composables/useWeatherForecast"
import type { FieldData } from "../../types"

type KeyMetric = {
  label: string
  value: string
  fillPct: number
  tone: "moisture" | "rain" | "vegetation" | "temp"
  sub: string
  subTone?: "up" | "down"
}

const props = defineProps<{
  field: FieldData
}>()

const latitude = computed(() => props.field.field.location.lat)
const longitude = computed(() => props.field.field.location.lng)

const { rainNext7Days, maxTempNext7Days } = useWeatherForecast(
  latitude,
  longitude,
)

const ndviDelta = computed(
  () => props.field.vegetation.ndvi - props.field.vegetation.ndvi_previous_week,
)

const ndviTrendNote = computed(() => {
  const delta = ndviDelta.value
  const abs = Math.abs(delta)
  if (abs < 0.02) {
    return "Canopy greenness is steady compared with last week."
  }
  if (delta > 0) {
    return "Greener than last week—more leaf cover or biomass."
  }
  return "Slightly less green than last week—watch for stress or crop stage changes."
})

const rainLast7dMm = computed(() => props.field.weather.rain_last_7_days_mm)

function formatLabel(value: string): string {
  return value.replaceAll("_", " ")
}

function clampPct(value: number, max: number): number {
  return Math.min(100, Math.max(0, (value / max) * 100))
}

function soilMoistureStatus(percent: number): string {
  if (percent < 25) return "Dry — consider irrigation"
  if (percent < 45) return "Moderate moisture"
  if (percent <= 75) return "Adequate for most crops"
  return "High — watch drainage"
}

const ndviDeltaLabel = computed(() => {
  const d = ndviDelta.value
  const sign = d >= 0 ? "+" : ""
  return `${sign}${d.toFixed(2)} vs last week`
})

const keyMetrics = computed((): KeyMetric[] => {
  const rainNext =
    rainNext7Days.value ?? props.field.weather.rain_last_7_days_mm
  const rainSub =
    rainNext7Days.value !== null
      ? `Last 7d: ${rainLast7dMm.value} mm · live forecast`
      : "Last 7d · field snapshot"

  const heatValue =
    maxTempNext7Days.value !== null
      ? `${maxTempNext7Days.value}°C`
      : `${props.field.weather.temperature_c}°C`
  const heatSub =
    maxTempNext7Days.value !== null
      ? `Peak next 7d · air now ${props.field.weather.temperature_c}°C`
      : `Air snapshot · soil ${props.field.soil.temperature_c}°C`

  return [
    {
      label: "Soil moisture",
      value: `${props.field.soil.moisture_percent}%`,
      fillPct: props.field.soil.moisture_percent,
      tone: "moisture",
      sub: soilMoistureStatus(props.field.soil.moisture_percent),
    },
    {
      label: rainNext7Days.value !== null ? "Rain next 7d" : "Rain last 7d",
      value: `${rainNext} mm`,
      fillPct: clampPct(rainNext, 80),
      tone: "rain",
      sub: rainSub,
    },
    {
      label: "NDVI",
      value: props.field.vegetation.ndvi.toFixed(2),
      fillPct: clampPct(props.field.vegetation.ndvi, 1),
      tone: "vegetation",
      sub: ndviDeltaLabel.value,
      subTone: ndviDelta.value >= 0 ? "up" : "down",
    },
    {
      label: "Heat",
      value: heatValue,
      fillPct: clampPct(
        maxTempNext7Days.value ?? props.field.weather.temperature_c,
        40,
      ),
      tone: "temp",
      sub: heatSub,
    },
  ]
})
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
        <span class="chip">pH {{ field.soil.ph }}</span>
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
        <span
          v-if="metric.sub"
          class="key-metric-sub"
          :class="
            metric.subTone ? `key-metric-sub--${metric.subTone}` : undefined
          "
        >
          {{ metric.sub }}
        </span>
      </div>
    </div>

    <div class="snapshot-grid">
      <div class="snapshot-card snapshot-card--ndvi">
        <div class="ndvi-card-head">
          <span class="snapshot-label">NDVI trend</span>
          <p class="ndvi-info">
            Normalized Difference Vegetation Index (0–1) from satellite imagery.
            Higher values mean denser green vegetation; bars show last week vs
            now.
          </p>
        </div>
        <div class="ndvi-compare">
          <div class="ndvi-bar-wrap">
            <span class="ndvi-bar-label" title="Previous week">Prev</span>
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
            <span class="ndvi-bar-label" title="Current reading">Now</span>
            <div class="ndvi-track">
              <div
                class="ndvi-fill ndvi-fill--now"
                :style="{ width: `${field.vegetation.ndvi * 100}%` }"
              />
            </div>
            <span class="ndvi-value">{{
              field.vegetation.ndvi.toFixed(2)
            }}</span>
          </div>
        </div>
        <div class="ndvi-foot">
          <span
            class="ndvi-delta"
            :class="ndviDelta >= 0 ? 'ndvi-delta--up' : 'ndvi-delta--down'"
          >
            {{ ndviDelta >= 0 ? "+" : "" }}{{ ndviDelta.toFixed(2) }} vs last
            week
          </span>
          <p class="ndvi-trend-note">{{ ndviTrendNote }}</p>
        </div>
      </div>

      <div class="snapshot-card snapshot-card--context">
        <span class="snapshot-label">Context</span>
        <p class="context-lead">
          Slower-moving or secondary signals for disease pressure and soil
          chemistry.
        </p>
        <dl class="context-metrics">
          <div class="context-metric">
            <dt>Soil temp</dt>
            <dd>{{ field.soil.temperature_c }}°C</dd>
          </div>
          <div class="context-metric">
            <dt>Air humidity</dt>
            <dd>{{ field.weather.humidity_percent }}%</dd>
          </div>
          <div class="context-metric">
            <dt>Soil pH</dt>
            <dd>{{ field.soil.ph }}</dd>
          </div>
        </dl>
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
  background: var(--chart-track);
  overflow: hidden;
}

.key-metric-fill {
  height: 100%;
  border-radius: inherit;
}

.key-metric-fill--temp {
  background: var(--chart-temp);
}

.key-metric-fill--moisture {
  background: var(--chart-water);
}

.key-metric-fill--rain {
  background: var(--chart-water-deep);
}

.key-metric-fill--vegetation {
  background: var(--chart-vegetation);
}

.key-metric-sub {
  font-size: 0.62rem;
  color: var(--text-muted);
  line-height: 1.35;
}

.key-metric-sub--up {
  color: var(--green);
  font-weight: 600;
}

.key-metric-sub--down {
  color: var(--red);
  font-weight: 600;
}

.snapshot-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

.snapshot-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
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

.snapshot-card--context {
  width: max-content;
  max-width: 100%;
  justify-self: end;
}

.ndvi-card-head {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.ndvi-info {
  margin: 0;
  font-size: 0.72rem;
  line-height: 1.45;
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
  background: var(--chart-track);
  overflow: hidden;
}

.ndvi-fill {
  height: 100%;
  border-radius: inherit;
}

.ndvi-fill--prev {
  background: var(--chart-vegetation-muted);
}

.ndvi-fill--now {
  background: var(--chart-vegetation);
}

.ndvi-value {
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.ndvi-foot {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ndvi-delta {
  font-size: 0.75rem;
  font-weight: 600;
}

.ndvi-trend-note {
  margin: 0;
  font-size: 0.72rem;
  line-height: 1.4;
  color: var(--text-muted);
}

.ndvi-delta--up {
  color: var(--green);
}

.ndvi-delta--down {
  color: var(--red);
}

.context-lead {
  margin: 0;
  font-size: 0.72rem;
  line-height: 1.45;
  color: var(--text-muted);
}

.context-metrics {
  margin: 0;
  display: grid;
  gap: 0.45rem;
}

.context-metric {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
}

.context-metric dt {
  margin: 0;
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 600;
}

.context-metric dd {
  margin: 0;
  font-size: 0.88rem;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

@media (max-width: 560px) {
  .snapshot-card--context {
    width: auto;
    justify-self: stretch;
  }
}
</style>
