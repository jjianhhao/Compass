import asyncio
from contextlib import asynccontextmanager
from functools import partial
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from schemas.models import KnowledgeMap, AgentPipelineOutput, GradeRequest, GradeResponse
from agents.pipeline import run_pipeline
from data.questions import load_questions, get_questions, get_question_by_id, get_total_count
from agents.grader import grade_student_work
from config import client, MODEL


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
    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, run_pipeline, knowledge_map)
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
                        "You are a supportive AI learning companion for a student studying "
                        "IB Mathematics Analysis and Approaches HL. You have access to their learning data. "
                        "Be encouraging, specific, and honest about what they need to work on. "
                        "Always explain your reasoning.\n\n"
                        "When writing mathematical expressions, use LaTeX notation: "
                        "use $...$ for inline math and $$...$$ for display math.\n"
                        "Keep responses concise (2-4 paragraphs max)."
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
