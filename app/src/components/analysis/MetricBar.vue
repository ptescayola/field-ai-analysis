<script setup lang="ts">
import type { ParsedMetric } from "../../utils/metric-visualization";

defineProps<{
  metric: ParsedMetric;
  assessmentLabel: string;
}>();
</script>

<template>
  <div class="metric-bar" :class="`metric-bar--${metric.tone}`">
    <div class="metric-bar-head">
      <span class="metric-bar-label">{{ metric.label }}</span>
      <span class="metric-bar-value">{{ metric.displayValue }}</span>
    </div>
    <div class="metric-bar-track" aria-hidden="true">
      <div class="metric-bar-fill" :style="{ width: `${metric.fillPct}%` }" />
    </div>
    <span class="metric-bar-assessment">{{ assessmentLabel }}</span>
  </div>
</template>

<style scoped>
.metric-bar {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.metric-bar-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
}

.metric-bar-label {
  font-size: 0.82rem;
  font-weight: 600;
}

.metric-bar-value {
  font-size: 0.82rem;
  font-variant-numeric: tabular-nums;
}

.metric-bar-track {
  height: 0.45rem;
  border-radius: 999px;
  background: var(--border);
  overflow: hidden;
}

.metric-bar-fill {
  height: 100%;
  border-radius: inherit;
  transition: width 0.35s ease;
}

.metric-bar--neutral .metric-bar-fill {
  background: var(--green);
}

.metric-bar--low .metric-bar-fill {
  background: #3d5a80;
}

.metric-bar--high .metric-bar-fill {
  background: var(--amber);
}

.metric-bar-assessment {
  font-size: 0.72rem;
  color: var(--text-muted);
}
</style>
