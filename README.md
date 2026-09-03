# Field AI Analysis

AI agronomic copilot that analyzes field data through a multi-agent pipeline and returns irrigation recommendations, risk assessments, and agronomic insights.

## Architecture

Hexagonal architecture (ports & adapters) with DDD bounded contexts:

```
field-ai-analysis/
├── app/              # Frontend (Vue)
├── backend/          # Domain, use cases, infrastructure, API, CLI
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   ├── presentation/
│   └── composition-root.ts
├── agents/           # LLM prompts
└── data/             # Field snapshots
```

Hexagonal architecture (ports & adapters) with DDD bounded contexts:

```
backend/
├── domain/           # Entities, schemas, port interfaces
│   ├── field/
│   ├── analysis/
│   ├── weather/
│   ├── pipeline/
│   └── ports/
├── application/      # Use cases & orchestration
│   ├── use-cases/
│   └── services/
├── infrastructure/   # Adapters (OpenAI, Open-Meteo, filesystem)
│   ├── llm/
│   ├── weather/
│   ├── persistence/
│   └── prompts/
├── presentation/     # Driving adapters (HTTP, CLI)
│   ├── http/
│   └── cli/
└── composition-root.ts   # Dependency wiring
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
cp .env.example .env   # add your OPENAI_API_KEY
npm install
cd app && npm install && cd ..
```

## Development

```bash
npm run dev      # API (3001) + Vue UI (5173)
npm run analyze  # CLI analysis
npm run analyze -- --json --trace
```

## Production

```bash
npm run build
npm start        # serves API from dist/
cd app && npm run build   # static UI → app/dist/
```

Set `OPENAI_API_KEY` in the environment. Run from the project root so `./data` and `./agents` resolve correctly.

## Deploy to Vercel

The repo is configured for a **single Vercel project**: Vue static app + Hono API as a serverless function on the same domain (`/api/*`).

### Prerequisites

1. [Vercel account](https://vercel.com) (GitHub login)
2. **Vercel Pro recommended** — `/api/analyze` runs 4 LLM agents and often takes 15–30s. Hobby plan timeout is **10s**; Pro allows **60s** (configured in `vercel.json`).
3. [OpenAI API key](https://platform.openai.com/api-keys)
4. Repo pushed to GitHub

### Step 1 — Push to GitHub

```bash
git add .
git commit -m "Prepare Vercel deployment"
git remote add origin https://github.com/YOUR_USER/field-ai-analysis.git
git push -u origin main
```

### Step 2 — Import project in Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the GitHub repository
3. **Framework preset:** Other (not Vite — root `vercel.json` controls the build)
4. **Root Directory:** leave **empty** (repository root). Do **not** set it to `app` — that causes `app/app/package.json` errors and breaks the API.
5. Build settings should come from `vercel.json`:
   - Install: `npm install && npm install --prefix app`
   - Build: `npm run vercel-build`
   - Output directory: `app/dist`

If you already created the project with Root Directory = `app`, fix it:
**Project → Settings → General → Root Directory → Edit → clear the field → Save**, then redeploy.

### Step 3 — Environment variables

In **Project → Settings → Environment Variables**, add:

| Variable | Value | Environments |
|----------|-------|--------------|
| `OPENAI_API_KEY` | `sk-...` | Production, Preview, Development |
| `OPENAI_MODEL` | `gpt-4o-mini` | Production (optional) |

Do **not** commit `.env` to git.

### Step 4 — Deploy

Click **Deploy**. Vercel will:

1. Install root + app dependencies
2. Build the Vue app → `app/dist/`
3. Deploy `api/index.ts` as a Node.js serverless function
4. Route `/api/*` → API, everything else → SPA

### Step 5 — Verify

```bash
curl https://YOUR_PROJECT.vercel.app/api/health
# → {"status":"ok"}

curl https://YOUR_PROJECT.vercel.app/api/fields
# → list of fields
```

Open `https://YOUR_PROJECT.vercel.app`, select a field, click **Should I irrigate?**

### Local Vercel simulation (optional)

```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
vercel dev
```

### Troubleshooting


| Issue | Fix |
|-------|-----|
| `504` / timeout on analyze | Upgrade to **Pro**; check `maxDuration: 60` in `vercel.json` |
| `Missing OPENAI_API_KEY` | Add env var in Vercel dashboard, redeploy |
| Empty fields list | Ensure `data/` is deployed (`includeFiles` in `vercel.json`) |
| `ENOENT .../app/app/package.json` | **Root Directory** must be empty (repo root), not `app` |
| CORS errors | Same-domain deploy should not need CORS; set `ALLOWED_ORIGIN` if using a custom domain on the app only |

### Alternative: split frontend / backend

If analyze timeouts persist, deploy **API on Railway/Fly.io** (`npm run build && npm start`) and set `VITE_API_URL` in the Vue app — requires a small code change in `app/src/api/client.ts`.

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
