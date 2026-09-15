<script setup lang="ts">
import AnalyzeButton from "./AnalyzeButton.vue"
import FieldSelector from "./FieldSelector.vue"
import type { FieldListItem } from "../types"

defineProps<{
  fields: FieldListItem[]
  selectedFile: string
  loadingFields?: boolean
  loadingField?: boolean
  analyzing?: boolean
}>()

const emit = defineEmits<{
  "select-field": [file: string]
  analyze: []
}>()
</script>

<template>
  <section class="field-workflow" aria-label="Field selection and analysis">
    <FieldSelector
      inline
      :fields="fields"
      :model-value="selectedFile"
      :disabled="loadingFields || analyzing"
      @update:model-value="emit('select-field', $event)"
    />
    <AnalyzeButton
      label="Analyze field"
      :disabled="!selectedFile || loadingField"
      :loading="analyzing"
      @click="emit('analyze')"
    />
  </section>
</template>

<style scoped>
.field-workflow {
  position: sticky;
  top: calc(
    var(--app-header-offset, 3.75rem) + var(--main-block-padding-top, 1.5rem)
  );
  z-index: 15;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  padding: 1rem 1.15rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 2px 12px rgb(26 46 26 / 8%);
}

@media (max-width: 640px) {
  .field-workflow {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
