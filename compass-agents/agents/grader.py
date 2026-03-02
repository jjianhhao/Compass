"""
AI grading module using GPT-4o Vision.
Grades student handwritten/uploaded work against IB mark schemes.
"""

import json
from config import client
from data.questions import get_question_by_id

GRADING_MODEL = "gpt-4o"

SYSTEM_PROMPT = """You are an experienced IB Mathematics AA HL examiner. You are grading a student's
handwritten or photographed work for a specific question.

You will receive:
1. The question's mark scheme (HTML format with worked solutions)
2. An image of the student's work

BLANK SUBMISSION RULE (highest priority — check this first):
If the image is completely blank, shows only a white/empty page, or contains no visible
mathematical writing, equations, working, or diagrams, you MUST return:
  marks_awarded: 0, feedback: "No work was submitted for this question.",
  strengths: [], errors: ["No working shown — a blank answer receives 0 marks."]
Do NOT award any marks whatsoever for a blank submission.
You MUST still populate model_answer and worked_solution even for blank submissions.

Grade the student's work according to IB marking principles:
- Award marks for correct working, even if the final answer is wrong
- Award method marks (M) for valid approaches even with arithmetic errors
- Award accuracy marks (A) only when following from correct working
- Apply follow-through marks where the student's working is visible and coherent
- Look for alternative valid methods not in the mark scheme
- Accept unsimplified but mathematically equivalent answers as fully correct (e.g. 3/243 is equivalent to 1/81 and should receive full marks — do NOT penalise for not simplifying unless the question explicitly asks for a simplified form)
- When reading handwritten fractions, carefully distinguish numerals that look similar (e.g. 1 vs 2 vs 3). If a digit in the student's fraction is ambiguous and one reading produces the correct answer, favour that reading and note it as correct or unsimplified rather than wrong

Return your assessment as a JSON object with these exact fields:
{
  "marks_awarded": <integer: marks earned>,
  "marks_available": <integer: total marks for this question>,
  "feedback": "<string: 2-3 sentence overall assessment>",
  "strengths": ["<string: what the student did well>"],
  "errors": ["<string: specific mistakes or gaps>"],
  "model_answer": "<plain string with ALL math in $...$, e.g. '$x = 3$' or '$d=4$, $S_{10}=200$'>",
  "worked_solution": [
    {"step": <integer>, "description": "<plain text description>", "working": "<single $$...$$ display math block, e.g. '$$x = \\frac{-b}{2a} = 3$$'>"}
  ]
}

Return ONLY the JSON object, no other text."""


def grade_student_work(question_id: str, image_base64: str) -> dict:
    """
    Grade a student's work using GPT-4o Vision.

    Args:
        question_id: Reference code of the question (e.g. "RT-Math-00001")
        image_base64: Base64-encoded PNG of the student's work (no data URI prefix)

    Returns:
        Dict with marks_awarded, marks_available, mark_percentage, feedback,
        strengths, errors, is_correct
    """
    # Look up question with markscheme
    question = get_question_by_id(question_id, include_markscheme=True)
    if question is None:
        return {
            "marks_awarded": 0,
            "marks_available": 0,
            "mark_percentage": 0,
            "feedback": f"Question {question_id} not found.",
            "strengths": [],
            "errors": ["Question not found in database."],
            "is_correct": False,
        }

    marks_available = question["marks"]
    markscheme = question["markscheme_body"]
    question_body = question["question_body"]

    user_content = [
        {
            "type": "text",
            "text": (
                f"## Question\n{question_body}\n\n"
                f"## Mark Scheme ({marks_available} marks available)\n{markscheme}\n\n"
                "## Student's Work\nThe image below shows the student's handwritten/uploaded answer. "
                "Grade it according to the mark scheme above."
            ),
        },
        {
            "type": "image_url",
            "image_url": {
                "url": f"data:image/png;base64,{image_base64}",
                "detail": "high",
            },
        },
    ]

    response = client.chat.completions.create(
        model=GRADING_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
        temperature=0.2,
        max_tokens=2048,
    )

    raw = response.choices[0].message.content.strip()

    # Parse JSON from response (handle markdown code fences)
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        return {
            "marks_awarded": 0,
            "marks_available": marks_available,
            "mark_percentage": 0,
            "feedback": "AI grading failed to parse. Please try again.",
            "strengths": [],
            "errors": ["Grading response was not valid JSON."],
            "is_correct": False,
        }

    marks_awarded = min(int(result.get("marks_awarded", 0)), marks_available)
    mark_percentage = round((marks_awarded / marks_available) * 100) if marks_available > 0 else 0

    model_answer = result.get("model_answer") or None
    worked_solution = result.get("worked_solution") or None

    # If GPT omitted the model answer (e.g. blank submission), generate it from the mark scheme
    if not model_answer and not worked_solution:
        try:
            ms_response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an IB Mathematics examiner. Given a question and its mark scheme, "
                            "produce a clean worked solution a student can learn from.\n"
                            "Return ONLY a JSON object with:\n"
                            '- "model_answer": the final answer as a plain string, ALL math wrapped in $...$, e.g. "$d=4$, $u_{10}=38$"\n'
                            '- "worked_solution": list of {"step": int, "description": str, "working": str} '
                            "where every working string is a single $$...$$ display math block, e.g. \"$$u_{10} = 2 + 9(4) = 38$$\""
                        ),
                    },
                    {
                        "role": "user",
                        "content": (
                            f"## Question\n{question_body}\n\n"
                            f"## Mark Scheme\n{markscheme}\n\n"
                            "Produce the worked solution JSON."
                        ),
                    },
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
                max_tokens=1024,
                timeout=15,
            )
            ms_result = json.loads(ms_response.choices[0].message.content)
            model_answer = ms_result.get("model_answer")
            worked_solution = ms_result.get("worked_solution")
        except Exception:
            pass

    return {
        "marks_awarded": marks_awarded,
        "marks_available": marks_available,
        "mark_percentage": mark_percentage,
        "feedback": result.get("feedback", ""),
        "strengths": result.get("strengths", []),
        "errors": result.get("errors", []),
        "is_correct": mark_percentage >= 50,
        "model_answer": model_answer,
        "worked_solution": worked_solution,
    }
