import json
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
_SYLLABUS_PATH = _BASE_DIR / "data" / "syllabus.json"


def setup_rag(syllabus_path: str | None = None):
    """Embed syllabus data into ChromaDB for RAG retrieval."""

    path = Path(syllabus_path) if syllabus_path else _SYLLABUS_PATH

    client = chromadb.PersistentClient(path=_RAG_DB_PATH)
    collection = client.get_or_create_collection(
        name="syllabus",
        embedding_function=openai_ef,
    )

    with open(path) as f:
        syllabus = json.load(f)

    documents = []
    ids = []
    metadatas = []

    for topic in syllabus["topics"]:
        doc = f"""Topic: {topic['name']}
Level: {topic.get('level', 'O-Level')}
Prerequisites: {', '.join(topic.get('prerequisites', ['None']))}
Subtopics: {', '.join(topic.get('subtopics', []))}
Learning Objectives: {topic.get('objectives', 'N/A')}
Common Misconceptions: {topic.get('common_mistakes', 'N/A')}
Recommended Approach When Struggling: {topic.get('remediation', 'N/A')}"""

        documents.append(doc)
        ids.append(topic["name"].lower().replace(" ", "_"))
        metadatas.append({"topic": topic["name"], "level": topic.get("level", "O-Level")})

    collection.add(documents=documents, ids=ids, metadatas=metadatas)
    print(f"Embedded {len(documents)} topics into RAG database.")


if __name__ == "__main__":
    setup_rag()
