<script setup lang="ts">
defineProps<{
  message: string;
  hint?: string;
}>();
</script>

<template>
  <div class="state analyzing" role="status" aria-live="polite">
    <div class="spinner" />
    <p>{{ message }}</p>
    <p v-if="hint" class="hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
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
