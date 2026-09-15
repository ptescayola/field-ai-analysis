<script setup lang="ts">
import AppFooter from "../components/AppFooter.vue"
import AppHeader from "../components/AppHeader.vue"
import { useAppHeaderOffset } from "../composables/useAppHeaderOffset"

useAppHeaderOffset()
</script>

<template>
  <div class="app">
    <AppHeader />

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
  --main-block-padding-top: 1.5rem;
  flex: 1;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: var(--main-block-padding-top) 1.25rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
</style>
