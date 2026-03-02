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
sarah = generate_interactions("sarah", {
    "quadratics": {"accuracy": 0.85, "attempts": 15, "start_days_ago": 30, "trend": "stable", "subtopic": "Quadratic formula"},
    "limits_and_derivatives": {"accuracy": 0.80, "attempts": 12, "start_days_ago": 25, "trend": "stable", "subtopic": "Power rule"},
    "differentiation_applications": {"accuracy": 0.75, "attempts": 18, "start_days_ago": 20, "trend": "improving", "subtopic": "Optimisation"},
    "integration_basics": {"accuracy": 0.60, "attempts": 14, "start_days_ago": 14, "trend": "plateauing", "subtopic": "Definite integrals"},
    "calculus_applications": {"accuracy": 0.55, "attempts": 10, "start_days_ago": 10, "trend": "plateauing", "subtopic": "Motion problems"},
})

# === PERSONA 2: James — Foundational gaps ===
james = generate_interactions("james", {
    "functions_basics": {"accuracy": 0.45, "attempts": 20, "start_days_ago": 28, "trend": "stable", "subtopic": "Composite functions"},
    "unit_circle_identities": {"accuracy": 0.40, "attempts": 12, "start_days_ago": 20, "trend": "regressing", "subtopic": "Solving trig equations"},
    "trig_identities_ahl": {"accuracy": 0.30, "attempts": 10, "start_days_ago": 14, "trend": "regressing", "subtopic": "Compound angle formulae"},
    "exponents_logarithms": {"accuracy": 0.50, "attempts": 8, "start_days_ago": 25, "trend": "stable", "subtopic": "Laws of logarithms"},
    "limits_and_derivatives": {"accuracy": 0.35, "attempts": 6, "start_days_ago": 7, "trend": "stable", "subtopic": "Chain rule"},
})

# === PERSONA 3: Aisha — Returning after break ===
aisha = generate_interactions("aisha", {
    "functions_basics": {"accuracy": 0.75, "attempts": 15, "start_days_ago": 45, "trend": "improving", "subtopic": "Inverse functions"},
    "quadratics": {"accuracy": 0.70, "attempts": 12, "start_days_ago": 42, "trend": "improving", "subtopic": "Completing the square"},
    "sequences_series": {"accuracy": 0.65, "attempts": 8, "start_days_ago": 40, "trend": "stable", "subtopic": "Geometric series"},
    "binomial_theorem": {"accuracy": 0.60, "attempts": 6, "start_days_ago": 38, "trend": "stable", "subtopic": "General term"},
    # Last activity ~38 days ago — temporal decay should kick in
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
