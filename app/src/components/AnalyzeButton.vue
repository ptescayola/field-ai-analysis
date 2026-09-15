<script setup lang="ts">
defineProps<{
  disabled?: boolean
  loading?: boolean
  loadingLabel?: string
  label?: string
}>()
</script>

<template>
  <button type="button" class="analyze-button" :disabled="disabled || loading">
    {{ loading ? (loadingLabel ?? "Analyzing…") : (label ?? "Analyze") }}
  </button>
</template>

<style scoped>
.analyze-button {
  padding: 0.62rem 1.35rem;
  border: 0;
  border-radius: 8px;
  background: var(--green);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  transition:
    background 0.15s,
    transform 0.15s,
    box-shadow 0.15s;
}

.analyze-button:hover:not(:disabled) {
  background: var(--green-light);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgb(45 106 79 / 35%);
}

.analyze-button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgb(64 145 108 / 45%);
}

@media (max-width: 640px) {
  .analyze-button {
    width: 100%;
  }
}
</style>
