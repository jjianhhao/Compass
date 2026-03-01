import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { computeKnowledgeMap, computeVelocity, loadInteractions } from '../api/localStore';

const MOCK_KNOWLEDGE_MAP = {
  algebraic_manipulation: { mastery_score: 0.72, attempt_count: 15, velocity: 'improving' },
  quadratic_equations: { mastery_score: 0.58, attempt_count: 12, velocity: 'plateauing' },
  trigonometric_functions: { mastery_score: 0.45, attempt_count: 8, velocity: 'regressing' },
  trigonometric_identities: { mastery_score: 0.40, attempt_count: 6, velocity: 'regressing' },
  differentiation: { mastery_score: 0.65, attempt_count: 18, velocity: 'improving' },
  integration: { mastery_score: 0.38, attempt_count: 10, velocity: 'regressing' },
  indices_and_logarithms: { mastery_score: 0.80, attempt_count: 20, velocity: 'improving' },
  surds: { mastery_score: 0.75, attempt_count: 9, velocity: 'improving' },
  polynomials: { mastery_score: 0.55, attempt_count: 7, velocity: 'plateauing' },
  binomial_theorem: { mastery_score: 0.50, attempt_count: 5, velocity: 'plateauing' },
  coordinate_geometry: { mastery_score: 0.62, attempt_count: 11, velocity: 'improving' },
  applications_of_differentiation: { mastery_score: 0.43, attempt_count: 9, velocity: 'regressing' },
  kinematics: { mastery_score: 0.60, attempt_count: 8, velocity: 'plateauing' },
  linear_law: { mastery_score: 0.35, attempt_count: 4, velocity: 'regressing' },
};

const MOCK_VELOCITY = [
  { topic: 'algebraic_manipulation', velocity: 'improving', mastery_change: 0.08, data_points: 5 },
  { topic: 'quadratic_equations', velocity: 'plateauing', mastery_change: 0.01, data_points: 4 },
  { topic: 'trigonometric_functions', velocity: 'regressing', mastery_change: -0.05, data_points: 3 },
  { topic: 'differentiation', velocity: 'improving', mastery_change: 0.12, data_points: 6 },
  { topic: 'integration', velocity: 'regressing', mastery_change: -0.08, data_points: 4 },
  { topic: 'indices_and_logarithms', velocity: 'improving', mastery_change: 0.10, data_points: 7 },
  { topic: 'surds', velocity: 'improving', mastery_change: 0.06, data_points: 3 },
  { topic: 'linear_law', velocity: 'regressing', mastery_change: -0.04, data_points: 2 },
];

