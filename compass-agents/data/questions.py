"""
CSV question loader for IB Math AA HL questions.
Reads data_math/Mathematics_transformed.csv at startup and serves questions.
"""

import csv
from pathlib import Path
from typing import Optional

# Path to the CSV relative to project root
CSV_PATH = Path(__file__).resolve().parent.parent.parent / "data_math" / "Mathematics_transformed.csv"

# In-memory question store
_questions: list[dict] = []
_questions_by_id: dict[str, dict] = {}

# Map marks to difficulty (since all Level values are "Basic")
_MARKS_TO_DIFFICULTY = {
    "1": "easy", "2": "easy", "3": "easy", "4": "easy",
    "5": "easy", "6": "easy",
    "7": "medium", "8": "medium", "9": "medium", "10": "medium",
    "11": "hard", "12": "hard", "13": "hard", "14": "hard",
    "15": "hard", "16": "hard", "17": "hard", "18": "hard",
    "19": "hard", "20": "hard",
}


def load_questions() -> int:
    """Load all questions from CSV into memory. Returns count loaded."""
    global _questions, _questions_by_id
    _questions = []
    _questions_by_id = {}

    if not CSV_PATH.exists():
        print(f"Warning: Question CSV not found at {CSV_PATH}. Starting with 0 questions.")
        return 0

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            ref = row.get("Reference_code", "").strip()
            if not ref:
                continue

            marks_str = row.get("Marks", "6").strip()
            marks = int(marks_str) if marks_str.isdigit() else 6
            difficulty = _MARKS_TO_DIFFICULTY.get(marks_str, "easy")

            q = {
                "id": ref,
                "question_title": row.get("Question_title", "").strip() or None,
                "subject": row.get("Subject", "").strip(),
                "marks": marks,
                "difficulty": difficulty,
                "paper": row.get("Paper", "").strip(),
                "question_number": row.get("Question_number", "").strip(),
                "question_body": row.get("Question_body", "").strip(),
                "question_diagram": row.get("Question_diagram", "").strip() or None,
                "markscheme_body": row.get("Markscheme_body", "").strip(),
                "markscheme_image": row.get("Markscheme_image", "").strip() or None,
                "examiner_report": row.get("Examiner_report", "").strip() or None,
                "question_html": row.get("Question_HTML", "").strip() or None,
            }
            _questions.append(q)
            _questions_by_id[ref] = q

    return len(_questions)


def _strip_markscheme(q: dict) -> dict:
    """Return a copy of the question without the mark scheme (student-facing)."""
    return {k: v for k, v in q.items() if k not in ("markscheme_body", "markscheme_image", "examiner_report")}


def get_questions(
    difficulty: Optional[str] = None,
    limit: int = 10,
    offset: int = 0,
) -> list[dict]:
    """Get paginated questions, optionally filtered by difficulty. Mark schemes stripped."""
    filtered = _questions
    if difficulty:
        filtered = [q for q in _questions if q["difficulty"] == difficulty]

    page = filtered[offset : offset + limit]
    return [_strip_markscheme(q) for q in page]


def get_question_by_id(question_id: str, include_markscheme: bool = False) -> Optional[dict]:
    """Get a single question by reference code."""
    q = _questions_by_id.get(question_id)
    if q is None:
        return None
    return dict(q) if include_markscheme else _strip_markscheme(q)


def get_total_count(difficulty: Optional[str] = None) -> int:
    """Get total number of questions, optionally filtered."""
    if difficulty:
        return sum(1 for q in _questions if q["difficulty"] == difficulty)
    return len(_questions)
