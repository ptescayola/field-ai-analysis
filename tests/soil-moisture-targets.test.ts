import assert from "node:assert/strict"
import { it } from "node:test"
import {
  formatMoistureRecommendedFooter,
  getSoilMoistureAdequateRange,
} from "../app/src/utils/soil-moisture-targets.ts"

it("maps sandy loam to agronomist band", () => {
  assert.deepEqual(getSoilMoistureAdequateRange("sandy_loam"), {
    min: 14,
    max: 22,
  })
})

it("maps calcareous loam to loam band", () => {
  assert.deepEqual(getSoilMoistureAdequateRange("calcareous_loam"), {
    min: 20,
    max: 30,
  })
})

it("formats recommended line when above adequate range", () => {
  assert.equal(
    formatMoistureRecommendedFooter(26, { min: 14, max: 22 }),
    "Recommended ↑ 4%",
  )
})

it("formats recommended line when below adequate range", () => {
  assert.equal(
    formatMoistureRecommendedFooter(10, { min: 14, max: 22 }),
    "Recommended ↓ 4%",
  )
})

it("formats recommended check when within range", () => {
  assert.equal(
    formatMoistureRecommendedFooter(18, { min: 14, max: 22 }),
    "Recommended ✓",
  )
})
