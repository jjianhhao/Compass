/**
 * Mock data for Person D's teacher components.
 * All shapes match exactly what Person A (/api/diagnose) and Person B (/api/students,
 * /api/student/:id/knowledge-map) will return — swap fetch calls in when APIs are live.
 */

// Mirrors GET /api/student/:id/activity (Person B — to be added as endpoint)
export const MOCK_ACTIVITY = {
  sarah_001: [
    { timestamp: new Date(Date.now() - 7200000).toISOString(), topic: 'Integration Basics', question_id: 'integ_003', is_correct: true, time_taken_sec: 52, difficulty: 'medium' },
    { timestamp: new Date(Date.now() - 7300000).toISOString(), topic: 'Integration Basics', question_id: 'integ_002', is_correct: false, time_taken_sec: 95, difficulty: 'hard' },
    { timestamp: new Date(Date.now() - 86400000).toISOString(), topic: 'Limits & Derivatives', question_id: 'lim_005', is_correct: true, time_taken_sec: 38, difficulty: 'easy' },
    { timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), topic: 'Differentiation Applications', question_id: 'diff_001', is_correct: false, time_taken_sec: 120, difficulty: 'hard' },
    { timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), topic: 'Limits & Derivatives', question_id: 'lim_004', is_correct: true, time_taken_sec: 45, difficulty: 'medium' },
  ],
  james_001: [
    { timestamp: new Date(Date.now() - 172800000).toISOString(), topic: 'Trig Identities (AHL)', question_id: 'trig_003', is_correct: false, time_taken_sec: 210, difficulty: 'medium' },
    { timestamp: new Date(Date.now() - 172900000).toISOString(), topic: 'Trig Identities (AHL)', question_id: 'trig_002', is_correct: false, time_taken_sec: 190, difficulty: 'medium' },
    { timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), topic: 'Functions Basics', question_id: 'func_004', is_correct: true, time_taken_sec: 60, difficulty: 'easy' },
    { timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), topic: 'Unit Circle & Identities', question_id: 'unit_001', is_correct: false, time_taken_sec: 150, difficulty: 'medium' },
    { timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), topic: 'Functions Basics', question_id: 'func_003', is_correct: false, time_taken_sec: 80, difficulty: 'medium' },
  ],
  aisha_001: [
    { timestamp: new Date(Date.now() - 86400000 * 22).toISOString(), topic: 'Binomial Theorem', question_id: 'binom_003', is_correct: true, time_taken_sec: 75, difficulty: 'medium' },
    { timestamp: new Date(Date.now() - 86400000 * 23).toISOString(), topic: 'Quadratics', question_id: 'quad_002', is_correct: true, time_taken_sec: 55, difficulty: 'medium' },
    { timestamp: new Date(Date.now() - 86400000 * 24).toISOString(), topic: 'Sequences & Series', question_id: 'seq_001', is_correct: false, time_taken_sec: 90, difficulty: 'hard' },
    { timestamp: new Date(Date.now() - 86400000 * 25).toISOString(), topic: 'Functions Basics', question_id: 'func_002', is_correct: true, time_taken_sec: 40, difficulty: 'easy' },
    { timestamp: new Date(Date.now() - 86400000 * 26).toISOString(), topic: 'Quadratics', question_id: 'quad_001', is_correct: true, time_taken_sec: 50, difficulty: 'medium' },
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
      { topic: 'Quadratics', mastery_score: 0.85, velocity: 'improving', attempt_count: 15 },
      { topic: 'Limits & Derivatives', mastery_score: 0.80, velocity: 'plateauing', attempt_count: 12 },
      { topic: 'Differentiation Applications', mastery_score: 0.75, velocity: 'improving', attempt_count: 18 },
      { topic: 'Integration Basics', mastery_score: 0.60, velocity: 'plateauing', attempt_count: 14 },
      { topic: 'Calculus Applications', mastery_score: 0.57, velocity: 'plateauing', attempt_count: 10 },
    ],
  },
  {
    student_id: 'james_001',
    student_name: 'James Tan',
    overall_mastery: 0.38,
    topics_tracked: 5,
    last_active: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    topic_masteries: [
      { topic: 'Functions Basics', mastery_score: 0.45, velocity: 'plateauing', attempt_count: 20 },
      { topic: 'Unit Circle & Identities', mastery_score: 0.40, velocity: 'regressing', attempt_count: 12 },
      { topic: 'Trig Identities (AHL)', mastery_score: 0.30, velocity: 'regressing', attempt_count: 10 },
      { topic: 'Exponents & Logarithms', mastery_score: 0.50, velocity: 'plateauing', attempt_count: 8 },
      { topic: 'Limits & Derivatives', mastery_score: 0.35, velocity: 'plateauing', attempt_count: 6 },
    ],
  },
  {
    student_id: 'aisha_001',
    student_name: 'Aisha Binte Rahman',
    overall_mastery: 0.47,
    topics_tracked: 4,
    last_active: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
    topic_masteries: [
      { topic: 'Functions Basics', mastery_score: 0.55, velocity: 'regressing', attempt_count: 15 },
      { topic: 'Quadratics', mastery_score: 0.50, velocity: 'regressing', attempt_count: 12 },
      { topic: 'Sequences & Series', mastery_score: 0.42, velocity: 'regressing', attempt_count: 8 },
      { topic: 'Binomial Theorem', mastery_score: 0.40, velocity: 'regressing', attempt_count: 6 },
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
      { topic: 'Quadratics', mastery_score: 0.85, velocity: 'improving', attempt_count: 15, last_practiced: new Date(Date.now() - 86400000).toISOString() },
      { topic: 'Limits & Derivatives', mastery_score: 0.80, velocity: 'plateauing', attempt_count: 12, last_practiced: new Date(Date.now() - 86400000 * 2).toISOString() },
      { topic: 'Differentiation Applications', mastery_score: 0.75, velocity: 'improving', attempt_count: 18, last_practiced: new Date(Date.now() - 86400000 * 3).toISOString() },
      { topic: 'Integration Basics', mastery_score: 0.60, velocity: 'plateauing', attempt_count: 14, last_practiced: new Date(Date.now() - 86400000 * 4).toISOString() },
      { topic: 'Calculus Applications', mastery_score: 0.57, velocity: 'plateauing', attempt_count: 10, last_practiced: new Date(Date.now() - 86400000 * 5).toISOString() },
    ],
    prerequisite_flags: [],
  },
  james_001: {
    student_id: 'james_001',
    student_name: 'James Tan',
    overall_mastery: 0.38,
    last_active: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    topic_masteries: [
      { topic: 'Functions Basics', mastery_score: 0.45, velocity: 'plateauing', attempt_count: 20, last_practiced: new Date(Date.now() - 86400000 * 3).toISOString() },
      { topic: 'Unit Circle & Identities', mastery_score: 0.40, velocity: 'regressing', attempt_count: 12, last_practiced: new Date(Date.now() - 86400000 * 5).toISOString() },
      { topic: 'Trig Identities (AHL)', mastery_score: 0.30, velocity: 'regressing', attempt_count: 10, last_practiced: new Date(Date.now() - 86400000 * 2).toISOString() },
      { topic: 'Exponents & Logarithms', mastery_score: 0.50, velocity: 'plateauing', attempt_count: 8, last_practiced: new Date(Date.now() - 86400000 * 7).toISOString() },
      { topic: 'Limits & Derivatives', mastery_score: 0.35, velocity: 'plateauing', attempt_count: 6, last_practiced: new Date(Date.now() - 86400000).toISOString() },
    ],
    prerequisite_flags: [
      { topic: 'Trig Identities (AHL)', prerequisite_topic: 'Functions Basics', prerequisite_mastery: 0.45, is_weak: true },
      { topic: 'Trig Identities (AHL)', prerequisite_topic: 'Unit Circle & Identities', prerequisite_mastery: 0.40, is_weak: true },
    ],
  },
  aisha_001: {
    student_id: 'aisha_001',
    student_name: 'Aisha Binte Rahman',
    overall_mastery: 0.47,
    last_active: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
    topic_masteries: [
      { topic: 'Functions Basics', mastery_score: 0.55, velocity: 'regressing', attempt_count: 15, last_practiced: new Date(Date.now() - 86400000 * 22).toISOString() },
      { topic: 'Quadratics', mastery_score: 0.50, velocity: 'regressing', attempt_count: 12, last_practiced: new Date(Date.now() - 86400000 * 23).toISOString() },
      { topic: 'Sequences & Series', mastery_score: 0.42, velocity: 'regressing', attempt_count: 8, last_practiced: new Date(Date.now() - 86400000 * 25).toISOString() },
      { topic: 'Binomial Theorem', mastery_score: 0.40, velocity: 'regressing', attempt_count: 6, last_practiced: new Date(Date.now() - 86400000 * 24).toISOString() },
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
        { topic: 'Integration Basics', issue: 'Mastery plateauing despite regular practice', severity: 'medium', evidence: '14 attempts with no improvement over 2 weeks' },
        { topic: 'Calculus Applications', issue: 'Speed and application under timed conditions', severity: 'medium', evidence: 'Correct approach but slow execution on harder questions' },
      ],
      error_classifications: [
        { error_type: 'time_pressure', evidence: 'High accuracy when untimed; struggles on timed assessments', confidence: 'high' },
      ],
      root_cause_analysis: 'Sarah has strong conceptual understanding but struggles with speed on integration and applied calculus. No prerequisite gaps detected — her differentiation (75%) is solid. This is a time-pressure issue, not a conceptual gap.',
      confidence: 'high',
      data_points_used: 69,
      reasoning_trail: 'Sarah\'s mastery across 5 topics averages 74%. Her differentiation foundation is strong. The plateau in integration and calculus applications is consistent with time-pressure errors — she understands the concepts but needs to build speed.',
    },
    plan: {
      student_id: 'sarah_001',
      recommendations: [
        { action: 'Practice 10 timed integration problems under exam conditions (45 seconds per question)', topic: 'Integration Basics', subtopic: 'Definite integrals', difficulty: 'medium', question_count: 10, reasoning: 'Speed drills will build automaticity without introducing new concepts', priority: 'high' },
        { action: 'Complete 8 timed calculus application problems to build speed', topic: 'Calculus Applications', subtopic: 'Motion problems', difficulty: 'medium', question_count: 8, reasoning: 'Timed practice targets the time-pressure error pattern identified', priority: 'medium' },
      ],
      study_plan_summary: 'Sarah needs speed, not new concepts. Focus on timed practice drills for integration and calculus applications to build automaticity.',
      estimated_sessions: 3,
      reasoning_trail: 'Because Sarah\'s error type is time_pressure and her conceptual foundation is strong, the intervention is timed drills — not re-teaching.',
    },
    evaluator_verdict: {
      approved: true,
      concerns: [],
      adjustments_made: [],
      fairness_check: 'No unfair penalisation. Sarah\'s plateau is genuine and evidence-based with 69 data points.',
      confidence_validated: true,
      reasoning_trail: 'Diagnosis is consistent with data. Confidence level "high" is appropriate for 69 data points.',
    },
    final_recommendations: [
      { action: 'Practice 10 timed integration problems under exam conditions (45 seconds per question)', topic: 'Integration Basics', subtopic: 'Definite integrals', difficulty: 'medium', question_count: 10, reasoning: 'Speed drills will build automaticity without introducing new concepts', priority: 'high' },
      { action: 'Complete 8 timed calculus application problems to build speed', topic: 'Calculus Applications', subtopic: 'Motion problems', difficulty: 'medium', question_count: 8, reasoning: 'Timed practice targets the time-pressure error pattern identified', priority: 'medium' },
    ],
    overall_confidence: 'high',
    reasoning_trail: '## Diagnosis\nSarah\'s mastery across 5 topics averages 74%...\n\n## Study Plan\nBecause Sarah\'s error type is time_pressure...\n\n## Quality Check\nDiagnosis is consistent with data.\n\n**Overall Confidence: high** | **Evaluator: ✅ Approved**',
  },
  james_001: {
    student_id: 'james_001',
    diagnosis: {
      student_id: 'james_001',
      findings: [
        { topic: 'Trig Identities (AHL)', issue: 'Regressing — conceptual gap compounded by weak prerequisites', severity: 'critical', evidence: '10 attempts, 30% mastery, downward trend' },
        { topic: 'Unit Circle & Identities', issue: 'Regressing — foundational prerequisite for AHL identities', severity: 'high', evidence: '12 attempts, 40% mastery and declining' },
        { topic: 'Functions Basics', issue: 'Weak prerequisite underpinning many topics', severity: 'high', evidence: '20 attempts, stuck at 45%' },
      ],
      error_classifications: [
        { error_type: 'conceptual_gap', evidence: 'Consistently wrong across attempts, wrong approach rather than arithmetic errors', confidence: 'high' },
      ],
      root_cause_analysis: 'James\'s struggle with Trig Identities (AHL) traces back upstream: both direct prerequisites (Unit Circle & Identities at 40% and Functions Basics at 45%) are weak. Must address foundational topics first.',
      confidence: 'high',
      data_points_used: 56,
      reasoning_trail: 'James shows a clear prerequisite gap chain: Functions Basics → Unit Circle & Identities → Trig Identities (AHL). All three are weak.',
    },
    plan: {
      student_id: 'james_001',
      recommendations: [
        { action: 'Review functions basics: domain/range, composite and inverse functions, 10 easy questions', topic: 'Functions Basics', subtopic: 'Composite functions', difficulty: 'easy', question_count: 10, reasoning: 'Root cause — must fix the foundation before any trig work will stick', priority: 'critical' },
        { action: 'Practice basic trig equations after foundational improvement', topic: 'Unit Circle & Identities', subtopic: 'Solving trig equations', difficulty: 'easy', question_count: 8, reasoning: 'Second-order prerequisite — build this before attempting AHL identities', priority: 'high' },
        { action: 'Return to Trig Identities (AHL) only after mastery of prerequisites reaches 60%+', topic: 'Trig Identities (AHL)', subtopic: 'Compound angle formulae', difficulty: 'easy', question_count: 5, reasoning: 'Attempting AHL identities now will be frustrating and unproductive', priority: 'medium' },
      ],
      study_plan_summary: 'James must go back to fundamentals. Trig Identities (AHL) cannot be fixed without first strengthening Functions Basics and Unit Circle & Identities.',
      estimated_sessions: 6,
      reasoning_trail: 'Prioritising root causes over symptoms. The prerequisite graph shows a clear chain of weakness.',
    },
    evaluator_verdict: {
      approved: true,
      concerns: [],
      adjustments_made: [],
      fairness_check: 'Analysis is fair. Sufficient data (56 points) to support high confidence.',
      confidence_validated: true,
      reasoning_trail: 'Prerequisite gap detection is accurate and well-evidenced.',
    },
    final_recommendations: [
      { action: 'Review functions basics: domain/range, composite and inverse functions, 10 easy questions', topic: 'Functions Basics', subtopic: 'Composite functions', difficulty: 'easy', question_count: 10, reasoning: 'Root cause — must fix the foundation before any trig work will stick', priority: 'critical' },
      { action: 'Practice basic trig equations after foundational improvement', topic: 'Unit Circle & Identities', subtopic: 'Solving trig equations', difficulty: 'easy', question_count: 8, reasoning: 'Second-order prerequisite — build this before attempting AHL identities', priority: 'high' },
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
      root_cause_analysis: 'Aisha was previously performing well (65-75% mastery) but has been inactive for 22 days. Temporal decay has reduced all scores. Confidence is MEDIUM because the decay is estimated.',
      confidence: 'medium',
      data_points_used: 41,
      reasoning_trail: 'Aisha\'s last active session was 22 days ago. Compass applies temporal decay — mastery is reduced rather than assuming knowledge is retained.',
    },
    plan: {
      student_id: 'aisha_001',
      recommendations: [
        { action: 'Start with a short diagnostic quiz across all 4 topics to assess actual retention', topic: 'Functions Basics', subtopic: 'General', difficulty: 'medium', question_count: 12, reasoning: 'Decay is estimated — a diagnostic will reveal true current mastery', priority: 'high' },
        { action: 'Review Sequences & Series and Binomial Theorem based on diagnostic results', topic: 'Sequences & Series', subtopic: 'Geometric series', difficulty: 'easy', question_count: 8, reasoning: 'Lowest estimated mastery — likely needs the most catch-up', priority: 'medium' },
      ],
      study_plan_summary: 'Aisha is returning after a break. Run a diagnostic first to check actual retention before planning further.',
      estimated_sessions: 4,
      reasoning_trail: 'Because confidence is medium (decay is estimated), the first recommendation is a diagnostic.',
    },
    evaluator_verdict: {
      approved: true,
      concerns: ['Confidence is medium due to estimated decay — actual retention unknown'],
      adjustments_made: ['Added diagnostic recommendation as first step'],
      fairness_check: 'Inactivity flagged but not penalised. Aisha\'s prior performance history is acknowledged.',
      confidence_validated: true,
      reasoning_trail: 'Appropriate caution given the estimated nature of temporal decay.',
    },
    final_recommendations: [
      { action: 'Start with a short diagnostic quiz across all 4 topics to assess actual retention', topic: 'Functions Basics', subtopic: 'General', difficulty: 'medium', question_count: 12, reasoning: 'Decay is estimated — a diagnostic will reveal true current mastery', priority: 'high' },
      { action: 'Review Sequences & Series and Binomial Theorem based on diagnostic results', topic: 'Sequences & Series', subtopic: 'Geometric series', difficulty: 'easy', question_count: 8, reasoning: 'Lowest estimated mastery — likely needs the most catch-up', priority: 'medium' },
    ],
    overall_confidence: 'medium',
    reasoning_trail: '## Diagnosis\nAisha\'s last active session was 22 days ago...\n\n## Study Plan\nBecause confidence is medium...\n\n## Quality Check\nAppropriate caution given temporal decay.\n\n**Overall Confidence: medium** | **Evaluator: ✅ Approved**',
  },
};
