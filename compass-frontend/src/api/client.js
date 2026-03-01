import { MOCK_STUDENTS, MOCK_KNOWLEDGE_MAPS, MOCK_DIAGNOSES, MOCK_ACTIVITY } from '../data/mockTeacherData';

const USE_MOCK = true; // flip to false when Person A/B backends are live
const ENGINE_URL = 'http://localhost:8000';
const AGENT_URL  = 'http://localhost:8001';

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

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
      body: JSON.stringify(event),
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
    const list = await fetch(`${ENGINE_URL}/api/students`).then(handleResponse);
    return Promise.all(
      list.map(async s => {
        const km = await fetch(`${ENGINE_URL}/api/student/${s.student_id}/knowledge-map`)
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
    const res = await fetch(`${ENGINE_URL}/api/student/${studentId}/knowledge-map`);
    if (!res.ok) return null;
    return res.json();
  },

  getVelocity: async (studentId) => {
    if (USE_MOCK) { await delay(); return null; }
    const res = await fetch(`${ENGINE_URL}/api/student/${resolveId(studentId)}/velocity`);
    if (!res.ok) return null;
    const data = await res.json();
    // Person B returns a dict keyed by topic name; convert to the array that VelocityChart expects
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return Object.entries(data).map(([topic, info]) => ({ topic, ...info }));
    }
    return Array.isArray(data) && data.length > 0 ? data : null;
  },

  getTopicGraph: async () => {
    if (USE_MOCK) { await delay(); return { nodes: [], edges: [] }; }
    return fetch(`${ENGINE_URL}/api/topics/graph`).then(handleResponse);
  },

  // Person B to add: GET /api/student/:id/activity?limit=10
  getActivity: async (studentId, limit = 10) => {
    if (USE_MOCK) {
      await delay();
      return (MOCK_ACTIVITY[resolveId(studentId)] ?? []).slice(0, limit);
    }
    const res = await fetch(`${ENGINE_URL}/api/student/${studentId}/activity?limit=${limit}`);
    if (!res.ok) return [];
    return res.json();
  },

  // === Person A — Agent Pipeline (port 8001) ===

  getDiagnosis: async (knowledgeMap) => {
    if (USE_MOCK) {
      await delay(800);
      return MOCK_DIAGNOSES[resolveId(knowledgeMap?.student_id)] ?? MOCK_DIAGNOSES['sarah_001'];
    }
    const res = await fetch(`${AGENT_URL}/api/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(knowledgeMap),
    });
    return handleResponse(res);
  },

  sendChatMessage: async (message, knowledgeMap) => {
    if (USE_MOCK) { throw new Error('backend not connected'); }
    const res = await fetch(`${AGENT_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, knowledge_map: knowledgeMap }),
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
          content: `You are a supportive AI learning companion for a student studying O-Level Additional Mathematics. You have access to their learning data. Be encouraging, specific, and honest about what they need to work on. Always explain your reasoning.\n\nIMPORTANT: When writing any mathematical expressions, always use LaTeX notation with proper delimiters: use $...$ for inline math (e.g. $x^2 + 1$) and $$...$$ for display/block math (e.g. $$\\int 2x\\,dx = x^2 + C$$). Never write raw LaTeX commands without delimiters.\n\nStudent's knowledge map: ${JSON.stringify(knowledgeMap)}`,
        },
        { role: 'user', content: message },
      ],
      temperature: 0.5,
    }),
  });
  const data = await res.json();
  return data.choices[0].message.content;
};
