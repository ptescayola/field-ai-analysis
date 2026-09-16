<script setup lang="ts">
import type { Risk } from "../../types"

defineProps<{
  risk: Risk
  label: string
}>()
</script>

<template>
  <li class="risk-meter" :class="`risk-meter--${risk.severity}`">
    <div class="risk-meter-head">
      <strong class="risk-meter-title">{{ label }}</strong>
      <span class="badge" :class="`severity-${risk.severity}`">{{
        risk.severity
      }}</span>
    </div>
    <p class="risk-meter-evidence">{{ risk.evidence }}</p>
  </li>
</template>

<style scoped>
.risk-meter {
  list-style: none;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--border);
}

.risk-meter:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.risk-meter-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
}

.risk-meter-title {
  min-width: 0;
}

.badge {
  font-size: 0.7rem;
  text-transform: uppercase;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  font-weight: 600;
  flex-shrink: 0;
}

.severity-low {
  background: var(--green-pale);
  color: var(--green);
}

.severity-medium {
  background: var(--amber-pale);
  color: #b08900;
}

.severity-high {
  background: var(--red-pale);
  color: var(--red);
}

.risk-meter-evidence {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--text-muted);
}
</style>
