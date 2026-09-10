import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import WMO4677Meteocons from "weather-i18n/wmo_4677/icons/meteocons";
import codes from "../src/constants/open-meteo-forecast-wmo-codes.json" with {
  type: "json",
};

const FALLBACK_SLUG = "not-available";
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const assetDir = path.join(scriptDir, "../src/assets/meteocons");
const sourceDir = path.join(
  scriptDir,
  "../node_modules/@meteocons/svg-static/flat",
);

const slugs = new Set([FALLBACK_SLUG]);
for (const code of codes) {
  const slug =
    WMO4677Meteocons(code, "day", {
      variant: "flat",
      format: "svg-static",
    }) ?? FALLBACK_SLUG;
  slugs.add(slug);
}

fs.mkdirSync(assetDir, { recursive: true });

for (const existing of fs.readdirSync(assetDir)) {
  if (existing.endsWith(".svg")) {
    fs.unlinkSync(path.join(assetDir, existing));
  }
}

for (const slug of slugs) {
  const source = path.join(sourceDir, `${slug}.svg`);
  if (!fs.existsSync(source)) {
    throw new Error(`Missing Meteocons icon: ${slug}.svg`);
  }
  fs.copyFileSync(source, path.join(assetDir, `${slug}.svg`));
}

console.log(`Synced ${slugs.size} Meteocons icons to src/assets/meteocons/`);
