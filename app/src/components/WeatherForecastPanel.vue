<script setup lang="ts">
import { toRef } from "vue";
import { useWeatherForecast } from "../composables/useWeatherForecast";
import WeatherForecastView from "./WeatherForecastView.vue";

const props = defineProps<{
  latitude: number;
  longitude: number;
  title?: string;
}>();

const { forecast, loading, error } = useWeatherForecast(
  toRef(props, "latitude"),
  toRef(props, "longitude")
);
</script>

<template>
  <section class="panel">
    <WeatherForecastView
      :forecast="forecast"
      :loading="loading"
      :error="error"
      :latitude="latitude"
      :longitude="longitude"
      :title="title"
    />
  </section>
</template>

<style scoped>
.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem 1.5rem;
  box-shadow: var(--shadow);
}
</style>
