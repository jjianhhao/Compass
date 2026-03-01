# 🧭 COMPASS — Person A (Ajitesh): AI Diagnosis & Maker-Checker

## Your Feature
You own the AI brain: 3-agent pipeline (Diagnosis → Planner → Evaluator), RAG grounding, error classification, reasoning trails, and confidence scoring.

## Tech Stack
- Python + FastAPI
- OpenAI API (you have $100 credits) or Azure OpenAI
- ChromaDB or FAISS for RAG (lightweight, local)
- Pydantic for structured outputs

---

## STEP 0: Project Setup (Hour 0-1)

```bash
mkdir compass-agents && cd compass-agents
python -m venv venv && source venv/bin/activate
pip install openai fastapi uvicorn pydantic chromadb
```

Create this folder structure:
```
compass-agents/
├── main.py              # FastAPI app
├── agents/
│   ├── __init__.py
│   ├── diagnosis.py     # Diagnosis Agent
│   ├── planner.py       # Planner Agent
│   ├── evaluator.py     # Evaluator Agent
│   └── pipeline.py      # Orchestrates all 3
├── rag/
│   ├── __init__.py
│   ├── setup.py         # Embeds syllabus data
│   └── query.py         # Retrieves relevant context
├── schemas/
│   ├── __init__.py
│   └── models.py        # All Pydantic models (shared contracts)
├── prompts/
│   ├── diagnosis.txt
│   ├── planner.txt
│   └── evaluator.txt
├── data/
│   └── syllabus.json    # Topic graph (from Person B/D)
└── config.py            # API keys, model settings
```

### config.py
```python
import os
from openai import OpenAI

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
MODEL = "gpt-4o"  # or "gpt-4o-mini" to save credits during dev
```

---

## STEP 1: Define Shared Schemas (Hour 1-2)

This is CRITICAL. These schemas are the contract between you and the rest of the team. Share this file with everyone.

### schemas/models.py
```python
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

# === SHARED: Topic Mastery (from Person B's engine) ===
class TopicMastery(BaseModel):
    topic: str
    subtopic: Optional[str] = None
    mastery_score: float = Field(ge=0, le=1)
    velocity: Literal["improving", "plateauing", "regressing"]
    last_practiced: Optional[datetime] = None
    attempt_count: int = 0
    error_types: dict = Field(default_factory=dict)  # {"conceptual": 3, "careless": 1, "time_pressure": 2}

class PrerequisiteStatus(BaseModel):
    topic: str
    prerequisite_topic: str
    prerequisite_mastery: float
    is_weak: bool  # True if prerequisite mastery < 0.5

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
    evidence: str  # Why this classification
    confidence: Literal["high", "medium", "low"]

class DiagnosisOutput(BaseModel):
    student_id: str
    findings: List[dict]  # List of {topic, issue, severity, evidence}
    error_classifications: List[ErrorClassification]
    root_cause_analysis: str  # Prerequisite-aware analysis
    confidence: Literal["high", "medium", "low"]
    data_points_used: int
    reasoning_trail: str  # Human-readable explanation

# === YOUR OUTPUT: Study Plan ===
class Recommendation(BaseModel):
    action: str  # What to do
    topic: str
    subtopic: Optional[str] = None
    difficulty: Literal["easy", "medium", "hard"]
    question_count: int
    reasoning: str  # Why this specific recommendation
    priority: Literal["critical", "high", "medium", "low"]

class PlannerOutput(BaseModel):
    student_id: str
    recommendations: List[Recommendation]
    study_plan_summary: str  # 2-3 sentence overview
    estimated_sessions: int
    reasoning_trail: str

# === YOUR OUTPUT: Evaluator Verdict ===
class EvaluatorOutput(BaseModel):
    approved: bool
    concerns: List[str]  # Any issues found
    adjustments_made: List[str]  # What the evaluator changed
    fairness_check: str  # Did we penalize unfairly?
    confidence_validated: bool  # Does confidence match data?
    reasoning_trail: str

# === FINAL: Combined Agent Output (what frontend consumes) ===
class AgentPipelineOutput(BaseModel):
    student_id: str
    diagnosis: DiagnosisOutput
    plan: PlannerOutput
    evaluator_verdict: EvaluatorOutput
    final_recommendations: List[Recommendation]  # Post-evaluation
    overall_confidence: Literal["high", "medium", "low"]
    reasoning_trail: str  # Combined readable explanation
```

