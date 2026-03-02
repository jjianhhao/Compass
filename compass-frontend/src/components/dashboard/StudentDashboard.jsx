import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, BookOpen, LogOut, Map } from 'lucide-react';
import MasteryOverview from './MasteryOverview';
import RecommendationPanel from './RecommendationPanel';
import VelocityChart from './VelocityChart';
import StudentChat from '../chat/StudentChat';
import KnowledgeMapGraph from '../shared/KnowledgeMapGraph';
import { saveOverride } from '../../api/localStore';
import { api } from '../../api/client';


export default function StudentDashboard({
  studentName,
  studentId,
  knowledgeMap,
  velocity,
  agentOutput,
  onStartQuiz,
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleOverride = useCallback((payload) => {
    saveOverride(studentId, { ...payload, student_id: studentId });
    // Best-effort: log a high-mastery interaction so the engine registers the student's self-report
    if (payload.override_reason === 'revised_offline') {
      const topic = agentOutput?.plan?.find(r => r.id === payload.recommendation_id)?.topic;
      if (topic) {
        api.logInteraction({
          student_id: studentId,
          topic,
          subtopic: 'self_reported',
          is_correct: true,
          time_taken_sec: 0,
          difficulty: 'medium',
          marks_available: 1,
          marks_awarded: 1,
          mark_percentage: 100,
          timestamp: payload.timestamp,
        }).catch(() => { /* best-effort */ });
      }
    }
  }, [studentId, agentOutput]);

  const overallMastery = knowledgeMap && Object.keys(knowledgeMap).length > 0
    ? Math.round(
        (Object.values(knowledgeMap).reduce((sum, d) => sum + d.mastery_score, 0) /
          Object.keys(knowledgeMap).length) *
          100
      )
    : null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Map },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-indigo-600 font-bold text-lg tracking-tight">
              🧭 COMPASS
            </span>
            <span className="text-gray-300">|</span>
            <div>
              <span className="font-semibold text-gray-800">{studentName}</span>
              {overallMastery !== null && (
                <span className="ml-2 text-sm text-gray-400">
                  Overall mastery:{' '}
                  <span
                    className={`font-semibold ${
                      overallMastery >= 70
                        ? 'text-green-600'
                        : overallMastery >= 40
                        ? 'text-yellow-600'
                        : 'text-red-500'
                    }`}
                  >
                    {overallMastery}%
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
              onClick={onStartQuiz}
            >
              <BookOpen size={14} />
              Take a Quiz
            </button>
            <button
              className="flex items-center gap-1.5 border border-gray-200 text-gray-500 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-colors"
              onClick={() => navigate('/')}
            >
              <LogOut size={14} />
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Content area — fills remaining height, never grows the page */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="max-w-7xl w-full mx-auto px-6 pt-6 flex-shrink-0">
          {/* Tab bar */}
          <div className="flex gap-1 mb-4 bg-white border border-gray-100 rounded-xl p-1 w-fit shadow-sm">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview tab — scrollable */}
        <div className={`flex-1 overflow-y-auto min-h-0 px-6 pb-6 ${activeTab === 'overview' ? '' : 'hidden'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 flex flex-col gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h2 className="text-sm font-semibold text-gray-700 mb-3">Knowledge Map</h2>
                  <KnowledgeMapGraph knowledgeMap={knowledgeMap ?? {}} />
                </div>
                <MasteryOverview knowledgeMap={knowledgeMap} />
                <VelocityChart velocity={velocity} />
              </div>
              <div className="lg:col-span-2">
                <RecommendationPanel agentOutput={agentOutput} onOverride={handleOverride} />
              </div>
            </div>
          </div>
        </div>

        {/* Chat tab — fixed height, no page growth */}
        <div className={`flex-1 min-h-0 px-6 pb-6 ${activeTab === 'chat' ? '' : 'hidden'}`}>
          <div className="max-w-7xl mx-auto h-full">
            <StudentChat knowledgeMap={knowledgeMap} studentName={studentName} />
          </div>
        </div>
      </div>
    </div>
  );
}