const TOPIC_ADVICE = {
  algebraic_manipulation: {
    actions: ['Practise factorisation and simplification of algebraic fractions', 'Revisit partial fractions and polynomial division', 'Work through manipulation of surds within algebraic expressions'],
    tips: 'Focus on showing clear working — marks are awarded for method even if the final answer is wrong.',
  },
  quadratic_equations: {
    actions: ['Drill completing the square and the quadratic formula', 'Practise discriminant questions — especially finding unknowns', 'Revisit forming quadratics from given roots'],
    tips: 'The discriminant (b²−4ac) appears frequently — know all three cases (>, =, <) cold.',
  },
  trigonometric_functions: {
    actions: ['Revisit the unit circle and ASTC quadrant rules', 'Practise solving equations in a given domain (0° to 360°)', 'Work on expressing in R sin(x+α) form'],
    tips: 'Always check how many solutions are expected — many students miss the second solution in a quadrant.',
  },
  trigonometric_identities: {
    actions: ['Memorise and apply the double angle formulae (sin 2A, cos 2A, tan 2A)', 'Practise proving identities — work from the more complex side', 'Revisit factor formulae for sum-to-product conversions'],
    tips: 'When proving identities, never move terms across the equals sign — manipulate each side independently.',
  },
  differentiation: {
    actions: ['Revisit the chain, product, and quotient rules with mixed examples', 'Practise differentiating ln x, eˣ, sin x, and cos x', 'Work on implicit differentiation questions'],
    tips: 'Show the substitution step clearly — examiners look for evidence you applied the correct rule.',
  },
  integration: {
    actions: ['Practise standard integrals: ∫eˣ, ∫sin x, ∫cos x, ∫1/x', 'Work through definite integrals and area between curves', 'Revisit integration by substitution with practice problems'],
    tips: 'Always include the constant of integration (+C) for indefinite integrals — it costs a mark if missing.',
  },
  indices_and_logarithms: {
    actions: ['Practise converting between index and log form', 'Work through equations combining both indices and logarithms', 'Revise change of base formula for problems with different bases'],
    tips: 'A common mistake is applying log laws incorrectly — log(a+b) ≠ log a + log b.',
  },
  surds: {
    actions: ['Practise rationalising the denominator with conjugate pairs', 'Work through simplification of nested surds', 'Solve equations involving surds — check for extraneous solutions'],
    tips: 'Always check your answer by substituting back — squaring both sides can introduce extraneous solutions.',
  },
  polynomials: {
    actions: ['Practise the Remainder and Factor Theorems with unknowns', 'Work through long division and synthetic division', 'Revise finding all roots once one factor is known'],
    tips: 'If (x−a) is a factor, f(a)=0. Use this to set up equations when the polynomial has unknown coefficients.',
  },
  binomial_theorem: {
    actions: ['Practise finding specific terms using the general term formula', 'Work on finding the term independent of x', 'Revise problems that combine binomial expansion with other identities'],
    tips: 'Write out the general term T(r+1) = C(n,r) × aⁿ⁻ʳ × bʳ first before substituting — it reduces errors.',
  },
  coordinate_geometry: {
    actions: ['Practise equation of circles — completing the square to find centre and radius', 'Work on tangent and normal to a curve at a point', 'Revise midpoint, gradient, and distance formula applications'],
    tips: 'For circle problems, always check whether the point is inside, on, or outside before finding tangents.',
  },
  applications_of_differentiation: {
    actions: ['Practise finding and classifying stationary points (max/min/inflection)', 'Work through connected rates of change problems', 'Revise optimisation problems — area, volume, and profit'],
    tips: "Use the second derivative test to classify stationary points. If f''(x) = 0, fall back to the first derivative sign change.",
  },
  kinematics: {
    actions: ['Practise deriving velocity and acceleration from a displacement function', 'Work on finding when a particle is at rest (v=0) or changes direction', 'Revise total distance vs displacement problems'],
    tips: 'Total distance ≠ displacement. Integrate |v| if the particle changes direction — sketch v vs t first.',
  },
  linear_law: {
    actions: ['Practise reducing non-linear equations to Y = mX + c form', 'Work on reading gradient and intercept from Y–X graphs', 'Revise finding unknowns a and b from a linearised graph'],
    tips: 'The hardest part is identifying what Y and X are — once you write the linear form, gradient and intercept read off directly.',
  },
};

// Transform Person B's KnowledgeMap API response into the dict format used by UI components.
// API returns: { student_id, topic_masteries: [{topic, mastery_score, velocity, attempt_count, ...}] }
// UI expects:  { topic_id: { mastery_score, velocity, attempt_count }, ... }
function transformKnowledgeMap(apiResponse) {
  if (!apiResponse || !apiResponse.topic_masteries) return null;
  const dict = {};
  apiResponse.topic_masteries.forEach((t) => {
    dict[t.topic] = {
      mastery_score: t.mastery_score,
      velocity: t.velocity,
      attempt_count: t.attempt_count,
    };
  });
  return dict;
}

