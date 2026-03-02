import asyncio
import httpx
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from schemas.models import KnowledgeMap, AgentPipelineOutput, GradeRequest, GradeResponse, StudyPlanRequest, StudyPlanResponse, StudySession
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


@app.post("/api/study-plan", response_model=StudyPlanResponse)
async def generate_study_plan(req: StudyPlanRequest):
    """Generate a personalised day-by-day study plan given a deadline and student context."""
    import json
    from datetime import date, timedelta

    today = date.today()
    try:
        deadline = date.fromisoformat(req.deadline_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid deadline_date format. Use YYYY-MM-DD.")

    days_until = (deadline - today).days
    if days_until <= 0:
        raise HTTPException(status_code=400, detail="Deadline must be in the future.")

    # Build study schedule dates
    hours_per_day = req.study_hours_per_day or (
        (req.study_days_per_week or 5) * 2 / 7  # spread weekly hours across days
    )

    # Summarise knowledge map for prompt
    km_summary = [
        {"topic": t.get("topic"), "mastery": round(t.get("mastery_score", 0) * 100), "velocity": t.get("velocity")}
        for t in req.knowledge_map
        if t.get("topic") in req.topics_to_cover
    ]

    exam_summary = [
        f"{e.exam_name} ({e.date}): {e.score_pct}% — topics: {', '.join(e.topics_tested)}"
        + (f" — notes: {e.notes}" if e.notes else "")
        for e in req.exam_results
    ] if req.exam_results else ["No past exam results provided."]

    user_prompt = f"""
Create a personalised study plan for a student preparing for: {req.deadline_name}
Deadline: {req.deadline_date} ({days_until} days away)
Available study time: {hours_per_day:.1f} hours/day
Topics to cover: {', '.join(req.topics_to_cover)}

STUDENT MASTERY (topics to cover only):
{json.dumps(km_summary, indent=2)}

PAST EXAM RESULTS:
{chr(10).join(exam_summary)}

Generate a day-by-day study plan from today ({today.isoformat()}) to the deadline.
Prioritise topics with low mastery and those that appeared weak in past exams.
Group related topics in the same session where possible.
Do not schedule study on the deadline day itself.

Return a JSON object matching this EXACT schema:
{{
  "plan_summary": "<2-3 sentence overview of the study strategy>",
  "total_days": <integer: number of study sessions>,
  "sessions": [
    {{
      "day": <integer starting at 1>,
      "date": "<YYYY-MM-DD>",
      "topics": ["<topic_id>"],
      "focus": "<specific focus for this session, e.g. 'Differentiation — chain rule and product rule'>",
      "duration_hours": <float>,
      "priority": "<critical|high|medium|low>"
    }}
  ],
  "reasoning": "<paragraph explaining the prioritisation logic>"
}}

Only include sessions on days with study time (skip days if study_days_per_week is set and not all days are study days — distribute evenly).
Cap total sessions at {min(days_until - 1, 30)} sessions maximum.
"""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert study planner for IB Mathematics students. "
                        "You create realistic, prioritised study schedules based on mastery data and past performance. "
                        "Always return valid JSON only."
                    ),
                },
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            timeout=30,
        )
        result = json.loads(response.choices[0].message.content)

        # Normalise priority values
        sessions = []
        for s in result.get("sessions", []):
            priority = s.get("priority", "medium").lower()
            if priority not in ("critical", "high", "medium", "low"):
                priority = "medium"
            sessions.append(StudySession(
                day=s.get("day", 1),
                date=s.get("date", today.isoformat()),
                topics=s.get("topics", []),
                focus=s.get("focus", ""),
                duration_hours=float(s.get("duration_hours", hours_per_day)),
                priority=priority,
            ))

        return StudyPlanResponse(
            plan_summary=result.get("plan_summary", ""),
            total_days=result.get("total_days", len(sessions)),
            sessions=sessions,
            reasoning=result.get("reasoning", ""),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Study plan generation failed: {str(e)}")


@app.get("/health")
async def health():
    return {"status": "ok", "agents": ["diagnosis", "planner", "evaluator", "grader", "chat"]}
