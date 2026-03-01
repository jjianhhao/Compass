import json
from pathlib import Path

from config import client, MODEL
from schemas.models import KnowledgeMap, DiagnosisOutput

_PROMPT_DIR = Path(__file__).resolve().parent.parent / "prompts"
SYSTEM_PROMPT = (_PROMPT_DIR / "diagnosis.txt").read_text()


def run_diagnosis(knowledge_map: KnowledgeMap) -> DiagnosisOutput:
    """Takes a student's knowledge map and produces a structured diagnosis."""

    user_prompt = f"""
Analyze this student's learning data and produce a diagnosis.

STUDENT: {knowledge_map.student_id}
OVERALL MASTERY: {knowledge_map.overall_mastery:.2f}

TOPIC MASTERIES:
{json.dumps([t.model_dump() for t in knowledge_map.topic_masteries], indent=2, default=str)}

PREREQUISITE FLAGS:
{json.dumps([p.model_dump() for p in knowledge_map.prerequisite_flags], indent=2)}

Produce your diagnosis as JSON matching this EXACT schema:
- findings: list of {{"topic": str, "issue": str, "severity": "critical"|"high"|"medium"|"low", "evidence": str}}
- error_classifications: list of {{"error_type": "conceptual_gap"|"careless_mistake"|"time_pressure", "evidence": str, "confidence": "high"|"medium"|"low"}}
- root_cause_analysis: string explaining prerequisite-aware root causes
- confidence: "high"|"medium"|"low" based on data available
- data_points_used: total attempts across all topics
- reasoning_trail: human-readable paragraph explaining your full analysis

IMPORTANT: error_type values MUST be lowercase: "conceptual_gap", "careless_mistake", or "time_pressure".
Do NOT include student_id in your response.
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.3,
    )

    result = json.loads(response.choices[0].message.content)

    # Remove student_id if the LLM included it (we set it explicitly)
    result.pop("student_id", None)

    # Normalise LLM output — it may return UPPER_CASE enum values
    for ec in result.get("error_classifications", []):
        if "error_type" in ec:
            ec["error_type"] = ec["error_type"].lower()
    for f in result.get("findings", []):
        if "severity" in f:
            f["severity"] = f["severity"].lower()
    if "confidence" in result:
        result["confidence"] = result["confidence"].lower()

    return DiagnosisOutput(student_id=knowledge_map.student_id, **result)
