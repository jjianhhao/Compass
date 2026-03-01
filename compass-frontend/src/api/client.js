const ENGINE_URL = 'http://localhost:8000';
const AGENT_URL = 'http://localhost:8001';

const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.text().catch(() => 'Unknown error');
    throw new Error(`HTTP ${res.status}: ${error}`);
  }
  return res.json();
};

export const api = {
  // === Knowledge Engine (Person B) ===

  logInteraction: async (event) => {
    const res = await fetch(`${ENGINE_URL}/api/interaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    return handleResponse(res);
  },

  getKnowledgeMap: async (studentId) => {
    const res = await fetch(`${ENGINE_URL}/api/student/${studentId}/knowledge-map`);
    if (!res.ok) return null;
    return res.json();
  },

  getVelocity: async (studentId) => {
    const res = await fetch(`${ENGINE_URL}/api/student/${studentId}/velocity`);
    if (!res.ok) return {};
    return res.json();
  },

  getTopicGraph: async () => {
    const res = await fetch(`${ENGINE_URL}/api/topics/graph`);
    return handleResponse(res);
  },

  // === Agent Pipeline (Person A) ===

  getDiagnosis: async (knowledgeMap) => {
    const res = await fetch(`${AGENT_URL}/api/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(knowledgeMap),
    });
    return handleResponse(res);
  },

  sendChatMessage: async (message, knowledgeMap) => {
    const res = await fetch(`${AGENT_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, knowledge_map: knowledgeMap }),
    });
    return handleResponse(res);
  },
};

// Fallback OpenAI direct call for chat if Person A's endpoint isn't ready
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
          content: `You are a supportive AI learning companion for a student studying O-Level Additional Mathematics. You have access to their learning data. Be encouraging, specific, and honest about what they need to work on. Always explain your reasoning. Show confidence levels in your responses.

Student's knowledge map: ${JSON.stringify(knowledgeMap)}`,
        },
        { role: 'user', content: message },
      ],
      temperature: 0.5,
    }),
  });
  const data = await res.json();
  return data.choices[0].message.content;
};
