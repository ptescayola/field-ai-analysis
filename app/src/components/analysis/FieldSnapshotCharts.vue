<script setup lang="ts">
import { computed } from "vue"
import FieldDataTile, {
  type FieldDataTileModel,
} from "../FieldDataTile.vue"
import { useWeatherForecast } from "../../composables/useWeatherForecast"
import { approxExpectedRainNext7DaysMm } from "../../utils/rain-seasonal-reference"
import {
  formatMoistureRecommendedFooter,
  getSoilMoistureAdequateRange,
} from "../../utils/soil-moisture-targets"
import {
  getAssessmentDisplay,
  observationForSnapshotTile,
  type DataAnalystObservation,
} from "../../utils/data-analyst-assessment"
import type { FieldData } from "../../types"
import type { FieldDataTileAnalyst } from "../FieldDataTile.vue"
import { formatLabel } from "../../utils/string"

const props = defineProps<{
  field: FieldData
  dataAnalystObservations?: DataAnalystObservation[]
}>()

function analystForTile(tileId: string): FieldDataTileAnalyst | undefined {
  const observations = props.dataAnalystObservations
  if (!observations?.length) return undefined

  const match = observationForSnapshotTile(tileId, observations, {
    rainPrefersForecast: rainNext7Days.value !== null,
  })
  if (!match) return undefined

  const display = getAssessmentDisplay(match.assessment)
  return {
    label: display.label,
    tone: display.tone,
    hint: display.hint,
  }
}

const latitude = computed(() => props.field.field.location.lat)
const longitude = computed(() => props.field.field.location.lng)

const { rainNext7Days, maxTempNext7Days } = useWeatherForecast(
  latitude,
  longitude,
)

const ndviDelta = computed(
  () => props.field.vegetation.ndvi - props.field.vegetation.ndvi_previous_week,
)

const ndviDeltaLabel = computed(() => {
  const d = ndviDelta.value
  const sign = d >= 0 ? "+" : ""
  return `${sign}${d.toFixed(2)} vs last week`
})

const snapshotTiles = computed((): FieldDataTileModel[] => {
  const field = props.field
  const moistureRange = getSoilMoistureAdequateRange(field.soil.type)
  const moistureFooter = formatMoistureRecommendedFooter(
    field.soil.moisture_percent,
    moistureRange,
  )

  const rainNext = rainNext7Days.value ?? field.weather.rain_last_7_days_mm
  const rainExpected = approxExpectedRainNext7DaysMm(
    field.field.location.lat,
  )

  const temperatureValue =
    maxTempNext7Days.value !== null
      ? `${maxTempNext7Days.value}°C`
      : `${field.weather.temperature_c}°C`
  const temperatureFooter =
    maxTempNext7Days.value !== null
      ? `Peak next 7d · air now ${field.weather.temperature_c}°C`
      : `Air snapshot · soil ${field.soil.temperature_c}°C`

  return [
    {
      id: "soil-moisture",
      label: "Soil moisture",
      highlight: `${field.soil.moisture_percent}%`,
      footer: [moistureFooter],
      analyst: analystForTile("soil-moisture"),
    },
    {
      id: "temperature",
      label: "Temperature",
      highlight: temperatureValue,
      footer: [temperatureFooter],
      analyst: analystForTile("temperature"),
    },
    {
      id: "humidity",
      label: "Humidity",
      highlight: `${field.weather.humidity_percent}%`,
      footer: ["Relative humidity · air"],
      analyst: analystForTile("humidity"),
    },
    {
      id: "ndvi",
      label: "NDVI",
      highlight: field.vegetation.ndvi.toFixed(2),
      footer: [ndviDeltaLabel.value],
      analyst: analystForTile("ndvi"),
    },
    {
      id: "rain",
      label: rainNext7Days.value !== null ? "Rain next 7d" : "Rain last 7d",
      highlight: `${rainNext} mm`,
      footer: [`Typical this week ~${rainExpected} mm`],
      analyst: analystForTile("rain"),
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
          {{ formatLabel(field.crop.type) }} ·
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

    <div class="snapshot-row">
      <FieldDataTile
        v-for="tile in snapshotTiles"
        :key="tile.id"
        :label="tile.label"
        :highlight="tile.highlight"
        :footer="tile.footer"
        :capitalize-highlight="tile.capitalizeHighlight"
        :capitalize-footer="tile.capitalizeFooter"
        :progress="tile.progress"
        :footer-accents="tile.footerAccents"
        :analyst="tile.analyst"
      />
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

.snapshot-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.65rem;
  align-items: stretch;
}

@media (max-width: 960px) {
  .snapshot-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .snapshot-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 420px) {
  .snapshot-row {
    grid-template-columns: 1fr;
  }
}
</style>
