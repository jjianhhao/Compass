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

    student_name = (knowledge_map.student_name or diagnosis.student_id).split("_")[0].capitalize()

    user_prompt = f"""
Create a personalised study plan written DIRECTLY to the student. Use "you" and "your" throughout — never use their name or third person.

STUDENT FIRST NAME (for internal context only, do NOT use in output): {student_name}

DIAGNOSIS:
{diagnosis.model_dump_json(indent=2)}

KNOWLEDGE MAP:
{json.dumps([t.model_dump() for t in knowledge_map.topic_masteries], indent=2, default=str)}

SYLLABUS CONTEXT (from RAG):
{rag_context if rag_context else "No additional syllabus context available."}

Generate a focused study plan (2-4 recommendations max) as JSON matching this EXACT schema:
- recommendations: list of {{"action": str, "topic": str, "subtopic": str|null, "difficulty": "easy"|"medium"|"hard", "question_count": int, "reasoning": str, "priority": "critical"|"high"|"medium"|"low"}}
- study_plan_summary: string (2-3 sentences, written directly to the student, warm and specific)
- estimated_sessions: integer
- reasoning_trail: string (paragraph, written directly to the student)

CRITICAL — the "action" field must be a specific, concrete instruction written directly to the student. It must include ALL of the following:
1. Exactly what to do (e.g. "Work through 5 medium questions on...")
2. The specific subtopic(s) to focus on within that chapter (not just the chapter name)
3. What to pay close attention to or a common mistake to avoid
4. A suggested approach or method (e.g. "try solving without a calculator first", "write out each step before simplifying", "sketch the graph before answering")

BAD example: "Practice foundational concepts"
BAD example: "Review and practice exponents and logarithms"
GOOD example: "Work through 5 medium questions on composite and inverse functions — focus on getting the order right when composing f(g(x)). Before substituting, write out each function separately and always check your domain."
GOOD example: "Do 6 easy questions on laws of logarithms, specifically log(ab) and log(a/b) rules. A common trap here is forgetting to flip the sign when dividing — watch out for that."

IMPORTANT: Do NOT include student_id in your response. Write entirely in second person ("you/your").
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
