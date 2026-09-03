import { cors } from "hono/cors";
import { Hono } from "hono";
import { createApplication } from "../../composition-root.js";
import { toAnalysisResponse } from "./analysis-response.js";
import {
  getAllowedOrigins,
  getErrorMessage,
  isValidFieldFile,
  parseCoordinates,
} from "./request-utils.js";

export function createHonoApp(): Hono {
  const app = new Hono().basePath("/api");
  const application = createApplication();

  app.use(
    "/*",
    cors({
      origin: getAllowedOrigins(),
    })
  );

  app.onError((error, c) => {
    console.error(error);
    return c.json({ error: "Unexpected server error" }, 500);
  });

  app.get("/health", (c) => c.json({ status: "ok" }));

  app.get("/fields", async (c) => {
    const fields = await application.listFields.execute();
    return c.json(fields);
  });

  app.get("/fields/:file", async (c) => {
    const file = c.req.param("file");
    if (!isValidFieldFile(file)) {
      return c.json({ error: "Invalid field" }, 400);
    }

    try {
      const field = await application.getField.execute(file);
      return c.json(field);
    } catch (error) {
      return c.json({ error: getErrorMessage(error, "Field not found") }, 404);
    }
  });

  app.get("/weather", async (c) => {
    const coordinates = parseCoordinates(c.req.query("lat"), c.req.query("lng"));
    if (!coordinates) return c.json({ error: "Invalid coordinates" }, 400);

    try {
      const forecast = await application.getWeatherForecast.execute(
        coordinates.latitude,
        coordinates.longitude
      );
      return c.json(forecast);
    } catch (error) {
      const message = getErrorMessage(error, "Weather fetch failed");
      return c.json({ error: message }, 502);
    }
  });

  app.post("/analyze", async (c) => {
    const body = (await c.req.json()) as { file?: string };
    const file = body.file ?? "field-001.json";

    if (!isValidFieldFile(file)) {
      return c.json({ error: "Invalid field" }, 400);
    }

    try {
      const result = await application.analyzeField.execute(file);
      return c.json(toAnalysisResponse(result));
    } catch (error) {
      console.error("Analysis failed", error);
      return c.json({ error: "Analysis failed" }, 500);
    }
  });

  return app;
}
