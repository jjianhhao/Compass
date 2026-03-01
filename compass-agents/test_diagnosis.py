"""
Integration test for the Compass agent pipeline.
Uses mock data for the James persona to validate the full
Diagnosis -> Planner -> Evaluator flow.

Usage:
    cd compass-agents
    python test_diagnosis.py
"""

from datetime import datetime, timedelta

from schemas.models import KnowledgeMap, TopicMastery, PrerequisiteStatus


def build_mock_knowledge_map() -> KnowledgeMap:
    """Build a realistic mock KnowledgeMap for student James."""
    return KnowledgeMap(
        student_id="james_001",
        student_name="James",
        overall_mastery=0.45,
        last_active=datetime.now(),
        topic_masteries=[
            TopicMastery(
                topic="Trigonometric Identities",
                mastery_score=0.35,
                velocity="regressing",
                attempt_count=12,
                error_types={"conceptual": 8, "careless": 2, "time_pressure": 2},
                last_practiced=datetime.now() - timedelta(days=2),
            ),
            TopicMastery(
                topic="Algebraic Manipulation",
                mastery_score=0.45,
                velocity="plateauing",
                attempt_count=15,
                error_types={"conceptual": 5, "careless": 6, "time_pressure": 4},
                last_practiced=datetime.now() - timedelta(days=5),
            ),
            TopicMastery(
                topic="Quadratic Equations",
                mastery_score=0.78,
                velocity="improving",
                attempt_count=20,
                error_types={"conceptual": 1, "careless": 3, "time_pressure": 0},
                last_practiced=datetime.now() - timedelta(days=1),
            ),
        ],
        prerequisite_flags=[
            PrerequisiteStatus(
                topic="Trigonometric Identities",
                prerequisite_topic="Algebraic Manipulation",
                prerequisite_mastery=0.45,
                is_weak=True,
            ),
        ],
    )


def test_diagnosis_only():
    """Test the Diagnosis Agent in isolation."""
    from agents.diagnosis import run_diagnosis

    km = build_mock_knowledge_map()
    print("=== Testing Diagnosis Agent ===")
    result = run_diagnosis(km)
    print(result.model_dump_json(indent=2))
    print()
    return result


def test_full_pipeline():
    """Test the full Diagnosis -> Planner -> Evaluator pipeline."""
    from agents.pipeline import run_pipeline

    km = build_mock_knowledge_map()
    print("=== Testing Full Pipeline ===")
    result = run_pipeline(km)
    print(result.model_dump_json(indent=2))

    print("\n=== Summary ===")
    print(f"Student: {result.student_id}")
    print(f"Overall confidence: {result.overall_confidence}")
    print(f"Evaluator approved: {result.evaluator_verdict.approved}")
    print(f"Recommendations: {len(result.final_recommendations)}")
    for i, rec in enumerate(result.final_recommendations, 1):
        print(f"  {i}. [{rec.priority}] {rec.action} — {rec.topic}")
    print()
    return result


if __name__ == "__main__":
    import sys

    if "--pipeline" in sys.argv:
        test_full_pipeline()
    else:
        diagnosis = test_diagnosis_only()
        print("Run with --pipeline to test the full pipeline.")
