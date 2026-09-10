<script setup lang="ts">
import { ref } from "vue";
import { analyzeField } from "../api/client";
import AnalysisLoadingState from "../components/AnalysisLoadingState.vue";
import AnalysisView from "../components/AnalysisView.vue";
import AnalyzeButton from "../components/AnalyzeButton.vue";
import EmptyState from "../components/EmptyState.vue";
import ErrorAlert from "../components/ErrorAlert.vue";
import FieldPanel from "../components/FieldPanel.vue";
import FieldSelector from "../components/FieldSelector.vue";
import HeaderActions from "../components/HeaderActions.vue";
import { useFields } from "../composables/useFields";
import AppLayout from "../layouts/AppLayout.vue";
import type { PipelineResult } from "../types";

const {
  fields,
  selectedFile,
  fieldData,
  loadingFields,
  loadingField,
  error: fieldsError,
  selectField,
} = useFields();

const result = ref<PipelineResult | null>(null);
const analyzing = ref(false);
const analysisError = ref<string | null>(null);

async function onFieldSelected(file: string): Promise<void> {
  result.value = null;
  analysisError.value = null;
  await selectField(file);
}

async function runAnalysis(): Promise<void> {
  if (!selectedFile.value) return;
  analyzing.value = true;
  analysisError.value = null;
  result.value = null;
  try {
    result.value = await analyzeField(selectedFile.value);
  } catch (e) {
    analysisError.value = e instanceof Error ? e.message : "Analysis failed";
  } finally {
    analyzing.value = false;
  }
}
</script>

<template>
  <AppLayout eyebrow="Field analysis with specialized agents">
    <template #actions>
      <HeaderActions>
        <FieldSelector
          :fields="fields"
          :model-value="selectedFile"
          :disabled="loadingFields || analyzing"
          @update:model-value="onFieldSelected"
        />
        <AnalyzeButton
          label="Analyze field"
          :disabled="!selectedFile || loadingField"
          :loading="analyzing"
          @click="runAnalysis"
        />
      </HeaderActions>
    </template>

    <ErrorAlert
      v-if="fieldsError || analysisError"
      :message="(analysisError ?? fieldsError)!"
    />

    <EmptyState v-if="loadingFields" message="Loading fields…" />

    <template v-else>
      <EmptyState v-if="fields.length === 0" message="No fields are available." />

      <AnalysisLoadingState
        v-if="analyzing"
        message="Running agents (Data Analyst, Risk Analyst, Agronomist, Coordinator)…"
        hint="This may take 10–20 seconds"
      />

      <AnalysisView
        v-else-if="result"
        :result="result"
        :field="fieldData"
      />

      <EmptyState v-if="loadingField" message="Loading field data…" />
      <FieldPanel v-else-if="fieldData" :field="fieldData" />
    </template>
  </AppLayout>
</template>
