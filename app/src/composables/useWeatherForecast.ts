import { computed, ref, watch, type MaybeRefOrGetter, toValue } from "vue";
import { fetchWeather } from "../api/client";
import type { WeatherForecast } from "../types";

export function useWeatherForecast(
  latitude: MaybeRefOrGetter<number | null | undefined>,
  longitude: MaybeRefOrGetter<number | null | undefined>
) {
  const forecast = ref<WeatherForecast | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const rainNext7Days = computed(() => {
    if (!forecast.value) return null;
    const total = forecast.value.days.reduce((sum, day) => sum + day.rain_mm, 0);
    return Math.round(total * 10) / 10;
  });

  watch(
    () => {
      const lat = toValue(latitude);
      const lng = toValue(longitude);
      if (lat == null || lng == null) return null;
      return { lat, lng };
    },
    async (coordinates) => {
      if (!coordinates) {
        forecast.value = null;
        error.value = null;
        loading.value = false;
        return;
      }

      loading.value = true;
      error.value = null;
      forecast.value = null;

      try {
        forecast.value = await fetchWeather(
          coordinates.lat,
          coordinates.lng
        );
      } catch (e) {
        error.value =
          e instanceof Error ? e.message : "Failed to load weather forecast";
      } finally {
        loading.value = false;
      }
    },
    { immediate: true }
  );

  return {
    forecast,
    loading,
    error,
    rainNext7Days,
  };
}
