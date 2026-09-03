<script setup lang="ts">
import { computed } from "vue";
import type { PipelineResult, Risk } from "../types";

const props = defineProps<{
  result: PipelineResult;
}>();

function formatRiskType(type: string): string {
  return type.replaceAll("_", " ");
}

function severityClass(severity: Risk["severity"]): string {
  return `severity-${severity}`;
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

const METRIC_LABELS: Record<string, string> = {
  soil_moisture: "Soil moisture",
  temperature: "Temperature",
  humidity: "Humidity",
  rainfall_last_7_days: "Rainfall (last 7 days)",
  ndvi: "NDVI",
  rain_forecast_next_48h: "Rain forecast (next 48h)",
};

const ASSESSMENT_COPY: Record<string, { label: string; hint: string }> = {
  low: { label: "Low", hint: "Below typical levels for this metric" },
  moderate: { label: "Moderate", hint: "Within a normal range" },
  high: { label: "High", hint: "Above typical levels for this metric" },
  "moderately high": { label: "Moderately high", hint: "Slightly above normal" },
  "moderately low": { label: "Moderately low", hint: "Slightly below normal" },
  normal: { label: "Normal", hint: "Within the expected range" },
  decreasing: { label: "Decreasing", hint: "Trending downward compared to recent values" },
  increasing: { label: "Increasing", hint: "Trending upward compared to recent values" },
  stable: { label: "Stable", hint: "No significant change detected" },
  expected: { label: "Expected", hint: "Matches the forecast for this period" },
  anomalous: { label: "Unusual", hint: "Outside typical patterns for this field" },
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replaceAll("_", " ");
}

function formatMetric(metric: string): string {
  const key = metric.trim().toLowerCase();
  return METRIC_LABELS[key] ?? metric.replaceAll("_", " ");
}

function formatAssessment(assessment: string): { label: string; hint: string } {
  const key = normalizeKey(assessment);
  const copy = ASSESSMENT_COPY[key];
  if (copy) return copy;

  const label = assessment
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return { label, hint: "Assessment from field data analysis" };
}

function assessmentTone(assessment: string): string {
  const key = normalizeKey(assessment);
  if (["low", "moderately low", "decreasing"].includes(key)) return "tone-low";
  if (["high", "moderately high", "increasing", "anomalous"].includes(key)) return "tone-high";
  return "tone-neutral";
}

function getAssessmentCopy(assessment: string): {
  label: string;
  hint: string;
  tone: string;
} {
  const { label, hint } = formatAssessment(assessment);
  return { label, hint, tone: assessmentTone(assessment) };
}

const dataAnalystObservations = computed(() =>
  props.result.analysis.agents.data_analyst.observations.map((obs) => ({
    ...obs,
    metricLabel: formatMetric(obs.metric),
    assessmentCopy: getAssessmentCopy(obs.assessment),
  }))
);
</script>

<template>
  <div class="results">
    <section class="hero" :class="result.analysis.irrigation.should_irrigate_next_48h ? 'irrigate-yes' : 'irrigate-no'">
      <p class="eyebrow">Irrigate in the next 48h?</p>
      <p class="verdict">
        {{ result.analysis.irrigation.should_irrigate_next_48h ? "Yes" : "No" }}
      </p>
      <p class="rationale">{{ result.analysis.irrigation.rationale }}</p>
    </section>

    <div class="scores">
      <div class="score-card">
        <span class="label">Field health</span>
        <strong>{{ result.analysis.field_health_score }}/100</strong>
      </div>
      <div class="score-card">
        <span class="label">Confidence</span>
        <strong>{{ formatPercent(result.analysis.confidence) }}</strong>
      </div>
    </div>

    <section class="card">
      <h2>Summary</h2>
      <p>{{ result.analysis.summary }}</p>
    </section>

    <section class="card highlight">
      <h2>Main recommendation</h2>
      <p>{{ result.analysis.main_recommendation }}</p>
    </section>

    <section class="card">
      <h2>Risks</h2>
      <ul v-if="result.analysis.risks.length" class="risks">
        <li v-for="(risk, i) in result.analysis.risks" :key="i">
          <div class="risk-head">
            <strong>{{ formatRiskType(risk.type) }}</strong>
            <span :class="['badge', severityClass(risk.severity)]">{{ risk.severity }}</span>
            <span class="conf">{{ formatPercent(risk.confidence) }}</span>
          </div>
          <p>{{ risk.evidence }}</p>
        </li>
      </ul>
      <p v-else class="empty">None identified</p>
    </section>

    <section class="card">
      <h2>Explanation</h2>
      <p>{{ result.analysis.explanation }}</p>
    </section>

    <section class="agents">
      <article class="card agent">
        <h3>Data Analyst</h3>
        <ul class="observations">
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
              <span class="assessment-hint">{{ obs.assessmentCopy.hint }}</span>
            </div>
          </li>
        </ul>
      </article>

      <article class="card agent">
        <h3>Agronomist</h3>
        <dl>
          <div><dt>Irrigation</dt><dd>{{ result.analysis.agents.agronomist.irrigation_assessment }}</dd></div>
          <div><dt>Stress</dt><dd>{{ result.analysis.agents.agronomist.crop_stress }}</dd></div>
          <div><dt>Development</dt><dd>{{ result.analysis.agents.agronomist.crop_development }}</dd></div>
          <div><dt>Health</dt><dd>{{ result.analysis.agents.agronomist.plant_health }}</dd></div>
        </dl>
      </article>

      <article class="card agent">
        <h3>Risk Analyst</h3>
        <ul class="risks compact">
          <li v-for="(risk, i) in result.analysis.agents.risk_analyst.risks" :key="i">
            <strong>{{ formatRiskType(risk.type) }}</strong> — {{ risk.evidence }}
          </li>
        </ul>
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

.scores {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
}

.score-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.score-card .label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem 1.5rem;
  box-shadow: var(--shadow);
}

.card h2 {
  margin: 0 0 0.75rem;
  font-size: 1.15rem;
}

.card p {
  margin: 0;
  line-height: 1.6;
}

.highlight {
  border-color: var(--green-light);
  background: linear-gradient(135deg, #fff 0%, var(--surface-muted) 100%);
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

.risk-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
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

.agents {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.agent h3 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: var(--green);
}

.agent ul {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.88rem;
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

.assessment-hint {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.tone-neutral {
  background: var(--green-pale);
  color: var(--green);
}

.tone-low {
  background: #e8f0ff;
  color: #3d5a80;
}

.tone-high {
  background: var(--amber-pale);
  color: #b08900;
}

.agent li {
  padding: 0.3rem 0;
  border-bottom: 1px solid var(--border);
}

.agent li:last-child {
  border-bottom: none;
}

.agent em {
  color: var(--text-muted);
  font-style: normal;
}

.agent dl {
  margin: 0;
  font-size: 0.88rem;
}

.agent dl div {
  margin-bottom: 0.6rem;
}

.agent dt {
  font-weight: 600;
  color: var(--green);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.agent dd {
  margin: 0.15rem 0 0;
  color: var(--text-muted);
}

.compact li {
  border: none;
  padding: 0.25rem 0;
}
</style>
