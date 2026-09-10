<script setup lang="ts">
import type { Risk } from "../../types";

defineProps<{
  risk: Risk;
  label: string;
}>();

const SEVERITY_FILL: Record<Risk["severity"], number> = {
  low: 33,
  medium: 66,
  high: 100,
};
</script>

<template>
  <li class="risk-meter" :class="`risk-meter--${risk.severity}`">
    <div class="risk-meter-head">
      <strong>{{ label }}</strong>
      <span class="badge" :class="`severity-${risk.severity}`">{{
        risk.severity
      }}</span>
      <span class="risk-meter-conf">{{ Math.round(risk.confidence * 100) }}%</span>
    </div>
    <div class="risk-meter-bars" aria-hidden="true">
      <div class="risk-meter-bar">
        <span class="risk-meter-bar-label">Severity</span>
        <div class="risk-meter-track">
          <div
            class="risk-meter-fill risk-meter-fill--severity"
            :style="{ width: `${SEVERITY_FILL[risk.severity]}%` }"
          />
        </div>
      </div>
      <div class="risk-meter-bar">
        <span class="risk-meter-bar-label">Confidence</span>
        <div class="risk-meter-track">
          <div
            class="risk-meter-fill risk-meter-fill--confidence"
            :style="{ width: `${risk.confidence * 100}%` }"
          />
        </div>
      </div>
    </div>
    <p class="risk-meter-evidence">{{ risk.evidence }}</p>
  </li>
</template>

<style scoped>
.risk-meter {
  list-style: none;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--border);
}

.risk-meter:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.risk-meter-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.risk-meter-conf {
  margin-left: auto;
  font-size: 0.78rem;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
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

.risk-meter-bars {
  display: grid;
  gap: 0.35rem;
  margin-bottom: 0.45rem;
}

.risk-meter-bar {
  display: grid;
  grid-template-columns: 5.5rem 1fr;
  align-items: center;
  gap: 0.5rem;
}

.risk-meter-bar-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-muted);
}

.risk-meter-track {
  height: 0.35rem;
  border-radius: 999px;
  background: var(--border);
  overflow: hidden;
}

.risk-meter-fill {
  height: 100%;
  border-radius: inherit;
}

.risk-meter-fill--severity {
  background: var(--red);
}

.risk-meter--low .risk-meter-fill--severity {
  background: var(--green);
}

.risk-meter--medium .risk-meter-fill--severity {
  background: var(--amber);
}

.risk-meter-fill--confidence {
  background: #3d5a80;
}

.risk-meter-evidence {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--text-muted);
}
</style>
