# Field AI Analysis

AI agronomic copilot that analyzes field data through a multi-agent pipeline and returns irrigation recommendations, risk assessments, and agronomic insights.

**Live demo:** [field-ai-analysis.vercel.app](https://field-ai-analysis.vercel.app)

The original product brief is available in [`PROJECT.md`](./PROJECT.md).

## Tech stack

- **Frontend:** Vue 3, Vite, TypeScript
- **Backend:** Node.js, Hono, hexagonal architecture
- **AI:** OpenAI (4 specialized agents)
- **Weather:** Open-Meteo (live 7-day forecast)
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
    └─ Risk Analyst ──┤ (parallel)
                      ▼
                 Agronomist
                      ▼
                 Coordinator → AnalysisOutput
```

Agent prompts live in `agents/*.md` (versioned via `agents/manifest.json`).

## Setup

```bash
cp .env.example .env
# Replace the placeholder in .env with your own OPENAI_API_KEY
npm install
npm install --prefix app
```

## Development

```bash
npm run dev      # API (3001) + Vue UI (5173)
npm run analyze  # CLI analysis
npm run analyze -- --json --trace
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

## Deploy to Vercel

Single Vercel project: Vue static app + native serverless API routes on the same domain (`/api/*`).

### Prerequisites

1. [Vercel account](https://vercel.com) (GitHub login)
2. **Vercel Pro recommended** — `/api/analyze` runs 4 LLM agents and often takes 15–30s. Hobby plan timeout is **10s**; Pro allows **60s** (configured in `vercel.json`).
3. [OpenAI API key](https://platform.openai.com/api-keys)
4. Repo pushed to GitHub

### Project settings

Import the repo as project **`field-ai-analysis`** with these settings:

| Setting | Value |
|---------|--------|
| Root Directory | *(empty — repo root, not `app`)* |
| Framework Preset | Other |
| Build / Install / Output | From `vercel.json` |

If Root Directory is set to `app`, the `api/` folder is not deployed and all `/api/*` routes return **404**.

### Environment variables

In **Project → Settings → Environment Variables**:

| Variable | Required | Environments |
|----------|----------|--------------|
| `OPENAI_API_KEY` | Yes | Production, Preview, Development |
| `OPENAI_MODEL` | No | Defaults to `gpt-4o-mini` |
| `APP_URL` | No | e.g. `https://field-ai-analysis.vercel.app` (CORS) |

Leave `VITE_API_BASE_URL` **empty** when app and API share the same Vercel domain.

**Redeploy after adding or changing env vars** — existing deployments do not pick them up automatically.

Do **not** commit `.env` to git.

### Security

- Keep real credentials in local `.env` files or Vercel Environment Variables.
- Only placeholders belong in `.env.example` and documentation.
- Never expose `OPENAI_API_KEY` through frontend variables prefixed with `VITE_`.
- Rotate a credential immediately if it is accidentally committed or printed.

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

## Bounded contexts

| Context | Responsibility |
|---------|----------------|
| **Field** | Field snapshots (crop, soil, vegetation, notes) |
| **Weather** | Live forecast enrichment |
| **Analysis** | Multi-agent pipeline, irrigation decision |
| **Observability** | Traces, token metrics (CLI `--trace`) |
