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
