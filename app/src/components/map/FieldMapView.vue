<script setup lang="ts">
import { useFieldMap } from "../../composables/useFieldMap"

const props = withDefaults(
  defineProps<{
    selectedFile?: string
    title?: string
    healthScore?: number | null
    irrigateNext48h?: boolean | null
  }>(),
  {
    selectedFile: "",
    title: "Field map",
    healthScore: null,
    irrigateNext48h: null,
  },
)

const emit = defineEmits<{
  "select-field": [file: string]
}>()

const {
  containerRef,
  loading,
  loadError,
  basemapMode,
  satelliteAvailable,
  setBasemapMode,
} = useFieldMap({
  selectedFile: () => props.selectedFile,
  healthScore: () => props.healthScore,
  irrigateNext48h: () => props.irrigateNext48h,
  onSelectField: (file) => emit("select-field", file),
})
</script>

<template>
  <section class="field-map">
    <div class="field-map-head">
      <h2>{{ title }}</h2>
      <p v-if="loadError" class="field-map-error">{{ loadError }}</p>
      <p v-else-if="loading" class="field-map-hint">Loading field locations…</p>
      <p v-else class="field-map-hint">
        Click a parcel to select · shapes use surveyed boundary or estimated
        rectangle from area
      </p>
    </div>

    <div class="field-map-canvas-wrap">
      <div
        v-if="satelliteAvailable"
        class="field-map-basemap"
        role="group"
        aria-label="Basemap"
      >
        <button
          type="button"
          class="field-map-basemap-btn"
          :class="{ active: basemapMode === 'standard' }"
          @click="setBasemapMode('standard')"
        >
          Map
        </button>
        <button
          type="button"
          class="field-map-basemap-btn"
          :class="{ active: basemapMode === 'satellite' }"
          @click="setBasemapMode('satellite')"
        >
          Satellite
        </button>
      </div>

      <div
        ref="containerRef"
        class="field-map-canvas"
        role="region"
        aria-label="Interactive field map"
      />
    </div>
  </section>
</template>

<style scoped>
.field-map {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.25rem 1.1rem;
  box-shadow: var(--shadow);
}

.field-map-head {
  margin-bottom: 0.65rem;
}

.field-map-head h2 {
  margin: 0 0 0.25rem;
  font-size: 1.15rem;
}

.field-map-hint {
  margin: 0;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.field-map-error {
  margin: 0;
  font-size: 0.82rem;
  color: var(--red);
}

.field-map-canvas-wrap {
  position: relative;
}

.field-map-basemap {
  position: absolute;
  top: 0.65rem;
  left: 0.65rem;
  z-index: 2;
  display: flex;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgb(0 0 0 / 12%);
  background: var(--surface);
}

.field-map-basemap-btn {
  margin: 0;
  padding: 0.35rem 0.65rem;
  font-size: 0.78rem;
  font-weight: 600;
  border: none;
  background: var(--surface);
  color: var(--text-muted);
  cursor: pointer;
}

.field-map-basemap-btn + .field-map-basemap-btn {
  border-left: 1px solid var(--border);
}

.field-map-basemap-btn.active {
  background: #2d6a4f;
  color: #fff;
}

.field-map-basemap-btn:not(.active):hover {
  background: var(--bg);
  color: var(--text);
}

.field-map-canvas {
  width: 100%;
  height: min(26rem, 58vh);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border);
}

:global(.field-map-popup) {
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--text);
}

:global(.field-map-popup strong) {
  font-size: 0.92rem;
}
</style>