// Transform Person B's velocity API response into the array format used by VelocityChart.
// API returns: { topic_id: { velocity, mastery_change, data_points, latest_mastery } }
// UI expects:  [{ topic, velocity, mastery_change, data_points }]
function transformVelocity(apiResponse) {
  if (!apiResponse) return [];
  if (Array.isArray(apiResponse)) return apiResponse;
  return Object.entries(apiResponse).map(([topic, data]) => ({ topic, ...data }));
}

// Transform Person A's AgentPipelineOutput into the format RecommendationPanel expects.
function transformAgentOutput(apiResponse) {
  if (!apiResponse) return null;
  const planObj = apiResponse.plan || {};
  if (Array.isArray(planObj)) {
    // Plan is already a flat array — ensure every item has an id
    return { ...apiResponse, plan: planObj.map((rec, i) => ({ id: rec.id ?? `rec_${i}`, ...rec })) };
  }
  const overallConfidence = apiResponse.overall_confidence || 'medium';
  const recommendations = (planObj.recommendations || []).map((rec, idx) => ({
    id: `rec_${idx}`,
    confidence: overallConfidence,
    ...rec,
  }));
  return {
    ...apiResponse,
    plan: recommendations,
    study_plan_summary: planObj.study_plan_summary || '',
  };
}

// Build dynamic agent recommendations based on actual knowledge map + real quiz mistakes
function buildAgentOutput(knowledgeMap, studentId) {
  if (!knowledgeMap || Object.keys(knowledgeMap).length === 0) return null;
  const entries = Object.entries(knowledgeMap)
    .map(([topic, data]) => ({ topic, ...data }))
    .sort((a, b) => a.mastery_score - b.mastery_score);

  const interactions = studentId ? loadInteractions(studentId) : [];

  const wrongByTopic = {};
  for (const i of interactions) {
    if (!i.is_correct) {
      if (!wrongByTopic[i.topic]) wrongByTopic[i.topic] = {};
      const sub = i.subtopic || 'general';
      wrongByTopic[i.topic][sub] = (wrongByTopic[i.topic][sub] || 0) + 1;
    }
  }

  const attemptedByTopic = {};
  for (const i of interactions) {
    if (!attemptedByTopic[i.topic]) attemptedByTopic[i.topic] = new Set();
    if (i.subtopic) attemptedByTopic[i.topic].add(i.subtopic);
  }

  const weakTopics = entries.filter((e) => e.mastery_score < 0.6);
  const plan = weakTopics.slice(0, 4).map((e, i) => {
    const advice = TOPIC_ADVICE[e.topic];
    const wrongSubs = wrongByTopic[e.topic] || {};
    const attemptedSubs = attemptedByTopic[e.topic] || new Set();
    const worstSubtopic = Object.entries(wrongSubs).sort((a, b) => b[1] - a[1])[0]?.[0];

    let action;
    if (worstSubtopic && worstSubtopic !== 'general') {
      action = `You got ${wrongSubs[worstSubtopic]} question${wrongSubs[worstSubtopic] > 1 ? 's' : ''} wrong on "${worstSubtopic}" — focus your revision here`;
    } else if (attemptedSubs.size > 0) {
      action = `You've attempted ${[...attemptedSubs].join(', ')} — review your mistakes and redo similar questions`;
    } else {
      const actionIndex = i % (advice?.actions?.length || 1);
      action = advice?.actions?.[actionIndex] ?? `Strengthen ${fmt(e.topic)} with focused practice`;
    }

    const totalAttempts = interactions.filter((x) => x.topic === e.topic).length;
    const totalWrong = interactions.filter((x) => x.topic === e.topic && !x.is_correct).length;
    const totalCorrect = totalAttempts - totalWrong;

    const quizLine = totalAttempts > 0
      ? `You attempted ${totalAttempts} question${totalAttempts > 1 ? 's' : ''} and got ${totalCorrect} correct (${Math.round(totalCorrect / totalAttempts * 100)}%).`
      : 'No quiz attempts recorded for this topic yet.';

    const velocityComment =
      e.velocity === 'regressing'
        ? 'Your performance has been declining — address this before it gets harder to recover.'
        : e.velocity === 'plateauing'
        ? 'Progress has stalled. Try different problem types to break through.'
        : "You're improving — keep up the regular practice.";

    const tip = advice?.tips ? `Tip: ${advice.tips}` : '';

    return {
      id: `rec_${String(i + 1).padStart(3, '0')}`,
      topic: e.topic,
      action,
      reasoning: `Mastery at ${Math.round(e.mastery_score * 100)}% (${e.velocity}). ${quizLine} ${velocityComment}${tip ? ' ' + tip : ''}`,
      priority: e.mastery_score < 0.4 ? 'critical' : e.mastery_score < 0.5 ? 'high' : 'medium',
      confidence: totalAttempts > 0 ? 'high' : 'medium',
    };
  });

  const overallMastery = Math.round(
    entries.reduce((s, e) => s + e.mastery_score, 0) / entries.length * 100
  );

  return {
    diagnosis: `Overall mastery is ${overallMastery}%. ${
      weakTopics.length > 0
        ? `Key gaps in: ${weakTopics.slice(0, 3).map((e) => fmt(e.topic)).join(', ')}.`
        : 'Strong performance across all topics!'
    }`,
    plan,
    study_plan_summary: plan.length > 0
      ? `Focus on ${plan.slice(0, 2).map((p) => fmt(p.topic)).join(' and ')} this session. Aim for 30 min per topic.`
      : 'Excellent work! Maintain your mastery with regular revision.',
    evaluator_verdict: { approved: true, concerns: [] },
    overall_confidence: overallMastery > 65 ? 'high' : 'medium',
    reasoning_trail: entries
      .map((e) => `${fmt(e.topic)}: ${Math.round(e.mastery_score * 100)}% [${e.velocity}]`)
      .join(' | '),
  };
}

