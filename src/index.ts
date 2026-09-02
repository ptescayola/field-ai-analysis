import { readFile } from "node:fs/promises";

const field = JSON.parse(
  await readFile("./data/field-001.json", "utf-8")
);

console.log("AI Agronomic Copilot");
console.log("---------------------");
console.log("");
console.log(`Field: ${field.field.name}`);
console.log(`Crop: ${field.crop.type}`);
console.log(`Area: ${field.field.area_hectares} ha`);
console.log(`Soil moisture: ${field.soil.moisture_percent}%`);
console.log(`NDVI: ${field.vegetation.ndvi}`);
