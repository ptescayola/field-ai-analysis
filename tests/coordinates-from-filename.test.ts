import assert from "node:assert/strict";
import { it } from "node:test";
import { parseCoordinatesFromFilename } from "../backend/domain/field/coordinates-from-filename.js";

it("parseCoordinatesFromFilename extracts lat and lng from image filenames", () => {
  assert.deepEqual(parseCoordinatesFromFilename("39.060664,1.397765.png"), {
    latitude: 39.060664,
    longitude: 1.397765,
  });

  assert.deepEqual(parseCoordinatesFromFilename("42.51,-8.81.jpg"), {
    latitude: 42.51,
    longitude: -8.81,
  });

  assert.deepEqual(
    parseCoordinatesFromFilename("/uploads/39.060664, 1.397765.webp"),
    {
      latitude: 39.060664,
      longitude: 1.397765,
    }
  );
});

it("parseCoordinatesFromFilename rejects invalid filenames", () => {
  assert.equal(parseCoordinatesFromFilename("field-photo.png"), null);
  assert.equal(parseCoordinatesFromFilename("39.060664.png"), null);
  assert.equal(parseCoordinatesFromFilename("39.060664,1.397765.gif"), null);
  assert.equal(parseCoordinatesFromFilename("91,0.png"), null);
});