---

## STEP 2: Build the Diagnosis Agent (Hour 2-6)

### prompts/diagnosis.txt
```
You are a Diagnosis Agent for an AI-powered learning companion called Compass. You analyze a student's learning data and identify their strengths, weaknesses, and the root causes of their struggles.

You will receive:
1. A knowledge map showing per-topic mastery scores, learning velocity, and attempt counts
2. Prerequisite relationship flags (which foundational topics are weak)
3. Recent interaction history with error patterns

Your job is to:
1. Identify the student's weakest topics and WHY they are weak
2. Classify errors into three types:
   - CONCEPTUAL_GAP: Student doesn't understand the underlying concept (evidence: consistently wrong across attempts, wrong approach)
   - CARELESS_MISTAKE: Student knows the concept but makes procedural errors (evidence: sometimes right sometimes wrong, correct approach but arithmetic errors)
   - TIME_PRESSURE: Student can solve it but too slowly (evidence: correct when given time, but time_taken is high relative to difficulty)
3. Check prerequisite relationships: if a student struggles with Topic X, is their prerequisite Topic Y also weak? If so, the root cause may be upstream.
4. Assign a confidence level based on how much data you have (>10 attempts = high, 5-10 = medium, <5 = low)
5. Generate a clear reasoning trail that a student or teacher can read and understand

Be honest about uncertainty. If you don't have enough data, say so. Never overstate confidence.

Respond ONLY with valid JSON matching the DiagnosisOutput schema.
```

### agents/diagnosis.py
```python
import json
from config import client, MODEL
from schemas.models import KnowledgeMap, DiagnosisOutput

SYSTEM_PROMPT = open("prompts/diagnosis.txt").read()

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

Produce your diagnosis as JSON matching this schema:
- findings: list of {{topic, issue, severity (critical/high/medium/low), evidence}}
- error_classifications: list of {{error_type, evidence, confidence}}
- root_cause_analysis: string explaining prerequisite-aware root causes
- confidence: "high"/"medium"/"low" based on data available
- data_points_used: total attempts across all topics
- reasoning_trail: human-readable paragraph explaining your full analysis
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.3  # Low temp for consistency
    )
    
    result = json.loads(response.choices[0].message.content)
    return DiagnosisOutput(student_id=knowledge_map.student_id, **result)
```

### Test it immediately with mock data:
```python
# test_diagnosis.py
from agents.diagnosis import run_diagnosis
from schemas.models import KnowledgeMap, TopicMastery, PrerequisiteStatus
from datetime import datetime, timedelta

mock_map = KnowledgeMap(
    student_id="james_001",
    student_name="James",
    overall_mastery=0.45,
    last_active=datetime.now(),
    topic_masteries=[
        TopicMastery(topic="Trigonometric Identities", mastery_score=0.35, velocity="regressing", attempt_count=12, 
                     error_types={"conceptual": 8, "careless": 2, "time_pressure": 2},
                     last_practiced=datetime.now() - timedelta(days=2)),
        TopicMastery(topic="Algebraic Manipulation", mastery_score=0.45, velocity="plateauing", attempt_count=15,
                     error_types={"conceptual": 5, "careless": 6, "time_pressure": 4},
                     last_practiced=datetime.now() - timedelta(days=5)),
        TopicMastery(topic="Quadratic Equations", mastery_score=0.78, velocity="improving", attempt_count=20,
                     error_types={"conceptual": 1, "careless": 3, "time_pressure": 0},
                     last_practiced=datetime.now() - timedelta(days=1)),
    ],
    prerequisite_flags=[
        PrerequisiteStatus(topic="Trigonometric Identities", prerequisite_topic="Algebraic Manipulation",
                          prerequisite_mastery=0.45, is_weak=True)
    ]
)

result = run_diagnosis(mock_map)
print(result.model_dump_json(indent=2))
```

