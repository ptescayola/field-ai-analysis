<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  kind: "moisture" | "temperature"
  label: string
  displayValue: string
  fillPercent: number
}>()

const fill = computed(() =>
  Math.min(100, Math.max(0, props.fillPercent)),
)

const ariaLabel = computed(
  () => `${props.label} ${props.displayValue}`,
)
</script>

<template>
  <div class="soil-metric-gauge" :class="`soil-metric-gauge--${kind}`">
    
    <div
    class="soil-metric-gauge-circle"
    role="img"
    :aria-label="ariaLabel"
    :style="{ '--fill': fill }"
    >
    <div class="soil-metric-gauge-circle-fill" aria-hidden="true" />
  </div>
  
  <strong class="soil-metric-gauge-value">{{ displayValue }}</strong>
  <span class="soil-metric-gauge-label">{{ label }}</span>
  </div>
</template>

<style scoped>
.soil-metric-gauge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  text-align: center;
}

.soil-metric-gauge-label {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 600;
}

.soil-metric-gauge-circle {
  --track: var(--chart-water-pale);
  --fill-color: var(--chart-water);

  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: var(--track);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.soil-metric-gauge--temperature .soil-metric-gauge-circle {
  --track: var(--chart-temp-pale);
  --fill-color: var(--chart-temp);
}

.soil-metric-gauge-circle-fill {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: calc(var(--fill) * 1%);
  background: var(--fill-color);
  transition: height 0.45s ease;
}

.soil-metric-gauge-value {
  font-size: 0.95rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.soil-metric-gauge--moisture .soil-metric-gauge-value {
  color: var(--chart-water-deep);
}

.soil-metric-gauge--temperature .soil-metric-gauge-value {
  color: var(--chart-temp-deep);
}
</style>
