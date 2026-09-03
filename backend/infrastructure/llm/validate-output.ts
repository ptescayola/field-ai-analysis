import type { ZodType } from "zod";
import { ZodError } from "zod";

export function validateAgentOutput<T>(
  schema: ZodType<T>,
  output: unknown,
  agentName: string
): T {
  try {
    return schema.parse(output);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      throw new Error(`${agentName} output failed validation: ${details}`);
    }
    throw error;
  }
}
