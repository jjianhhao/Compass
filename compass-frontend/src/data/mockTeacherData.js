/**
 * Mock data for Person D's teacher components.
 * All shapes match exactly what Person A (/api/diagnose) and Person B (/api/students,
 * /api/student/:id/knowledge-map) will return — swap fetch calls in when APIs are live.
 */

// Mirrors GET /api/student/:id/activity (Person B — to be added as endpoint)
export const MOCK_ACTIVITY = {
  sarah_001: [
    { timestamp: new Date(Date.now() - 7200000).toISOString(), topic: 'Integration', question_id: 'integ_003', is_correct: true, time_taken_sec: 52, difficulty: 'medium' },
    { timestamp: new Date(Date.now() - 7300000).toISOString(), topic: 'Integration', question_id: 'integ_002', is_correct: false, time_taken_sec: 95, difficulty: 'hard' },
    { timestamp: new Date(Date.now() - 86400000).toISOString(), topic: 'Differentiation', question_id: 'diff_005', is_correct: true, time_taken_sec: 38, difficulty: 'easy' },
    { timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), topic: 'Applications of Differentiation', question_id: 'appd_001', is_correct: false, time_taken_sec: 120, difficulty: 'hard' },
    { timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), topic: 'Differentiation', question_id: 'diff_004', is_correct: true, time_taken_sec: 45, difficulty: 'medium' },
  ],
  james_001: [
    { timestamp: new Date(Date.now() - 172800000).toISOString(), topic: 'Trigonometric Identities', question_id: 'trig_003', is_correct: false, time_taken_sec: 210, difficulty: 'medium' },
    { timestamp: new Date(Date.now() - 172900000).toISOString(), topic: 'Trigonometric Identities', question_id: 'trig_002', is_correct: false, time_taken_sec: 190, difficulty: 'medium' },
    { timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), topic: 'Algebraic Manipulation', question_id: 'alg_004', is_correct: true, time_taken_sec: 60, difficulty: 'easy' },
    { timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), topic: 'Trigonometric Functions', question_id: 'trig_001', is_correct: false, time_taken_sec: 150, difficulty: 'medium' },
    { timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), topic: 'Algebraic Manipulation', question_id: 'alg_003', is_correct: false, time_taken_sec: 80, difficulty: 'medium' },
  ],
  aisha_001: [
    { timestamp: new Date(Date.now() - 86400000 * 22).toISOString(), topic: 'Polynomials', question_id: 'poly_003', is_correct: true, time_taken_sec: 75, difficulty: 'medium' },
    { timestamp: new Date(Date.now() - 86400000 * 23).toISOString(), topic: 'Quadratic Equations', question_id: 'quad_002', is_correct: true, time_taken_sec: 55, difficulty: 'medium' },
    { timestamp: new Date(Date.now() - 86400000 * 24).toISOString(), topic: 'Surds', question_id: 'surd_001', is_correct: false, time_taken_sec: 90, difficulty: 'hard' },
    { timestamp: new Date(Date.now() - 86400000 * 25).toISOString(), topic: 'Algebraic Manipulation', question_id: 'alg_002', is_correct: true, time_taken_sec: 40, difficulty: 'easy' },
    { timestamp: new Date(Date.now() - 86400000 * 26).toISOString(), topic: 'Quadratic Equations', question_id: 'quad_001', is_correct: true, time_taken_sec: 50, difficulty: 'medium' },
  ],
};

