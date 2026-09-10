<script setup lang="ts">
import { RouterLink, useRoute } from "vue-router";

defineProps<{
  eyebrow?: string;
  experimental?: boolean;
}>();

const route = useRoute();

const navItems = [
  { to: "/", label: "Field analysis" },
  { to: "/image", label: "Image analysis", experimental: true },
] as const;
</script>

<template>
  <header class="header">
    <div class="header-inner">
      <div class="title">
        <p class="eyebrow">
          {{ eyebrow ?? "Field analysis with specialized agents" }}
          <span v-if="experimental" class="experimental-badge">Experimental</span>
        </p>
        <h1>
          <RouterLink to="/" class="title-link">
            <img
              src="/favicon.ico"
              alt=""
              class="title-icon"
              width="24"
              height="24"
            />
            Field AI Analysis
          </RouterLink>
        </h1>
        <p class="meta">
          Pere Torres Escayola
          <span aria-hidden="true">·</span>
          Powered by OpenAI
        </p>
      </div>

      <nav class="nav" aria-label="Main">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ active: route.path === item.to }"
        >
          {{ item.label }}
          <span v-if="'experimental' in item" class="nav-badge">Beta</span>
        </RouterLink>
      </nav>

      <div v-if="$slots.actions" class="controls">
        <slot name="actions" />
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
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem 1.5rem;
  align-items: center;
}

.title {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  grid-column: 1;
}

.title h1 {
  margin: 0;
  font-size: 2rem;
  line-height: 1.15;
}

.title-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #fff;
  text-decoration: none;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.experimental-badge {
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  background: rgb(255 255 255 / 18%);
  font-size: 0.65rem;
  letter-spacing: 0.05em;
}

.meta {
  margin-top: 0.15rem;
  font-size: 0.85rem;
}

.meta span {
  margin: 0 0.4rem;
  opacity: 0.6;
}

.nav {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  align-self: center;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  border: 1px solid rgb(255 255 255 / 30%);
  border-radius: 8px;
  background: rgb(255 255 255 / 10%);
  color: rgb(255 255 255 / 90%);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.nav-link:hover {
  background: rgb(255 255 255 / 18%);
  border-color: rgb(255 255 255 / 45%);
  color: #fff;
}

.nav-link.active {
  background: #fff;
  border-color: #fff;
  color: var(--green);
}

.nav-badge {
  padding: 0.05rem 0.35rem;
  border-radius: 999px;
  background: var(--amber-pale);
  color: #8a6500;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.controls {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

@media (max-width: 720px) {
  .header-inner {
    grid-template-columns: 1fr;
  }

  .nav {
    grid-column: 1;
    grid-row: auto;
    justify-content: flex-start;
  }

  .controls {
    justify-content: stretch;
  }

  .title h1 {
    font-size: 1.65rem;
  }
}
</style>
