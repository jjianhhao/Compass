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
    if (USE_MOCK) { await delay(); return MOCK_STUDENTS; }
    // Person B's /api/students only returns { student_id, overall_mastery, topics_tracked, last_active }
    // Enrich with student_name + topic_masteries from knowledge-map per student
    const list = await fetch(`${ENGINE_URL}/api/students`).then(handleResponse);
    return Promise.all(
      list.map(async s => {
        const km = await fetch(`${ENGINE_URL}/api/student/${s.student_id}/knowledge-map`).then(r => r.json()).catch(() => null);
        return { ...s, student_name: km?.student_name ?? s.student_id, topic_masteries: km?.topic_masteries ?? [] };
      })
    );
  },

  getKnowledgeMap: async (studentId) => {
    if (USE_MOCK) { await delay(); return MOCK_KNOWLEDGE_MAPS[studentId] ?? null; }
    const res = await fetch(`${ENGINE_URL}/api/student/${studentId}/knowledge-map`);
    if (!res.ok) return null;
    return res.json();
  },

  getVelocity: async (studentId) => {
    if (USE_MOCK) { await delay(); return {}; }
    const res = await fetch(`${ENGINE_URL}/api/student/${studentId}/velocity`);
    if (!res.ok) return {};
    return res.json();
  },

  getTopicGraph: async () => {
    if (USE_MOCK) { await delay(); return { nodes: [], edges: [] }; }
    return fetch(`${ENGINE_URL}/api/topics/graph`).then(handleResponse);
  },

  // Person B to add: GET /api/student/:id/activity?limit=10
  getActivity: async (studentId, limit = 10) => {
    if (USE_MOCK) { await delay(); return (MOCK_ACTIVITY[studentId] ?? []).slice(0, limit); }
    const res = await fetch(`${ENGINE_URL}/api/student/${studentId}/activity?limit=${limit}`);
    if (!res.ok) return [];
    return res.json();
  },

  // === Person A — Agent Pipeline (port 8001) ===

  getDiagnosis: async (knowledgeMap) => {
    if (USE_MOCK) { await delay(800); return MOCK_DIAGNOSES[knowledgeMap.student_id] ?? null; }
    const res = await fetch(`${AGENT_URL}/api/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(knowledgeMap),
    });
    return handleResponse(res);
  },

  sendChatMessage: async (message, knowledgeMap) => {
    if (USE_MOCK) { await delay(600); return { reply: 'Mock response — backend not connected yet.' }; }
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
          content: `You are a supportive AI learning companion for a student studying O-Level Additional Mathematics. You have access to their learning data. Be encouraging, specific, and honest about what they need to work on. Always explain your reasoning. Show confidence levels in your responses.\n\nStudent's knowledge map: ${JSON.stringify(knowledgeMap)}`,
        },
        { role: 'user', content: message },
      ],
      temperature: 0.5,
    }),
  });
  const data = await res.json();
  return data.choices[0].message.content;
};
