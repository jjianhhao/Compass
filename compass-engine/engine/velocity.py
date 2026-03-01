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
