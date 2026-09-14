import OpenAI from "openai"

let client: OpenAI | undefined

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY.")
  }

  client ??= new OpenAI({
    apiKey,
  })

  return client
}

export function getModel(): string {
  return process.env.VITE_OPENAI_MODEL ?? "gpt-4o-mini"
}
