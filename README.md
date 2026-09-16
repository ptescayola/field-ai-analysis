# Field AI Analysis

Field AI Analysis analyzes field data through a multi-agent pipeline and returns irrigation recommendations, risk assessments, and agronomic insights.

**Live demo:** [field-ai-analysis.vercel.app](https://field-ai-analysis.vercel.app)

The original product brief is available in [`PROJECT.md`](./PROJECT.md).

## Tech stack

- **Frontend:** Vue 3, Vite, TypeScript
- **Backend:** Node.js, Hono, hexagonal architecture
- **AI:** OpenAI (4 specialized agents)
- **Weather:** Open-Meteo (live 7-day forecast)
- **Map:** MapLibre GL JS
- **Deploy:** Vercel (static app + serverless API)

## Architecture

Hexagonal architecture (ports & adapters) with DDD bounded contexts:

```
field-ai-analysis/
├── app/              # Vue frontend
├── api/              # Vercel serverless routes
├── backend/
│   ├── domain/       # Schemas, entities, port interfaces
│   ├── application/  # Use cases & orchestration
│   ├── infrastructure/  # OpenAI, Open-Meteo, filesystem adapters
│   └── presentation/ # Hono HTTP server, CLI
├── agents/           # Versioned LLM prompts (*.md)
└── data/             # Field snapshots (JSON fixtures)
```

### Agent pipeline

```
Field snapshot + live weather (Open-Meteo)
    │
    ├─ Data Analyst ──┐
    └─ Risk Analyst ──┤
                      ▼
                 Agronomist
                      ▼
                 Coordinator → AnalysisOutput
```

Agent prompts live in `agents/*.md`.

## Setup

```bash
# Create .env at the repo root (see "Example .env" under Deploy → Environment variables)
npm install
npm install --prefix app
```

## Development

```bash
npm run dev      # API (3001) + Vue UI (5173)
npm run analyze  # CLI analysis
npm run analyze -- --json
```

Run from the project root so `./data` and `./agents` resolve correctly.

### Quality checks

```bash
npm run check
```

This runs backend tests, backend TypeScript compilation, and Vue type checking.
Use `npm run build:app` to verify the production frontend bundle separately.

## Production (local)

```bash
npm run build
npm start        # API from backend-dist/
npm run build --prefix app   # static UI → app/dist/
```

### Environment variables

| Variable | Used by | Notes |
|----------|---------|--------|
| `OPENAI_API_KEY` | API / CLI / serverless | OpenAI secret. Read via `process.env` on the server only — never from `import.meta.env` in Vue. |

#### Example `.env` (local)

```env
OPENAI_API_KEY=sk-...
VITE_OPENAI_MODEL=gpt-4o-mini
```

### Verify

```bash
curl https://field-ai-analysis.vercel.app/api/health
# → {"status":"ok"}

curl https://field-ai-analysis.vercel.app/api/fields
# → list of fields
```

Open the demo, select a field, click **Analyze field**.

### Local Vercel simulation (optional)

```bash
npm i -g vercel
vercel login
vercel link      # select project "field-ai-analysis"
vercel env pull .env.local
vercel dev
```

## API

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/fields` | List field snapshots |
| GET | `/api/fields/:file` | Get field data |
| GET | `/api/weather?lat=&lng=` | 7-day forecast (Open-Meteo) |
| POST | `/api/analyze` | Run analysis pipeline |
| POST | `/api/analyze-image` | Image → vision agent → full pipeline |

## Bounded contexts

| Context | Responsibility |
|---------|----------------|
| **Field** | Field snapshots (crop, soil, vegetation, notes) |
| **Weather** | Live forecast enrichment |
| **Analysis** | Multi-agent pipeline, irrigation decision |
