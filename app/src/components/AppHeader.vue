<script setup lang="ts">
import { RouterLink, useRoute } from "vue-router"

const route = useRoute()

const navItems = [
  { to: "/", label: "Fields" },
  { to: "/image", label: "Image", beta: true },
] as const
</script>

<template>
  <header class="header app-header">
    <div class="header-inner">
      <RouterLink to="/" class="brand">
        <img
          src="/favicon.ico"
          alt=""
          class="brand-icon"
          width="32"
          height="32"
        />
        <span class="brand-name">Field AI Analysis</span>
      </RouterLink>

      <nav class="nav" aria-label="Main">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ active: route.path === item.to }"
          :aria-current="route.path === item.to ? 'page' : undefined"
        >
          {{ item.label }}
          <span v-if="'beta' in item" class="nav-badge">Beta</span>
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--green);
  color: #fff;
  box-shadow: 0 2px 8px rgb(26 46 26 / 12%);
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0.85rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
  color: inherit;
  text-decoration: none;
}

.brand-icon {
  flex-shrink: 0;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgb(0 0 0 / 25%);
}

.brand-name {
  font-family: var(--font-display);
  font-size: clamp(1.05rem, 3.5vw, 1.35rem);
  line-height: 1.15;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav {
  flex-shrink: 0;
  display: inline-flex;
  padding: 0.18rem;
  gap: 0.12rem;
  border-radius: 10px;
  background: rgb(0 0 0 / 22%);
  border: 1px solid rgb(255 255 255 / 14%);
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.42rem 0.9rem;
  border-radius: 8px;
  color: rgb(255 255 255 / 90%);
  text-decoration: none;
  font-size: 0.84rem;
  font-weight: 600;
  white-space: nowrap;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.nav-link:hover {
  color: #fff;
  background: rgb(255 255 255 / 12%);
}

.nav-link.active {
  background: #fff;
  color: var(--green);
}

.nav-link:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.nav-badge {
  padding: 0.06rem 0.38rem;
  border-radius: 999px;
  background: var(--amber-pale);
  color: #8a6500;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

@media (max-width: 520px) {
  .header-inner {
    padding: 0.75rem 1rem;
    flex-wrap: wrap;
  }

  .nav {
    width: 100%;
  }

  .nav-link {
    flex: 1;
    justify-content: center;
  }
}
</style>
