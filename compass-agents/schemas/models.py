from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from enum import Enum


# === SHARED: Interaction Event (from Person C's quiz) ===
class InteractionEvent(BaseModel):
    student_id: str
    question_id: str
    topic: str
    subtopic: str
    difficulty: Literal["easy", "medium", "hard"]
    student_answer: str
    correct_answer: str
    is_correct: bool
    time_taken_sec: float
    timestamp: datetime
    # AI grading fields (optional, for free-response questions)
    marks_available: Optional[int] = None
    marks_awarded: Optional[int] = None
    mark_percentage: Optional[float] = None
    ai_feedback: Optional[str] = None


# === Grading request/response ===
class GradeRequest(BaseModel):
    student_id: str
    question_id: str
    image_base64: str


class GradeResponse(BaseModel):
    marks_awarded: int
    marks_available: int
    mark_percentage: float
    feedback: str
    strengths: List[str]
    errors: List[str]
    is_correct: bool
    model_answer: Optional[str] = None
    worked_solution: Optional[List[dict]] = None


# === SHARED: Topic Mastery (from Person B's engine) ===
class TopicMastery(BaseModel):
    topic: str
    subtopic: Optional[str] = None
    mastery_score: float = Field(ge=0, le=1)
    velocity: Literal["improving", "plateauing", "regressing"]
    last_practiced: Optional[datetime] = None
    attempt_count: int = 0
    error_types: dict = Field(default_factory=dict)


class PrerequisiteStatus(BaseModel):
    topic: str
    prerequisite_topic: str
    prerequisite_mastery: float
    is_weak: bool


# === SHARED: Knowledge Map (from Person B) ===
class KnowledgeMap(BaseModel):
    student_id: str
    student_name: Optional[str] = None
    topic_masteries: List[TopicMastery]
    prerequisite_flags: List[PrerequisiteStatus] = []
    overall_mastery: float = 0.0
    last_active: Optional[datetime] = None


# === YOUR OUTPUT: Diagnosis ===
class ErrorClassification(BaseModel):
    error_type: Literal["conceptual_gap", "careless_mistake", "time_pressure"]
    evidence: str
    confidence: Literal["high", "medium", "low"]


class DiagnosisOutput(BaseModel):
    student_id: str
    findings: List[dict]
    error_classifications: List[ErrorClassification]
    root_cause_analysis: str
    confidence: Literal["high", "medium", "low"]
    data_points_used: int
    reasoning_trail: str


# === YOUR OUTPUT: Study Plan ===
class Recommendation(BaseModel):
    action: str
    topic: str
    subtopic: Optional[str] = None
    difficulty: Literal["easy", "medium", "hard"]
    question_count: int
    reasoning: str
    priority: Literal["critical", "high", "medium", "low"]


class PlannerOutput(BaseModel):
    student_id: str
    recommendations: List[Recommendation]
    study_plan_summary: str
    estimated_sessions: int
    reasoning_trail: str


# === YOUR OUTPUT: Evaluator Verdict ===
class EvaluatorOutput(BaseModel):
    approved: bool
    concerns: List[str]
    adjustments_made: List[str]
    fairness_check: str
    confidence_validated: bool
    reasoning_trail: str


# === FINAL: Combined Agent Output (what frontend consumes) ===
class AgentPipelineOutput(BaseModel):
    student_id: str
    diagnosis: DiagnosisOutput
    plan: PlannerOutput
    evaluator_verdict: EvaluatorOutput
    final_recommendations: List[Recommendation]
    overall_confidence: Literal["high", "medium", "low"]
    reasoning_trail: str
