<script setup lang="ts">
defineProps<{
  crop: string;
}>();
</script>

<template>
  <span class="crop-icon" :title="crop" role="img" :aria-label="crop">
    <svg
      v-if="crop === 'grape'"
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <path d="M17 4c2-2 5-2 7-1-1 3-4 5-7 4" class="leaf" />
      <path d="M16 3v6" class="stem" />
      <circle cx="12" cy="11" r="4" />
      <circle cx="20" cy="11" r="4" />
      <circle cx="16" cy="17" r="4" />
      <circle cx="11" cy="20" r="4" />
      <circle cx="21" cy="20" r="4" />
      <circle cx="16" cy="25" r="4" />
    </svg>

    <svg
      v-else-if="crop === 'corn'"
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <path d="M16 5c6 2 7 16 0 22-7-6-6-20 0-22Z" />
      <path d="M9 13c-4 5-2 12 7 15M23 13c4 5 2 12-7 15" class="leaf" />
      <path d="M13 10h6M12 14h8M12 18h8M13 22h6" class="detail" />
    </svg>

    <svg
      v-else-if="crop === 'olive'"
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <path d="M7 27C13 20 18 13 25 5" class="stem" />
      <path d="M9 21C4 20 3 16 4 14c5 0 8 3 7 6M15 15c-4-2-4-6-2-8 4 1 6 4 4 7M20 11c0-4 3-7 7-7 0 4-2 7-6 8M14 23c3-2 7-1 8 2-3 3-7 2-9 0" class="leaf" />
      <ellipse cx="21" cy="17" rx="3" ry="4" />
    </svg>

    <svg v-else viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 7c7 0 11 4 11 10s-5 10-11 10S5 23 5 17 9 7 16 7Z" />
      <path d="M16 8c-1-4 3-6 6-5-1 3-3 5-6 5ZM16 8c-2-3-5-3-7-1 2 2 4 3 7 1Z" class="leaf" />
    </svg>
  </span>
</template>

<style scoped>
.crop-icon {
  width: 2.25rem;
  height: 2.25rem;
  display: inline-grid;
  flex: 0 0 auto;
  place-items: center;
  color: var(--green);
}

svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

circle,
ellipse,
path {
  fill: currentColor;
  stroke: none;
}

.leaf {
  fill: var(--green-light);
}

.stem,
.detail {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.stem {
  stroke-width: 2;
}

.detail {
  stroke: var(--green-pale);
  stroke-width: 1.5;
}
</style>
