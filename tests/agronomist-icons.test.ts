import assert from "node:assert/strict"
import { it } from "node:test"
import { agronomistIconUrl } from "../app/src/utils/agronomist-icons.ts"

it("maps agronomist facet ids to icon paths", () => {
  assert.equal(
    agronomistIconUrl("irrigation"),
    "/icons/agronomist/irrigation.png",
  )
  assert.equal(
    agronomistIconUrl("development"),
    "/icons/agronomist/development.png",
  )
})
