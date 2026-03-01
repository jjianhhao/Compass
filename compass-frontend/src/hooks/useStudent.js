import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

// --- Transforms between frontend flat format and Person A's backend schema ---

const formatTopicName = (t) =>
  t
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

/** Convert flat knowledgeMap → Person A's KnowledgeMap Pydantic schema */
function toBackendKnowledgeMap(flatKM, studentId) {
  const entries = Object.entries(flatKM);
  return {
    student_id: studentId || 'student_001',
    topic_masteries: entries.map(([topic, data]) => ({
      topic: formatTopicName(topic),
      mastery_score: data.mastery_score,
      velocity: data.velocity,
      attempt_count: data.attempt_count || 0,
      error_types: data.error_types || {},
    })),
    overall_mastery:
      entries.reduce((sum, [, d]) => sum + d.mastery_score, 0) / entries.length,
  };
}

/** Convert Person A's AgentPipelineOutput → shape RecommendationPanel expects */
function fromBackendAgentOutput(raw) {
  return {
    diagnosis: raw.diagnosis?.root_cause_analysis || '',
    plan: (raw.final_recommendations || []).map((rec, i) => ({
      id: `rec_${String(i + 1).padStart(3, '0')}`,
      topic: rec.topic.toLowerCase().replace(/ /g, '_'),
      action: rec.action,
      reasoning: rec.reasoning,
      priority: rec.priority,
      confidence: raw.overall_confidence || 'medium',
    })),
    study_plan_summary: raw.plan?.study_plan_summary || '',
    evaluator_verdict: {
      approved: raw.evaluator_verdict?.approved ?? true,
      concerns: raw.evaluator_verdict?.concerns || [],
    },
    overall_confidence: raw.overall_confidence || 'medium',
    reasoning_trail: raw.reasoning_trail || '',
  };
}

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

const MOCK_AGENT_OUTPUT = {
  diagnosis: 'Student shows strong performance in logarithms and surds but significant gaps in integration and linear law.',
  plan: [
    {
      id: 'rec_001',
      topic: 'integration',
      action: 'Review definite integrals and practice area under curve problems',
      reasoning: 'Mastery score of 38% with regressing velocity indicates conceptual gaps that will impact exam performance.',
      priority: 'critical',
      confidence: 'high',
    },
    {
      id: 'rec_002',
      topic: 'linear_law',
      action: 'Study how to reduce equations to linear form and interpret Y-X graphs',
      reasoning: 'Lowest mastery (35%) with very few practice attempts. This topic is commonly tested.',
      priority: 'critical',
      confidence: 'high',
    },
    {
      id: 'rec_003',
      topic: 'trigonometric_functions',
      action: 'Revise solving trig equations and the R sin(x+α) form',
      reasoning: 'Regressing velocity suggests recent confusion. Tackle before trigonometric identities.',
      priority: 'high',
      confidence: 'medium',
    },
    {
      id: 'rec_004',
      topic: 'applications_of_differentiation',
      action: 'Practice stationary points and rates of change problems',
      reasoning: 'Connected topic to differentiation (65% mastery) — bridging here is high ROI.',
      priority: 'high',
      confidence: 'high',
    },
  ],
  study_plan_summary: 'Focus on integration and linear law this week. Spend 30 min daily on each weak topic.',
  evaluator_verdict: { approved: true, concerns: [] },
  overall_confidence: 'high',
  reasoning_trail: 'Step 1: Identified mastery scores below 0.5 → integration (0.38), linear_law (0.35), trig_functions (0.45). Step 2: Applied velocity weighting — regressing topics flagged as critical. Step 3: Checked dependency graph — linear_law has no prerequisites, integration requires differentiation (satisfied). Step 4: Ordered by priority × mastery gap. Step 5: Evaluator verified recommendations are achievable and not contradictory.',
};

export function useStudent(studentId) {
  const [knowledgeMap, setKnowledgeMap] = useState(null);
  const [velocity, setVelocity] = useState([]);
  const [agentOutput, setAgentOutput] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStudentData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Step 1: Try Person B's engine, fall back to mock data
    let resolvedKM;
    let resolvedVel;
    try {
      const [km, vel] = await Promise.all([
        api.getKnowledgeMap(studentId),
        api.getVelocity(studentId),
      ]);
      resolvedKM = km || MOCK_KNOWLEDGE_MAP;
      resolvedVel = vel?.topics || vel || MOCK_VELOCITY;
    } catch {
      resolvedKM = MOCK_KNOWLEDGE_MAP;
      resolvedVel = MOCK_VELOCITY;
    }

    setKnowledgeMap(resolvedKM);
    setVelocity(resolvedVel);

    // Step 2: Always try Person A's diagnosis pipeline (even if Person B is down)
    try {
      const backendKM = toBackendKnowledgeMap(resolvedKM, studentId);
      const raw = await api.getDiagnosis(backendKM);
      setAgentOutput(raw ? fromBackendAgentOutput(raw) : MOCK_AGENT_OUTPUT);
    } catch {
      setAgentOutput(MOCK_AGENT_OUTPUT);
    }

    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    if (studentId) loadStudentData();
  }, [studentId, loadStudentData]);

  return { knowledgeMap, velocity, agentOutput, loading, error, refresh: loadStudentData };
}
