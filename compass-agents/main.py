from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from schemas.models import KnowledgeMap, AgentPipelineOutput, GradeRequest, GradeResponse
from agents.pipeline import run_pipeline
from data.questions import load_questions, get_questions, get_question_by_id, get_total_count
from agents.grader import grade_student_work


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load questions from CSV
    count = load_questions()
    print(f"Loaded {count} questions from CSV")
    yield


app = FastAPI(title="Compass Agent API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# === Existing endpoints ===

@app.post("/api/diagnose", response_model=AgentPipelineOutput)
async def diagnose_student(knowledge_map: KnowledgeMap):
    """Run full agent pipeline: Diagnosis -> Planner -> Evaluator"""
    result = run_pipeline(knowledge_map)
    return result


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
    result = grade_student_work(req.question_id, req.image_base64)
    return result


@app.get("/health")
async def health():
    return {"status": "ok", "agents": ["diagnosis", "planner", "evaluator", "grader"]}
