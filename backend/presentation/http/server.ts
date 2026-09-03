import "dotenv/config";
import { serve } from "@hono/node-server";
import { createHonoApp } from "./create-app.js";

const app = createHonoApp();
const port = Number(process.env.PORT ?? 3001);

console.error(`API listening on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
