<script setup lang="ts">
import { computed } from "vue";
import {
  getMeteoconsIconUrl,
  getWeatherDescription,
  type DayPhase,
} from "../utils/wmo-weather";

const props = withDefaults(
  defineProps<{
    weatherCode: number;
    dayPhase?: DayPhase;
    size?: "sm" | "md" | "lg";
  }>(),
  {
    dayPhase: "day",
    size: "md",
  },
);

const iconUrl = computed(() =>
  getMeteoconsIconUrl(props.weatherCode, props.dayPhase),
);

const label = computed(() =>
  getWeatherDescription(props.weatherCode, props.dayPhase),
);
</script>

<template>
  <span
    class="weather-icon"
    :class="`weather-icon--${size}`"
    :title="label"
    :aria-label="label"
  >
    <img :src="iconUrl" :alt="label" width="48" height="48" decoding="async" />
  </span>
</template>

<style scoped>
.weather-icon {
  display: inline-flex;
  line-height: 0;
  flex-shrink: 0;
}

.weather-icon img {
  display: block;
  object-fit: contain;
}

.weather-icon--sm img {
  width: 1.75rem;
  height: 1.75rem;
}

.weather-icon--md img {
  width: 2.75rem;
  height: 2.75rem;
}

.weather-icon--lg img {
  width: 3.5rem;
  height: 3.5rem;
}
</style>
