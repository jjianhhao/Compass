# Compass

An AI-powered adaptive learning companion for IB Mathematics Analysis and Approaches HL, built for DLW 2026 (Microsoft Track).

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
| `compass-frontend` | 5173 | React SPA — student quiz, dashboard, chat, study planner; teacher overview & drilldown |
| `compass-engine` | 8000 | Knowledge state tracking — mastery, velocity, prerequisite graph, temporal decay |
| `compass-agents` | 8001 | AI pipeline — 3-agent diagnosis, GPT-4o Vision grading, RAG, chat, study plans |

## Key Features

**For Students**
- Handwriting canvas + photo upload quiz with AI grading (GPT-4o Vision)
- Interactive prerequisite dependency graph (28 IB Math AA HL topics)
- Personalised study recommendations with full reasoning trails
- AI chat companion grounded in learning data with LaTeX math rendering
- Study planner with exam logging and AI-generated day-by-day schedules
- Override recommendations ("I already revised this") with structured reasons

**For Teachers**
- Class overview with at-risk student alerts (mastery < 30% or inactive 14+ days)
- Per-student drilldown with AI diagnosis, error classification, prerequisite analysis
- Accept / Modify / Reject workflow for AI recommendations
- Full override audit trail with timestamps and filterable action log

**Responsible AI**
- Explainability: full reasoning trails from diagnosis through evaluation
- Fairness: Evaluator Agent checks for bias (one bad session, burst learners, different paces)
- Human Agency: teachers and students can override any AI recommendation
- Honesty: temporal decay prevents stale mastery from appearing high (14-day half-life)
- Transparency: maker-checker pattern — AI reviews its own output before showing it
- Privacy: no personally identifiable information sent to AI beyond a student ID string

## Quick Start

### Prerequisites
- Node.js v18+
- Python 3.10+
- OpenAI API key

### 1. Knowledge Engine (port 8000)
```bash
cd compass-engine
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
# Auto-seeds 166 demo interactions for 3 students on startup
```

### 2. Agent Pipeline (port 8001)
```bash
cd compass-agents
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
python rag/setup.py          # One-time: embed syllabus into ChromaDB
uvicorn main:app --port 8001 --reload
# Pre-computes diagnoses for all demo students on startup
```

### 3. Frontend (port 5173)
```bash
cd compass-frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

> **Note:** If the agent service isn't running, the app still works — quizzes use mock grading, recommendations are generated locally, and chat falls back to a direct OpenAI call or offline responses.

### Demo Accounts
| Username | Password | Persona |
|---|---|---|
| `sarah` | `sarah123` | Plateauing high-achiever (mastery ~62%) |
| `james` | `james123` | Foundational gaps — demo highlight (mastery ~28%) |
| `aisha` | `aisha123` | Returning after break — temporal decay (mastery ~45%) |

Teacher dashboard: http://localhost:5173/teacher (link at bottom of login page)

## 3-Agent Pipeline

1. **Diagnosis Agent** — Classifies errors as conceptual gaps, careless mistakes, or time pressure; checks prerequisite chains; assigns confidence based on data volume
2. **Planner Agent** — Generates 2-4 actionable study recommendations grounded in RAG-retrieved syllabus context; matches intervention type to error type
3. **Evaluator Agent** (Maker-Checker) — Reviews diagnosis + plan for consistency, fairness, and quality; rejection triggers retry (max 2 retries)

## Key Algorithms

- **Mastery Tracking**: weighted moving average with difficulty weighting (easy 0.5x, medium 1.0x, hard 1.5x) and decaying learning rate
- **Temporal Decay**: exponential decay with 14-day half-life to a 0.3 baseline — the system is honest when a returning student's knowledge may have degraded
- **Prerequisite Gap Detection**: NetworkX DAG of 28 topics with 32 directed edges; flags upstream weaknesses when mastery drops below 0.5
- **Learning Velocity**: sliding-window linear regression on the last 5 mastery data points to classify improving / plateauing / regressing trends

## Tech Stack

- **Frontend:** React 19, Vite 7, Tailwind CSS 4, React Router 7, Recharts, KaTeX, signature_pad, dagre
- **Knowledge Engine:** Python, FastAPI, NetworkX, Pydantic
- **Agent Pipeline:** Python, FastAPI, OpenAI GPT-4o / GPT-4o-mini, ChromaDB, Pydantic
- **AI Grading:** GPT-4o Vision against IB mark schemes with method/follow-through marking

## Team

Built in 48 hours at DLW 2026 by Team iGimmit.
- Ajitesh S/O Manoj Krishnan
- Ho Jian Hao
- Chong Cheng Yu
- Chin Jiaqi
