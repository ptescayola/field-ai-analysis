<script setup lang="ts">
import { ref } from "vue";
import { analyzeFieldImage } from "../api/client";
import AnalysisLoadingState from "../components/AnalysisLoadingState.vue";
import AnalysisView from "../components/AnalysisView.vue";
import ErrorAlert from "../components/ErrorAlert.vue";
import ImageUploadPanel from "../components/ImageUploadPanel.vue";
import AppLayout from "../layouts/AppLayout.vue";
import type { PipelineResult, SelectedImage } from "../types";

const result = ref<PipelineResult | null>(null);
const analyzing = ref(false);
const analysisError = ref<string | null>(null);

async function runImageAnalysis(image: SelectedImage): Promise<void> {
  analyzing.value = true;
  analysisError.value = null;
  result.value = null;
  try {
    result.value = await analyzeFieldImage(
      image.base64,
      image.mimeType,
      image.fileName
    );
  } catch (e) {
    analysisError.value = e instanceof Error ? e.message : "Image analysis failed";
  } finally {
    analyzing.value = false;
  }
}
</script>

<template>
  <AppLayout
    eyebrow="Experimental image analysis with vision agents"
    experimental
  >
    <ErrorAlert v-if="analysisError" :message="analysisError" />

    <AnalysisLoadingState
      v-if="analyzing"
      message="Running Image Analyst, then Data Analyst, Risk Analyst, Agronomist, Coordinator…"
      hint="This may take 15–30 seconds"
    />

    <AnalysisView v-else-if="result" :result="result" />

    <ImageUploadPanel
      :analyzing="analyzing"
      @analyze="runImageAnalysis"
      @clear-error="analysisError = null"
      @error="(message) => (analysisError = message)"
    />
  </AppLayout>
</template>
