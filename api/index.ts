import { handle } from "hono/vercel";
import { createHonoApp } from "../backend-dist/presentation/http/create-app.js";

export const config = {
  runtime: "nodejs",
  maxDuration: 60,
};

const app = createHonoApp();

export default handle(app);
