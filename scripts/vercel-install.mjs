import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

function run(command) {
  execSync(command, { stdio: "inherit" });
}

const atRepoRoot = existsSync("app/package.json");
const atAppRoot =
  !atRepoRoot && existsSync("package.json") && existsSync("vite.config.ts");

if (atRepoRoot) {
  run("npm install");
  run("npm install --prefix app");
} else if (atAppRoot) {
  console.error(
    "\n⚠️  Vercel Root Directory is set to \"app\" but this project must deploy from the repository root.\n" +
      "   Fix: Project → Settings → General → Root Directory → clear the field → Save → Redeploy.\n" +
      "   Without this, /api routes, backend/, data/ and agents/ are not deployed.\n"
  );
  run("npm install");
  run("npm install --prefix ..");
} else {
  throw new Error(
    "Unexpected project layout. Deploy from the repository root (Root Directory must be empty)."
  );
}
