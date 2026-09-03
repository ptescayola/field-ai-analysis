import assert from "node:assert/strict";
import { it } from "node:test";
import { z } from "zod";
import { validateAgentOutput } from "../backend/infrastructure/llm/validate-output.js";

const outputSchema = z.object({
  confidence: z.number().min(0).max(1),
});

it("returns a schema-validated agent output", () => {
  assert.deepEqual(
    validateAgentOutput(outputSchema, { confidence: 0.8 }, "coordinator"),
    { confidence: 0.8 }
  );
});

it("reports the agent and invalid field when output validation fails", () => {
  assert.throws(
    () =>
      validateAgentOutput(
        outputSchema,
        { confidence: 1.5 },
        "coordinator"
      ),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /coordinator output failed validation/);
      assert.match(error.message, /confidence/);
      return true;
    }
  );
});
