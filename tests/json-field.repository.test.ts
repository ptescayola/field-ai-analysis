import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, it } from "node:test";
import { JsonFieldRepository } from "../backend/infrastructure/persistence/json-field.repository.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true })
    )
  );
});

async function createRepository(): Promise<{
  directory: string;
  repository: JsonFieldRepository;
}> {
  const directory = await mkdtemp(join(tmpdir(), "field-repository-"));
  temporaryDirectories.push(directory);
  return {
    directory,
    repository: new JsonFieldRepository(directory),
  };
}

const validField = {
  field: {
    id: "FIELD-TEST",
    name: "Test field",
    location: { lat: 41.39, lng: 2.17 },
    area_hectares: 1,
  },
  crop: {
    type: "tomato",
    variety: "test",
    planting_date: "2026-04-15",
    growth_stage: "development",
  },
  soil: {
    type: "loam",
    moisture_percent: 40,
    temperature_c: 22,
    ph: 6.8,
  },
  weather: {
    temperature_c: 25,
    humidity_percent: 60,
    rain_last_7_days_mm: 2,
    forecast: [],
  },
  vegetation: { ndvi: 0.7, ndvi_previous_week: 0.68 },
  observations: [],
};

it("lists only safe JSON fields without exposing filesystem paths", async () => {
  const { directory, repository } = await createRepository();
  await writeFile(join(directory, "field-b.json"), JSON.stringify(validField));
  await writeFile(
    join(directory, "field-a.json"),
    JSON.stringify({
      ...validField,
      field: { ...validField.field, id: "FIELD-A", name: "Field A" },
    })
  );
  await writeFile(join(directory, "notes.txt"), "not a field");

  const fields = await repository.list();

  assert.deepEqual(
    fields.map((field) => field.file),
    ["field-a.json", "field-b.json"]
  );
  assert.equal("path" in fields[0]!, false);
});

it("rejects traversal before reading from the filesystem", async () => {
  const { repository } = await createRepository();

  await assert.rejects(
    repository.getByFileName("../secret.json"),
    /Invalid field file name/
  );
});

it("validates field data at the repository boundary", async () => {
  const { directory, repository } = await createRepository();
  await writeFile(
    join(directory, "invalid.json"),
    JSON.stringify({ ...validField, soil: { moisture_percent: 150 } })
  );

  await assert.rejects(repository.getByFileName("invalid.json"));
});
