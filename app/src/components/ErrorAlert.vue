<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>

<template>
  <p class="error" role="alert">{{ message }}</p>
</template>

<style scoped>
.error {
  background: var(--red-pale);
  color: var(--red);
  border: 1px solid #f5c2c2;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin: 0;
}
</style>
