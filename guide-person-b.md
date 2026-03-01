# 🧭 COMPASS — Person B: Knowledge State Engine & Topic Graph

## Your Feature
You own the data foundation: mastery tracking, prerequisite dependency graph, learning velocity, temporal decay, and the APIs that everyone else consumes.

## Tech Stack
- Python + FastAPI
- NetworkX (prerequisite graph)
- SQLite or JSON files (lightweight for hackathon)
- Pydantic for schemas

---

## STEP 0: Project Setup (Hour 0-1)

```bash
mkdir compass-engine && cd compass-engine
python -m venv venv && source venv/bin/activate
pip install fastapi uvicorn pydantic networkx
```

Folder structure:
```
compass-engine/
├── main.py                # FastAPI app — all endpoints
├── engine/
│   ├── __init__.py
│   ├── mastery.py         # Mastery tracker + temporal decay
│   ├── graph.py           # Prerequisite graph (NetworkX)
│   ├── velocity.py        # Learning velocity calculation
│   └── knowledge_map.py   # Combines everything into a KnowledgeMap
├── data/
│   ├── topics.json        # Topic structure + prerequisites
│   ├── students.json      # Student interaction histories
│   └── questions.json     # Question bank metadata
├── schemas.py             # Shared Pydantic models (COPY FROM PERSON A)
└── seed.py                # Generate synthetic demo data
```

---

## STEP 1: Copy the Shared Schemas (Hour 1)

Get schemas/models.py from Person A (Ajitesh). Copy it into your project as `schemas.py`. You both must use the exact same models.

---

## STEP 2: Build the Topic Prerequisite Graph (Hour 1-6)

This is your first deliverable. Build this for O-Level Additional Mathematics.

