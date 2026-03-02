import { MOCK_STUDENTS, MOCK_KNOWLEDGE_MAPS, MOCK_DIAGNOSES, MOCK_ACTIVITY } from '../data/mockTeacherData';
import CSV_QUESTIONS from '../data/csvQuestions.json';

const USE_MOCK = false; // flip to true for offline/mock mode
const ENGINE_URL = 'http://localhost:8000';
const AGENT_URL  = 'http://localhost:8001';

// IB Math AA HL topic graph for mock mode (matches compass-engine/data/topics.json)
const MOCK_TOPIC_GRAPH = {
  nodes: [
    { id: 'sequences_series', name: 'Sequences & Series', category: 'Topic 1: Number and Algebra', subtopics: ['Arithmetic sequences', 'Geometric sequences', 'Sigma notation', 'Convergent series', 'Maclaurin series'] },
    { id: 'exponents_logarithms', name: 'Exponents & Logarithms', category: 'Topic 1: Number and Algebra', subtopics: ['Laws of exponents', 'Laws of logarithms', 'Change of base', 'Exponential equations', 'Logarithmic equations'] },
    { id: 'binomial_theorem', name: 'Binomial Theorem', category: 'Topic 1: Number and Algebra', subtopics: ['Expansion of (a+b)^n', 'General term', 'Binomial coefficients', 'Extension to fractional/negative indices'] },
    { id: 'proofs', name: 'Proofs', category: 'Topic 1: Number and Algebra', subtopics: ['Mathematical induction', 'Proof by contradiction', 'Proof by counterexample', 'Direct proof'] },
    { id: 'complex_numbers', name: 'Complex Numbers', category: 'Topic 1: Number and Algebra', subtopics: ['Cartesian form', 'Modulus-argument form', 'Argand diagram', 'De Moivre\'s theorem', 'Roots of polynomials'] },
    { id: 'systems_of_equations', name: 'Systems of Equations', category: 'Topic 1: Number and Algebra', subtopics: ['Systems of linear equations', 'Row reduction', 'Unique/infinite/no solutions'] },
    { id: 'functions_basics', name: 'Functions Basics', category: 'Topic 2: Functions', subtopics: ['Domain and range', 'Composite functions', 'Inverse functions', 'Function notation', 'Graphing with technology'] },
    { id: 'quadratics', name: 'Quadratics', category: 'Topic 2: Functions', subtopics: ['Completing the square', 'Quadratic formula', 'Discriminant', 'Solving quadratic inequalities', 'Axis of symmetry'] },
    { id: 'rational_exponential_log_functions', name: 'Rational, Exp. & Log Functions', category: 'Topic 2: Functions', subtopics: ['Exponential growth/decay', 'Logarithmic functions', 'Rational functions', 'Asymptotes'] },
    { id: 'transformations', name: 'Transformations', category: 'Topic 2: Functions', subtopics: ['Translations', 'Reflections', 'Stretches', 'Composite transformations'] },
    { id: 'functions_ahl', name: 'Functions (AHL)', category: 'Topic 2: Functions', subtopics: ['Odd and even functions', 'Self-inverse functions', 'Factor and remainder theorems', 'Partial fractions', 'Polynomial inequalities'] },
    { id: 'measurement_and_trig', name: 'Measurement & Trigonometry', category: 'Topic 3: Geometry and Trigonometry', subtopics: ['3D geometry', 'Sine rule', 'Cosine rule', 'Area of triangle', 'Radian measure', 'Arc length and sector area'] },
    { id: 'unit_circle_identities', name: 'Unit Circle & Identities', category: 'Topic 3: Geometry and Trigonometry', subtopics: ['Unit circle', 'Exact values', 'Pythagorean identity', 'Double angle formulae', 'Composite trig equations'] },
    { id: 'circular_functions', name: 'Circular Functions', category: 'Topic 3: Geometry and Trigonometry', subtopics: ['Graphs of sin, cos, tan', 'Amplitude, period, phase shift', 'Modelling with trig functions'] },
    { id: 'vectors', name: 'Vectors', category: 'Topic 3: Geometry and Trigonometry', subtopics: ['Vector algebra', 'Scalar product', 'Angle between vectors', 'Vector equations of lines', 'Intersection of lines'] },
    { id: 'trig_identities_ahl', name: 'Trig Identities (AHL)', category: 'Topic 3: Geometry and Trigonometry', subtopics: ['Compound angle formulae', 'Double angle identities', 'Symmetry properties', 'Inverse trig functions'] },
    { id: 'vector_applications', name: 'Vector Applications', category: 'Topic 3: Geometry and Trigonometry', subtopics: ['Cross product', 'Areas and volumes using vectors', 'Vector equation of a plane', 'Intersections of lines and planes'] },
    { id: 'descriptive_stats', name: 'Descriptive Statistics', category: 'Topic 4: Statistics and Probability', subtopics: ['Population vs sample', 'Measures of central tendency', 'Measures of dispersion', 'Correlation and regression'] },
    { id: 'probability', name: 'Probability', category: 'Topic 4: Statistics and Probability', subtopics: ['Venn diagrams', 'Combined events', 'Conditional probability', 'Independent events', 'Probability distributions'] },
    { id: 'distributions', name: 'Distributions', category: 'Topic 4: Statistics and Probability', subtopics: ['Binomial distribution', 'Normal distribution', 'Standardisation (z-scores)', 'Inverse normal'] },
    { id: 'stats_ahl', name: 'Statistics (AHL)', category: 'Topic 4: Statistics and Probability', subtopics: ['Bayes\' theorem', 'Probability density functions', 'Hypothesis testing', 'Chi-squared test'] },
    { id: 'limits_and_derivatives', name: 'Limits & Derivatives', category: 'Topic 5: Calculus', subtopics: ['Concept of limit', 'Derivative as gradient', 'Differentiation rules', 'Tangent and normal lines'] },
    { id: 'differentiation_applications', name: 'Differentiation Applications', category: 'Topic 5: Calculus', subtopics: ['Increasing/decreasing functions', 'Stationary points', 'Optimisation', 'Related rates', 'Second derivative test'] },
    { id: 'integration_basics', name: 'Integration Basics', category: 'Topic 5: Calculus', subtopics: ['Anti-differentiation', 'Definite integrals', 'Area under curves', 'Area between curves', 'Kinematics'] },
    { id: 'calculus_applications', name: 'Calculus Applications', category: 'Topic 5: Calculus', subtopics: ['Modelling with calculus', 'Motion problems', 'Growth and decay models'] },
    { id: 'calculus_ahl_differentiation', name: 'Calculus AHL: Differentiation', category: 'Topic 5: Calculus', subtopics: ['Derivatives of trig, exp, log functions', 'Related rates (AHL)', 'Implicit differentiation', 'L\'Hôpital\'s rule'] },
    { id: 'calculus_ahl_integration', name: 'Calculus AHL: Integration', category: 'Topic 5: Calculus', subtopics: ['Integration by substitution', 'Integration by parts', 'Volumes of revolution'] },
    { id: 'differential_equations', name: 'Differential Equations', category: 'Topic 5: Calculus', subtopics: ['Separable equations', 'Slope fields', 'Euler\'s method', 'Modelling with DEs'] },
  ],
  edges: [
    { from: 'sequences_series', to: 'binomial_theorem' },
    { from: 'exponents_logarithms', to: 'binomial_theorem' },
    { from: 'sequences_series', to: 'proofs' },
    { from: 'exponents_logarithms', to: 'complex_numbers' },
    { from: 'binomial_theorem', to: 'complex_numbers' },
    { from: 'exponents_logarithms', to: 'systems_of_equations' },
    { from: 'functions_basics', to: 'quadratics' },
    { from: 'functions_basics', to: 'rational_exponential_log_functions' },
    { from: 'exponents_logarithms', to: 'rational_exponential_log_functions' },
    { from: 'functions_basics', to: 'transformations' },
    { from: 'quadratics', to: 'transformations' },
    { from: 'transformations', to: 'functions_ahl' },
    { from: 'rational_exponential_log_functions', to: 'functions_ahl' },
    { from: 'measurement_and_trig', to: 'unit_circle_identities' },
    { from: 'unit_circle_identities', to: 'circular_functions' },
    { from: 'measurement_and_trig', to: 'vectors' },
    { from: 'unit_circle_identities', to: 'trig_identities_ahl' },
    { from: 'circular_functions', to: 'trig_identities_ahl' },
    { from: 'vectors', to: 'vector_applications' },
    { from: 'descriptive_stats', to: 'probability' },
    { from: 'probability', to: 'distributions' },
    { from: 'distributions', to: 'stats_ahl' },
    { from: 'functions_basics', to: 'limits_and_derivatives' },
    { from: 'exponents_logarithms', to: 'limits_and_derivatives' },
    { from: 'limits_and_derivatives', to: 'differentiation_applications' },
    { from: 'limits_and_derivatives', to: 'integration_basics' },
    { from: 'differentiation_applications', to: 'calculus_applications' },
    { from: 'integration_basics', to: 'calculus_applications' },
    { from: 'differentiation_applications', to: 'calculus_ahl_differentiation' },
    { from: 'trig_identities_ahl', to: 'calculus_ahl_differentiation' },
    { from: 'integration_basics', to: 'calculus_ahl_integration' },
    { from: 'calculus_ahl_differentiation', to: 'calculus_ahl_integration' },
    { from: 'calculus_ahl_integration', to: 'differential_equations' },
  ],
};

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));
const timeout = (ms) => ({ signal: AbortSignal.timeout(ms) });

