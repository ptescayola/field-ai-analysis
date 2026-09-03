import OpenAI from "openai";

let client: OpenAI | undefined;

export function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "Missing OPENAI_API_KEY. Copy .env.example to .env and add your OpenAI API key."
    );
  }

  client ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return client;
}

export function getModel(): string {
  return process.env.OPENAI_MODEL ?? "gpt-4o-mini";
}
