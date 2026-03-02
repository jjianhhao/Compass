# Compass - Setup Guide

Compass has 3 services that run together:

| Service | Directory | Port | Purpose |
|---------|-----------|------|---------|
| **Frontend** | `compass-frontend/` | 5173 | React + Vite UI |
| **Engine** | `compass-engine/` | 8000 | Knowledge state tracking, mastery, velocity, prerequisite graph |
| **Agents** | `compass-agents/` | 8001 | AI diagnosis pipeline, GPT-4o Vision grading, chat |

## Prerequisites

- **Node.js** v18+ and **npm**
- **Python** 3.10+
- **pip** (Python package manager)

## Quick Start (3 terminals)

### Terminal 1: Knowledge Engine (port 8000)

```bash
cd compass-engine
pip install -r requirements.txt
python seed.py                        # generates demo data (one-time)
uvicorn main:app --port 8000 --reload
```

The engine auto-seeds 3 demo students on startup. You should see:
```
Auto-seeded 166 demo interactions for 3 students
```

Verify it's working:
```bash
curl http://localhost:8000/health
# → {"status":"ok","students":3}
```

### Terminal 2: Agent Service (port 8001) — optional

This service requires an OpenAI API key for AI grading, diagnosis, and chat.

```bash
cd compass-agents
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
uvicorn main:app --port 8001 --reload
```

> **Note:** If you don't start this service, the app still works — quizzes use mock grading and recommendations are generated locally. The chat will fall back to a direct OpenAI call or offline responses.

### Terminal 3: Frontend (port 5173)

```bash
cd compass-frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## Demo Accounts

| Username | Password | Persona |
|----------|----------|---------|
| `sarah` | `sarah123` | Plateauing high-achiever (mastery ~62%) |
| `james` | `james123` | Foundational gaps (mastery ~28%) |
| `aisha` | `aisha123` | Returning after break, temporal decay (mastery ~45%) |

Teacher dashboard: **http://localhost:5173/teacher**

## Demo Walkthrough

1. Login as `james` / `james123`
2. Student dashboard loads with knowledge map, mastery overview, velocity chart
3. Check AI recommendations in the right panel
4. Click **Take a Quiz** → answer 3-5 questions → submit via drawing or photo upload
5. View AI grading results with marks and feedback
6. Return to dashboard — mastery should update
7. Switch to **Chat** tab → ask "Why am I struggling with trigonometry?"
8. Go to **http://localhost:5173/teacher** → see class overview with 3 students
9. Click on James → see AI diagnosis with prerequisite gap detection
10. Accept/Modify/Reject a recommendation

## Architecture

```
Frontend (:5173) ──→ Engine (:8000) ──→ Agents (:8001)
                         │                    │
                         │ POST /interaction   │ POST /diagnose
                         │ GET /knowledge-map  │ POST /grade
                         │ GET /velocity       │ POST /chat
                         │ GET /topics/graph   │ GET /questions
                         │ GET /students       │
                         │ GET /activity       │
                         │ POST /seed          │
```

## Mock Mode

If you need to work without any backend running, edit `compass-frontend/src/api/client.js` and set:

```js
const USE_MOCK = true;
```

This uses hardcoded mock data for everything. Flip back to `false` when backends are running.

## Environment Variables

### compass-agents/.env

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o | (required) |
| `MODEL` | Model for agent pipeline | `gpt-4o-mini` |

> Use `gpt-4o-mini` during development to save costs (~$0.003/call vs ~$0.03-0.05 for `gpt-4o`).

## Troubleshooting

- **"Failed to load students" on teacher dashboard** — Make sure the engine is running on port 8000.
- **Quiz shows mock grading feedback** — The agent service on port 8001 isn't running. Start it or this is expected.
- **Chat says "couldn't connect"** — Neither the agent service nor a direct OpenAI key is available.
- **Knowledge map shows all gray nodes** — The engine has no data. Restart the engine (it auto-seeds) or run `curl -X POST http://localhost:8000/api/seed`.
- **`requirements.txt` looks garbled** — The engine's file is UTF-16 encoded. Install with: `pip install fastapi uvicorn pydantic networkx` if pip can't parse it.
