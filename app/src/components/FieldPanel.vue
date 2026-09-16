<script setup lang="ts">
import { computed } from "vue"
import { useWeatherForecast } from "../composables/useWeatherForecast"
import FieldDataTile, {
  type FieldDataTileModel,
} from "./FieldDataTile.vue"
import WeatherForecastView from "./WeatherForecastView.vue"
import { formatShortDate } from "../utils/intl-dates"
import type { FieldData } from "../types"

const props = defineProps<{
  field: FieldData
}>()

const latitude = computed(() => props.field.field.location.lat)
const longitude = computed(() => props.field.field.location.lng)

const { forecast, loading, error, rainNext7Days } = useWeatherForecast(
  latitude,
  longitude,
)

function formatCropName(value: string): string {
  return value.replaceAll("_", " ")
}

const fieldDataTiles = computed((): FieldDataTileModel[] => {
  const field = props.field

  const rainLine =
    rainNext7Days.value !== null
      ? `${rainNext7Days.value} mm rain next 7d`
      : `${field.weather.rain_last_7_days_mm} mm rain last 7d`

  return [
    {
      id: "planted",
      label: "Planted",
      highlight: formatShortDate(field.crop.planting_date),
    },
    {
      id: "crop",
      label: "Crop",
      highlight: formatCropName(field.crop.type),
      footer: [
        formatCropName(field.crop.variety),
        formatCropName(field.crop.growth_stage),
      ],
      capitalizeHighlight: true,
      capitalizeFooter: true,
    },
    {
      id: "area",
      label: "Area",
      highlight: `${field.field.area_hectares} ha`,
    },
    {
      id: "ndvi",
      label: "NDVI",
      highlight: String(field.vegetation.ndvi),
      footer: [`prev. ${field.vegetation.ndvi_previous_week}`],
    },
    {
      id: "weather",
      label: "Weather",
      highlight: `${field.weather.temperature_c}°C`,
      footer: [
        `${field.weather.humidity_percent}% humidity`,
        rainLine,
      ],
    },
    {
      id: "soil",
      label: "Soil",
      highlight: formatCropName(field.soil.type),
      footer: [
        `${field.soil.moisture_percent}% moisture`,
        `${field.soil.temperature_c}°C soil · pH ${field.soil.ph}`,
      ],
      capitalizeHighlight: true,
    },
  ]
})
</script>

<template>
  <section class="panel">
    <h2>Field data</h2>
    <div class="grid">
      <FieldDataTile
        v-for="tile in fieldDataTiles"
        :key="tile.id"
        :label="tile.label"
        :highlight="tile.highlight"
        :footer="tile.footer"
        :capitalize-highlight="tile.capitalizeHighlight"
        :capitalize-footer="tile.capitalizeFooter"
      />
    </div>

    <div class="forecast-section">
      <WeatherForecastView
        :forecast="forecast"
        :loading="loading"
        :error="error"
      />
    </div>

    <div v-if="false && field.observations.length" class="farmer-notes">
      <div class="farmer-notes-header">
        <h3>Notes</h3>
        <span class="source">Field observations from the grower</span>
      </div>
      <ul class="farmer-notes-list">
        <li
          v-for="(note, i) in field.observations"
          :key="i"
          class="farmer-note"
        >
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
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: 0.75rem;
}

.forecast-section {
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--border);
}

.forecast-section :deep(.forecast-strip) {
  margin: 0 -0.25rem;
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