Run this and verify you get a structured diagnosis. Tweak the prompt until the output is clear and useful.

---

## STEP 3: Build the Planner Agent (Hour 6-12)

### prompts/planner.txt
```
You are a Planner Agent for Compass, an AI learning companion. You take a diagnosis of a student's learning gaps and create a specific, actionable study plan.

You will receive:
1. The Diagnosis Agent's output (findings, error classifications, root cause analysis)
2. The student's current knowledge map
3. Syllabus context from RAG (topic prerequisites, learning objectives)

Your job is to:
1. Prioritize what the student should work on FIRST (address root causes before symptoms)
2. For each recommendation, specify: exact topic, difficulty level, number of questions, and WHY
3. Match the intervention to the error type:
   - Conceptual gap → worked examples + explanatory notes, easier difficulty first
   - Careless mistakes → practice drills at current difficulty, focus on checking steps
   - Time pressure → timed practice at slightly easier difficulty to build speed
4. Create a realistic study plan (not 50 topics — focus on 2-3 highest priority actions)
5. Generate a reasoning trail explaining your logic

Be specific. Don't say "review trigonometry." Say "Practice 5 medium-difficulty questions on double-angle formulas, focusing on sin(2A) and cos(2A) identities."

Respond ONLY with valid JSON matching the PlannerOutput schema.
```

### agents/planner.py
```python
import json
from config import client, MODEL
from schemas.models import DiagnosisOutput, KnowledgeMap, PlannerOutput

SYSTEM_PROMPT = open("prompts/planner.txt").read()

def run_planner(diagnosis: DiagnosisOutput, knowledge_map: KnowledgeMap, rag_context: str = "") -> PlannerOutput:
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

Generate a focused study plan (2-4 recommendations max) as JSON matching PlannerOutput schema.
Each recommendation needs: action, topic, subtopic (if applicable), difficulty, question_count, reasoning, priority.
Also include: study_plan_summary (2-3 sentences), estimated_sessions (number), reasoning_trail (paragraph).
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.3
    )
    
    result = json.loads(response.choices[0].message.content)
    return PlannerOutput(student_id=diagnosis.student_id, **result)
```

---

## STEP 4: Build the Evaluator Agent — Maker-Checker (Hour 12-18)

This is your biggest differentiator. The Evaluator independently reviews the Diagnosis + Plan.

### prompts/evaluator.txt
```
You are the Evaluator Agent for Compass. You are the safety gate — your job is to independently review the Diagnosis Agent's analysis and the Planner Agent's recommendations BEFORE they reach the student or teacher.

You will receive:
1. The original knowledge map data
2. The Diagnosis Agent's output
3. The Planner Agent's output

Your job is to CHECK for:
1. CONSISTENCY: Does the diagnosis match the actual data? If the data shows 80% accuracy but the diagnosis says "critical weakness," flag it.
2. CONFIDENCE VALIDATION: Is the confidence level appropriate? High confidence with only 3 data points should be flagged.
3. FAIRNESS CHECK: Are we penalizing the student unfairly? Examples:
   - Student had one bad session but overall trend is improving → don't overreact
   - Student learns in bursts (inactive then active) → don't flag inactivity as regression
   - Different learning styles should not be treated as deficiencies
4. RECOMMENDATION QUALITY: Are the planner's suggestions specific and actionable? Vague recommendations like "study more" should be flagged.
5. REASONING COHERENCE: Does the reasoning trail logically follow from the data?

If you find issues:
- Set approved=false
- List specific concerns
- Suggest adjustments

If everything checks out:
- Set approved=true
- Note what you verified

Always be honest. If the analysis is good, say so. If it has problems, explain exactly what and why.

Respond ONLY with valid JSON matching the EvaluatorOutput schema.
```