### data/topics.json
```json
{
  "subject": "O-Level Additional Mathematics",
  "level": "Secondary 3-4",
  "topics": [
    {
      "id": "algebraic_manipulation",
      "name": "Algebraic Manipulation",
      "subtopics": ["Expansion", "Factorisation", "Simplification of algebraic fractions"],
      "prerequisites": [],
      "objectives": "Manipulate algebraic expressions fluently",
      "common_mistakes": "Sign errors during expansion, forgetting to factorise completely",
      "remediation": "Start with simple expansion drills, then progress to multi-step problems"
    },
    {
      "id": "quadratic_equations",
      "name": "Quadratic Equations",
      "subtopics": ["Factorisation method", "Completing the square", "Quadratic formula", "Discriminant"],
      "prerequisites": ["algebraic_manipulation"],
      "objectives": "Solve quadratic equations using multiple methods and interpret discriminant",
      "common_mistakes": "Forgetting ± in quadratic formula, errors in completing the square",
      "remediation": "Practice all three methods on the same equation to build flexibility"
    },
    {
      "id": "surds",
      "name": "Surds",
      "subtopics": ["Simplification", "Rationalisation", "Operations with surds"],
      "prerequisites": ["algebraic_manipulation"],
      "objectives": "Simplify and rationalise surd expressions",
      "common_mistakes": "Incorrect rationalisation of denominators with two terms",
      "remediation": "Focus on conjugate pairs for rationalisation"
    },
    {
      "id": "indices_and_logarithms",
      "name": "Indices and Logarithms",
      "subtopics": ["Laws of indices", "Laws of logarithms", "Solving exponential equations", "Change of base"],
      "prerequisites": ["algebraic_manipulation"],
      "objectives": "Apply index and logarithm laws to solve equations",
      "common_mistakes": "Confusing log(a+b) with log(a)+log(b), wrong application of power rule",
      "remediation": "Drill individual laws before combining them in equations"
    },
    {
      "id": "polynomials",
      "name": "Polynomials and Partial Fractions",
      "subtopics": ["Remainder theorem", "Factor theorem", "Cubic equations", "Partial fractions"],
      "prerequisites": ["algebraic_manipulation", "quadratic_equations"],
      "objectives": "Use factor/remainder theorem and decompose into partial fractions",
      "common_mistakes": "Sign errors in synthetic division, wrong form for partial fractions",
      "remediation": "Practice factor theorem to find first root, then polynomial division"
    },
    {
      "id": "binomial_theorem",
      "name": "Binomial Theorem",
      "subtopics": ["Expansion of (a+b)^n", "General term", "Applications"],
      "prerequisites": ["algebraic_manipulation", "indices_and_logarithms"],
      "objectives": "Expand binomial expressions and find specific terms",
      "common_mistakes": "Errors in nCr calculation, forgetting to apply power to both terms",
      "remediation": "Start with Pascal's triangle for small n, then transition to formula"
    },
    {
      "id": "coordinate_geometry",
      "name": "Coordinate Geometry",
      "subtopics": ["Distance formula", "Midpoint", "Gradient", "Equation of line", "Parallel and perpendicular lines"],
      "prerequisites": ["algebraic_manipulation", "quadratic_equations"],
      "objectives": "Apply coordinate geometry to solve problems involving lines and curves",
      "common_mistakes": "Mixing up gradient conditions for parallel vs perpendicular",
      "remediation": "Visualise on graph paper, connect algebraic and geometric interpretations"
    },
    {
      "id": "trigonometric_functions",
      "name": "Trigonometric Functions",
      "subtopics": ["Six trig ratios", "Graphs of trig functions", "Trig equations", "Basic identities"],
      "prerequisites": ["algebraic_manipulation"],
      "objectives": "Understand and apply trigonometric functions and solve trig equations",
      "common_mistakes": "Wrong quadrant for solutions, forgetting principal values",
      "remediation": "Always draw the ASTC diagram, practice finding all solutions in range"
    },
    {
      "id": "trigonometric_identities",
      "name": "Trigonometric Identities and Equations",
      "subtopics": ["Addition formulae", "Double angle formulae", "R-formula", "Proving identities"],
      "prerequisites": ["trigonometric_functions", "algebraic_manipulation"],
      "objectives": "Apply trig identities to prove results and solve complex equations",
      "common_mistakes": "Confusing sin(A+B) with sinA+sinB, errors in R-formula",
      "remediation": "Memorise the three key identities, practice proving before solving"
    },
    {
      "id": "differentiation",
      "name": "Differentiation",
      "subtopics": ["Power rule", "Chain rule", "Product rule", "Quotient rule", "Tangent and normal"],
      "prerequisites": ["algebraic_manipulation", "indices_and_logarithms", "trigonometric_functions"],
      "objectives": "Differentiate functions and apply to tangent/normal problems",
      "common_mistakes": "Chain rule errors with composite functions, forgetting to multiply by inner derivative",
      "remediation": "Practice chain rule separately before combining with product/quotient rules"
    },
    {
      "id": "applications_of_differentiation",
      "name": "Applications of Differentiation",
      "subtopics": ["Increasing/decreasing functions", "Stationary points", "Rate of change", "Maximum/minimum problems"],
      "prerequisites": ["differentiation", "coordinate_geometry"],
      "objectives": "Apply differentiation to optimisation and rate of change problems",
      "common_mistakes": "Not verifying nature of stationary point, setting up wrong equation for optimisation",
      "remediation": "Practice setting up the function to optimise from word problems"
    },
    {
      "id": "integration",
      "name": "Integration",
      "subtopics": ["Reverse of differentiation", "Definite integrals", "Area under curve", "Area between curves"],
      "prerequisites": ["differentiation", "algebraic_manipulation"],
      "objectives": "Integrate functions and apply to area calculations",
      "common_mistakes": "Forgetting +C for indefinite integrals, wrong limits for area between curves",
      "remediation": "Connect integration to differentiation first, then build to area applications"
    },
    {
      "id": "kinematics",
      "name": "Kinematics",
      "subtopics": ["Displacement", "Velocity", "Acceleration", "v-t and s-t graphs"],
      "prerequisites": ["differentiation", "integration"],
      "objectives": "Apply calculus to motion problems",
      "common_mistakes": "Confusing when to differentiate vs integrate, sign conventions for direction",
      "remediation": "Always start from the relationship: differentiate s→v→a, integrate a→v→s"
    },
    {
      "id": "linear_law",
      "name": "Linear Law",
      "subtopics": ["Reducing equations to linear form", "Plotting linear graphs", "Estimating values"],
      "prerequisites": ["coordinate_geometry", "indices_and_logarithms"],
      "objectives": "Convert non-linear relationships to linear form and extract parameters",
      "common_mistakes": "Wrong substitution for Y and X variables, reading gradient/intercept incorrectly",
      "remediation": "Practice the algebraic manipulation to get Y = mX + c form"
    },
    {
      "id": "proofs_in_plane_geometry",
      "name": "Proofs in Plane Geometry",
      "subtopics": ["Circle properties", "Tangent-chord angle", "Alternate segment theorem"],
      "prerequisites": ["trigonometric_functions", "coordinate_geometry"],
      "objectives": "Apply circle theorems to prove geometric results",
      "common_mistakes": "Not identifying which theorem applies, incomplete proof structure",
      "remediation": "Learn to recognise visual patterns for each theorem"
    }
  ]
}
```

