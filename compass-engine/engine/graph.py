import json
import networkx as nx
from typing import List, Dict, Optional


class TopicGraph:
    def __init__(self, topics_path: str = "data/topics.json"):
        with open(topics_path) as f:
            data = json.load(f)

        self.graph = nx.DiGraph()
        self.topic_data = {}

        for topic in data["topics"]:
            self.graph.add_node(topic["id"], **topic)
            self.topic_data[topic["id"]] = topic
            for prereq in topic.get("prerequisites", []):
                self.graph.add_edge(prereq, topic["id"])  # prereq → topic

    def get_prerequisites(self, topic_id: str) -> List[str]:
        """Get direct prerequisites of a topic."""
        return list(self.graph.predecessors(topic_id))

    def get_all_prerequisites(self, topic_id: str) -> List[str]:
        """Get ALL upstream prerequisites (transitive)."""
        return list(nx.ancestors(self.graph, topic_id))

    def get_dependents(self, topic_id: str) -> List[str]:
        """Get topics that depend on this one."""
        return list(self.graph.successors(topic_id))

    def check_prerequisite_gaps(self, topic_id: str, mastery_scores: Dict[str, float], threshold: float = 0.5) -> List[Dict]:
        """Check if a weak topic has weak prerequisites (root cause detection)."""
        gaps = []
        for prereq in self.get_prerequisites(topic_id):
            prereq_mastery = mastery_scores.get(prereq, 0.0)
            if prereq_mastery < threshold:
                gaps.append({
                    "topic": topic_id,
                    "prerequisite_topic": prereq,
                    "prerequisite_mastery": prereq_mastery,
                    "is_weak": True,
                    "topic_name": self.topic_data[topic_id]["name"],
                    "prerequisite_name": self.topic_data[prereq]["name"]
                })
        return gaps

    def get_study_order(self, weak_topics: List[str]) -> List[str]:
        """Given a list of weak topics, return the optimal study order (prerequisites first)."""
        subgraph = self.graph.subgraph(
            set(weak_topics) | {p for t in weak_topics for p in self.get_all_prerequisites(t)}
        )
        return list(nx.topological_sort(subgraph))

    def get_topic_info(self, topic_id: str) -> Optional[Dict]:
        """Get full topic metadata."""
        return self.topic_data.get(topic_id)

    def get_graph_json(self) -> Dict:
        """Export graph as JSON for frontend visualization."""
        nodes = []
        edges = []
        for node_id, data in self.graph.nodes(data=True):
            nodes.append({
                "id": node_id,
                "name": data.get("name", node_id),
                "subtopics": data.get("subtopics", []),
            })
        for source, target in self.graph.edges():
            edges.append({"from": source, "to": target})
        return {"nodes": nodes, "edges": edges}


if __name__ == "__main__":
    g = TopicGraph()
    print("All topics:", [n for n in g.graph.nodes()])
    print("\nPrerequisites for integration:", g.get_prerequisites("integration"))
    print("ALL upstream for integration:", g.get_all_prerequisites("integration"))

    scores = {"differentiation": 0.4, "algebraic_manipulation": 0.3, "integration": 0.25}
    gaps = g.check_prerequisite_gaps("integration", scores)
    print("\nPrerequisite gaps for integration:", gaps)

    print("\nStudy order:", g.get_study_order(["integration", "differentiation"]))
