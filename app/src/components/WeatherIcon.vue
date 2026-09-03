<script setup lang="ts">
import { computed } from "vue";

export type WeatherCondition = "sun" | "partly-cloudy" | "cloud" | "rain";

const props = defineProps<{
  weatherCode: number;
  rainMm: number;
}>();

function resolveCondition(code: number, rainMm: number): WeatherCondition {
  const rainCodes = [51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99];
  if (rainMm >= 0.5 || rainCodes.includes(code)) return "rain";

  return "sun";
}

const condition = computed(() =>
  resolveCondition(props.weatherCode, props.rainMm)
);

const label = computed(() => {
  switch (condition.value) {
    case "sun":
      return "Sunny";
    case "partly-cloudy":
      return "Partly cloudy";
    case "cloud":
      return "Cloudy";
    case "rain":
      return "Rain";
  }
});
</script>

<template>
  <span class="weather-icon" :title="label" :aria-label="label">
    <svg v-if="condition === 'sun'" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      <g stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
        <line x1="4.2" y1="4.2" x2="6.3" y2="6.3" />
        <line x1="17.7" y1="17.7" x2="19.8" y2="19.8" />
        <line x1="4.2" y1="19.8" x2="6.3" y2="17.7" />
        <line x1="17.7" y1="6.3" x2="19.8" y2="4.2" />
      </g>
    </svg>

    <svg
      v-else-if="condition === 'partly-cloudy'"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="3.25" fill="currentColor" />
      <g stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <line x1="8" y1="2" x2="8" y2="3.5" />
        <line x1="8" y1="12.5" x2="8" y2="14" />
        <line x1="2" y1="8" x2="3.5" y2="8" />
        <line x1="12.5" y1="8" x2="14" y2="8" />
      </g>
      <path
        d="M7 18h10a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.8A3.2 3.2 0 0 0 7 18z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>

    <svg
      v-else-if="condition === 'cloud'"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M6.5 18h11a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.3-1.8A3.8 3.8 0 0 0 6.5 18z"
        fill="currentColor"
      />
    </svg>

    <svg v-else viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.5 17h11a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.3-1.8A3.8 3.8 0 0 0 6.5 17z"
        fill="currentColor"
        opacity="0.85"
      />
      <g stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
        <line x1="8" y1="18" x2="7" y2="21" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="16" y1="18" x2="17" y2="21" />
      </g>
    </svg>
  </span>
</template>

<style scoped>
.weather-icon {
  display: inline-flex;
  color: var(--green);
  line-height: 0;
}

.weather-icon svg {
  width: 1.75rem;
  height: 1.75rem;
}
</style>
