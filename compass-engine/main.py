import json
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


@app.post("/api/seed")
async def seed_demo_data():
    """Load demo_interactions.json and seed all interactions."""
    try:
        with open("data/demo_interactions.json") as f:
            raw = json.load(f)
        events = [InteractionEvent(**e) for e in raw]
        for event in events:
            engine.process_interaction(event)
        return {"status": "ok", "count": len(events), "message": "Demo data loaded successfully"}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="demo_interactions.json not found. Run seed.py first.")


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


@app.get("/api/student/{student_id}/activity")
async def get_activity(student_id: str, limit: int = 10):
    """Get the most recent interactions for a student across all topics."""
    tracker = engine.student_trackers.get(student_id)
    if not tracker:
        raise HTTPException(status_code=404, detail="Student not found")

    # Flatten all topic histories into a single list and sort by timestamp descending
    all_events = []
    for topic, history in tracker.history.items():
        topic_info = graph.get_topic_info(topic)
        topic_name = topic_info["name"] if topic_info else topic
        for entry in history:
            all_events.append({
                "topic": topic,
                "topic_name": topic_name,
                "timestamp": entry["timestamp"],
                "mastery_after": round(entry["mastery"], 3),
                "is_correct": entry["is_correct"],
                "time_taken_sec": entry["time_taken"],
            })

    all_events.sort(key=lambda e: e["timestamp"], reverse=True)
    return all_events[:limit]


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
