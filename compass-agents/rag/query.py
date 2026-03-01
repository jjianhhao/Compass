import os
from pathlib import Path

import chromadb
from chromadb.utils import embedding_functions
from dotenv import load_dotenv

# Load env vars
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key=os.environ.get("OPENAI_API_KEY", ""),
    model_name="text-embedding-3-small",
)

_BASE_DIR = Path(__file__).resolve().parent.parent
_RAG_DB_PATH = str(_BASE_DIR / "rag_db")


def get_syllabus_context(topics: list[str], n_results: int = 3) -> str:
    """Retrieve relevant syllabus context for given topics.

    Returns an empty string if the RAG database hasn't been initialised yet,
    so the pipeline can still run without RAG.
    """
    try:
        client = chromadb.PersistentClient(path=_RAG_DB_PATH)
        collection = client.get_collection(name="syllabus", embedding_function=openai_ef)
    except Exception:
        # Collection doesn't exist yet — RAG not initialised
        return ""

    query = (
        f"Student is struggling with: {', '.join(topics)}. "
        "What are the prerequisites, common mistakes, and recommended study approach?"
    )

    results = collection.query(query_texts=[query], n_results=n_results)

    if results and results["documents"]:
        return "\n\n---\n\n".join(results["documents"][0])
    return ""