const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.text().catch(() => 'Unknown error');
    throw new Error(`HTTP ${res.status}: ${error}`);
  }
  return res.json();
};

// Maps short student-facing IDs (used in URL params) to backend IDs (used in mock data)
const STUDENT_ID_ALIASES = { sarah: 'sarah_001', james: 'james_001', aisha: 'aisha_001' };
const resolveId = (id) => STUDENT_ID_ALIASES[id] || id;

export const api = {
  // === Person B — Knowledge Engine (port 8000) ===

  logInteraction: async (event) => {
    if (USE_MOCK) { await delay(100); return { status: 'ok' }; }
    const res = await fetch(`${ENGINE_URL}/api/interaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...event, student_id: resolveId(event.student_id) }),
      ...timeout(10000),
    });
    return handleResponse(res);
  },

  listStudents: async () => {
    if (USE_MOCK) {
      await delay();
      // Enrich mock students with topic_masteries from MOCK_KNOWLEDGE_MAPS
      return MOCK_STUDENTS.map(s => ({
        ...s,
        topic_masteries: MOCK_KNOWLEDGE_MAPS[s.student_id]?.topic_masteries ?? [],
      }));
    }
    // Person B's /api/students only returns { student_id, overall_mastery, topics_tracked, last_active }
    // Enrich with student_name + topic_masteries from knowledge-map per student
    const list = await fetch(`${ENGINE_URL}/api/students`, timeout(10000)).then(handleResponse);
    return Promise.all(
      list.map(async s => {
        const km = await fetch(`${ENGINE_URL}/api/student/${s.student_id}/knowledge-map`, timeout(10000))
          .then(r => r.ok ? r.json() : null)
          .catch(() => null);
        // km.student_name may be null if Person B's engine didn't store it;
        // fall back to formatting the ID: "sarah_001" → "Sarah"
        const fallbackName = s.student_id
          .split('_')[0]
          .replace(/^\w/, c => c.toUpperCase());
        return {
          ...s,
          student_name: km?.student_name ?? fallbackName,
          topic_masteries: km?.topic_masteries ?? [],
        };
      })
    );
  },

  getKnowledgeMap: async (studentId) => {
    if (USE_MOCK) { await delay(); return MOCK_KNOWLEDGE_MAPS[resolveId(studentId)] ?? null; }
    const res = await fetch(`${ENGINE_URL}/api/student/${resolveId(studentId)}/knowledge-map`, timeout(10000));
    if (!res.ok) return null;
    return res.json();
  },

  getVelocity: async (studentId) => {
    if (USE_MOCK) { await delay(); return null; }
    const res = await fetch(`${ENGINE_URL}/api/student/${resolveId(studentId)}/velocity`, timeout(10000));
    if (!res.ok) return null;
    const data = await res.json();
    // Person B returns a dict keyed by topic name; convert to the array that VelocityChart expects
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return Object.entries(data).map(([topic, info]) => ({ topic, ...info }));
    }
    return Array.isArray(data) && data.length > 0 ? data : null;
  },

  getTopicGraph: async () => {
    // Always try the real API first, fall back to inline graph data
    try {
      const res = await fetch(`${ENGINE_URL}/api/topics/graph`, timeout(8000));
      if (res.ok) return res.json();
    } catch { /* backend unavailable */ }
    return MOCK_TOPIC_GRAPH;
  },

  // Person B to add: GET /api/student/:id/activity?limit=10
  getActivity: async (studentId, limit = 10) => {
    if (USE_MOCK) {
      await delay();
      return (MOCK_ACTIVITY[resolveId(studentId)] ?? []).slice(0, limit);
    }
    const res = await fetch(`${ENGINE_URL}/api/student/${resolveId(studentId)}/activity?limit=${limit}`, timeout(10000));
    if (!res.ok) return [];
    return res.json();
  },

  // === Person A — Agent Pipeline (port 8001) ===

  getDiagnosis: async (knowledgeMap) => {
    if (USE_MOCK) {
      await delay(800);
      return MOCK_DIAGNOSES[resolveId(knowledgeMap?.student_id)] ?? MOCK_DIAGNOSES['sarah_001'];
    }
    const studentId = resolveId(knowledgeMap?.student_id);
    // Try the fast pre-computed cache first
    try {
      const cached = await fetch(`${AGENT_URL}/api/diagnosis/${studentId}`, timeout(5000));
      if (cached.ok) return handleResponse(cached);
    } catch { /* cache miss or agent down — fall through */ }
    // Fall back to full pipeline
    const res = await fetch(`${AGENT_URL}/api/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(knowledgeMap),
      ...timeout(60000),
    });
    return handleResponse(res);
  },

  // === Question Bank + AI Grading (port 8001) ===

  fetchQuestions: async (difficulty = null, limit = 10, offset = 0) => {
    // Try agent service first, fall back to bundled CSV questions
    if (!USE_MOCK) {
      try {
        const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
        if (difficulty) params.set('difficulty', difficulty);
        const res = await fetch(`${AGENT_URL}/api/questions?${params}`, timeout(10000));
        if (res.ok) return handleResponse(res);
      } catch { /* agent service unavailable — use CSV fallback */ }
    }
    // CSV fallback (works in both mock and live mode when agent is down)
    await delay();
    let pool = CSV_QUESTIONS;
    if (difficulty) pool = pool.filter(q => q.difficulty === difficulty);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(offset, offset + limit);
    const questions = selected.map(({ markscheme_body, ...q }) => q);
    return { questions, total: pool.length };
  },

  gradeAnswer: async (studentId, questionId, imageBase64) => {
    // Try agent service for real AI grading
    if (!USE_MOCK) {
      try {
        const res = await fetch(`${AGENT_URL}/api/grade`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: resolveId(studentId),
            question_id: questionId,
            image_base64: imageBase64,
          }),
          ...timeout(45000),
        });
        if (res.ok) return handleResponse(res);
      } catch { /* agent service unavailable — use mock grading */ }
    }
    // Mock grading fallback
    await delay(1200);
    const q = CSV_QUESTIONS.find(q => q.id === questionId);
    const marks = q?.marks ?? 6;
    const awarded = Math.floor(Math.random() * (marks + 1));
    const pct = Math.round((awarded / marks) * 100);
    return {
      marks_awarded: awarded,
      marks_available: marks,
      mark_percentage: pct,
      feedback: 'Mock grading — connect the agent backend (port 8001) for real AI grading with GPT-4o Vision.',
      strengths: awarded > marks / 2 ? ['Good attempt shown'] : [],
      errors: awarded <= marks / 2 ? ['Review your working — some steps may be missing'] : [],
      is_correct: pct >= 50,
    };
  },

  generateStudyPlan: async (payload) => {
    if (USE_MOCK) { await delay(1000); return null; }
    const res = await fetch(`${AGENT_URL}/api/study-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      ...timeout(30000),
    });
    return handleResponse(res);
  },

  sendChatMessage: async (message, knowledgeMap) => {
    if (USE_MOCK) { throw new Error('backend not connected'); }
    const res = await fetch(`${AGENT_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, knowledge_map: knowledgeMap }),
      ...timeout(30000),
    });
    return handleResponse(res);
  },
};

// Direct OpenAI fallback for chat if Person A's endpoint isn't ready
export const getAIResponseDirect = async (message, knowledgeMap, apiKey) => {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a precise AI learning companion for a student studying IB Mathematics Analysis and Approaches HL. You have access to their learning data.\n\nRESPONSE RULES:\n- Answer ONLY what was asked — no tangential points or unrelated advice.\n- Be specific: name the exact rule, formula, or step that applies.\n- Always include a short, concrete example (1-3 lines) that directly illustrates your answer, so the student can see the correct method and compare it to their mistake.\n- If correcting a mistake, show what went wrong and then the correct working side-by-side.\n- Keep explanations tight — the example should do the heavy lifting.\n- No motivational filler (e.g. "Great question!", "You're doing well!").\n- Use LaTeX for all math: $...$ for inline, $$...$$ for display equations.\n\nStudent's knowledge map: ${JSON.stringify(knowledgeMap)}`,
        },
        { role: 'user', content: message },
      ],
      temperature: 0.5,
    }),
  });
  const data = await res.json();
  if (!data.choices?.length) throw new Error(data.error?.message ?? 'OpenAI error');
  return data.choices[0].message.content;
};