### engine/graph.py
```python
import json
import networkx as nx
from typing import List, Dict, Optional

class TopicGraph:
    def __init__(self, topics_path: str = "data/topics.json"):
        with open(topics_path) as f:
            data = json.load(f)
        
        self.graph = nx.DiGraph()
        self.topic_data = {}
        
        for topic in data["topics"]:
            self.graph.add_node(topic["id"], **topic)
            self.topic_data[topic["id"]] = topic
            for prereq in topic.get("prerequisites", []):
                self.graph.add_edge(prereq, topic["id"])  # prereq → topic
    
    def get_prerequisites(self, topic_id: str) -> List[str]:
        """Get direct prerequisites of a topic."""
        return list(self.graph.predecessors(topic_id))
    
    def get_all_prerequisites(self, topic_id: str) -> List[str]:
        """Get ALL upstream prerequisites (transitive)."""
        return list(nx.ancestors(self.graph, topic_id))
    
    def get_dependents(self, topic_id: str) -> List[str]:
        """Get topics that depend on this one."""
        return list(self.graph.successors(topic_id))
    
    def check_prerequisite_gaps(self, topic_id: str, mastery_scores: Dict[str, float], threshold: float = 0.5) -> List[Dict]:
        """Check if a weak topic has weak prerequisites (root cause detection)."""
        gaps = []
        for prereq in self.get_prerequisites(topic_id):
            prereq_mastery = mastery_scores.get(prereq, 0.0)
            if prereq_mastery < threshold:
                gaps.append({
                    "topic": topic_id,
                    "prerequisite_topic": prereq,
                    "prerequisite_mastery": prereq_mastery,
                    "is_weak": True,
                    "topic_name": self.topic_data[topic_id]["name"],
                    "prerequisite_name": self.topic_data[prereq]["name"]
                })
        return gaps
    
    def get_study_order(self, weak_topics: List[str]) -> List[str]:
        """Given a list of weak topics, return the optimal study order (prerequisites first)."""
        subgraph = self.graph.subgraph(
            set(weak_topics) | {p for t in weak_topics for p in self.get_all_prerequisites(t)}
        )
        return list(nx.topological_sort(subgraph))
    
    def get_topic_info(self, topic_id: str) -> Optional[Dict]:
        """Get full topic metadata."""
        return self.topic_data.get(topic_id)
    
    def get_graph_json(self) -> Dict:
        """Export graph as JSON for frontend visualization."""
        nodes = []
        edges = []
        for node_id, data in self.graph.nodes(data=True):
            nodes.append({
                "id": node_id,
                "name": data.get("name", node_id),
                "subtopics": data.get("subtopics", []),
            })
        for source, target in self.graph.edges():
            edges.append({"from": source, "to": target})
        return {"nodes": nodes, "edges": edges}


# Test it
if __name__ == "__main__":
    g = TopicGraph()
    print("All topics:", [n for n in g.graph.nodes()])
    print("\nPrerequisites for integration:", g.get_prerequisites("integration"))
    print("ALL upstream for integration:", g.get_all_prerequisites("integration"))
    
    # Simulate weak mastery scores
    scores = {"differentiation": 0.4, "algebraic_manipulation": 0.3, "integration": 0.25}
    gaps = g.check_prerequisite_gaps("integration", scores)
    print("\nPrerequisite gaps for integration:", gaps)
    
    print("\nStudy order:", g.get_study_order(["integration", "differentiation"]))
```

