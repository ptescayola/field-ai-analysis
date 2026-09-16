import assert from "node:assert/strict"
import { it } from "node:test"
import {
  getAssessmentDisplay,
  observationForSnapshotTile,
} from "../app/src/utils/data-analyst-assessment.ts"

it("formats moderate assessment label", () => {
  assert.equal(getAssessmentDisplay("moderate").label, "Moderate")
  assert.equal(getAssessmentDisplay("moderate").tone, "neutral")
})

it("maps moderately high to high tone", () => {
  assert.equal(getAssessmentDisplay("moderately high").label, "Moderately high")
  assert.equal(getAssessmentDisplay("moderately high").tone, "high")
})

it("finds soil moisture observation for tile", () => {
  const observations = [
    { metric: "soil_moisture", value: "26%", assessment: "moderate" },
    { metric: "temperature", value: "21°C", assessment: "high" },
  ]
  const hit = observationForSnapshotTile("soil-moisture", observations)
  assert.equal(hit?.assessment, "moderate")
})
