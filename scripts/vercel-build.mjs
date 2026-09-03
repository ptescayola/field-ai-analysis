import { cpSync, existsSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";

function run(command) {
  execSync(command, { stdio: "inherit" });
}

const atRepoRoot = existsSync("app/package.json");
const atAppRoot =
  !atRepoRoot && existsSync("package.json") && existsSync("vite.config.ts");

if (atRepoRoot) {
  run("npm run build");
  run("npm run build --prefix app");
  // Vercel outputDirectory is "dist" at repo root — publish the Vue build there
  if (existsSync("dist")) {
    rmSync("dist", { recursive: true, force: true });
  }
  cpSync("app/dist", "dist", { recursive: true });
} else if (atAppRoot) {
  run("npm run build --prefix ..");
  run("npm run build");
} else {
  throw new Error(
    "Unexpected project layout. Deploy from the repository root (Root Directory must be empty)."
  );
}

const staticIndex = atRepoRoot ? "dist/index.html" : "dist/index.html";
if (!existsSync(staticIndex)) {
  throw new Error(
    `Frontend build missing: expected ${staticIndex}. ` +
      "Root Directory should be empty (repo root). Output Directory should be 'dist'."
  );
}

console.error(`✓ Static output ready at ${staticIndex}`);
