import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { computeKnowledgeMap, computeVelocity, loadInteractions } from '../api/localStore';

const MOCK_KNOWLEDGE_MAP = {
  sequences_series: { mastery_score: 0.80, attempt_count: 20, velocity: 'improving' },
  exponents_logarithms: { mastery_score: 0.75, attempt_count: 15, velocity: 'improving' },
  binomial_theorem: { mastery_score: 0.50, attempt_count: 5, velocity: 'plateauing' },
  proofs: { mastery_score: 0.45, attempt_count: 6, velocity: 'plateauing' },
  complex_numbers: { mastery_score: 0.38, attempt_count: 4, velocity: 'regressing' },
  systems_of_equations: { mastery_score: 0.62, attempt_count: 8, velocity: 'improving' },
  functions_basics: { mastery_score: 0.72, attempt_count: 15, velocity: 'improving' },
  quadratics: { mastery_score: 0.68, attempt_count: 12, velocity: 'plateauing' },
  rational_exponential_log_functions: { mastery_score: 0.55, attempt_count: 7, velocity: 'plateauing' },
  transformations: { mastery_score: 0.60, attempt_count: 9, velocity: 'improving' },
  functions_ahl: { mastery_score: 0.35, attempt_count: 4, velocity: 'regressing' },
  measurement_and_trig: { mastery_score: 0.70, attempt_count: 14, velocity: 'improving' },
  unit_circle_identities: { mastery_score: 0.45, attempt_count: 8, velocity: 'regressing' },
  circular_functions: { mastery_score: 0.52, attempt_count: 6, velocity: 'plateauing' },
  vectors: { mastery_score: 0.58, attempt_count: 10, velocity: 'improving' },
  trig_identities_ahl: { mastery_score: 0.40, attempt_count: 6, velocity: 'regressing' },
  vector_applications: { mastery_score: 0.33, attempt_count: 3, velocity: 'regressing' },
  descriptive_stats: { mastery_score: 0.78, attempt_count: 12, velocity: 'improving' },
  probability: { mastery_score: 0.65, attempt_count: 10, velocity: 'plateauing' },
  distributions: { mastery_score: 0.48, attempt_count: 7, velocity: 'plateauing' },
  stats_ahl: { mastery_score: 0.30, attempt_count: 3, velocity: 'regressing' },
  limits_and_derivatives: { mastery_score: 0.65, attempt_count: 18, velocity: 'improving' },
  differentiation_applications: { mastery_score: 0.43, attempt_count: 9, velocity: 'regressing' },
  integration_basics: { mastery_score: 0.38, attempt_count: 10, velocity: 'regressing' },
  calculus_applications: { mastery_score: 0.35, attempt_count: 4, velocity: 'regressing' },
  calculus_ahl_differentiation: { mastery_score: 0.28, attempt_count: 3, velocity: 'regressing' },
  calculus_ahl_integration: { mastery_score: 0.25, attempt_count: 2, velocity: 'regressing' },
  differential_equations: { mastery_score: 0.20, attempt_count: 2, velocity: 'regressing' },
};

const MOCK_VELOCITY = [
  { topic: 'sequences_series', velocity: 'improving', mastery_change: 0.08, data_points: 5 },
  { topic: 'exponents_logarithms', velocity: 'improving', mastery_change: 0.10, data_points: 7 },
  { topic: 'functions_basics', velocity: 'improving', mastery_change: 0.06, data_points: 5 },
  { topic: 'quadratics', velocity: 'plateauing', mastery_change: 0.01, data_points: 4 },
  { topic: 'unit_circle_identities', velocity: 'regressing', mastery_change: -0.05, data_points: 3 },
  { topic: 'limits_and_derivatives', velocity: 'improving', mastery_change: 0.12, data_points: 6 },
  { topic: 'integration_basics', velocity: 'regressing', mastery_change: -0.08, data_points: 4 },
  { topic: 'differential_equations', velocity: 'regressing', mastery_change: -0.04, data_points: 2 },
];

