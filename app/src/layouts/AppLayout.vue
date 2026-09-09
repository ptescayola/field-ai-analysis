<script setup lang="ts">
import AppFooter from "../components/AppFooter.vue";
import AppHeader from "../components/AppHeader.vue";

defineProps<{
  eyebrow?: string;
  experimental?: boolean;
}>();
</script>

<template>
  <div class="app">
    <AppHeader :eyebrow="eyebrow" :experimental="experimental">
      <template v-if="$slots.actions" #actions>
        <slot name="actions" />
      </template>
    </AppHeader>

    <main class="main">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  max-width: 1100px;
  width: 100%;
  margin: -1rem auto 0;
  padding: 0 1.25rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
</style>