Run this immediately and verify the graph is correct.

---

## STEP 3: Build the Mastery Tracker (Hour 6-12)

### engine/mastery.py
```python
import math
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from schemas import InteractionEvent

class MasteryTracker:
    """
    Tracks per-topic mastery for a student.
    Mastery updates on each interaction and decays over time.
    """
    
    def __init__(self):
        self.mastery: Dict[str, float] = {}        # topic -> score (0-1)
        self.attempt_counts: Dict[str, int] = {}    # topic -> total attempts
        self.correct_counts: Dict[str, int] = {}    # topic -> correct attempts
        self.last_practiced: Dict[str, datetime] = {}
        self.error_types: Dict[str, Dict[str, int]] = {}  # topic -> {type: count}
        self.history: Dict[str, List[dict]] = {}    # topic -> list of {timestamp, mastery, is_correct}
    
    def update(self, event: InteractionEvent):
        """Update mastery based on a new interaction event."""
        topic = event.topic
        
        # Initialize if new topic
        if topic not in self.mastery:
            self.mastery[topic] = 0.5  # Start at 50% (unknown)
            self.attempt_counts[topic] = 0
            self.correct_counts[topic] = 0
            self.error_types[topic] = {"conceptual": 0, "careless": 0, "time_pressure": 0}
            self.history[topic] = []
        
        # Apply temporal decay BEFORE updating
        self._apply_decay(topic, event.timestamp)
        
        # Update counts
        self.attempt_counts[topic] += 1
        if event.is_correct:
            self.correct_counts[topic] += 1
        
        # Update mastery using weighted moving average
        # Weight by difficulty: harder questions affect mastery more
        difficulty_weight = {"easy": 0.5, "medium": 1.0, "hard": 1.5}
        weight = difficulty_weight.get(event.difficulty, 1.0)
        
        # Learning rate decreases with more attempts (more stable estimate)
        learning_rate = max(0.05, 0.3 / math.sqrt(self.attempt_counts[topic]))
        
        target = 1.0 if event.is_correct else 0.0
        self.mastery[topic] += learning_rate * weight * (target - self.mastery[topic])
        self.mastery[topic] = max(0.0, min(1.0, self.mastery[topic]))  # Clamp
        
        # Update timestamps
        self.last_practiced[topic] = event.timestamp
        
        # Store history for velocity calculation
        self.history[topic].append({
            "timestamp": event.timestamp,
            "mastery": self.mastery[topic],
            "is_correct": event.is_correct,
            "time_taken": event.time_taken_sec
        })
    
    def _apply_decay(self, topic: str, current_time: datetime):
        """Apply temporal decay based on time since last practice."""
        if topic not in self.last_practiced:
            return
        
        days_since = (current_time - self.last_practiced[topic]).total_seconds() / 86400
        
        if days_since <= 1:
            return  # No decay within a day
        
        # Exponential decay towards 0.3 (not 0 — we assume some retention)
        # Half-life of ~14 days (adjustable)
        baseline = 0.3
        half_life = 14.0
        decay_factor = math.pow(0.5, days_since / half_life)
        
        current = self.mastery[topic]
        self.mastery[topic] = baseline + (current - baseline) * decay_factor
    
    def get_mastery(self, topic: str, at_time: Optional[datetime] = None) -> float:
        """Get current mastery for a topic, with decay applied."""
        if topic not in self.mastery:
            return 0.0
        
        if at_time:
            self._apply_decay(topic, at_time)
        
        return self.mastery[topic]
    
    def get_all_masteries(self, at_time: Optional[datetime] = None) -> Dict[str, float]:
        """Get mastery for all topics."""
        if at_time:
            for topic in self.mastery:
                self._apply_decay(topic, at_time)
        return dict(self.mastery)
    
    def update_error_type(self, topic: str, error_type: str):
        """Record an error classification for a topic."""
        if topic not in self.error_types:
            self.error_types[topic] = {"conceptual": 0, "careless": 0, "time_pressure": 0}
        if error_type in self.error_types[topic]:
            self.error_types[topic][error_type] += 1


# Test
if __name__ == "__main__":
    tracker = MasteryTracker()
    now = datetime.now()
    
    # Simulate James: weak at trig identities
    events = [
        InteractionEvent(student_id="james", question_id="q1", topic="Trigonometric Identities",
                        subtopic="Double angle", difficulty="medium", student_answer="wrong",
                        correct_answer="right", is_correct=False, time_taken_sec=180, timestamp=now - timedelta(days=14)),
        InteractionEvent(student_id="james", question_id="q2", topic="Trigonometric Identities",
                        subtopic="Addition formulae", difficulty="medium", student_answer="wrong",
                        correct_answer="right", is_correct=False, time_taken_sec=200, timestamp=now - timedelta(days=13)),
        InteractionEvent(student_id="james", question_id="q3", topic="Trigonometric Identities",
                        subtopic="Double angle", difficulty="easy", student_answer="right",
                        correct_answer="right", is_correct=True, time_taken_sec=90, timestamp=now - timedelta(days=10)),
    ]
    
    for e in events:
        tracker.update(e)
    
    print(f"Mastery (trig identities): {tracker.get_mastery('Trigonometric Identities', now):.3f}")
    print(f"Attempts: {tracker.attempt_counts}")
```

