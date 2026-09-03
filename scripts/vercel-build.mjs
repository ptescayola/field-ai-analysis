import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

function run(command) {
  execSync(command, { stdio: "inherit" });
}

const atRepoRoot = existsSync("app/package.json");
const atAppRoot =
  !atRepoRoot && existsSync("package.json") && existsSync("vite.config.ts");

if (atRepoRoot) {
  run("npm run build");
  run("npm run build --prefix app");
} else if (atAppRoot) {
  run("npm run build --prefix ..");
  run("npm run build");
} else {
  throw new Error(
    "Unexpected project layout. Deploy from the repository root (Root Directory must be empty)."
  );
}

const staticIndex = atRepoRoot ? "dist/index.html" : "../dist/index.html";
if (!existsSync(staticIndex)) {
  throw new Error(
    `Frontend build missing: expected ${staticIndex}. Check Vite outDir and Root Directory settings.`
  );
}