function fmt(t) {
  return t.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function useStudent(studentId) {
  const [knowledgeMap, setKnowledgeMap] = useState(null);
  const [velocity, setVelocity] = useState([]);
  const [agentOutput, setAgentOutput] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStudentData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [rawKm, rawVel] = await Promise.all([
        api.getKnowledgeMap(studentId),
        api.getVelocity(studentId),
      ]);

      // Transform API response → UI format, then overlay local quiz history
      const apiKM = transformKnowledgeMap(rawKm);
      const baseKM = apiKM || MOCK_KNOWLEDGE_MAP;
      const localKM = computeKnowledgeMap(studentId, baseKM);
      const resolvedKM = localKM || baseKM;
      setKnowledgeMap(resolvedKM);

      const apiVel = transformVelocity(rawVel);
      const localVel = computeVelocity(studentId, resolvedKM, MOCK_VELOCITY);
      setVelocity(localVel || (apiVel.length > 0 ? apiVel : MOCK_VELOCITY));

      try {
        const diagnosis = await api.getDiagnosis(rawKm || resolvedKM);
        setAgentOutput(transformAgentOutput(diagnosis) || buildAgentOutput(resolvedKM, studentId));
      } catch {
        setAgentOutput(buildAgentOutput(resolvedKM, studentId));
      }
    } catch (err) {
      setError(err?.message || 'Failed to load student data');
      // Fall back to local quiz history on top of mock data
      const localKM = computeKnowledgeMap(studentId, MOCK_KNOWLEDGE_MAP);
      const resolvedKM = localKM || MOCK_KNOWLEDGE_MAP;
      const localVel = computeVelocity(studentId, resolvedKM, MOCK_VELOCITY);
      setKnowledgeMap(resolvedKM);
      setVelocity(localVel || MOCK_VELOCITY);
      setAgentOutput(buildAgentOutput(resolvedKM, studentId));
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) loadStudentData();
  }, [studentId, loadStudentData]);

  return { knowledgeMap, velocity, agentOutput, loading, error, refresh: loadStudentData };
}