---

## STEP 4: Build Learning Velocity (Hour 12-18)

### engine/velocity.py
```python
from typing import Dict, List, Literal
from datetime import datetime, timedelta

def calculate_velocity(history: List[dict], window_size: int = 5) -> Literal["improving", "plateauing", "regressing"]:
    """
    Calculate learning velocity for a topic based on recent mastery history.
    
    Uses a sliding window to compare recent performance against earlier performance.
    """
    if len(history) < 3:
        return "plateauing"  # Not enough data
    
    recent = history[-window_size:]
    
    if len(recent) < 2:
        return "plateauing"
    
    # Calculate trend using simple linear regression on mastery scores
    n = len(recent)
    x_vals = list(range(n))
    y_vals = [h["mastery"] for h in recent]
    
    x_mean = sum(x_vals) / n
    y_mean = sum(y_vals) / n
    
    numerator = sum((x - x_mean) * (y - y_mean) for x, y in zip(x_vals, y_vals))
    denominator = sum((x - x_mean) ** 2 for x in x_vals)
    
    if denominator == 0:
        return "plateauing"
    
    slope = numerator / denominator
    
    # Thresholds for classification
    if slope > 0.02:
        return "improving"
    elif slope < -0.02:
        return "regressing"
    else:
        return "plateauing"


def get_velocity_details(history: List[dict]) -> Dict:
    """Get detailed velocity info for display."""
    velocity = calculate_velocity(history)
    
    if len(history) >= 2:
        recent_mastery = history[-1]["mastery"]
        earlier_mastery = history[0]["mastery"]
        change = recent_mastery - earlier_mastery
    else:
        change = 0.0
    
    return {
        "velocity": velocity,
        "mastery_change": round(change, 3),
        "data_points": len(history),
        "latest_mastery": history[-1]["mastery"] if history else 0.0
    }
```

---

## STEP 5: Combine into Knowledge Map Builder (Hour 18-22)

