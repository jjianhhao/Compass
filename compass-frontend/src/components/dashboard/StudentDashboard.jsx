import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, BookOpen, LogOut, Map, CalendarDays, ChevronDown, ChevronUp, CheckCircle2, Circle, Clock, BookOpen as BookIcon } from 'lucide-react';
import MasteryOverview from './MasteryOverview';
import RecommendationPanel from './RecommendationPanel';
import VelocityChart from './VelocityChart';
import StudentChat from '../chat/StudentChat';
import KnowledgeMapGraph from '../shared/KnowledgeMapGraph';
import StudyPlanner from './StudyPlanner';
import { saveOverride, loadStudyPlan, loadCompletedSessions, toggleSessionComplete } from '../../api/localStore';
import { api } from '../../api/client';
import { formatTopicName } from '../../utils/topicNames';

const PRIORITY_STYLES = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high:     'bg-orange-100 text-orange-700 border-orange-200',
  medium:   'bg-blue-100 text-blue-700 border-blue-200',
  low:      'bg-gray-100 text-gray-600 border-gray-200',
};
const PRIORITY_LABEL = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };

function TodayStudyCard({ studentId }) {
  const plan = loadStudyPlan(studentId);
  const [open, setOpen] = useState(true);
  const [completed, setCompleted] = useState(() => loadCompletedSessions(studentId));

  if (!plan || !plan.sessions?.length) return null;

  const today = new Date().toISOString().split('T')[0];
  const todaySession = plan.sessions.find(s => s.date === today);
  const nextSession = !todaySession
    ? plan.sessions.find(s => s.date > today)
    : null;
  const session = todaySession || nextSession;
  if (!session) return null;

  const isToday = !!todaySession;
  const isDone = completed.has(session.day);

  const handleToggle = () => {
    const updated = toggleSessionComplete(studentId, session.day);
    setCompleted(new Set(updated));
  };

  return (
    <div className={`rounded-2xl border shadow-sm mb-4 transition-all ${isDone ? 'border-green-200 bg-green-50' : 'border-teal-200 bg-teal-50'}`}>
      {/* Header row — always visible */}
      <button
        className="w-full flex items-center justify-between px-5 py-3 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <CalendarDays size={15} className={isDone ? 'text-green-600' : 'text-teal-600'} />
          <div>
            <span className={`text-xs font-semibold uppercase tracking-wide ${isDone ? 'text-green-700' : 'text-teal-700'}`}>
              {isToday ? "Today's Study Session" : `Next Session — ${session.date}`}
            </span>
            <p className={`text-sm font-medium mt-0.5 ${isDone ? 'text-green-800 line-through opacity-60' : 'text-teal-900'}`}>
              {session.focus}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); handleToggle(); }}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
              isDone
                ? 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200'
                : 'bg-white border-teal-200 text-teal-600 hover:bg-teal-100'
            }`}
          >
            {isDone
              ? <><CheckCircle2 size={13} /> Completed</>
              : <><Circle size={13} /> Mark Complete</>}
          </button>
          {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
        </div>
      </button>

      {/* Expanded details */}
      {open && (
        <div className="px-5 pb-4 flex items-center gap-4 flex-wrap border-t border-teal-100">
          <span className="flex items-center gap-1 text-xs text-teal-600 mt-2">
            <Clock size={11} /> {session.duration_hours}h
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border mt-2 ${PRIORITY_STYLES[session.priority] || PRIORITY_STYLES.medium}`}>
            {PRIORITY_LABEL[session.priority] || session.priority}
          </span>
          <div className="flex flex-wrap gap-1 mt-2">
            {session.topics.map(t => (
              <span key={t} className="flex items-center gap-1 text-xs bg-white border border-teal-200 text-teal-700 px-2 py-0.5 rounded-full">
                <BookIcon size={9} /> {formatTopicName(t)}
              </span>
            ))}
          </div>
          {plan._deadline_name && (
            <span className="text-xs text-teal-400 ml-auto mt-2">
              Day {session.day} of {plan.total_days} — {plan._deadline_name}
            </span>
          )}
        </div>
      )}
    </div>
  );
}


export default function StudentDashboard({
  studentName,
  studentId,
  knowledgeMap,
  velocity,
  agentOutput,
  agentLoading,
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
    { id: 'planner', label: 'Study Planner', icon: CalendarDays },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-teal-50/40">
      {/* Top bar */}
      <header className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4 flex-shrink-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-white font-bold text-lg tracking-tight">
              🧭 COMPASS
            </span>
            <span className="text-white/30">|</span>
            <div>
              <span className="font-semibold text-white">{studentName}</span>
              {overallMastery !== null && (
                <span className="ml-2 text-sm text-teal-100">
                  Overall mastery:{' '}
                  <span
                    className={`font-semibold ${
                      overallMastery >= 70
                        ? 'text-green-300'
                        : overallMastery >= 40
                        ? 'text-yellow-300'
                        : 'text-red-300'
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
              className="flex items-center gap-1.5 bg-white text-teal-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-teal-50 transition-colors shadow-sm"
              onClick={onStartQuiz}
            >
              <BookOpen size={14} />
              Take a Quiz
            </button>
            <button
              className="flex items-center gap-1.5 border border-white/30 text-teal-100 text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
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
          <div className="flex gap-1 mb-4 bg-white border border-teal-100 rounded-xl p-1 w-fit shadow-sm">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === id
                    ? 'bg-teal-600 text-white shadow-sm'
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
            <TodayStudyCard studentId={studentId} />
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
                <RecommendationPanel agentOutput={agentOutput} agentLoading={agentLoading} onOverride={handleOverride} />
              </div>
            </div>
          </div>
        </div>

        {/* Study Planner tab */}
        <div className={`flex-1 overflow-y-auto min-h-0 px-6 pb-6 ${activeTab === 'planner' ? '' : 'hidden'}`}>
          <div className="max-w-7xl mx-auto">
            <StudyPlanner knowledgeMap={knowledgeMap} studentId={studentId} />
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
