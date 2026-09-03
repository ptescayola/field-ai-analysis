import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getAllowedOrigins,
  isValidFieldFile,
  parseCoordinates,
} from "../backend/presentation/http/request-utils.js";

describe("isValidFieldFile", () => {
  it("accepts safe JSON file names", () => {
    assert.equal(isValidFieldFile("field-001.json"), true);
    assert.equal(isValidFieldFile("demo_field.json"), true);
  });

  it("rejects traversal and non-JSON paths", () => {
    assert.equal(isValidFieldFile("../secret.json"), false);
    assert.equal(isValidFieldFile("nested/field.json"), false);
    assert.equal(isValidFieldFile("field-001.txt"), false);
  });
});

describe("parseCoordinates", () => {
  it("parses coordinates inside the valid range", () => {
    assert.deepEqual(parseCoordinates("41.39", "2.17"), {
      latitude: 41.39,
      longitude: 2.17,
    });
  });

  it("rejects missing, non-numeric, and out-of-range values", () => {
    assert.equal(parseCoordinates(undefined, "2.17"), null);
    assert.equal(parseCoordinates("north", "2.17"), null);
    assert.equal(parseCoordinates("91", "2.17"), null);
    assert.equal(parseCoordinates("41.39", "181"), null);
  });
});

describe("getAllowedOrigins", () => {
  it("normalizes Vercel host names and keeps explicit URLs", () => {
    const origins = getAllowedOrigins({
      APP_URL: "https://example.com",
      VERCEL_URL: "preview.vercel.app",
    });

    assert.ok(origins.includes("https://example.com"));
    assert.ok(origins.includes("https://preview.vercel.app"));
    assert.ok(origins.includes("http://localhost:5173"));
  });
});