// Mirrors GET /api/students (Person B, port 8000)
// Enriched with topic_masteries so the teacher dashboard table has full data in mock mode
export const MOCK_STUDENTS = [
  {
    student_id: 'sarah_001',
    student_name: 'Sarah Lim',
    overall_mastery: 0.74,
    topics_tracked: 5,
    last_active: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    topic_masteries: [
      { topic: 'Quadratic Equations', mastery_score: 0.85, velocity: 'improving', attempt_count: 15 },
      { topic: 'Coordinate Geometry', mastery_score: 0.80, velocity: 'plateauing', attempt_count: 12 },
      { topic: 'Differentiation', mastery_score: 0.75, velocity: 'improving', attempt_count: 18 },
      { topic: 'Integration', mastery_score: 0.60, velocity: 'plateauing', attempt_count: 14 },
      { topic: 'Applications of Differentiation', mastery_score: 0.57, velocity: 'plateauing', attempt_count: 10 },
    ],
  },
  {
    student_id: 'james_001',
    student_name: 'James Tan',
    overall_mastery: 0.38,
    topics_tracked: 5,
    last_active: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    topic_masteries: [
      { topic: 'Algebraic Manipulation', mastery_score: 0.45, velocity: 'plateauing', attempt_count: 20 },
      { topic: 'Trigonometric Functions', mastery_score: 0.40, velocity: 'regressing', attempt_count: 12 },
      { topic: 'Trigonometric Identities', mastery_score: 0.30, velocity: 'regressing', attempt_count: 10 },
      { topic: 'Indices and Logarithms', mastery_score: 0.50, velocity: 'plateauing', attempt_count: 8 },
      { topic: 'Differentiation', mastery_score: 0.35, velocity: 'plateauing', attempt_count: 6 },
    ],
  },
  {
    student_id: 'aisha_001',
    student_name: 'Aisha Binte Rahman',
    overall_mastery: 0.47,
    topics_tracked: 4,
    last_active: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
    topic_masteries: [
      { topic: 'Algebraic Manipulation', mastery_score: 0.55, velocity: 'regressing', attempt_count: 15 },
      { topic: 'Quadratic Equations', mastery_score: 0.50, velocity: 'regressing', attempt_count: 12 },
      { topic: 'Surds', mastery_score: 0.42, velocity: 'regressing', attempt_count: 8 },
      { topic: 'Polynomials', mastery_score: 0.40, velocity: 'regressing', attempt_count: 6 },
    ],
  },
];

// Mirrors GET /api/student/:id/knowledge-map (Person B, port 8000)
export const MOCK_KNOWLEDGE_MAPS = {
  sarah_001: {
    student_id: 'sarah_001',
    student_name: 'Sarah Lim',
    overall_mastery: 0.74,
    last_active: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    topic_masteries: [
      { topic: 'Quadratic Equations', mastery_score: 0.85, velocity: 'improving', attempt_count: 15, last_practiced: new Date(Date.now() - 86400000).toISOString() },
      { topic: 'Coordinate Geometry', mastery_score: 0.80, velocity: 'plateauing', attempt_count: 12, last_practiced: new Date(Date.now() - 86400000 * 2).toISOString() },
      { topic: 'Differentiation', mastery_score: 0.75, velocity: 'improving', attempt_count: 18, last_practiced: new Date(Date.now() - 86400000 * 3).toISOString() },
      { topic: 'Integration', mastery_score: 0.60, velocity: 'plateauing', attempt_count: 14, last_practiced: new Date(Date.now() - 86400000 * 4).toISOString() },
      { topic: 'Applications of Differentiation', mastery_score: 0.57, velocity: 'plateauing', attempt_count: 10, last_practiced: new Date(Date.now() - 86400000 * 5).toISOString() },
    ],
    prerequisite_flags: [],
  },
  james_001: {
    student_id: 'james_001',
    student_name: 'James Tan',
    overall_mastery: 0.38,
    last_active: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    topic_masteries: [
      { topic: 'Algebraic Manipulation', mastery_score: 0.45, velocity: 'plateauing', attempt_count: 20, last_practiced: new Date(Date.now() - 86400000 * 3).toISOString() },
      { topic: 'Trigonometric Functions', mastery_score: 0.40, velocity: 'regressing', attempt_count: 12, last_practiced: new Date(Date.now() - 86400000 * 5).toISOString() },
      { topic: 'Trigonometric Identities', mastery_score: 0.30, velocity: 'regressing', attempt_count: 10, last_practiced: new Date(Date.now() - 86400000 * 2).toISOString() },
      { topic: 'Indices and Logarithms', mastery_score: 0.50, velocity: 'plateauing', attempt_count: 8, last_practiced: new Date(Date.now() - 86400000 * 7).toISOString() },
      { topic: 'Differentiation', mastery_score: 0.35, velocity: 'plateauing', attempt_count: 6, last_practiced: new Date(Date.now() - 86400000).toISOString() },
    ],
    prerequisite_flags: [
      { topic: 'Trigonometric Identities', prerequisite_topic: 'Algebraic Manipulation', prerequisite_mastery: 0.45, is_weak: true },
      { topic: 'Trigonometric Identities', prerequisite_topic: 'Trigonometric Functions', prerequisite_mastery: 0.40, is_weak: true },
    ],
  },
  aisha_001: {
    student_id: 'aisha_001',
    student_name: 'Aisha Binte Rahman',
    overall_mastery: 0.47,
    last_active: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
    topic_masteries: [
      { topic: 'Algebraic Manipulation', mastery_score: 0.55, velocity: 'regressing', attempt_count: 15, last_practiced: new Date(Date.now() - 86400000 * 22).toISOString() },
      { topic: 'Quadratic Equations', mastery_score: 0.50, velocity: 'regressing', attempt_count: 12, last_practiced: new Date(Date.now() - 86400000 * 23).toISOString() },
      { topic: 'Surds', mastery_score: 0.42, velocity: 'regressing', attempt_count: 8, last_practiced: new Date(Date.now() - 86400000 * 25).toISOString() },
      { topic: 'Polynomials', mastery_score: 0.40, velocity: 'regressing', attempt_count: 6, last_practiced: new Date(Date.now() - 86400000 * 24).toISOString() },
    ],
    prerequisite_flags: [],
  },
};

