import { cors } from "hono/cors";
import { Hono } from "hono";
import { createApplication } from "../../composition-root.js";

function isValidFieldFile(file: string): boolean {
  return file.endsWith(".json") && !file.includes("..");
}

function getAllowedOrigins(): string[] {
  const origins = new Set<string>([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]);

  for (const value of [
    process.env.APP_URL,
    process.env.ALLOWED_ORIGIN,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_URL,
  ]) {
    if (!value) continue;
    origins.add(value.startsWith("http") ? value : `https://${value}`);
  }

  return [...origins];
}

export function createHonoApp(): Hono {
  const app = new Hono();
  const application = createApplication();

  app.use(
    "/*",
    cors({
      origin: getAllowedOrigins(),
    })
  );

  app.get("/api/health", (c) => c.json({ status: "ok" }));

  app.get("/api/fields", async (c) => {
    const fields = await application.listFields.execute();
    return c.json(fields);
  });

  app.get("/api/fields/:file", async (c) => {
    const file = c.req.param("file");
    if (!isValidFieldFile(file)) {
      return c.json({ error: "Invalid field" }, 400);
    }

    const field = await application.getField.execute(file);
    return c.json(field);
  });

  app.get("/api/weather", async (c) => {
    const lat = Number(c.req.query("lat"));
    const lng = Number(c.req.query("lng"));

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return c.json({ error: "Invalid coordinates" }, 400);
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return c.json({ error: "Coordinates out of range" }, 400);
    }

    try {
      const forecast = await application.getWeatherForecast.execute(lat, lng);
      return c.json(forecast);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Weather fetch failed";
      return c.json({ error: message }, 502);
    }
  });

  app.post("/api/analyze", async (c) => {
    const body = (await c.req.json()) as { file?: string };
    const file = body.file ?? "field-001.json";

    if (!isValidFieldFile(file)) {
      return c.json({ error: "Invalid field" }, 400);
    }

    const result = await application.analyzeField.execute(file);
    return c.json(result);
  });

  return app;
}
