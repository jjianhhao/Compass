from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from schemas.models import KnowledgeMap, AgentPipelineOutput
from agents.pipeline import run_pipeline

app = FastAPI(title="Compass Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/diagnose", response_model=AgentPipelineOutput)
async def diagnose_student(knowledge_map: KnowledgeMap):
    """Run full agent pipeline: Diagnosis -> Planner -> Evaluator"""
    result = run_pipeline(knowledge_map)
    return result


@app.get("/health")
async def health():
    return {"status": "ok", "agents": ["diagnosis", "planner", "evaluator"]}
