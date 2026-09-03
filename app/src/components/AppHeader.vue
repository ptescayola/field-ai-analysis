<script setup lang="ts">
import type { FieldListItem } from "../types";

defineProps<{
  fields: FieldListItem[];
  selectedFile: string;
  loadingFields: boolean;
  loadingField: boolean;
  analyzing: boolean;
}>();

const emit = defineEmits<{
  "update:selectedFile": [file: string];
  analyze: [];
}>();

function selectField(event: Event): void {
  emit("update:selectedFile", (event.target as HTMLSelectElement).value);
}
</script>

<template>
  <header class="header">
    <div class="header-inner">
      <div class="title">
        <p class="eyebrow">Field analysis with specialized agents</p>
        <h1>
          <img
            src="/favicon.ico"
            alt=""
            class="title-icon"
            width="24"
            height="24"
          />
          AI Agronomic Copilot
        </h1>
        <p class="meta">
          Pere Torres Escayola
          <span aria-hidden="true">·</span>
          Powered by OpenAI
        </p>
      </div>

      <div class="controls">
        <label for="field-select">Field</label>
        <div class="actions">
          <select
            id="field-select"
            :value="selectedFile"
            :disabled="loadingFields || analyzing"
            @change="selectField"
          >
            <option v-for="field in fields" :key="field.file" :value="field.file">
              {{ field.name }} ({{ field.id }})
            </option>
          </select>
          <button
            class="analyze-button"
            :disabled="!selectedFile || analyzing || loadingField"
            @click="emit('analyze')"
          >
            {{ analyzing ? "Analyzing…" : "Analyze field" }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
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
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.title {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.title h1 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 2rem;
  color: #fff;
  line-height: 1.15;
}

.title-icon {
  flex-shrink: 0;
  border-radius: 6px;
}

.eyebrow,
.meta {
  margin: 0;
  opacity: 0.8;
}

.eyebrow {
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.meta {
  margin-top: 0.15rem;
  font-size: 0.85rem;
}

.meta span {
  margin: 0 0.4rem;
  opacity: 0.6;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.8rem;
}

.actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
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

.analyze-button {
  padding: 0.6rem 1.25rem;
  border: 0;
  border-radius: 8px;
  background: #fff;
  color: var(--green);
  font-size: 0.95rem;
  font-weight: 600;
  transition: transform 0.15s, box-shadow 0.15s;
}

.analyze-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
}

@media (max-width: 560px) {
  .header-inner,
  .actions {
    align-items: stretch;
  }

  .header-inner,
  .actions {
    flex-direction: column;
  }

  .title h1 {
    font-size: 1.65rem;
  }

  select {
    width: 100%;
    min-width: 0;
  }
}
</style>
