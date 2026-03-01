import json
from pathlib import Path

from config import client, MODEL
from schemas.models import KnowledgeMap, DiagnosisOutput, PlannerOutput, EvaluatorOutput

_PROMPT_DIR = Path(__file__).resolve().parent.parent / "prompts"
SYSTEM_PROMPT = (_PROMPT_DIR / "evaluator.txt").read_text()


def run_evaluator(
    knowledge_map: KnowledgeMap,
    diagnosis: DiagnosisOutput,
    plan: PlannerOutput,
) -> EvaluatorOutput:
    """Independently reviews diagnosis and plan before output reaches user."""

    user_prompt = f"""
Review the following diagnosis and study plan for consistency, fairness, and quality.

ORIGINAL DATA (ground truth):
{json.dumps([t.model_dump() for t in knowledge_map.topic_masteries], indent=2, default=str)}

DIAGNOSIS AGENT OUTPUT:
{diagnosis.model_dump_json(indent=2)}

PLANNER AGENT OUTPUT:
{plan.model_dump_json(indent=2)}

Evaluate and respond with JSON matching this EXACT schema:
- approved: bool
- concerns: list of strings (issues found, empty list if none)
- adjustments_made: list of strings (what you'd change, empty list if none)
- fairness_check: string (assessment of fairness)
- confidence_validated: bool
- reasoning_trail: string (your evaluation reasoning)

IMPORTANT: Do NOT include any extra fields beyond those listed above.
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )

    result = json.loads(response.choices[0].message.content)
    return EvaluatorOutput(**result)
