<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import type { SelectedImage } from "../types";
import { parseCoordinatesFromFilename } from "../utils/coordinates-from-filename";
import WeatherForecastPanel from "./WeatherForecastPanel.vue";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const props = defineProps<{
  analyzing: boolean;
}>();

const emit = defineEmits<{
  analyze: [payload: SelectedImage];
  clear: [];
  clearError: [];
  error: [message: string];
}>();

const selectedImage = ref<SelectedImage | null>(null);
const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

function revokePreview(url: string | null): void {
  if (url) URL.revokeObjectURL(url);
}

function clearImage(): void {
  if (selectedImage.value) {
    revokePreview(selectedImage.value.previewUrl);
  }
  selectedImage.value = null;
  if (fileInput.value) fileInput.value.value = "";
  emit("clear");
}

async function readFile(file: File): Promise<void> {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    emit("error", "Use a JPEG, PNG, or WebP image");
    return;
  }

  if (file.size > MAX_IMAGE_BYTES) {
    emit("error", "Image must be 4 MB or smaller");
    return;
  }

  const coordinates = parseCoordinatesFromFilename(file.name);
  if (!coordinates) {
    emit(
      "error",
      "Filename must include coordinates: lat,lng.ext (e.g. 39.060664,1.397765.png)"
    );
    return;
  }

  if (selectedImage.value) {
    revokePreview(selectedImage.value.previewUrl);
  }

  const previewUrl = URL.createObjectURL(file);

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read image"));
        return;
      }
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });

  selectedImage.value = {
    base64,
    mimeType: file.type,
    previewUrl,
    fileName: file.name,
    coordinates,
  };
  emit("clearError");
}

function onFileChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  void readFile(file).catch((error: unknown) => {
    emit("error", error instanceof Error ? error.message : "Could not read image");
  });
}

function onDrop(event: DragEvent): void {
  isDragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  void readFile(file).catch((error: unknown) => {
    emit("error", error instanceof Error ? error.message : "Could not read image");
  });
}

function openPicker(): void {
  if (props.analyzing) return;
  fileInput.value?.click();
}

function runAnalysis(): void {
  if (!selectedImage.value || props.analyzing) return;
  emit("analyze", selectedImage.value);
}

onBeforeUnmount(() => {
  if (selectedImage.value) {
    revokePreview(selectedImage.value.previewUrl);
  }
});
</script>

<template>
  <section class="card experimental">
    <div class="head">
      <div>
        <h2>Field image analysis</h2>
        <p class="intro">
          Upload a photo named with the field coordinates, e.g.
          <code>39.060664,1.397765.png</code>. A vision agent reads the image,
          weather is fetched for those coordinates, and the full pipeline produces
          an irrigation recommendation.
        </p>
      </div>
    </div>

    <div
      class="dropzone"
      :class="{ dragging: isDragging, filled: !!selectedImage }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      @click="openPicker"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="sr-only"
        :disabled="analyzing"
        @change="onFileChange"
      />

      <img
        v-if="selectedImage"
        :src="selectedImage.previewUrl"
        alt="Selected field preview"
        class="preview"
      />

      <div v-else class="placeholder">
        <p class="placeholder-title">Drop an image here or click to browse</p>
        <p class="placeholder-meta">
          Name format: lat,lng.ext · JPEG, PNG, or WebP · max 4 MB
        </p>
      </div>
    </div>

    <div v-if="selectedImage" class="file-row">
      <span class="file-name">{{ selectedImage.fileName }}</span>
      <button
        type="button"
        class="clear-button"
        :disabled="analyzing"
        @click.stop="clearImage"
      >
        Remove
      </button>
    </div>

    <div v-if="selectedImage" class="forecast-wrap">
      <WeatherForecastPanel
        :latitude="selectedImage.coordinates.latitude"
        :longitude="selectedImage.coordinates.longitude"
        title="Weather forecast for detected location"
      />
    </div>

    <button
      type="button"
      class="analyze-button"
      :disabled="!selectedImage || analyzing"
      @click="runAnalysis"
    >
      {{ analyzing ? "Analyzing image…" : "Analyze image" }}
    </button>
  </section>
</template>

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem 1.5rem;
  box-shadow: var(--shadow);
}

.card.experimental {
  border-style: dashed;
  border-color: #b08900;
  background: linear-gradient(135deg, #fff 0%, #fffdf5 100%);
}

.head {
  margin-bottom: 1rem;
}

h2 {
  margin: 0 0 0.35rem;
  font-size: 1.15rem;
}

.intro {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.92rem;
  line-height: 1.55;
}

.intro code {
  font-size: 0.85em;
  background: var(--surface-muted);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}

.dropzone {
  border: 2px dashed var(--border);
  border-radius: 10px;
  min-height: 180px;
  display: grid;
  place-items: center;
  cursor: pointer;
  overflow: hidden;
  background: var(--surface-muted);
  transition: border-color 0.15s, background 0.15s;
}

.dropzone:hover:not(.filled) {
  border-color: var(--green-light);
  background: #f7fbf4;
}

.dropzone.dragging {
  border-color: var(--green);
  background: var(--green-pale);
}

.dropzone.filled {
  cursor: default;
  min-height: auto;
}

.preview {
  width: 100%;
  max-height: 320px;
  object-fit: cover;
  display: block;
}

.placeholder {
  text-align: center;
  padding: 1.5rem;
}

.placeholder-title {
  margin: 0;
  font-weight: 600;
}

.placeholder-meta {
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.file-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.forecast-wrap {
  margin-top: 1.25rem;
}

.file-name {
  font-size: 0.88rem;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clear-button {
  border: 1px solid var(--border);
  background: #fff;
  color: var(--text);
  border-radius: 6px;
  padding: 0.35rem 0.65rem;
  font-size: 0.82rem;
}

.analyze-button {
  margin-top: 1rem;
  width: 100%;
  padding: 0.7rem 1rem;
  border: 0;
  border-radius: 8px;
  background: var(--green);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
}

.analyze-button:hover:not(:disabled) {
  background: var(--green-light);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
