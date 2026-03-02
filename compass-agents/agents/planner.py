import json
from pathlib import Path

from config import client, MODEL
from schemas.models import DiagnosisOutput, KnowledgeMap, PlannerOutput

_PROMPT_DIR = Path(__file__).resolve().parent.parent / "prompts"
SYSTEM_PROMPT = (_PROMPT_DIR / "planner.txt").read_text()


def run_planner(
    diagnosis: DiagnosisOutput,
    knowledge_map: KnowledgeMap,
    rag_context: str = "",
) -> PlannerOutput:
    """Takes a diagnosis and produces an actionable study plan."""

    user_prompt = f"""
Create a study plan for this student based on the diagnosis.

STUDENT: {diagnosis.student_id}

DIAGNOSIS:
{diagnosis.model_dump_json(indent=2)}

KNOWLEDGE MAP:
{json.dumps([t.model_dump() for t in knowledge_map.topic_masteries], indent=2, default=str)}

SYLLABUS CONTEXT (from RAG):
{rag_context if rag_context else "No additional syllabus context available."}

Generate a focused study plan (2-4 recommendations max) as JSON matching this EXACT schema:
- recommendations: list of {{"action": str, "topic": str, "subtopic": str|null, "difficulty": "easy"|"medium"|"hard", "question_count": int, "reasoning": str, "priority": "critical"|"high"|"medium"|"low"}}
- study_plan_summary: string (2-3 sentences)
- estimated_sessions: integer
- reasoning_trail: string (paragraph)

IMPORTANT: Do NOT include student_id in your response.
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.3,
        timeout=15,
    )

    result = json.loads(response.choices[0].message.content)

    # Remove student_id if the LLM included it (we set it explicitly)
    result.pop("student_id", None)

    # Normalise enum values the LLM may return in UPPER_CASE
    for rec in result.get("recommendations", []):
        if "difficulty" in rec:
            rec["difficulty"] = rec["difficulty"].lower()
        if "priority" in rec:
            rec["priority"] = rec["priority"].lower()

    return PlannerOutput(student_id=diagnosis.student_id, **result)
