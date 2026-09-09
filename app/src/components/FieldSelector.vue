<script setup lang="ts">
import type { FieldListItem } from "../types";

defineProps<{
  fields: FieldListItem[];
  modelValue: string;
  disabled?: boolean;
  label?: string;
  id?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [file: string];
}>();

function onChange(event: Event): void {
  emit("update:modelValue", (event.target as HTMLSelectElement).value);
}
</script>

<template>
  <div class="field-selector">
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
}

select {
  min-width: 220px;
  padding: 0.55rem 0.75rem;
  border: 0;
  border-radius: 8px;
  background: rgb(255 255 255 / 95%);
  color: var(--text);
  font: inherit;
  font-size: 0.95rem;
}

@media (max-width: 560px) {
  select {
    width: 100%;
    min-width: 0;
  }
}
</style>
