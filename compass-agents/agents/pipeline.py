import json

from schemas.models import (
    KnowledgeMap,
    AgentPipelineOutput,
)
from agents.diagnosis import run_diagnosis
from agents.planner import run_planner
from agents.evaluator import run_evaluator
from rag.query import get_syllabus_context

MAX_RETRIES = 2


def run_pipeline(knowledge_map: KnowledgeMap) -> AgentPipelineOutput:
    """
    Full agent pipeline: Diagnosis -> Planner -> Evaluator.
    If evaluator rejects, retry with adjustments (up to MAX_RETRIES times).
    """

    # Step 1: Get RAG context for the student's weak topics
    weak_topics = [t.topic for t in knowledge_map.topic_masteries if t.mastery_score < 0.5]
    rag_context = get_syllabus_context(weak_topics) if weak_topics else ""

    # Step 2: Run Diagnosis
    diagnosis = run_diagnosis(knowledge_map)

    # Step 3: Run Planner (grounded by RAG)
    plan = run_planner(diagnosis, knowledge_map, rag_context)

    # Step 4: Run Evaluator (maker-checker)
    evaluator_verdict = run_evaluator(knowledge_map, diagnosis, plan)

    # Step 5: If evaluator flags issues, retry with feedback
    retries = 0
    while not evaluator_verdict.approved and retries < MAX_RETRIES:
        feedback = (
            f"EVALUATOR CONCERNS: {json.dumps(evaluator_verdict.concerns)}\n"
            f"ADJUSTMENTS NEEDED: {json.dumps(evaluator_verdict.adjustments_made)}"
        )
        rag_context_with_feedback = rag_context + "\n\n" + feedback
        plan = run_planner(diagnosis, knowledge_map, rag_context_with_feedback)
        evaluator_verdict = run_evaluator(knowledge_map, diagnosis, plan)
        retries += 1

    # Step 6: Determine overall confidence
    if diagnosis.confidence == "low" or not evaluator_verdict.confidence_validated:
        overall_confidence = "low"
    elif diagnosis.confidence == "high" and evaluator_verdict.approved:
        overall_confidence = "high"
    else:
        overall_confidence = "medium"

    # Step 7: Build combined reasoning trail
    combined_reasoning = f"""## Diagnosis
{diagnosis.reasoning_trail}

## Study Plan
{plan.reasoning_trail}

## Quality Check
{evaluator_verdict.reasoning_trail}

**Overall Confidence: {overall_confidence}** | **Evaluator: {'Approved' if evaluator_verdict.approved else 'Flagged concerns'}**""".strip()

    return AgentPipelineOutput(
        student_id=knowledge_map.student_id,
        diagnosis=diagnosis,
        plan=plan,
        evaluator_verdict=evaluator_verdict,
        final_recommendations=plan.recommendations,
        overall_confidence=overall_confidence,
        reasoning_trail=combined_reasoning,
    )
