<script setup lang="ts">
defineProps<{
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  label?: string;
}>();
</script>

<template>
  <button
    type="button"
    class="analyze-button"
    :disabled="disabled || loading"
  >
    {{ loading ? (loadingLabel ?? "Analyzing…") : (label ?? "Analyze") }}
  </button>
</template>

<style scoped>
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
</style>
