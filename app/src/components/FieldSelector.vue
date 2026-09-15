<script setup lang="ts">
import type { FieldListItem } from "../types"

defineProps<{
  fields: FieldListItem[]
  modelValue: string
  disabled?: boolean
  label?: string
  id?: string
  allowEmpty?: boolean
  emptyLabel?: string
  /** Horizontal label + control (header toolbar). */
  inline?: boolean
}>()

const emit = defineEmits<{
  "update:modelValue": [file: string]
}>()

function onChange(event: Event): void {
  emit("update:modelValue", (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <div class="field-selector" :class="{ inline }">
    <label :for="id ?? 'field-select'">{{ label ?? "Field" }}</label>
    <select
      :id="id ?? 'field-select'"
      :value="modelValue"
      :disabled="disabled"
      @change="onChange"
    >
      <option v-if="allowEmpty" value="">
        {{ emptyLabel ?? "No field selected" }}
      </option>
      <option v-for="field in fields" :key="field.file" :value="field.file">
        {{ field.name }} ({{ field.id }})
      </option>
    </select>
  </div>
</template>

<style scoped>
.field-selector {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.8rem;
  flex: 1 1 12rem;
  min-width: 0;
}

.field-selector.inline {
  flex-direction: row;
  align-items: center;
  gap: 0.65rem;
}

.field-selector.inline label {
  flex-shrink: 0;
  margin: 0;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

label {
  font-weight: 600;
  color: var(--text-muted);
}

select {
  min-width: min(100%, 280px);
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: 0.95rem;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

select:focus-visible {
  outline: none;
  border-color: var(--green-light);
  box-shadow: 0 0 0 3px rgb(64 145 108 / 25%);
}

select:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.field-selector.inline select {
  flex: 1;
  min-width: 0;
}

@media (max-width: 640px) {
  .field-selector.inline {
    flex-direction: column;
    align-items: stretch;
  }

  select {
    width: 100%;
    min-width: 0;
  }
}
</style>
