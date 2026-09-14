import assert from "node:assert/strict"
import { it } from "node:test"
import {
  DEFAULT_MAP_STYLE_URL,
  resolveMapSatelliteStyleUrl,
  resolveMapStyleUrl,
  withMapApiKey,
} from "../app/src/utils/map-style-url.ts"

const MAPTILER_HOST = "api.maptiler.com"
const MAP_API_KEY = "test-key"

it("withMapApiKey appends the key query param", () => {
  assert.equal(
    withMapApiKey(
      "https://api.maptiler.com/maps/topo-v4/style.json",
      MAP_API_KEY,
    ),
    "https://api.maptiler.com/maps/topo-v4/style.json?key=test-key",
  )
})

it("withMapApiKey returns the base URL when the key is missing", () => {
  assert.equal(
    withMapApiKey(
      "https://api.maptiler.com/maps/topo-v4/style.json",
      undefined,
    ),
    "https://api.maptiler.com/maps/topo-v4/style.json",
  )
})

it("resolveMapStyleUrl appends style.json for MapTiler map URLs", () => {
  const resolved = resolveMapStyleUrl(
    withMapApiKey("https://api.maptiler.com/maps/topo-v4/", MAP_API_KEY),
    MAPTILER_HOST,
  )
  assert.equal(
    resolved,
    "https://api.maptiler.com/maps/topo-v4/style.json?key=test-key",
  )
})

it("resolveMapStyleUrl falls back when unset or invalid", () => {
  assert.equal(
    resolveMapStyleUrl(undefined, MAPTILER_HOST),
    DEFAULT_MAP_STYLE_URL,
  )
  assert.equal(resolveMapStyleUrl("   ", MAPTILER_HOST), DEFAULT_MAP_STYLE_URL)
  assert.equal(
    resolveMapStyleUrl("not-a-url", MAPTILER_HOST),
    DEFAULT_MAP_STYLE_URL,
  )
})

it("resolveMapSatelliteStyleUrl derives MapTiler hybrid from the API key", () => {
  const mapStyle = withMapApiKey(
    "https://api.maptiler.com/maps/topo-v4/style.json",
    MAP_API_KEY,
  )
  const resolved = resolveMapSatelliteStyleUrl(
    mapStyle,
    undefined,
    MAPTILER_HOST,
    MAP_API_KEY,
  )
  assert.equal(
    resolved,
    "https://api.maptiler.com/maps/hybrid/style.json?key=test-key",
  )
})

it("resolveMapSatelliteStyleUrl prefers the explicit satellite URL", () => {
  const resolved = resolveMapSatelliteStyleUrl(
    withMapApiKey("https://api.maptiler.com/maps/topo-v4/style.json", "a"),
    withMapApiKey("https://api.maptiler.com/maps/satellite-v2/style.json", "b"),
    MAPTILER_HOST,
    "b",
  )
  assert.equal(
    resolved,
    "https://api.maptiler.com/maps/satellite-v2/style.json?key=b",
  )
})

it("resolveMapSatelliteStyleUrl returns null without a MapTiler key", () => {
  assert.equal(
    resolveMapSatelliteStyleUrl(undefined, undefined, MAPTILER_HOST, undefined),
    null,
  )
  assert.equal(
    resolveMapSatelliteStyleUrl(
      DEFAULT_MAP_STYLE_URL,
      undefined,
      MAPTILER_HOST,
      MAP_API_KEY,
    ),
    null,
  )
})

it("resolveMapSatelliteStyleUrl returns null without mapTilerHost", () => {
  assert.equal(
    resolveMapSatelliteStyleUrl(
      withMapApiKey(
        "https://api.maptiler.com/maps/topo-v4/style.json",
        MAP_API_KEY,
      ),
      undefined,
      undefined,
      MAP_API_KEY,
    ),
    null,
  )
})
