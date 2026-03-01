/**
 * API client — Person C owns this file.
 * These stubs let Person D develop teacher components independently.
 * When Person C sets up real endpoints, they replace this file.
 */
import { MOCK_STUDENTS, MOCK_KNOWLEDGE_MAPS, MOCK_DIAGNOSES, MOCK_ACTIVITY } from '../data/mockTeacherData';

const USE_MOCK = true; // flip to false when Person A/B backends are live
const ENGINE_URL = 'http://localhost:8000';
const AGENT_URL  = 'http://localhost:8001';

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

export const api = {
  // === Person B — Knowledge Engine (port 8000) ===
  listStudents: async () => {
    if (USE_MOCK) { await delay(); return MOCK_STUDENTS; }
    // Person B's /api/students returns { student_id, overall_mastery, topics_tracked, last_active }
    // We enrich with student_name + topic_masteries by calling knowledge-map per student.
    const res = await fetch(`${ENGINE_URL}/api/students`);
    const list = await res.json();
    const enriched = await Promise.all(
      list.map(async s => {
        const km = await fetch(`${ENGINE_URL}/api/student/${s.student_id}/knowledge-map`).then(r => r.json()).catch(() => null);
        return { ...s, student_name: km?.student_name ?? s.student_id, topic_masteries: km?.topic_masteries ?? [] };
      })
    );
    return enriched;
  },

  getKnowledgeMap: async (studentId) => {
    if (USE_MOCK) { await delay(); return MOCK_KNOWLEDGE_MAPS[studentId] ?? null; }
    const res = await fetch(`${ENGINE_URL}/api/student/${studentId}/knowledge-map`);
    if (!res.ok) return null;
    return res.json();
  },

  getTopicGraph: async () => {
    if (USE_MOCK) { await delay(); return { nodes: [], edges: [] }; }
    const res = await fetch(`${ENGINE_URL}/api/topics/graph`);
    return res.json();
  },

  logInteraction: async (event) => {
    if (USE_MOCK) { await delay(100); return { status: 'ok' }; }
    const res = await fetch(`${ENGINE_URL}/api/interaction`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    return res.json();
  },

  getActivity: async (studentId, limit = 10) => {
    if (USE_MOCK) { await delay(); return (MOCK_ACTIVITY[studentId] ?? []).slice(0, limit); }
    // Person B to add: GET /api/student/:id/activity?limit=10
    const res = await fetch(`${ENGINE_URL}/api/student/${studentId}/activity?limit=${limit}`);
    if (!res.ok) return [];
    return res.json();
  },

  // === Person A — Agent Pipeline (port 8001) ===
  getDiagnosis: async (knowledgeMap) => {
    if (USE_MOCK) { await delay(800); return MOCK_DIAGNOSES[knowledgeMap.student_id] ?? null; }
    const res = await fetch(`${AGENT_URL}/api/diagnose`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(knowledgeMap),
    });
    return res.json();
  },
};
