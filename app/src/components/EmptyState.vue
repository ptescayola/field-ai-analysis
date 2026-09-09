<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>

<template>
  <div class="state" aria-live="polite">{{ message }}</div>
</template>

<style scoped>
.state {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}
</style>