### engine/knowledge_map.py
```python
from datetime import datetime
from typing import Dict, Optional
from engine.mastery import MasteryTracker
from engine.graph import TopicGraph
from engine.velocity import calculate_velocity, get_velocity_details
from schemas import KnowledgeMap, TopicMastery, PrerequisiteStatus, InteractionEvent

class KnowledgeMapBuilder:
    """Combines mastery tracking, prerequisite graph, and velocity into a complete knowledge map."""
    
    def __init__(self, topics_path: str = "data/topics.json"):
        self.graph = TopicGraph(topics_path)
        self.student_trackers: Dict[str, MasteryTracker] = {}
    
    def process_interaction(self, event: InteractionEvent):
        """Process a new student interaction."""
        if event.student_id not in self.student_trackers:
            self.student_trackers[event.student_id] = MasteryTracker()
        
        self.student_trackers[event.student_id].update(event)
    
    def get_knowledge_map(self, student_id: str, student_name: Optional[str] = None) -> KnowledgeMap:
        """Build a complete knowledge map for a student."""
        tracker = self.student_trackers.get(student_id)
        now = datetime.now()
        
        if not tracker:
            # Return empty map for new student
            return KnowledgeMap(
                student_id=student_id,
                student_name=student_name,
                topic_masteries=[],
                prerequisite_flags=[],
                overall_mastery=0.0,
                last_active=None
            )
        
        # Build per-topic mastery
        topic_masteries = []
        mastery_scores = {}
        
        for topic_id in tracker.mastery:
            mastery = tracker.get_mastery(topic_id, now)
            mastery_scores[topic_id] = mastery
            
            history = tracker.history.get(topic_id, [])
            velocity = calculate_velocity(history)
            
            topic_masteries.append(TopicMastery(
                topic=topic_id,
                mastery_score=round(mastery, 3),
                velocity=velocity,
                last_practiced=tracker.last_practiced.get(topic_id),
                attempt_count=tracker.attempt_counts.get(topic_id, 0),
                error_types=tracker.error_types.get(topic_id, {})
            ))
        
        # Check prerequisite gaps for all weak topics
        prerequisite_flags = []
        for topic_id, mastery in mastery_scores.items():
            if mastery < 0.5:  # Weak topic
                gaps = self.graph.check_prerequisite_gaps(topic_id, mastery_scores)
                for gap in gaps:
                    prerequisite_flags.append(PrerequisiteStatus(**{
                        "topic": gap["topic"],
                        "prerequisite_topic": gap["prerequisite_topic"],
                        "prerequisite_mastery": gap["prerequisite_mastery"],
                        "is_weak": gap["is_weak"]
                    }))
        
        # Overall mastery
        overall = sum(mastery_scores.values()) / len(mastery_scores) if mastery_scores else 0.0
        
        # Last active
        last_active = max(tracker.last_practiced.values()) if tracker.last_practiced else None
        
        return KnowledgeMap(
            student_id=student_id,
            student_name=student_name,
            topic_masteries=topic_masteries,
            prerequisite_flags=prerequisite_flags,
            overall_mastery=round(overall, 3),
            last_active=last_active
        )
```

---

## STEP 6: Build API Endpoints (Hour 22-26)