### agents/evaluator.py
```python
import json
from config import client, MODEL
from schemas.models import KnowledgeMap, DiagnosisOutput, PlannerOutput, EvaluatorOutput

SYSTEM_PROMPT = open("prompts/evaluator.txt").read()

def run_evaluator(knowledge_map: KnowledgeMap, diagnosis: DiagnosisOutput, plan: PlannerOutput) -> EvaluatorOutput:
    """Independently reviews diagnosis and plan before output reaches user."""
    
    user_prompt = f"""
Review the following diagnosis and study plan for consistency, fairness, and quality.

ORIGINAL DATA (ground truth):
{json.dumps([t.model_dump() for t in knowledge_map.topic_masteries], indent=2, default=str)}

DIAGNOSIS AGENT OUTPUT:
{diagnosis.model_dump_json(indent=2)}

PLANNER AGENT OUTPUT:
{plan.model_dump_json(indent=2)}

Evaluate and respond with JSON matching EvaluatorOutput schema:
- approved: bool
- concerns: list of strings (issues found)
- adjustments_made: list of strings (what you'd change)
- fairness_check: string (assessment of fairness)
- confidence_validated: bool
- reasoning_trail: string (your evaluation reasoning)
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.2  # Even lower temp for evaluation
    )
    
    result = json.loads(response.choices[0].message.content)
    return EvaluatorOutput(**result)
```

---

## STEP 5: Build the Pipeline Orchestrator (Hour 18-22)

### agents/pipeline.py
```python
import json
from schemas.models import (
    KnowledgeMap, AgentPipelineOutput, DiagnosisOutput, PlannerOutput, EvaluatorOutput
)
from agents.diagnosis import run_diagnosis
from agents.planner import run_planner
from agents.evaluator import run_evaluator
from rag.query import get_syllabus_context

MAX_RETRIES = 2

def run_pipeline(knowledge_map: KnowledgeMap) -> AgentPipelineOutput:
    """
    Full agent pipeline: Diagnosis → Planner → Evaluator
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
        # Feed evaluator concerns back to planner
        feedback = f"EVALUATOR CONCERNS: {json.dumps(evaluator_verdict.concerns)}\nADJUSTMENTS NEEDED: {json.dumps(evaluator_verdict.adjustments_made)}"
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
    combined_reasoning = f"""
## Diagnosis
{diagnosis.reasoning_trail}

## Study Plan
{plan.reasoning_trail}

## Quality Check
{evaluator_verdict.reasoning_trail}

**Overall Confidence: {overall_confidence}** | **Evaluator: {'✅ Approved' if evaluator_verdict.approved else '⚠️ Flagged concerns'}**
""".strip()
    
    return AgentPipelineOutput(
        student_id=knowledge_map.student_id,
        diagnosis=diagnosis,
        plan=plan,
        evaluator_verdict=evaluator_verdict,
        final_recommendations=plan.recommendations,
        overall_confidence=overall_confidence,
        reasoning_trail=combined_reasoning
    )
```

---

## STEP 6: Set Up RAG (Hour 22-26)

### rag/setup.py
```python
import json
import chromadb
from chromadb.utils import embedding_functions

# Use OpenAI embeddings (or switch to a free local model to save credits)
openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key="YOUR_KEY",
    model_name="text-embedding-3-small"  # Cheap: $0.02/1M tokens
)

def setup_rag(syllabus_path: str = "data/syllabus.json"):
    """Embed syllabus data into ChromaDB for RAG retrieval."""
    
    client = chromadb.PersistentClient(path="./rag_db")
    collection = client.get_or_create_collection(
        name="syllabus",
        embedding_function=openai_ef
    )
    
    with open(syllabus_path) as f:
        syllabus = json.load(f)
    
    documents = []
    ids = []
    metadatas = []
    
    for topic in syllabus["topics"]:
        # Create a rich text document for each topic
        doc = f"""
Topic: {topic['name']}
Level: {topic.get('level', 'O-Level')}
Prerequisites: {', '.join(topic.get('prerequisites', ['None']))}
Subtopics: {', '.join(topic.get('subtopics', []))}
Learning Objectives: {topic.get('objectives', 'N/A')}
Common Misconceptions: {topic.get('common_mistakes', 'N/A')}
Recommended Approach When Struggling: {topic.get('remediation', 'N/A')}
""".strip()
        
        documents.append(doc)
        ids.append(topic['name'].lower().replace(' ', '_'))
        metadatas.append({"topic": topic['name'], "level": topic.get('level', 'O-Level')})
    
    collection.add(documents=documents, ids=ids, metadatas=metadatas)
    print(f"Embedded {len(documents)} topics into RAG database.")

if __name__ == "__main__":
    setup_rag()
```

