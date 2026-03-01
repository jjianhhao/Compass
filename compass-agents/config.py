import os
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

# Load .env from compass-agents directory
load_dotenv(Path(__file__).parent / ".env")

api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError(
        "OPENAI_API_KEY is not set. "
        "Copy .env.example to .env and fill in your key:\n"
        "  cp .env.example .env"
    )

client = OpenAI(api_key=api_key)
MODEL = os.environ.get("MODEL", "gpt-4o-mini")
