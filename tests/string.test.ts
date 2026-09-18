import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  formatLabel,
  normalizeUnderscoreKey,
  underscoreToSpaces,
} from "../backend/domain/string.js"

describe("string utils", () => {
  it("underscoreToSpaces replaces underscores", () => {
    assert.equal(underscoreToSpaces("root_zone_limitation"), "root zone limitation")
  })

  it("normalizeUnderscoreKey trims and lowercases", () => {
    assert.equal(normalizeUnderscoreKey("  Moderately_High "), "moderately high")
  })

  it("formatLabel title-cases words", () => {
    assert.equal(formatLabel("crop_stress"), "Crop Stress")
  })
})
