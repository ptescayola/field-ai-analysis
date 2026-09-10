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
  toRef(props, "longitude"),
);
</script>

<template>
  <WeatherForecastView
    :forecast="forecast"
    :loading="loading"
    :error="error"
    :title="title"
  />
</template>
