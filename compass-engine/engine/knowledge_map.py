from datetime import datetime
from typing import Dict, Optional
from engine.mastery import MasteryTracker
from engine.graph import TopicGraph
from engine.velocity import calculate_velocity, get_velocity_details
from schemas import KnowledgeMap, TopicMastery, PrerequisiteStatus, InteractionEvent


class KnowledgeMapBuilder:
    """Combines mastery tracking, prerequisite graph, and velocity into a complete knowledge map."""

    def __init__(self, topics_path: str = "data/topics.json"):
        self.graph = TopicGraph(topics_path)
        self.student_trackers: Dict[str, MasteryTracker] = {}

    def process_interaction(self, event: InteractionEvent):
        """Process a new student interaction."""
        if event.student_id not in self.student_trackers:
            self.student_trackers[event.student_id] = MasteryTracker()

        self.student_trackers[event.student_id].update(event)

    def get_knowledge_map(self, student_id: str, student_name: Optional[str] = None) -> KnowledgeMap:
        """Build a complete knowledge map for a student."""
        tracker = self.student_trackers.get(student_id)
        now = datetime.now()

        if not tracker:
            return KnowledgeMap(
                student_id=student_id,
                student_name=student_name,
                topic_masteries=[],
                prerequisite_flags=[],
                overall_mastery=0.0,
                last_active=None
            )

        topic_masteries = []
        mastery_scores = {}

        for topic_id in tracker.mastery:
            mastery = tracker.get_mastery(topic_id, now)
            mastery_scores[topic_id] = mastery

            history = tracker.history.get(topic_id, [])
            velocity = calculate_velocity(history)

            topic_masteries.append(TopicMastery(
                topic=topic_id,
                mastery_score=round(mastery, 3),
                velocity=velocity,
                last_practiced=tracker.last_practiced.get(topic_id),
                attempt_count=tracker.attempt_counts.get(topic_id, 0),
                error_types=tracker.error_types.get(topic_id, {})
            ))

        # Check prerequisite gaps for all weak topics
        prerequisite_flags = []
        for topic_id, mastery in mastery_scores.items():
            if mastery < 0.5:
                gaps = self.graph.check_prerequisite_gaps(topic_id, mastery_scores)
                for gap in gaps:
                    prerequisite_flags.append(PrerequisiteStatus(
                        topic=gap["topic"],
                        prerequisite_topic=gap["prerequisite_topic"],
                        prerequisite_mastery=gap["prerequisite_mastery"],
                        is_weak=gap["is_weak"]
                    ))

        overall = sum(mastery_scores.values()) / len(mastery_scores) if mastery_scores else 0.0
        last_active = max(tracker.last_practiced.values()) if tracker.last_practiced else None

        return KnowledgeMap(
            student_id=student_id,
            student_name=student_name,
            topic_masteries=topic_masteries,
            prerequisite_flags=prerequisite_flags,
            overall_mastery=round(overall, 3),
            last_active=last_active
        )
