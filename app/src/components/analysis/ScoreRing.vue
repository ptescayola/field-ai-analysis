<script setup lang="ts">
import { computed } from "vue";
import type { MetricTone } from "../../utils/metric-visualization";

const props = withDefaults(
  defineProps<{
    label: string;
    value: number;
    max?: number;
    suffix?: string;
    tone?: MetricTone;
  }>(),
  {
    max: 100,
    suffix: "",
    tone: "neutral",
  },
);

const radius = 38;
const circumference = 2 * Math.PI * radius;

const pct = computed(() =>
  Math.min(100, Math.max(0, (props.value / props.max) * 100)),
);

const dashOffset = computed(
  () => circumference - (circumference * pct.value) / 100,
);

const displayValue = computed(() => {
  if (props.suffix === "%") return `${Math.round(props.value)}%`;
  if (Number.isInteger(props.value)) return String(props.value);
  return props.value.toFixed(1);
});
</script>

<template>
  <div class="score-ring" :class="`score-ring--${tone}`">
    <div class="score-ring-chart">
      <svg viewBox="0 0 96 96" aria-hidden="true">
        <circle class="score-ring-track" cx="48" cy="48" :r="radius" />
        <circle
          class="score-ring-fill"
          cx="48"
          cy="48"
          :r="radius"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
        />
      </svg>
      <div class="score-ring-center">
        <strong>{{ displayValue }}</strong>
        <span v-if="suffix && suffix !== '%'" class="score-ring-suffix">{{
          suffix
        }}</span>
      </div>
    </div>
    <span class="score-ring-label">{{ label }}</span>
  </div>
</template>

<style scoped>
.score-ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  min-width: 6.5rem;
}

.score-ring-chart {
  position: relative;
  width: 5.5rem;
  height: 5.5rem;
}

.score-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.score-ring-track {
  fill: none;
  stroke: var(--border);
  stroke-width: 7;
}

.score-ring-fill {
  fill: none;
  stroke-width: 7;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.4s ease;
}

.score-ring--neutral .score-ring-fill {
  stroke: var(--green);
}

.score-ring--low .score-ring-fill {
  stroke: #3d5a80;
}

.score-ring--high .score-ring-fill {
  stroke: var(--amber);
}

.score-ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.1rem;
  line-height: 1;
}

.score-ring-center strong {
  font-size: 1.35rem;
  font-variant-numeric: tabular-nums;
}

.score-ring-suffix {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.score-ring-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  text-align: center;
}
</style>
