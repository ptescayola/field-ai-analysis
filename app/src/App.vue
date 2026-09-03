<script setup lang="ts">
import { onMounted, ref } from "vue";
import { analyzeField, fetchField, fetchFields } from "./api/client";
import AnalysisView from "./components/AnalysisView.vue";
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

async function onFieldChange(): Promise<void> {
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
    <header class="header">
      <div class="header-inner">
        <div>
          <h1>AI Agronomic Copilot</h1>
          <p class="subtitle">Field analysis with specialized agents</p>
        </div>
        <div class="controls">
          <label>
            <span>Field</span>
            <select
              v-model="selectedFile"
              :disabled="loadingFields || analyzing"
              @change="onFieldChange"
            >
              <option v-for="f in fields" :key="f.file" :value="f.file">
                {{ f.name }} ({{ f.id }})
              </option>
            </select>
          </label>
          <button
            class="btn-primary"
            :disabled="!selectedFile || analyzing || loadingField"
            @click="runAnalysis"
          >
            {{ analyzing ? "Analyzing…" : "Analyze field" }}
          </button>
        </div>
      </div>
    </header>

    <main class="main">
      <p v-if="error" class="error">{{ error }}</p>

      <div v-if="loadingFields" class="state">Loading fields…</div>

      <template v-else>
        <div v-if="loadingField" class="state">Loading field data…</div>
        <FieldPanel v-else-if="fieldData" :field="fieldData" />

        <div v-if="analyzing" class="state analyzing">
          <div class="spinner" />
          <p>Running agents (Data Analyst, Risk Analyst, Agronomist, Coordinator)…</p>
          <p class="hint">This may take 10–20 seconds</p>
        </div>

        <AnalysisView v-else-if="result" :result="result" />
      </template>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
}

.header {
  background: var(--green);
  color: #fff;
  padding: 1.5rem 1.25rem 2rem;
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.header h1 {
  margin: 0 0 0.25rem;
  font-size: 2rem;
  color: #fff;
}

.subtitle {
  margin: 0;
  opacity: 0.85;
  font-size: 0.95rem;
}

.controls {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.controls label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.8rem;
  opacity: 0.9;
}

select {
  font-family: inherit;
  font-size: 0.95rem;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  border: none;
  min-width: 220px;
  background: rgb(255 255 255 / 95%);
  color: var(--text);
}

.btn-primary {
  background: #fff;
  color: var(--green);
  border: none;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  transition: transform 0.15s, box-shadow 0.15s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
}

.main {
  max-width: 1100px;
  margin: -1rem auto 0;
  padding: 0 1.25rem 3rem;
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
</style>