const TOPIC_ADVICE = {
  sequences_series: {
    actions: ['Practise identifying arithmetic vs geometric sequences', 'Work through sigma notation and sum formulas', 'Revise convergence conditions for infinite geometric series'],
    tips: 'For infinite geometric series, always check |r| < 1 before applying the sum formula S∞ = a/(1−r).',
  },
  exponents_logarithms: {
    actions: ['Practise converting between exponential and log form', 'Work through equations combining both exponents and logarithms', 'Revise the change of base formula'],
    tips: 'Remember: log(a+b) ≠ log a + log b. Log laws only apply to products, quotients, and powers.',
  },
  binomial_theorem: {
    actions: ['Practise finding specific terms using the general term formula', 'Work on finding the term independent of x', 'Revise extension to fractional/negative indices (AHL)'],
    tips: 'Write out T(r+1) = C(n,r) × aⁿ⁻ʳ × bʳ first — it reduces sign and index errors.',
  },
  proofs: {
    actions: ['Practise mathematical induction with a structured template', 'Work through proof by contradiction examples', 'Revise when to use counterexample vs direct proof'],
    tips: 'In induction: always state the base case, inductive hypothesis, and clearly show where you use the hypothesis in the inductive step.',
  },
  complex_numbers: {
    actions: ['Practise converting between Cartesian and polar form', 'Work through De Moivre\'s theorem applications', 'Revise finding nth roots on the Argand diagram'],
    tips: 'When finding nth roots, remember there are exactly n roots equally spaced on a circle in the Argand diagram.',
  },
  systems_of_equations: {
    actions: ['Practise row reduction with 3×3 systems', 'Work on identifying unique, infinite, and no-solution cases', 'Revise geometric interpretation of systems'],
    tips: 'Always verify your solution by substituting back into all original equations.',
  },
  functions_basics: {
    actions: ['Practise finding domain and range from different representations', 'Work through composite function problems f(g(x))', 'Revise conditions for inverse functions to exist'],
    tips: 'For inverses, remember to swap x and y, then solve. Check domain restrictions carefully.',
  },
  quadratics: {
    actions: ['Drill completing the square and the quadratic formula', 'Practise discriminant analysis — especially finding unknowns', 'Revisit forming quadratics from given roots'],
    tips: 'The discriminant (b²−4ac) appears frequently — know all three cases (> 0, = 0, < 0) and what each means.',
  },
  rational_exponential_log_functions: {
    actions: ['Practise identifying asymptotes of rational functions', 'Work through exponential growth and decay models', 'Revise solving equations graphically with technology'],
    tips: 'Sketch key features (intercepts, asymptotes) by hand first, then verify with your GDC.',
  },
  transformations: {
    actions: ['Practise applying single transformations to known functions', 'Work on describing composite transformations', 'Revise the effect of parameters a, b, c, d in f(x) = a·f(b(x−c))+d'],
    tips: 'Horizontal transformations are "opposite" — f(x−3) shifts right 3, not left.',
  },
  functions_ahl: {
    actions: ['Practise the factor and remainder theorems with unknowns', 'Work through partial fraction decomposition', 'Revise odd/even function classification'],
    tips: 'For partial fractions, set up the correct form first (check for repeated or irreducible quadratic factors).',
  },
  measurement_and_trig: {
    actions: ['Practise sine and cosine rule problems in 3D contexts', 'Work through radian measure conversions', 'Revise arc length and sector area formulas'],
    tips: 'Always check your calculator is in the correct mode (degrees vs radians) before starting.',
  },
  unit_circle_identities: {
    actions: ['Revise exact trig values from the unit circle', 'Practise applying the Pythagorean identity and its variants', 'Work through double angle formula problems'],
    tips: 'Always find ALL solutions in the given domain — draw the unit circle to check for additional solutions.',
  },
  circular_functions: {
    actions: ['Practise sketching transformed trig graphs', 'Work on determining amplitude, period, and phase shift from equations', 'Revise modelling periodic phenomena with trig functions'],
    tips: 'For modelling: identify the period from the context first, then determine the value of b in y = a sin(b(x−c))+d.',
  },
  vectors: {
    actions: ['Practise scalar (dot) product calculations in 2D and 3D', 'Work through vector equation of a line problems', 'Revise finding angles between vectors'],
    tips: 'The scalar product a·b = |a||b|cos θ gives you the angle. If a·b = 0, the vectors are perpendicular.',
  },
  trig_identities_ahl: {
    actions: ['Practise compound angle formulae sin(A±B), cos(A±B)', 'Work through identity proofs step by step', 'Revise inverse trig function domains and ranges'],
    tips: 'Derive double angle from compound angle — it builds understanding and serves as a check.',
  },
  vector_applications: {
    actions: ['Practise cross product calculations using the determinant method', 'Work through finding equations of planes', 'Revise intersection of a line and a plane'],
    tips: 'For the cross product, use the "i j k" determinant method and be careful with the sign pattern (+, −, +).',
  },
  descriptive_stats: {
    actions: ['Practise calculating mean, median, and standard deviation', 'Work on interpreting correlation coefficients', 'Revise regression line predictions and limitations'],
    tips: 'Never extrapolate beyond the range of your data — state this limitation explicitly in exam answers.',
  },
  probability: {
    actions: ['Practise conditional probability with tree diagrams', 'Work through Venn diagram problems with combined events', 'Revise the distinction between independent and mutually exclusive'],
    tips: 'Independent ≠ mutually exclusive. If P(A∩B) = P(A)×P(B), events are independent.',
  },
  distributions: {
    actions: ['Practise identifying when to use binomial vs normal distribution', 'Work through standardisation and inverse normal calculations', 'Revise stating parameters before calculating'],
    tips: 'Always write X ~ B(n,p) or X ~ N(μ,σ²) before calculating — it shows the examiner your reasoning.',
  },
  stats_ahl: {
    actions: ['Practise Bayes\' theorem with tree diagrams', 'Work through hypothesis testing procedures step by step', 'Revise chi-squared tests (goodness of fit and independence)'],
    tips: 'In hypothesis testing, always state H₀ and H₁, calculate the test statistic, compare with the critical value, and state your conclusion in context.',
  },
  limits_and_derivatives: {
    actions: ['Revisit the chain, product, and quotient rules with mixed examples', 'Practise differentiating standard functions', 'Work on tangent and normal line problems'],
    tips: 'Show the substitution step clearly — IB examiners look for evidence you applied the correct rule.',
  },
  differentiation_applications: {
    actions: ['Practise finding and classifying stationary points', 'Work through optimisation word problems', 'Revise related rates of change'],
    tips: "Use the second derivative test for classification. If f''(x) = 0, use the first derivative sign change test.",
  },
  integration_basics: {
    actions: ['Practise standard integrals and anti-differentiation', 'Work through area under and between curves', 'Revise kinematics applications of integration'],
    tips: 'Always include +C for indefinite integrals. For areas, sketch first and check which curve is on top.',
  },
  calculus_applications: {
    actions: ['Practise setting up calculus models from word problems', 'Work through motion problems (displacement, velocity, acceleration)', 'Revise growth and decay applications'],
    tips: 'Identify the physical context first — is the quantity changing (differentiate) or accumulating (integrate)?',
  },
  calculus_ahl_differentiation: {
    actions: ['Practise implicit differentiation step by step', 'Work through L\'Hôpital\'s rule for indeterminate forms', 'Revise derivatives of trig, exponential, and log functions'],
    tips: 'For L\'Hôpital\'s rule: verify you have 0/0 or ∞/∞ before applying. It does not work for other forms.',
  },
  calculus_ahl_integration: {
    actions: ['Practise integration by substitution with various forms', 'Work through integration by parts (use LIATE for choosing u)', 'Revise volumes of revolution about x and y axes'],
    tips: 'For substitution: always change the limits if doing a definite integral, or convert back at the end.',
  },
  differential_equations: {
    actions: ['Practise separating variables and integrating both sides', 'Work through Euler\'s method calculations step by step', 'Revise interpreting slope fields graphically'],
    tips: 'After separating variables, don\'t forget the constant of integration — find it using the initial condition.',
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
