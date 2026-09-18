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

it("maps root zone limitation and aliases", () => {
  assert.equal(riskIconKey("root_zone_limitation"), "root_zone_limitation")
  assert.equal(
    riskIconUrl("root_zone_limitation"),
    "/icons/risk/root_zone_limitation.png",
  )
  assert.equal(riskIconKey("shallow_root_zone"), "root_zone_limitation")
})
