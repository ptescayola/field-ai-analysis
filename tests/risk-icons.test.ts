import assert from "node:assert/strict"
import { it } from "node:test"
import { riskIconKey, riskIconUrl } from "../app/src/utils/risk-icons.ts"

it("maps known risk types to icon paths", () => {
  assert.equal(riskIconKey("water_stress"), "water_stress")
  assert.equal(
    riskIconUrl("nutrient_deficiency"),
    "/icons/risk/nutrient_deficiency.png",
  )
})

it("normalizes spaced risk type labels", () => {
  assert.equal(riskIconKey("Extreme Weather"), "extreme_weather")
})
