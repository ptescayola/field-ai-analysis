import OpenAI from "openai";

let client: OpenAI | undefined;

export function getOpenAIClient(): OpenAI {
  console.log("VERCEL_ENV:", process.env.VERCEL_ENV);
  console.log("OPENAI_API_KEY exists:", Boolean(process.env.OPENAI_API_KEY));
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  client ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return client;
}

export function getModel(): string {
  return process.env.OPENAI_MODEL ?? "gpt-4o-mini";
}
