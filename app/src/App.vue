<script setup lang="ts">
import { onMounted, ref } from "vue";
import { analyzeField, fetchField, fetchFields } from "./api/client";
import AnalysisView from "./components/AnalysisView.vue";
import AppFooter from "./components/AppFooter.vue";
import AppHeader from "./components/AppHeader.vue";
import FieldPanel from "./components/FieldPanel.vue";
import type { FieldData, FieldListItem, PipelineResult } from "./types";

const fields = ref<FieldListItem[]>([]);
const selectedFile = ref("");
const fieldData = ref<FieldData | null>(null);
const result = ref<PipelineResult | null>(null);
const loadingFields = ref(true);
const loadingField = ref(false);
const analyzing = ref(false);
const error = ref<string | null>(null);

async function loadFieldsList(): Promise<void> {
  loadingFields.value = true;
  error.value = null;
  try {
    fields.value = await fetchFields();
    if (fields.value.length > 0) {
      selectedFile.value = fields.value[0].file;
      await loadSelectedField();
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Error loading fields";
  } finally {
    loadingFields.value = false;
  }
}

async function loadSelectedField(): Promise<void> {
  if (!selectedFile.value) return;
  loadingField.value = true;
  result.value = null;
  error.value = null;
  try {
    fieldData.value = await fetchField(selectedFile.value);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Error loading field";
    fieldData.value = null;
  } finally {
    loadingField.value = false;
  }
}

async function onFieldSelected(file: string): Promise<void> {
  selectedFile.value = file;
  await loadSelectedField();
}

async function runAnalysis(): Promise<void> {
  if (!selectedFile.value) return;
  analyzing.value = true;
  error.value = null;
  result.value = null;
  try {
    result.value = await analyzeField(selectedFile.value);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Analysis failed";
  } finally {
    analyzing.value = false;
  }
}

onMounted(() => {
  void loadFieldsList();
});
</script>

<template>
  <div class="app">
    <AppHeader
      :fields="fields"
      :selected-file="selectedFile"
      :loading-fields="loadingFields"
      :loading-field="loadingField"
      :analyzing="analyzing"
      @update:selected-file="onFieldSelected"
      @analyze="runAnalysis"
    />

    <main class="main">
      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <div v-if="loadingFields" class="state" aria-live="polite">
        Loading fields…
      </div>

      <template v-else>
        <div v-if="fields.length === 0" class="state">
          No fields are available.
        </div>
        <div v-if="loadingField" class="state">Loading field data…</div>
        <FieldPanel v-else-if="fieldData" :field="fieldData" />

        <div
          v-if="analyzing"
          class="state analyzing"
          role="status"
          aria-live="polite"
        >
          <div class="spinner" />
          <p>Running agents (Data Analyst, Risk Analyst, Agronomist, Coordinator)…</p>
          <p class="hint">This may take 10–20 seconds</p>
        </div>

        <AnalysisView v-else-if="result" :result="result" />
      </template>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  max-width: 1100px;
  width: 100%;
  margin: -1rem auto 0;
  padding: 0 1.25rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.error {
  background: var(--red-pale);
  color: var(--red);
  border: 1px solid #f5c2c2;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin: 0;
}

.state {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}

.analyzing {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.spinner {
  width: 36px;
  height: 36px;
  margin: 0 auto 1rem;
  border: 3px solid var(--border);
  border-top-color: var(--green);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.hint {
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
}
</style>
