import assert from "node:assert/strict";
import { it } from "node:test";
import { parseImagePayload } from "../backend/presentation/http/image-request-utils.js";

const tinyPngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

it("parseImagePayload accepts valid base64 image payloads", () => {
  const parsed = parseImagePayload({
    image: tinyPngBase64,
    mimeType: "image/png",
    fileName: "39.060664,1.397765.png",
  });

  assert.ok(!("error" in parsed));
  if ("error" in parsed) return;

  assert.equal(parsed.mimeType, "image/png");
  assert.equal(parsed.base64, tinyPngBase64);
});

it("parseImagePayload strips data URL prefixes", () => {
  const parsed = parseImagePayload({
    image: `data:image/png;base64,${tinyPngBase64}`,
    mimeType: "image/png",
    fileName: "39.060664,1.397765.png",
  });

  assert.ok(!("error" in parsed));
  if ("error" in parsed) return;

  assert.equal(parsed.base64, tinyPngBase64);
});

it("parseImagePayload rejects unsupported mime types", () => {
  const parsed = parseImagePayload({
    image: tinyPngBase64,
    mimeType: "image/gif",
    fileName: "39.060664,1.397765.png",
  });

  assert.ok("error" in parsed);
});
