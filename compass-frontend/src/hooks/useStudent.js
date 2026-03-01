import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

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
    try {
      const [km, vel] = await Promise.all([
        api.getKnowledgeMap(studentId),
        api.getVelocity(studentId),
      ]);

      const resolvedKM = km || MOCK_KNOWLEDGE_MAP;
      setKnowledgeMap(resolvedKM);
      setVelocity(vel?.topics || vel || MOCK_VELOCITY);

      try {
        const diagnosis = await api.getDiagnosis(resolvedKM);
        setAgentOutput(diagnosis || MOCK_AGENT_OUTPUT);
      } catch {
        setAgentOutput(MOCK_AGENT_OUTPUT);
      }
    } catch {
      setKnowledgeMap(MOCK_KNOWLEDGE_MAP);
      setVelocity(MOCK_VELOCITY);
      setAgentOutput(MOCK_AGENT_OUTPUT);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) loadStudentData();
  }, [studentId, loadStudentData]);

  return { knowledgeMap, velocity, agentOutput, loading, error, refresh: loadStudentData };
}
