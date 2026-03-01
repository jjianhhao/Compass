// Local persistence for quiz interactions — used as fallback when Person B's API isn't available.
// Stores per-student quiz history in localStorage and computes a live knowledge map from it.

const KEY = (studentId) => `compass_interactions_${studentId}`;

export function saveInteraction(studentId, interaction) {
  try {
    const existing = loadInteractions(studentId);
    existing.push(interaction);
    // Keep last 500 interactions per student
    const trimmed = existing.slice(-500);
    localStorage.setItem(KEY(studentId), JSON.stringify(trimmed));
  } catch {
    // localStorage unavailable — silently skip
  }
}

export function loadInteractions(studentId) {
  try {
    return JSON.parse(localStorage.getItem(KEY(studentId)) || '[]');
  } catch {
    return [];
  }
}

export function clearInteractions(studentId) {
  localStorage.removeItem(KEY(studentId));
}

// Compute a live knowledge map from stored interactions.
// Returns null if there are no interactions yet (so caller falls back to mock data).
export function computeKnowledgeMap(studentId, baseMockMap) {
  const interactions = loadInteractions(studentId);
  if (interactions.length === 0) return null;

  // Group by topic
  const byTopic = {};
  for (const i of interactions) {
    if (!byTopic[i.topic]) byTopic[i.topic] = [];
    byTopic[i.topic].push(i);
  }

  const result = { ...baseMockMap };

  for (const [topic, items] of Object.entries(byTopic)) {
    const correct = items.filter((i) => i.is_correct).length;
    const total = items.length;
    const recentScore = correct / total;

    // Blend: 60% existing mock mastery + 40% quiz performance
    const existingMastery = baseMockMap[topic]?.mastery_score ?? 0.5;
    const newMastery = Math.min(1, Math.max(0, existingMastery * 0.6 + recentScore * 0.4));

    // Determine velocity from trend: compare last 3 vs previous 3 attempts
    const last3 = items.slice(-3);
    const prev3 = items.slice(-6, -3);
    let velocity = 'plateauing';
    if (prev3.length >= 2) {
      const lastScore = last3.filter((i) => i.is_correct).length / last3.length;
      const prevScore = prev3.filter((i) => i.is_correct).length / prev3.length;
      if (lastScore - prevScore > 0.15) velocity = 'improving';
      else if (prevScore - lastScore > 0.15) velocity = 'regressing';
    } else if (last3.length >= 2) {
      // Not enough history — use absolute score
      if (recentScore > 0.65) velocity = 'improving';
      else if (recentScore < 0.4) velocity = 'regressing';
    }

    result[topic] = {
      mastery_score: Math.round(newMastery * 100) / 100,
      attempt_count: (baseMockMap[topic]?.attempt_count ?? 0) + total,
      velocity,
    };
  }

  return result;
}

// Compute velocity array from a knowledge map (for VelocityChart)
export function computeVelocity(studentId, knowledgeMap, baseMockVelocity) {
  const interactions = loadInteractions(studentId);
  if (interactions.length === 0) return null;

  const byTopic = {};
  for (const i of interactions) {
    if (!byTopic[i.topic]) byTopic[i.topic] = [];
    byTopic[i.topic].push(i);
  }

  return Object.entries(byTopic).map(([topic, items]) => {
    const correct = items.filter((i) => i.is_correct).length / items.length;
    const base = baseMockVelocity.find((v) => v.topic === topic);
    const baseChange = base?.mastery_change ?? 0;
    // Blend the recorded mock change with the actual quiz delta
    const quizDelta = correct - 0.5; // positive = doing better than 50%
    const blendedChange = baseChange * 0.5 + quizDelta * 0.1;

    return {
      topic,
      velocity: knowledgeMap[topic]?.velocity ?? 'plateauing',
      mastery_change: Math.round(blendedChange * 100) / 100,
      data_points: items.length,
    };
  });
}
