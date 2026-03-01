import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, BookOpen, Map } from 'lucide-react';
import MasteryOverview from './MasteryOverview';
import RecommendationPanel from './RecommendationPanel';
import VelocityChart from './VelocityChart';
import StudentChat from '../chat/StudentChat';


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

  const overallMastery = knowledgeMap
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
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="text-indigo-600 font-bold text-lg tracking-tight"
              onClick={() => navigate('/')}
            >
              🧭 COMPASS
            </button>
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
                        : overallMastery >= 50
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
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tab bar */}
        <div className="flex gap-1 mb-6 bg-white border border-gray-100 rounded-xl p-1 w-fit shadow-sm">
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

        {/* Overview tab — always mounted, hidden when not active */}
        <div className={activeTab === 'overview' ? '' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Knowledge map + Mastery + Velocity */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              {/* Knowledge map placeholder */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-1">Knowledge Map</h2>
                <p className="text-xs text-gray-400 mb-4">Topic dependency graph — Person B integration</p>
                <div className="h-48 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center gap-2">
                  <Map size={28} className="text-indigo-300" />
                  <p className="text-sm text-indigo-400 font-medium">Knowledge graph coming soon</p>
                  <p className="text-xs text-indigo-300">Connect Person B's graph component here</p>
                </div>
              </div>

              {/* Mastery overview */}
              <MasteryOverview knowledgeMap={knowledgeMap} />

              {/* Velocity chart */}
              <VelocityChart velocity={velocity} />
            </div>

            {/* Right: Recommendations */}
            <div className="lg:col-span-2">
              <RecommendationPanel
                agentOutput={agentOutput}
                onOverride={() => {}}
              />
            </div>
          </div>
        </div>

        {/* Chat tab — always mounted, hidden when not active */}
        <div className={activeTab === 'chat' ? '' : 'hidden'}>
          <StudentChat knowledgeMap={knowledgeMap} studentName={studentName} />
        </div>
      </div>
    </div>
  );
}
