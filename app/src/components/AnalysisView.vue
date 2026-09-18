<script setup lang="ts">
import { computed } from "vue"
import FieldSnapshotCharts from "./analysis/FieldSnapshotCharts.vue"
import FieldDataTile, {
  type FieldDataTileModel,
} from "./FieldDataTile.vue"
import ScoreRing from "./analysis/ScoreRing.vue"
import { healthScoreTone } from "../utils/metric-visualization"
import { agronomistIconUrl } from "../utils/agronomist-icons"
import { riskIconUrl } from "../utils/risk-icons"
import { formatLabel } from "../utils/string"
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

function severityClass(severity: Risk["severity"]): string {
  return `severity-${severity}`
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

const healthTone = computed(() =>
  healthScoreTone(props.result.field_health_score),
)

const healthUplift = computed(
  () => props.result.recommendation_health_uplift_pct ?? 0,
)

const projectedFieldHealth = computed(() =>
  Math.min(100, props.result.field_health_score + healthUplift.value),
)

const riskTiles = computed((): FieldDataTileModel[] =>
  props.result.agents.risk_analyst.risks.map((risk, index) => ({
    id: `${risk.type}-${index}`,
    label: formatLabel(risk.type),
    highlight: risk.severity,
    capitalizeHighlight: true,
    highlightSeverity: risk.severity,
    footer: risk.evidence.trim() ? [risk.evidence.trim()] : [],
    footerAlign: "start",
    iconSrc: riskIconUrl(risk.type),
  })),
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

function chipToneToHighlightSeverity(
  tone: string,
): FieldDataTileModel["highlightSeverity"] | undefined {
  if (tone === "chip-good") return "low"
  if (tone === "chip-warn") return "medium"
  if (tone === "chip-bad") return "high"
  return undefined
}

function agronomistTile(
  id: string,
  label: string,
  value: string,
  tone: string,
  footerLines: Array<string | null | undefined>,
): FieldDataTileModel {
  return {
    id,
    label,
    highlight: value,
    capitalizeHighlight: true,
    highlightSeverity: chipToneToHighlightSeverity(tone),
    footer: footerLines
      .filter((line): line is string => Boolean(line?.trim()))
      .map((line) => line.trim()),
    footerAlign: "start",
    iconSrc: agronomistIconUrl(id),
  }
}

const agronomistTiles = computed((): FieldDataTileModel[] => {
  const { irrigation, crop_stress, crop_development, plant_health } =
    agronomist.value

  const irrigationExtra =
    irrigation.recommended_mm === null
      ? "N/A"
      : `${irrigation.recommended_mm} mm`

  return [
    agronomistTile(
      "irrigation",
      "Irrigation",
      formatLabel(irrigation.status),
      IRRIGATION_TONES[irrigation.status],
      [irrigationExtra, irrigation.timing, irrigation.assessment],
    ),
    agronomistTile(
      "stress",
      "Stress",
      formatLabel(crop_stress.level),
      STRESS_TONES[crop_stress.level],
      [
        crop_stress.drivers.length
          ? crop_stress.drivers.join(" · ")
          : null,
        crop_stress.assessment,
      ],
    ),
    agronomistTile(
      "development",
      "Development",
      formatLabel(crop_development.stage_assessment),
      STAGE_TONES[crop_development.stage_assessment],
      [crop_development.assessment],
    ),
    agronomistTile(
      "health",
      "Health",
      formatLabel(plant_health.rating),
      HEALTH_TONES[plant_health.rating],
      [plant_health.assessment],
    ),
  ]
})

function formatCategory(category: string): string {
  return formatLabel(category)
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
  return VEGETATION_LABELS[type] ?? formatLabel(type)
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
      <div class="hero">
        <div class="hero-head">
          <h2 class="hero-title">Recommendation</h2>
          <p
            v-if="healthUplift > 0"
            class="hero-uplift"
            title="Coordinator estimate if the main recommendation is followed in time; not a measured outcome."
          >
            <span class="hero-uplift-value">+{{ healthUplift }}%</span>
            field health potential
          </p>
        </div>
        <p class="hero-recommendation">{{ result.main_recommendation }}</p>
        <p v-if="healthUplift > 0" class="hero-uplift-footnote">
          Est. field health up to {{ Math.round(projectedFieldHealth) }}% (from
          {{ Math.round(result.field_health_score) }}%)
        </p>
      </div>

      <div class="dashboard-scores">
        <ScoreRing
          label="Field health"
          :value="result.field_health_score"
          suffix="%"
          :tone="healthTone"
        />
      </div>
    </section>

    <FieldSnapshotCharts
      v-if="field"
      :field="field"
      :data-analyst-observations="result.agents.data_analyst.observations"
    />

    <article class="card agronomist-panel">
      <h2 class="agronomist-title">Agronomist</h2>

      <div class="agronomist-tiles">
        <FieldDataTile
          v-for="tile in agronomistTiles"
          :key="tile.id"
          :label="tile.label"
          :highlight="tile.highlight"
          :footer="tile.footer"
          :capitalize-highlight="tile.capitalizeHighlight"
          :highlight-severity="tile.highlightSeverity"
          :footer-align="tile.footerAlign"
          :icon-src="tile.iconSrc"
        />
      </div>

      <div v-if="agronomist.actions.length" class="actions">
        <h3 class="panel-title">Recommended actions</h3>
        <ol class="action-list">
          <li v-for="(action, i) in agronomist.actions" :key="i">
            <div class="action-head">
              <span
                v-if="action.priority === 'high'"
                class="badge severity-high action-priority-tag"
              >
                Priority
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
    </article>

    <article class="card analyst-panel">
      <h2>Risk Analyst</h2>
      <div v-if="riskTiles.length" class="risk-tiles">
        <FieldDataTile
          v-for="tile in riskTiles"
          :key="tile.id"
          :label="tile.label"
          :highlight="tile.highlight"
          :footer="tile.footer"
          :capitalize-highlight="tile.capitalizeHighlight"
          :highlight-severity="tile.highlightSeverity"
          :footer-align="tile.footerAlign"
          :icon-src="tile.iconSrc"
        />
      </div>
      <p v-else class="empty">None identified</p>
    </article>
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
  padding: 1.25rem 1.35rem;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border);
}

.hero-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  margin-bottom: 0.65rem;
}

.hero-title {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.hero-uplift {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
  white-space: nowrap;
}

.hero-uplift-value {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--green);
  font-variant-numeric: tabular-nums;
}

.hero-recommendation {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 600;
  line-height: 1.35;
}

.hero-uplift-footnote {
  margin: 0.75rem 0 0;
  font-size: 0.72rem;
  line-height: 1.4;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.analyst-panel h2 {
  margin: 0 0 0.75rem;
  font-size: 1.15rem;
}

.risk-tiles {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
  align-items: stretch;
}

@media (max-width: 960px) {
  .risk-tiles {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .risk-tiles {
    grid-template-columns: 1fr;
  }
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

.empty {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.agronomist-title {
  margin: 0 0 0.85rem;
  font-size: 1.15rem;
}

.agronomist-tiles {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
  align-items: stretch;
}

@media (max-width: 960px) {
  .agronomist-tiles {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .agronomist-tiles {
    grid-template-columns: 1fr;
  }
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
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.action-priority-tag {
  flex-shrink: 0;
}

.action-text {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  font-size: 0.9rem;
}

.action-window {
  flex-shrink: 0;
  margin-left: auto;
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.25;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  background: var(--surface-muted);
  border: 1px solid var(--border);
  color: var(--green);
  text-align: right;
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
