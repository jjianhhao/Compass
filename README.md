# Compass

An AI-powered adaptive learning companion for O-Level Additional Mathematics, built for DLW 2026 (Microsoft Track).

Compass diagnoses *why* students struggle — not just *what* they got wrong — using a 3-agent AI pipeline with a maker-checker safety gate, prerequisite dependency analysis, temporal decay for honest knowledge estimates, and full teacher oversight.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  compass-frontend│     │  compass-engine  │     │  compass-agents  │
│  React + Vite    │────▶│  FastAPI :8000   │────▶│  FastAPI :8001   │
│  :5173           │     │  Knowledge Engine│     │  AI Agent Pipeline│
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

| Service | Port | Purpose |
|---|---|---|
| `compass-frontend` | 5173 | React SPA — student quiz, dashboard, chat; teacher overview & drilldown |
| `compass-engine` | 8000 | Knowledge state tracking — mastery, velocity, prerequisite graph, temporal decay |
| `compass-agents` | 8001 | AI pipeline — 3-agent diagnosis, GPT-4o Vision grading, RAG, chat |

## Key Features

**For Students**
- Handwriting canvas + photo upload quiz with AI grading (GPT-4o Vision)
- Interactive prerequisite dependency graph (15 A-Math topics)
- Personalised study recommendations with full reasoning trails
- AI chat companion grounded in learning data
- Override recommendations ("I already revised this")

**For Teachers**
- Class overview with at-risk student alerts
- Per-student drilldown with AI diagnosis, error classification, prerequisite analysis
- Accept / Modify / Reject workflow for AI recommendations
- Full override audit trail

**Responsible AI**
- Explainability: full reasoning trails from diagnosis through evaluation
- Fairness: Evaluator Agent checks for bias (one bad session, burst learners, different paces)
- Human Agency: teacher and student can override any AI recommendation
- Honesty: temporal decay prevents stale mastery from appearing high (14-day half-life)
- Transparency: maker-checker pattern — AI reviews its own output before showing it

## Quick Start

### Prerequisites
- Node.js v18+
- Python 3.10+
- OpenAI API key

### 1. Frontend
```bash
cd compass-frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### 2. Knowledge Engine
```bash
cd compass-engine
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
# Seed demo data: POST http://localhost:8000/api/seed
```

### 3. Agent Pipeline
```bash
cd compass-agents
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
python rag/setup.py          # One-time: embed syllabus into ChromaDB
uvicorn main:app --port 8001 --reload
```

### Demo Accounts
| Username | Password | Persona |
|---|---|---|
| `sarah` | `sarah123` | Plateauing high-achiever |
| `james` | `james123` | Foundational gaps (demo highlight) |
| `aisha` | `aisha123` | Returning after break — temporal decay |

Teacher view: click "Teacher Dashboard" on the login page.

## Tech Stack

- **Frontend:** React 19, Vite 7, Tailwind CSS 4, React Router 7, Recharts, KaTeX, signature_pad
- **Knowledge Engine:** Python, FastAPI, NetworkX, Pydantic
- **Agent Pipeline:** Python, FastAPI, OpenAI GPT-4o / GPT-4o-mini, ChromaDB, Pydantic
- **AI Grading:** GPT-4o Vision against IB mark schemes

## 3-Agent Pipeline

1. **Diagnosis Agent** — Classifies errors as conceptual gaps, careless mistakes, or time pressure; checks prerequisite chains
2. **Planner Agent** — Generates 2-4 actionable study recommendations grounded in RAG-retrieved syllabus context
3. **Evaluator Agent** (Maker-Checker) — Reviews diagnosis + plan for consistency, fairness, and quality; rejects trigger retry

## Team

Built in 48 hours at DLW 2026.
