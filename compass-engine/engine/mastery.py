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
        self.mastery: Dict[str, float] = {}
        self.attempt_counts: Dict[str, int] = {}
        self.correct_counts: Dict[str, int] = {}
        self.last_practiced: Dict[str, datetime] = {}
        self.error_types: Dict[str, Dict[str, int]] = {}
        self.history: Dict[str, List[dict]] = {}

    def update(self, event: InteractionEvent):
        """Update mastery based on a new interaction event."""
        topic = event.topic

        # Normalise to timezone-naive so decay arithmetic never fails
        event_time = event.timestamp.replace(tzinfo=None) if event.timestamp.tzinfo else event.timestamp

        if topic not in self.mastery:
            self.mastery[topic] = 0.5  # Start at 50% (unknown)
            self.attempt_counts[topic] = 0
            self.correct_counts[topic] = 0
            self.error_types[topic] = {"conceptual": 0, "careless": 0, "time_pressure": 0}
            self.history[topic] = []

        # Apply temporal decay BEFORE updating
        self._apply_decay(topic, event_time)

        self.attempt_counts[topic] += 1
        if event.is_correct:
            self.correct_counts[topic] += 1

        # Weight by difficulty: harder questions affect mastery more
        difficulty_weight = {"easy": 0.5, "medium": 1.0, "hard": 1.5}
        weight = difficulty_weight.get(event.difficulty, 1.0)

        # Learning rate decreases with more attempts (more stable estimate)
        learning_rate = max(0.05, 0.3 / math.sqrt(self.attempt_counts[topic]))

        target = 1.0 if event.is_correct else 0.0
        self.mastery[topic] += learning_rate * weight * (target - self.mastery[topic])
        self.mastery[topic] = max(0.0, min(1.0, self.mastery[topic]))

        self.last_practiced[topic] = event_time

        self.history[topic].append({
            "timestamp": event_time,
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
        # Half-life of ~14 days
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


if __name__ == "__main__":
    tracker = MasteryTracker()
    now = datetime.now()

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