### rag/query.py
```python
import chromadb
from chromadb.utils import embedding_functions

openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key="YOUR_KEY",
    model_name="text-embedding-3-small"
)

def get_syllabus_context(topics: list[str], n_results: int = 3) -> str:
    """Retrieve relevant syllabus context for given topics."""
    
    client = chromadb.PersistentClient(path="./rag_db")
    collection = client.get_collection(name="syllabus", embedding_function=openai_ef)
    
    query = f"Student is struggling with: {', '.join(topics)}. What are the prerequisites, common mistakes, and recommended study approach?"
    
    results = collection.query(query_texts=[query], n_results=n_results)
    
    if results and results['documents']:
        return "\n\n---\n\n".join(results['documents'][0])
    return ""
```

---

## STEP 7: Build the API Endpoints (Hour 26-30)

### main.py
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas.models import KnowledgeMap, AgentPipelineOutput
from agents.pipeline import run_pipeline

app = FastAPI(title="Compass Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon — restrict in production
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/diagnose", response_model=AgentPipelineOutput)
async def diagnose_student(knowledge_map: KnowledgeMap):
    """Run full agent pipeline: Diagnosis → Planner → Evaluator"""
    result = run_pipeline(knowledge_map)
    return result

@app.get("/health")
async def health():
    return {"status": "ok", "agents": ["diagnosis", "planner", "evaluator"]}
```

Run with: `uvicorn main:app --reload --port 8001`

---

## STEP 8: Build Your Frontend Component (Hour 24-30)

Create a React component that Person C will embed in the student dashboard. This shows:
- The diagnosis summary
- Each recommendation with reasoning
- Confidence badges
- The full reasoning trail (expandable)
- Evaluator verdict

Tell Cursor: "Build a React component called DiagnosisPanel that takes an AgentPipelineOutput JSON and renders: a diagnosis summary card, a list of recommendation cards each with reasoning text and confidence badges (green=high, yellow=medium, red=low), an expandable reasoning trail section, and an evaluator verdict badge (approved=green checkmark, flagged=yellow warning). Use Tailwind CSS. Make it clean and professional."

---

## STEP 9: Integration (Hour 30-36)

Replace mock KnowledgeMap with Person B's live API:
```python
import httpx

async def get_knowledge_map(student_id: str) -> KnowledgeMap:
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"http://localhost:8000/api/student/{student_id}/knowledge-map")
        return KnowledgeMap(**resp.json())
```

---

## STEP 10: Edge Cases & Polish (Hour 36-42)

Test these scenarios:
1. **New student (0 interactions):** Agent should say "Not enough data yet. Complete a few questions so I can understand your learning patterns."
2. **Student mastered everything:** Agent should congratulate and suggest challenge problems or moving to next chapter.
3. **Evaluator rejects diagnosis:** Verify retry loop works and final output acknowledges the adjustment.
4. **Only 1-2 data points:** Confidence must be "low" with explicit disclaimer.

---

## COST ESTIMATE (OpenAI Credits)

Per pipeline run (~3 API calls): ~$0.03-0.05 with GPT-4o
RAG embedding (one-time): ~$0.01
For 48 hours of dev + demo: ~$10-15 total

You have $100 — plenty of headroom. Use GPT-4o-mini during development ($0.005/run), switch to GPT-4o for the demo.

---

## CHECKLIST

- [ ] Schemas defined and shared with team
- [ ] Diagnosis Agent working with mock data
- [ ] Planner Agent working with mock data
- [ ] Evaluator Agent (maker-checker) working
- [ ] Pipeline orchestrator connecting all 3
- [ ] RAG set up with syllabus data
- [ ] API endpoint `/api/diagnose` live
- [ ] Frontend component built
- [ ] Connected to Person B's live knowledge engine
- [ ] Edge cases handled
- [ ] Reasoning trails read naturally for demo
