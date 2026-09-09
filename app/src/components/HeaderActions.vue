<template>
  <div class="header-actions">
    <slot />
  </div>
</template>

<style scoped>
.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

@media (max-width: 560px) {
  .header-actions {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
}
</style>
