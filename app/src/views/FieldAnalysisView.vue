<script setup lang="ts">
import { ref } from "vue"
import { analyzeField } from "../api/client"
import AnalysisLoadingState from "../components/AnalysisLoadingState.vue"
import AnalysisView from "../components/AnalysisView.vue"
import EmptyState from "../components/EmptyState.vue"
import ErrorAlert from "../components/ErrorAlert.vue"
import FieldMapView from "../components/map/FieldMapView.vue"
import FieldPanel from "../components/FieldPanel.vue"
import FieldWorkflowBar from "../components/FieldWorkflowBar.vue"
import { useFields } from "../composables/useFields"
import AppLayout from "../layouts/AppLayout.vue"
import type { AnalysisOutput } from "../types"

const {
  fields,
  selectedFile,
  fieldData,
  loadingFields,
  loadingField,
  error: fieldsError,
  selectField,
} = useFields()

const result = ref<AnalysisOutput | null>(null)
const analyzing = ref(false)
const analysisError = ref<string | null>(null)

async function onFieldSelected(file: string): Promise<void> {
  if (file === selectedFile.value) return
  result.value = null
  analysisError.value = null
  await selectField(file)
}

async function runAnalysis(): Promise<void> {
  if (!selectedFile.value) return
  window.scrollTo({ top: 0, behavior: "smooth" })
  analyzing.value = true
  analysisError.value = null
  result.value = null
  try {
    result.value = await analyzeField(selectedFile.value)
  } catch (e) {
    analysisError.value = e instanceof Error ? e.message : "Analysis failed"
  } finally {
    analyzing.value = false
  }
}
</script>

<template>
  <AppLayout>
    <ErrorAlert
      v-if="fieldsError || analysisError"
      :message="(analysisError ?? fieldsError)!"
    />

    <FieldWorkflowBar
      :fields="fields"
      :selected-file="selectedFile"
      :loading-fields="loadingFields"
      :loading-field="loadingField"
      :analyzing="analyzing"
      @select-field="onFieldSelected"
      @analyze="runAnalysis"
    />

    <EmptyState v-if="loadingFields" message="Loading fields…" />

    <template v-else>
      <AnalysisLoadingState
        v-if="analyzing"
        message="Running agents (Data Analyst, Risk Analyst, Agronomist, Coordinator)…"
        hint="This may take 10-20 seconds"
      />

      <AnalysisView v-else-if="result" :result="result" :field="fieldData" />

      <EmptyState
        v-if="fields.length === 0"
        message="No fields are available."
      />

      <FieldMapView
        v-if="fields.length > 0"
        :selected-file="selectedFile"
        @select-field="onFieldSelected"
      />

      <EmptyState v-if="loadingField" message="Loading field data…" />
      <FieldPanel
        v-else-if="fieldData"
        :key="selectedFile"
        :field="fieldData"
      />
    </template>
  </AppLayout>
</template>
