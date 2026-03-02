import asyncio
import httpx
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from schemas.models import KnowledgeMap, AgentPipelineOutput, GradeRequest, GradeResponse
from agents.pipeline import run_pipeline
from data.questions import load_questions, get_questions, get_question_by_id, get_total_count
from agents.grader import grade_student_work
from config import client, MODEL

ENGINE_URL = "http://localhost:8000"

# In-memory diagnosis cache: student_id -> AgentPipelineOutput
_diagnosis_cache: dict[str, AgentPipelineOutput] = {}


async def _fetch_and_run(student_id: str):
    """Fetch knowledge map from engine and run the pipeline, storing result in cache."""
    try:
        async with httpx.AsyncClient(timeout=10) as http:
            res = await http.get(f"{ENGINE_URL}/api/student/{student_id}/knowledge-map")
            if res.status_code != 200:
                return
            km = KnowledgeMap(**res.json())
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, run_pipeline, km)
        _diagnosis_cache[student_id] = result
        print(f"Pre-computed diagnosis for {student_id}")
    except Exception as e:
        print(f"Pre-compute failed for {student_id}: {e}")


async def _precompute_all():
    """Fetch all students from engine and pre-compute their diagnoses."""
    try:
        async with httpx.AsyncClient(timeout=10) as http:
            res = await http.get(f"{ENGINE_URL}/api/students")
            if res.status_code != 200:
                return
            students = res.json()
        for s in students:
            await _fetch_and_run(s["student_id"])
    except Exception as e:
        print(f"Pre-compute startup failed: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load questions from CSV, then pre-compute diagnoses in background
    count = load_questions()
    print(f"Loaded {count} questions from CSV")
    asyncio.create_task(_precompute_all())
    yield


app = FastAPI(title="Compass Agent API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# === Diagnosis endpoints ===

@app.get("/api/diagnosis/{student_id}", response_model=AgentPipelineOutput)
async def get_cached_diagnosis(student_id: str, background_tasks: BackgroundTasks):
    """Return pre-computed diagnosis instantly. Triggers a background refresh if not cached."""
    if student_id in _diagnosis_cache:
        return _diagnosis_cache[student_id]
    # Not cached yet — trigger background computation and return 404 so frontend falls back
    background_tasks.add_task(_fetch_and_run, student_id)
    raise HTTPException(status_code=404, detail="Diagnosis not ready yet — computing in background")


@app.post("/api/diagnosis/{student_id}/refresh")
async def refresh_diagnosis(student_id: str, background_tasks: BackgroundTasks):
    """Trigger a background re-computation of the diagnosis for a student."""
    background_tasks.add_task(_fetch_and_run, student_id)
    return {"status": "refreshing", "student_id": student_id}


@app.post("/api/diagnose", response_model=AgentPipelineOutput)
async def diagnose_student(knowledge_map: KnowledgeMap):
    """Run full agent pipeline: Diagnosis -> Planner -> Evaluator"""
    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, run_pipeline, knowledge_map)
        _diagnosis_cache[knowledge_map.student_id] = result
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent pipeline error: {str(e)}")


# === Question endpoints ===

@app.get("/api/questions")
async def list_questions(
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: easy, medium, hard"),
    limit: int = Query(10, ge=1, le=50),
    offset: int = Query(0, ge=0),
):
    """Get paginated question list (mark schemes stripped)."""
    questions = get_questions(difficulty=difficulty, limit=limit, offset=offset)
    total = get_total_count(difficulty=difficulty)
    return {"questions": questions, "total": total, "limit": limit, "offset": offset}


@app.get("/api/questions/{question_id}")
async def get_single_question(question_id: str):
    """Get a single question by ID (mark scheme stripped)."""
    q = get_question_by_id(question_id)
    if q is None:
        raise HTTPException(status_code=404, detail=f"Question {question_id} not found")
    return q


# === Grading endpoint ===

@app.post("/api/grade", response_model=GradeResponse)
async def grade_answer(req: GradeRequest):
    """Grade a student's handwritten/uploaded work using GPT-4o Vision."""
    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, grade_student_work, req.question_id, req.image_base64
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Grading error: {str(e)}")


# === Chat endpoint ===

class ChatRequest(BaseModel):
    message: str
    knowledge_map: Optional[dict] = None

class ChatResponse(BaseModel):
    message: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """AI learning companion chat grounded in the student's knowledge map."""
    km_context = ""
    if req.knowledge_map:
        import json
        km_context = f"\n\nStudent's knowledge map:\n{json.dumps(req.knowledge_map, default=str)}"

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                    "You are a precise AI learning companion for a student studying "
                    "IB Mathematics Analysis and Approaches HL. You have access to their learning data.\n\n"
                    "RESPONSE RULES:\n"
                    "- Answer ONLY what was asked — no tangential points or unrelated advice.\n"
                    "- Be specific: name the exact rule, formula, or step that applies.\n"
                    "- Always include a short, concrete example (1-3 lines) that directly illustrates your answer, "
                    "so the student can see the correct method and compare it to their mistake.\n"
                    "- If correcting a mistake, show what went wrong and then the correct working side-by-side.\n"
                    "- Keep explanations tight — the example should do the heavy lifting.\n"
                    "- No motivational filler (e.g. 'Great question!', 'You're doing well!').\n"
                    "- Use LaTeX for all math: $...$ for inline, $$...$$ for display equations."
                        f"{km_context}"
                    ),
                },
                {"role": "user", "content": req.message},
            ],
            temperature=0.5,
            timeout=30,
        )
        reply = response.choices[0].message.content
        return ChatResponse(message=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@app.get("/health")
async def health():
    return {"status": "ok", "agents": ["diagnosis", "planner", "evaluator", "grader", "chat"]}