### main.py
```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from engine.knowledge_map import KnowledgeMapBuilder
from engine.graph import TopicGraph
from schemas import InteractionEvent, KnowledgeMap
from typing import List

app = FastAPI(title="Compass Knowledge Engine")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Global state (in production this would be a database)
engine = KnowledgeMapBuilder()
graph = TopicGraph()

@app.post("/api/interaction")
async def log_interaction(event: InteractionEvent):
    """Log a student interaction (from quiz)."""
    engine.process_interaction(event)
    return {"status": "ok", "student_id": event.student_id, "topic": event.topic}

@app.post("/api/interactions/batch")
async def log_interactions_batch(events: List[InteractionEvent]):
    """Load multiple interactions at once (for demo data)."""
    for event in events:
        engine.process_interaction(event)
    return {"status": "ok", "count": len(events)}

@app.get("/api/student/{student_id}/knowledge-map", response_model=KnowledgeMap)
async def get_knowledge_map(student_id: str):
    """Get the full knowledge map for a student."""
    km = engine.get_knowledge_map(student_id)
    if not km.topic_masteries:
        raise HTTPException(status_code=404, detail="No data for this student yet")
    return km

@app.get("/api/student/{student_id}/velocity")
async def get_velocity(student_id: str):
    """Get learning velocity details per topic."""
    tracker = engine.student_trackers.get(student_id)
    if not tracker:
        raise HTTPException(status_code=404, detail="Student not found")
    
    from engine.velocity import get_velocity_details
    velocities = {}
    for topic, history in tracker.history.items():
        velocities[topic] = get_velocity_details(history)
    return velocities

@app.get("/api/topics/graph")
async def get_topic_graph():
    """Get the prerequisite graph for frontend visualization."""
    return graph.get_graph_json()

@app.get("/api/topics/{topic_id}")
async def get_topic_info(topic_id: str):
    """Get detailed info about a specific topic."""
    info = graph.get_topic_info(topic_id)
    if not info:
        raise HTTPException(status_code=404, detail="Topic not found")
    return info

@app.get("/api/students")
async def list_students():
    """List all students with basic info."""
    students = []
    for sid in engine.student_trackers:
        km = engine.get_knowledge_map(sid)
        students.append({
            "student_id": sid,
            "overall_mastery": km.overall_mastery,
            "topics_tracked": len(km.topic_masteries),
            "last_active": km.last_active
        })
    return students

@app.get("/health")
async def health():
    return {"status": "ok", "students": len(engine.student_trackers)}
```

Run with: `uvicorn main:app --reload --port 8000`

---

## STEP 7: Generate Synthetic Demo Data (Hour 26-30)

### seed.py
```python
"""Generate realistic demo data for 3 student personas."""
import json
import random
from datetime import datetime, timedelta
from schemas import InteractionEvent

random.seed(42)
now = datetime.now()

def generate_interactions(student_id: str, profile: dict) -> list:
    """Generate realistic interaction history based on a student profile."""
    interactions = []
    
    for topic, config in profile.items():
        base_accuracy = config["accuracy"]
        num_attempts = config["attempts"]
        start_day = config["start_days_ago"]
        
        for i in range(num_attempts):
            day_offset = start_day - (i * (start_day // max(num_attempts, 1)))
            timestamp = now - timedelta(days=max(day_offset, 0), hours=random.randint(8, 22))
            
            # Simulate improvement or regression
            if config.get("trend") == "improving":
                accuracy = base_accuracy + (i / num_attempts) * 0.2
            elif config.get("trend") == "regressing":
                accuracy = base_accuracy - (i / num_attempts) * 0.15
            else:
                accuracy = base_accuracy + random.uniform(-0.05, 0.05)
            
            is_correct = random.random() < accuracy
            difficulty = random.choice(["easy", "medium", "hard"])
            time_taken = random.uniform(30, 300) if is_correct else random.uniform(60, 400)
            
            interactions.append(InteractionEvent(
                student_id=student_id,
                question_id=f"{topic}_{i}",
                topic=topic,
                subtopic=config.get("subtopic", "General"),
                difficulty=difficulty,
                student_answer="correct" if is_correct else "wrong",
                correct_answer="correct",
                is_correct=is_correct,
                time_taken_sec=round(time_taken, 1),
                timestamp=timestamp
            ))
    
    return interactions

# === PERSONA 1: Sarah — Plateauing high-achiever ===
sarah = generate_interactions("sarah_001", {
    "quadratic_equations": {"accuracy": 0.85, "attempts": 15, "start_days_ago": 30, "trend": "stable", "subtopic": "Quadratic formula"},
    "coordinate_geometry": {"accuracy": 0.80, "attempts": 12, "start_days_ago": 25, "trend": "stable", "subtopic": "Equation of line"},
    "differentiation": {"accuracy": 0.75, "attempts": 18, "start_days_ago": 20, "trend": "improving", "subtopic": "Chain rule"},
    "integration": {"accuracy": 0.60, "attempts": 14, "start_days_ago": 14, "trend": "plateauing", "subtopic": "Definite integrals"},
    "applications_of_differentiation": {"accuracy": 0.55, "attempts": 10, "start_days_ago": 10, "trend": "plateauing", "subtopic": "Stationary points"},
})

# === PERSONA 2: James — Foundational gaps ===
james = generate_interactions("james_001", {
    "algebraic_manipulation": {"accuracy": 0.45, "attempts": 20, "start_days_ago": 28, "trend": "stable", "subtopic": "Factorisation"},
    "trigonometric_functions": {"accuracy": 0.40, "attempts": 12, "start_days_ago": 20, "trend": "regressing", "subtopic": "Trig equations"},
    "trigonometric_identities": {"accuracy": 0.30, "attempts": 10, "start_days_ago": 14, "trend": "regressing", "subtopic": "Double angle formulae"},
    "indices_and_logarithms": {"accuracy": 0.50, "attempts": 8, "start_days_ago": 25, "trend": "stable", "subtopic": "Laws of logarithms"},
    "differentiation": {"accuracy": 0.35, "attempts": 6, "start_days_ago": 7, "trend": "stable", "subtopic": "Power rule"},
})

# === PERSONA 3: Aisha — Returning after break ===
aisha = generate_interactions("aisha_001", {
    "algebraic_manipulation": {"accuracy": 0.75, "attempts": 15, "start_days_ago": 45, "trend": "improving", "subtopic": "Simplification"},
    "quadratic_equations": {"accuracy": 0.70, "attempts": 12, "start_days_ago": 42, "trend": "improving", "subtopic": "Completing the square"},
    "surds": {"accuracy": 0.65, "attempts": 8, "start_days_ago": 40, "trend": "stable", "subtopic": "Rationalisation"},
    "polynomials": {"accuracy": 0.60, "attempts": 6, "start_days_ago": 38, "trend": "stable", "subtopic": "Factor theorem"},
    # Note: last activity was ~38 days ago — temporal decay should kick in
})

all_interactions = sarah + james + aisha

# Save as JSON
output = [e.model_dump(mode="json") for e in all_interactions]
with open("data/demo_interactions.json", "w") as f:
    json.dump(output, f, indent=2, default=str)

print(f"Generated {len(all_interactions)} interactions for 3 personas")
print(f"  Sarah: {len(sarah)} interactions")
print(f"  James: {len(james)} interactions")
print(f"  Aisha: {len(aisha)} interactions")
```

