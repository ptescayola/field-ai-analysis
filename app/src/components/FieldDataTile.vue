<script setup lang="ts">
import type { AssessmentTone } from "../utils/data-analyst-assessment"

export type MetricProgressTone = "moisture" | "rain" | "vegetation" | "temp"

export type FieldDataTileAnalyst = {
  label: string
  tone: AssessmentTone
  hint?: string
}

export type HighlightSeverity = "low" | "medium" | "high"

export type FieldDataTileModel = {
  id: string
  label: string
  highlight: string
  footer?: string[]
  capitalizeHighlight?: boolean
  capitalizeFooter?: boolean
  progress?: { pct: number; tone: MetricProgressTone }
  footerAccents?: Array<"up" | "down" | undefined>
  analyst?: FieldDataTileAnalyst
  highlightSeverity?: HighlightSeverity
  footerAlign?: "center" | "start"
  iconSrc?: string
}

withDefaults(
  defineProps<{
    label: string
    highlight: string
    footer?: string[]
    capitalizeHighlight?: boolean
    capitalizeFooter?: boolean
    progress?: FieldDataTileModel["progress"]
    footerAccents?: FieldDataTileModel["footerAccents"]
    analyst?: FieldDataTileAnalyst
    highlightSeverity?: HighlightSeverity
    footerAlign?: "center" | "start"
    iconSrc?: string
  }>(),
  {
    footer: () => [],
    capitalizeHighlight: false,
    capitalizeFooter: false,
    footerAccents: () => [],
    footerAlign: "center",
  },
)

function footerAccentClass(accent: "up" | "down" | undefined): string | undefined {
  if (accent === "up") return "footer-accent-up"
  if (accent === "down") return "footer-accent-down"
  return undefined
}
</script>

<template>
  <article class="field-data-tile">
    <div v-if="iconSrc" class="field-data-tile-icon">
      <img :src="iconSrc" alt="" width="32" height="32" decoding="async" />
    </div>
    <span class="field-data-tile-label">{{ label }}</span>
    <p
      class="field-data-tile-highlight"
      :class="[
        { capitalize: capitalizeHighlight },
        highlightSeverity
          ? `field-data-tile-highlight--severity-${highlightSeverity}`
          : undefined,
      ]"
    >
      {{ highlight }}
    </p>
    <div v-if="progress" class="field-data-tile-track">
      <div
        class="field-data-tile-fill"
        :class="`field-data-tile-fill--${progress.tone}`"
        :style="{ width: `${progress.pct}%` }"
      />
    </div>
    <div
      v-if="footer.length"
      class="field-data-tile-footer"
      :class="{ 'field-data-tile-footer--start': footerAlign === 'start' }"
    >
      <span
        v-for="(line, index) in footer"
        :key="index"
        :class="[
          { capitalize: capitalizeFooter },
          footerAccentClass(footerAccents[index]),
        ]"
      >
        {{ line }}
      </span>
    </div>
    <div v-if="analyst" class="field-data-tile-analyst">
      <span
        class="field-data-tile-analyst-chip"
        :class="`field-data-tile-analyst-chip--${analyst.tone}`"
        :title="analyst.hint"
      >
        {{ analyst.label }}
      </span>
    </div>
  </article>
</template>

<style scoped>
.field-data-tile {
  background: var(--surface-muted);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.65rem 0.7rem 0.7rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 7.25rem;
  min-width: 0;
}

.field-data-tile-icon {
  display: flex;
  justify-content: center;
  margin: 0.75rem 0 0.8rem;
}

.field-data-tile-icon img {
  width: 2rem;
  height: 2rem;
  object-fit: contain;
  border-radius: 50%;
}

.field-data-tile-label {
  font-size: 0.62rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  text-align: center;
}

.field-data-tile-highlight {
  flex: 1;
  display: flex;
  justify-content: center;
  margin: 0.35rem 0 0.15rem;
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.25;
  text-align: center;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.field-data-tile-highlight--severity-low {
  color: var(--green);
}

.field-data-tile-highlight--severity-medium {
  color: #b08900;
}

.field-data-tile-highlight--severity-high {
  color: var(--red);
}

.field-data-tile-track {
  height: 0.35rem;
  border-radius: 999px;
  background: var(--chart-track);
  overflow: hidden;
  margin-bottom: 0.2rem;
}

.field-data-tile-fill {
  height: 100%;
  border-radius: inherit;
}

.field-data-tile-fill--temp {
  background: var(--chart-temp);
}

.field-data-tile-fill--moisture {
  background: var(--chart-water);
}

.field-data-tile-fill--rain {
  background: var(--chart-water-deep);
}

.field-data-tile-fill--vegetation {
  background: var(--chart-vegetation);
}

.field-data-tile-footer {
  margin-top: auto;
  padding-top: 0.45rem;
  border-top: 1px solid rgb(216 226 208 / 65%);
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  font-size: 0.72rem;
  line-height: 1.35;
  text-align: center;
  color: var(--text-muted);
}

.field-data-tile-footer--start {
  text-align: left;
}

.footer-accent-up {
  color: var(--green);
  font-weight: 600;
}

.footer-accent-down {
  color: var(--red);
  font-weight: 600;
}

.capitalize {
  text-transform: capitalize;
}

.field-data-tile-analyst {
  margin-top: auto;
  padding-top: 0.45rem;
  border-top: 1px solid rgb(216 226 208 / 65%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.field-data-tile-footer + .field-data-tile-analyst {
  margin-top: 0.45rem;
  padding-top: 0.45rem;
}

.field-data-tile-analyst-chip {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  line-height: 1.25;
}

.field-data-tile-analyst-chip--neutral {
  background: var(--green-pale);
  color: var(--green);
}

.field-data-tile-analyst-chip--low {
  background: var(--chart-secondary-pale);
  color: var(--chart-secondary);
}

.field-data-tile-analyst-chip--high {
  background: var(--amber-pale);
  color: var(--amber-deep);
}
</style>
