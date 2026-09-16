<script setup lang="ts">
import { computed } from "vue"
import FieldSnapshotCharts from "./analysis/FieldSnapshotCharts.vue"
import MetricBar from "./analysis/MetricBar.vue"
import RiskMeter from "./analysis/RiskMeter.vue"
import ScoreRing from "./analysis/ScoreRing.vue"
import {
  healthScoreTone,
  parseObservationMetric,
} from "../utils/metric-visualization"
import type {
  AnalysisOutput,
  FieldData,
  IrrigationStatus,
  PlantHealthRating,
  Risk,
  StageAssessment,
  StressLevel,
} from "../types"

const props = defineProps<{
  result: AnalysisOutput
  field?: FieldData | null
}>()

function formatRiskType(type: string): string {
  return type
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function severityClass(severity: Risk["severity"]): string {
  return `severity-${severity}`
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

const METRIC_LABELS: Record<string, string> = {
  soil_moisture: "Soil moisture",
  temperature: "Temperature",
  humidity: "Humidity",
  rainfall_last_7_days: "Rainfall (last 7 days)",
  ndvi: "NDVI",
  rain_forecast_next_48h: "Rain forecast (next 48h)",
}

const ASSESSMENT_COPY: Record<string, { label: string; hint: string }> = {
  low: { label: "Low", hint: "Below typical levels for this metric" },
  moderate: { label: "Moderate", hint: "Within a normal range" },
  high: { label: "High", hint: "Above typical levels for this metric" },
  "moderately high": {
    label: "Moderately high",
    hint: "Slightly above normal",
  },
  "moderately low": { label: "Moderately low", hint: "Slightly below normal" },
  normal: { label: "Normal", hint: "Within the expected range" },
  decreasing: {
    label: "Decreasing",
    hint: "Trending downward compared to recent values",
  },
  increasing: {
    label: "Increasing",
    hint: "Trending upward compared to recent values",
  },
  stable: { label: "Stable", hint: "No significant change detected" },
  expected: { label: "Expected", hint: "Matches the forecast for this period" },
  anomalous: {
    label: "Unusual",
    hint: "Outside typical patterns for this field",
  },
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replaceAll("_", " ")
}

function formatMetric(metric: string): string {
  const key = metric.trim().toLowerCase()
  return METRIC_LABELS[key] ?? metric.replaceAll("_", " ")
}

function formatAssessment(assessment: string): { label: string; hint: string } {
  const key = normalizeKey(assessment)
  const copy = ASSESSMENT_COPY[key]
  if (copy) return copy

  const label = assessment
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())

  return { label, hint: "Assessment from field data analysis" }
}

function assessmentTone(assessment: string): string {
  const key = normalizeKey(assessment)
  if (["low", "moderately low", "decreasing"].includes(key)) return "tone-low"
  if (["high", "moderately high", "increasing", "anomalous"].includes(key))
    return "tone-high"
  return "tone-neutral"
}

function getAssessmentCopy(assessment: string): {
  label: string
  hint: string
  tone: string
} {
  const { label, hint } = formatAssessment(assessment)
  return { label, hint, tone: assessmentTone(assessment) }
}

const dataAnalystObservations = computed(() =>
  props.result.agents.data_analyst.observations.map((obs) => ({
    ...obs,
    metricLabel: formatMetric(obs.metric),
    assessmentCopy: getAssessmentCopy(obs.assessment),
    chart: parseObservationMetric(obs.metric, obs.value, obs.assessment),
  })),
)

const chartableObservations = computed(() =>
  dataAnalystObservations.value.filter((obs) => obs.chart !== null),
)

const healthTone = computed(() =>
  healthScoreTone(props.result.field_health_score),
)

const imageAnalyst = computed(() => props.result.agents.image_analyst ?? null)

const IRRIGATION_TONES: Record<IrrigationStatus, string> = {
  deficit: "chip-warn",
  adequate: "chip-good",
  excess: "chip-bad",
  unknown: "chip-muted",
}

const STRESS_TONES: Record<StressLevel, string> = {
  none: "chip-good",
  mild: "chip-muted",
  moderate: "chip-warn",
  severe: "chip-bad",
}

const STAGE_TONES: Record<StageAssessment, string> = {
  behind: "chip-warn",
  on_track: "chip-good",
  ahead: "chip-good",
  unknown: "chip-muted",
}

const HEALTH_TONES: Record<PlantHealthRating, string> = {
  poor: "chip-bad",
  fair: "chip-warn",
  good: "chip-good",
  excellent: "chip-good",
}

const agronomist = computed(() => props.result.agents.agronomist)

type AgronomistFacet = {
  label: string
  value: string
  tone: string
  extra: string | null
  note: string | null
  assessment: string
}

const agronomistFacets = computed((): AgronomistFacet[] => {
  const { irrigation, crop_stress, crop_development, plant_health } =
    agronomist.value

  return [
    {
      label: "Irrigation",
      value: formatRiskType(irrigation.status),
      tone: IRRIGATION_TONES[irrigation.status],
      extra:
        irrigation.recommended_mm === null
          ? null
          : `${irrigation.recommended_mm} mm`,
      note: irrigation.timing,
      assessment: irrigation.assessment,
    },
    {
      label: "Stress",
      value: formatRiskType(crop_stress.level),
      tone: STRESS_TONES[crop_stress.level],
      extra: null,
      note: crop_stress.drivers.join(" · ") || null,
      assessment: crop_stress.assessment,
    },
    {
      label: "Development",
      value: formatRiskType(crop_development.stage_assessment),
      tone: STAGE_TONES[crop_development.stage_assessment],
      extra: null,
      note: null,
      assessment: crop_development.assessment,
    },
    {
      label: "Health",
      value: formatRiskType(plant_health.rating),
      tone: HEALTH_TONES[plant_health.rating],
      extra: null,
      note: null,
      assessment: plant_health.assessment,
    },
  ]
})

function formatCategory(category: string): string {
  return formatRiskType(category)
}

const VEGETATION_LABELS: Record<string, string> = {
  tree: "Tree",
  vine: "Vine",
  shrub: "Shrub",
  herbaceous: "Herbaceous crop",
  mixed: "Mixed vegetation",
  unknown: "Unknown",
}

function formatVegetationType(type: string): string {
  return VEGETATION_LABELS[type] ?? formatRiskType(type)
}
</script>

<template>
  <div class="results">
    <article v-if="imageAnalyst" class="card image-agent image-agent-featured">
      <div class="image-header">
        <h2>Image Analyst</h2>
        <div class="image-kpis">
          <span class="image-kpi">
            {{ formatVegetationType(imageAnalyst.vegetation_type) }}
          </span>
          <span class="image-kpi">{{
            imageAnalyst.estimated_plant_health
          }}</span>
          <span v-if="imageAnalyst.crop_detected" class="image-kpi">
            {{ imageAnalyst.crop_detected.type }}
            {{ formatPercent(imageAnalyst.crop_detected.confidence) }}
          </span>
          <span v-if="imageAnalyst.variety_guess" class="image-kpi">
            {{ imageAnalyst.variety_guess }}
          </span>
        </div>
      </div>

      <p class="image-summary">{{ imageAnalyst.summary }}</p>

      <div class="image-body">
        <section class="image-panel">
          <h3 class="image-panel-title">Identification</h3>
          <dl class="image-facts">
            <div>
              <dt>Growth stage</dt>
              <dd>{{ imageAnalyst.growth_stage }}</dd>
            </div>
            <div>
              <dt>Crop</dt>
              <dd>
                <template v-if="imageAnalyst.crop_detected">
                  {{ imageAnalyst.crop_detected.type }}
                </template>
                <template v-else>Not identifiable</template>
              </dd>
            </div>
          </dl>
          <ul
            v-if="imageAnalyst.species_candidates.length"
            class="species-chips"
          >
            <li
              v-for="(candidate, i) in imageAnalyst.species_candidates"
              :key="i"
              class="species-chip"
              :title="candidate.scientific_name ?? undefined"
            >
              <span class="species-name">{{ candidate.common_name }}</span>
              <span class="species-conf">
                {{ formatPercent(candidate.confidence) }}
              </span>
            </li>
          </ul>
          <p class="image-signal">{{ imageAnalyst.irrigation_signals }}</p>
        </section>

        <section
          v-if="imageAnalyst.visual_observations.length"
          class="image-panel"
        >
          <h3 class="image-panel-title">Visual observations</h3>
          <ul class="image-observations-compact">
            <li v-for="(obs, i) in imageAnalyst.visual_observations" :key="i">
              <span class="obs-label">{{ formatCategory(obs.category) }}</span>
              <span
                v-if="obs.severity"
                :class="['badge', severityClass(obs.severity)]"
              >
                {{ obs.severity }}
              </span>
              <span class="obs-sep" aria-hidden="true">·</span>
              <span class="obs-text">{{ obs.observation }}</span>
            </li>
          </ul>
        </section>
      </div>

      <p class="limitations">{{ imageAnalyst.limitations }}</p>
    </article>

    <section class="dashboard">
      <div
        class="hero"
        :class="
          result.irrigation.should_irrigate_next_48h
            ? 'irrigate-yes'
            : 'irrigate-no'
        "
      >
        <p class="eyebrow">Irrigate in the next 48h?</p>
        <p class="verdict">
          {{ result.irrigation.should_irrigate_next_48h ? "Yes" : "No" }}
        </p>
        <p class="rationale">{{ result.main_recommendation }}</p>
      </div>

      <div class="dashboard-scores">
        <ScoreRing
          label="Field health"
          :value="result.field_health_score"
          suffix="/100"
          :tone="healthTone"
        />
        <ScoreRing
          label="Confidence"
          :value="result.confidence * 100"
          suffix="%"
          tone="neutral"
        />
      </div>
    </section>

    <FieldSnapshotCharts v-if="field" :field="field" />

    <section class="card summary-card">
      <h2>Summary</h2>
      <p class="summary-text">{{ result.summary }}</p>
      <details class="explanation-details">
        <summary>Full explanation</summary>
        <p>{{ result.explanation }}</p>
      </details>
    </section>

    <article class="card agronomist-panel">
      <div class="agronomist-header">
        <h2>Agronomist</h2>
        <span class="conf">
          Confidence {{ formatPercent(agronomist.confidence) }}
        </span>
      </div>

      <div class="facets">
        <div v-for="facet in agronomistFacets" :key="facet.label" class="facet">
          <p class="facet-label">{{ facet.label }}</p>
          <p class="facet-head">
            <span class="chip" :class="facet.tone">{{ facet.value }}</span>
            <span v-if="facet.extra" class="facet-extra">
              {{ facet.extra }}
            </span>
          </p>
          <p v-if="facet.note" class="facet-note">{{ facet.note }}</p>
          <p class="facet-assessment">{{ facet.assessment }}</p>
        </div>
      </div>

      <div v-if="agronomist.actions.length" class="actions">
        <h3 class="panel-title">Recommended actions</h3>
        <ol class="action-list">
          <li v-for="(action, i) in agronomist.actions" :key="i">
            <div class="action-head">
              <span :class="['badge', severityClass(action.priority)]">
                {{ action.priority }}
              </span>
              <span class="action-text">{{ action.action }}</span>
              <span class="action-window">{{ action.window }}</span>
            </div>
            <p class="action-rationale">{{ action.rationale }}</p>
          </li>
        </ol>
      </div>

      <p v-if="agronomist.data_gaps.length" class="data-gaps">
        <span class="data-gaps-label">Missing data</span>
        {{ agronomist.data_gaps.join(" · ") }}
      </p>

      <div class="reasoning-block">
        <h3 class="panel-title">Reasoning</h3>
        <p class="reasoning-text">{{ agronomist.reasoning }}</p>
      </div>
    </article>

    <section class="analysts-row">
      <article class="card analyst-panel">
        <h2>Data Analyst</h2>
        <div v-if="chartableObservations.length" class="metrics-chart">
          <MetricBar
            v-for="(obs, i) in chartableObservations"
            :key="i"
            :metric="obs.chart!"
            :assessment-label="obs.assessmentCopy.label"
          />
        </div>
        <ul v-else class="observations">
          <li v-for="(obs, i) in dataAnalystObservations" :key="i">
            <div class="obs-row">
              <span class="obs-metric">{{ obs.metricLabel }}</span>
              <span class="obs-value">{{ obs.value }}</span>
            </div>
            <div class="obs-assessment">
              <span
                class="assessment-badge"
                :class="obs.assessmentCopy.tone"
                :title="obs.assessmentCopy.hint"
              >
                {{ obs.assessmentCopy.label }}
              </span>
            </div>
          </li>
        </ul>
      </article>

      <article class="card analyst-panel">
        <h2>Risk Analyst</h2>
        <ul
          v-if="result.agents.risk_analyst.risks.length"
          class="risks risks-visual"
        >
          <RiskMeter
            v-for="(risk, i) in result.agents.risk_analyst.risks"
            :key="i"
            :risk="risk"
            :label="formatRiskType(risk.type)"
          />
        </ul>
        <p v-else class="empty">None identified</p>
      </article>
    </section>
  </div>
</template>

<style scoped>
.results {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dashboard {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: stretch;
}

@media (max-width: 640px) {
  .dashboard {
    grid-template-columns: 1fr;
  }

  .dashboard-scores {
    justify-content: center;
  }
}

.dashboard-scores {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.85rem 1rem;
}

.hero {
  border-radius: var(--radius);
  padding: 1.5rem;
  color: var(--text);
}

.irrigate-no {
  background: var(--green-pale);
  border: 1px solid #95d5b2;
}

.irrigate-yes {
  background: var(--amber-pale);
  border: 1px solid #ffc971;
}

.eyebrow {
  margin: 0;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.verdict {
  margin: 0.25rem 0;
  font-family: var(--font-display);
  font-size: 2.5rem;
}

.rationale {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.metrics-chart {
  display: grid;
  gap: 0.85rem;
}

.analysts-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  align-items: start;
}

@media (max-width: 768px) {
  .analysts-row {
    grid-template-columns: 1fr;
  }
}

.analyst-panel h2 {
  margin: 0 0 0.75rem;
  font-size: 1.15rem;
}

.summary-card h2 {
  margin: 0 0 0.75rem;
}

.summary-text {
  margin: 0;
  line-height: 1.6;
}

.explanation-details {
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--border);
}

.explanation-details summary {
  cursor: pointer;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--green);
  list-style: none;
}

.explanation-details summary::-webkit-details-marker {
  display: none;
}

.explanation-details summary::after {
  content: " +";
  color: var(--text-muted);
  font-weight: 400;
}

.explanation-details[open] summary::after {
  content: " −";
}

.explanation-details p {
  margin: 0.65rem 0 0;
  line-height: 1.6;
  color: var(--text-muted);
}

.risks-visual {
  gap: 0;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem 1.5rem;
}

.card h2 {
  margin: 0 0 0.75rem;
  font-size: 1.15rem;
}

.card p {
  margin: 0;
  line-height: 1.6;
}

.risks {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.risks li p {
  margin: 0.35rem 0 0;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.badge {
  font-size: 0.7rem;
  text-transform: uppercase;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  font-weight: 600;
}

.severity-low {
  background: var(--green-pale);
  color: var(--green);
}

.severity-medium {
  background: var(--amber-pale);
  color: #b08900;
}

.severity-high {
  background: var(--red-pale);
  color: var(--red);
}

.conf {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-left: auto;
}

.empty {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.agronomist-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.agronomist-header h2 {
  margin: 0;
  font-size: 1.15rem;
}

.facets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 0.85rem;
}

.facet {
  border-left: 2px solid var(--border);
  padding-left: 0.7rem;
}

.facet-label {
  margin: 0;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

.facet-head {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin: 0.3rem 0 0;
}

.chip {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.chip-good {
  background: var(--green-pale);
  color: var(--green);
}

.chip-warn {
  background: var(--amber-pale);
  color: var(--amber-deep);
}

.chip-bad {
  background: var(--red-pale);
  color: var(--red);
}

.chip-muted {
  background: var(--surface-muted);
  color: var(--text-muted);
}

.facet-extra {
  font-size: 0.85rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.facet-note {
  margin: 0.3rem 0 0;
  font-size: 0.78rem;
  line-height: 1.4;
  color: var(--chart-secondary);
}

.facet-assessment {
  margin: 0.3rem 0 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--text-muted);
}

.actions {
  margin-top: 1.1rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--border);
}

.panel-title {
  margin: 0 0 0.6rem;
  font-family: var(--font);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

.action-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.action-head {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.action-text {
  font-weight: 600;
  font-size: 0.9rem;
}

.action-window {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-left: auto;
}

.action-rationale {
  margin: 0.2rem 0 0;
  font-size: 0.84rem;
  line-height: 1.5;
  color: var(--text-muted);
}

.data-gaps {
  margin-top: 0.9rem;
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--text-muted);
}

.data-gaps-label {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 0.68rem;
  color: var(--amber-deep);
  margin-right: 0.35rem;
}

.observations li {
  padding: 0.65rem 0;
  border-bottom: 1px solid var(--border);
}

.observations li:last-child {
  border-bottom: none;
}

.obs-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 0.35rem;
}

.obs-metric {
  font-weight: 600;
  color: var(--text);
}

.obs-value {
  font-variant-numeric: tabular-nums;
  color: var(--text);
}

.obs-assessment {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.assessment-badge {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  font-weight: 600;
}

.tone-neutral {
  background: var(--green-pale);
  color: var(--green);
}

.tone-low {
  background: var(--chart-secondary-pale);
  color: var(--chart-secondary);
}

.tone-high {
  background: var(--amber-pale);
  color: var(--amber-deep);
}

.reasoning-block {
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--border);
}

.reasoning-text {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--text);
}

.image-agent {
  border-color: #ffc971;
  background: linear-gradient(135deg, #fff 0%, #fffdf5 100%);
}

.image-agent-featured {
  width: 100%;
  padding: 1rem 1.25rem;
}

.image-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.image-agent-featured h2 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--green);
}

.image-kpis {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.image-kpi {
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: rgb(255 255 255 / 70%);
  border: 1px solid #ffc971;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: capitalize;
  color: #7a5a00;
}

.image-summary {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text);
}

.image-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.75rem 1rem;
}

.image-panel {
  background: rgb(255 255 255 / 55%);
  border: 1px solid rgb(255 201 113 / 45%);
  border-radius: 8px;
  padding: 0.75rem 0.85rem;
}

.image-panel-title {
  margin: 0 0 0.5rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.image-facts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.45rem 0.75rem;
  margin: 0 0 0.55rem;
  font-size: 0.82rem;
}

.image-facts dt {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--green);
}

.image-facts dd {
  margin: 0.1rem 0 0;
  color: var(--text);
  line-height: 1.35;
}

.species-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0 0 0.55rem;
  padding: 0;
  list-style: none;
}

.species-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 0.78rem;
}

.species-name {
  font-weight: 600;
  text-transform: capitalize;
}

.species-conf {
  color: var(--text-muted);
  font-size: 0.72rem;
}

.image-signal {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.45;
  color: var(--text-muted);
}

.image-observations-compact {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.image-observations-compact li {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.3rem 0.4rem;
  font-size: 0.82rem;
  line-height: 1.4;
}

.obs-label {
  font-weight: 600;
  color: var(--text);
}

.obs-sep {
  color: var(--text-muted);
  opacity: 0.6;
}

.obs-text {
  color: var(--text-muted);
  flex: 1 1 12rem;
}

.limitations {
  margin: 0.65rem 0 0;
  padding-top: 0.65rem;
  border-top: 1px solid rgb(255 201 113 / 45%);
  font-size: 0.78rem;
  line-height: 1.45;
  color: var(--text-muted);
  font-style: italic;
}
</style>