---

## STEP 8: Build Knowledge Map Visualization (Hour 24-30)

Tell Cursor: "Build a React component called KnowledgeMapGraph that takes a topic graph (nodes with id, name, mastery_score, velocity) and edges (from, to) and renders an interactive directed graph. Each node should be a rounded rectangle colored by mastery: green (>=0.7), yellow (0.4-0.7), red (<0.4). Show the topic name and mastery percentage inside each node. Show velocity arrows: ↑ green for improving, → gray for plateauing, ↓ red for regressing. Edges should be arrows showing prerequisite relationships. Use a top-to-bottom layout. When clicking a node, show a tooltip with subtopics, attempt count, last practiced, and prerequisite status. Use Tailwind CSS. Make it the visual centerpiece of the dashboard."

---

## STEP 9: Integration & Polish (Hour 30-42)

1. Load demo data on startup: add an endpoint `POST /api/seed` that loads demo_interactions.json
2. Test with Person A: their agent pipeline should be able to call your `/api/student/{id}/knowledge-map` and get back a valid KnowledgeMap
3. Test with Person C: their quiz should POST to `/api/interaction` and the knowledge map should update
4. Test with Person D: the `/api/students` endpoint should list all demo students for the teacher dashboard

---

## CHECKLIST

- [ ] Topic prerequisite graph (15+ topics, correct edges)
- [ ] Mastery tracker with weighted updates
- [ ] Temporal decay working (test with Aisha persona)
- [ ] Learning velocity calculation (improving/plateauing/regressing)
- [ ] Prerequisite gap detection (test with James persona)
- [ ] All API endpoints live and tested
- [ ] Synthetic demo data for 3 personas
- [ ] Knowledge map visualization component
- [ ] Connected to Person A's agent pipeline
- [ ] Connected to Person C's quiz interface