// Mirrors POST /api/diagnose response (Person A, port 8001)
export const MOCK_DIAGNOSES = {
  sarah_001: {
    student_id: 'sarah_001',
    diagnosis: {
      student_id: 'sarah_001',
      findings: [
        { topic: 'Integration', issue: 'Mastery plateauing despite regular practice', severity: 'medium', evidence: '14 attempts with no improvement over 2 weeks' },
        { topic: 'Applications of Differentiation', issue: 'Speed and application under timed conditions', severity: 'medium', evidence: 'Correct approach but slow execution on harder questions' },
      ],
      error_classifications: [
        { error_type: 'time_pressure', evidence: 'High accuracy when untimed; struggles on timed assessments', confidence: 'high' },
      ],
      root_cause_analysis: 'Sarah has strong conceptual understanding but struggles with speed on integration and applied differentiation. No prerequisite gaps detected — her differentiation (75%) is solid. This is a time-pressure issue, not a conceptual gap.',
      confidence: 'high',
      data_points_used: 69,
      reasoning_trail: 'Sarah\'s mastery across 5 topics averages 74%. Her differentiation foundation is strong. The plateau in integration and applications of differentiation is consistent with time-pressure errors — she understands the concepts but needs to build speed.',
    },
    plan: {
      student_id: 'sarah_001',
      recommendations: [
        { action: 'Practice 10 timed integration problems under exam conditions (45 seconds per question)', topic: 'Integration', subtopic: 'Definite integrals', difficulty: 'medium', question_count: 10, reasoning: 'Speed drills will build automaticity without introducing new concepts', priority: 'high' },
        { action: 'Complete 8 timed stationary point problems to build application speed', topic: 'Applications of Differentiation', subtopic: 'Stationary points', difficulty: 'medium', question_count: 8, reasoning: 'Timed practice targets the time-pressure error pattern identified', priority: 'medium' },
      ],
      study_plan_summary: 'Sarah needs speed, not new concepts. Focus on timed practice drills for integration and applied differentiation to build automaticity.',
      estimated_sessions: 3,
      reasoning_trail: 'Because Sarah\'s error type is time_pressure and her conceptual foundation is strong, the intervention is timed drills — not re-teaching. This is the key distinction Compass makes.',
    },
    evaluator_verdict: {
      approved: true,
      concerns: [],
      adjustments_made: [],
      fairness_check: 'No unfair penalisation. Sarah\'s plateau is genuine and evidence-based with 69 data points.',
      confidence_validated: true,
      reasoning_trail: 'Diagnosis is consistent with data. Confidence level "high" is appropriate for 69 data points. Recommendations are specific and match the error type.',
    },
    final_recommendations: [
      { action: 'Practice 10 timed integration problems under exam conditions (45 seconds per question)', topic: 'Integration', subtopic: 'Definite integrals', difficulty: 'medium', question_count: 10, reasoning: 'Speed drills will build automaticity without introducing new concepts', priority: 'high' },
      { action: 'Complete 8 timed stationary point problems to build application speed', topic: 'Applications of Differentiation', subtopic: 'Stationary points', difficulty: 'medium', question_count: 8, reasoning: 'Timed practice targets the time-pressure error pattern identified', priority: 'medium' },
    ],
    overall_confidence: 'high',
    reasoning_trail: '## Diagnosis\nSarah\'s mastery across 5 topics averages 74%...\n\n## Study Plan\nBecause Sarah\'s error type is time_pressure...\n\n## Quality Check\nDiagnosis is consistent with data.\n\n**Overall Confidence: high** | **Evaluator: ✅ Approved**',
  },
  james_001: {
    student_id: 'james_001',
    diagnosis: {
      student_id: 'james_001',
      findings: [
        { topic: 'Trigonometric Identities', issue: 'Regressing — conceptual gap compounded by weak prerequisites', severity: 'critical', evidence: '10 attempts, 30% mastery, downward trend' },
        { topic: 'Trigonometric Functions', issue: 'Regressing — foundational prerequisite for identities', severity: 'high', evidence: '12 attempts, 40% mastery and declining' },
        { topic: 'Algebraic Manipulation', issue: 'Weak prerequisite underpinning all trig topics', severity: 'high', evidence: '20 attempts, stuck at 45%' },
      ],
      error_classifications: [
        { error_type: 'conceptual_gap', evidence: 'Consistently wrong across attempts, wrong approach rather than arithmetic errors', confidence: 'high' },
      ],
      root_cause_analysis: 'James\'s struggle with Trigonometric Identities traces back upstream: both direct prerequisites (Trigonometric Functions at 40% and Algebraic Manipulation at 45%) are weak. Fixing the symptoms (identities) without fixing the root causes will not work. Must address algebraic manipulation first.',
      confidence: 'high',
      data_points_used: 56,
      reasoning_trail: 'James shows a clear prerequisite gap chain: Algebraic Manipulation → Trigonometric Functions → Trigonometric Identities. All three are weak. The Evaluator confirmed this analysis is consistent with the data.',
    },
    plan: {
      student_id: 'james_001',
      recommendations: [
        { action: 'Review algebraic manipulation: factorisation and simplification drills, 10 easy questions', topic: 'Algebraic Manipulation', subtopic: 'Factorisation', difficulty: 'easy', question_count: 10, reasoning: 'Root cause — must fix the foundation before any trig work will stick', priority: 'critical' },
        { action: 'Practice basic trig equations after algebraic foundation improves', topic: 'Trigonometric Functions', subtopic: 'Trig equations', difficulty: 'easy', question_count: 8, reasoning: 'Second-order prerequisite — build this before attempting identities', priority: 'high' },
        { action: 'Return to Trigonometric Identities only after mastery of prerequisites reaches 60%+', topic: 'Trigonometric Identities', subtopic: 'Double angle formulae', difficulty: 'easy', question_count: 5, reasoning: 'Attempting identities now will be frustrating and unproductive', priority: 'medium' },
      ],
      study_plan_summary: 'James must go back to fundamentals. Trigonometric Identities cannot be fixed without first strengthening Algebraic Manipulation and Trigonometric Functions.',
      estimated_sessions: 6,
      reasoning_trail: 'Prioritising root causes over symptoms. The prerequisite graph shows a clear chain of weakness.',
    },
    evaluator_verdict: {
      approved: true,
      concerns: [],
      adjustments_made: [],
      fairness_check: 'Analysis is fair. Sufficient data (56 points) to support high confidence. No overreaction to single sessions.',
      confidence_validated: true,
      reasoning_trail: 'Prerequisite gap detection is accurate and well-evidenced. Recommendations correctly address root causes first.',
    },
    final_recommendations: [
      { action: 'Review algebraic manipulation: factorisation and simplification drills, 10 easy questions', topic: 'Algebraic Manipulation', subtopic: 'Factorisation', difficulty: 'easy', question_count: 10, reasoning: 'Root cause — must fix the foundation before any trig work will stick', priority: 'critical' },
      { action: 'Practice basic trig equations after algebraic foundation improves', topic: 'Trigonometric Functions', subtopic: 'Trig equations', difficulty: 'easy', question_count: 8, reasoning: 'Second-order prerequisite — build this before attempting identities', priority: 'high' },
    ],
    overall_confidence: 'high',
    reasoning_trail: '## Diagnosis\nJames shows a clear prerequisite gap chain...\n\n## Study Plan\nPrioritising root causes over symptoms...\n\n## Quality Check\nPrerequisite gap detection is accurate.\n\n**Overall Confidence: high** | **Evaluator: ✅ Approved**',
  },
  aisha_001: {
    student_id: 'aisha_001',
    diagnosis: {
      student_id: 'aisha_001',
      findings: [
        { topic: 'All Topics', issue: 'Mastery decayed across all topics due to 22-day inactivity', severity: 'high', evidence: 'Last activity 22 days ago; temporal decay applied to all topic scores' },
      ],
      error_classifications: [],
      root_cause_analysis: 'Aisha was previously performing well (65-75% mastery) but has been inactive for 22 days. Temporal decay has reduced all scores. Confidence is MEDIUM because the decay is estimated — actual retention may be higher than the model suggests.',
      confidence: 'medium',
      data_points_used: 41,
      reasoning_trail: 'Aisha\'s last active session was 22 days ago. Compass applies temporal decay honestly — mastery is reduced rather than assuming knowledge is retained. However, the model cannot know how much Aisha actually remembers, so confidence is medium.',
    },
    plan: {
      student_id: 'aisha_001',
      recommendations: [
        { action: 'Start with a short diagnostic quiz across all 4 topics to assess actual retention', topic: 'Algebraic Manipulation', subtopic: 'General', difficulty: 'medium', question_count: 12, reasoning: 'Decay is estimated — a diagnostic will reveal true current mastery before committing to a full plan', priority: 'high' },
        { action: 'Review Surds and Polynomials based on diagnostic results', topic: 'Surds', subtopic: 'Rationalisation', difficulty: 'easy', question_count: 8, reasoning: 'Lowest estimated mastery — likely needs the most catch-up', priority: 'medium' },
      ],
      study_plan_summary: 'Aisha is returning after a break. Run a diagnostic first to check actual retention before planning further. Her historical performance suggests she may recover quickly.',
      estimated_sessions: 4,
      reasoning_trail: 'Because confidence is medium (decay is estimated), the first recommendation is always a diagnostic rather than jumping straight to intervention.',
    },
    evaluator_verdict: {
      approved: true,
      concerns: ['Confidence is medium due to estimated decay — actual retention unknown'],
      adjustments_made: ['Added diagnostic recommendation as first step'],
      fairness_check: 'Inactivity flagged but not penalised. Aisha\'s prior performance history is acknowledged.',
      confidence_validated: true,
      reasoning_trail: 'Appropriate caution given the estimated nature of temporal decay. Diagnostic-first approach is correct.',
    },
    final_recommendations: [
      { action: 'Start with a short diagnostic quiz across all 4 topics to assess actual retention', topic: 'Algebraic Manipulation', subtopic: 'General', difficulty: 'medium', question_count: 12, reasoning: 'Decay is estimated — a diagnostic will reveal true current mastery before committing to a full plan', priority: 'high' },
      { action: 'Review Surds and Polynomials based on diagnostic results', topic: 'Surds', subtopic: 'Rationalisation', difficulty: 'easy', question_count: 8, reasoning: 'Lowest estimated mastery — likely needs the most catch-up', priority: 'medium' },
    ],
    overall_confidence: 'medium',
    reasoning_trail: '## Diagnosis\nAisha\'s last active session was 22 days ago...\n\n## Study Plan\nBecause confidence is medium...\n\n## Quality Check\nAppropriate caution given temporal decay.\n\n**Overall Confidence: medium** | **Evaluator: ✅ Approved**',
  },
};
