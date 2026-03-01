import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import RecommendationReview from './RecommendationReview';
import OverrideLog from './OverrideLog';
import KnowledgeMapGraph from '../shared/KnowledgeMapGraph';

function MasteryBar({ score, showPct = true }) {
  const pct = Math.round(score * 100);
  const color = score >= 0.7 ? 'bg-green-500' : score >= 0.4 ? 'bg-amber-400' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {showPct && (
        <span className={`text-xs font-semibold w-8 text-right ${score >= 0.7 ? 'text-green-700' : score >= 0.4 ? 'text-amber-700' : 'text-red-700'}`}>
          {pct}%
        </span>
      )}
    </div>
  );
}

function VelocityBadge({ velocity }) {
  const map = {
    improving: { icon: '↑', cls: 'text-green-700 bg-green-50', label: 'Improving' },
    regressing: { icon: '↓', cls: 'text-red-600 bg-red-50', label: 'Regressing' },
    plateauing: { icon: '→', cls: 'text-gray-500 bg-gray-100', label: 'Plateauing' },
  };
  const { icon, cls, label } = map[velocity] || map.plateauing;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
      {icon} {label}
    </span>
  );
}

function timeAgo(isoString) {
  if (!isoString) return '—';
  const diff = Date.now() - new Date(isoString).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Recently';
}

function PrerequisiteFlag({ flag }) {
  return (
    <div className="flex items-center gap-2 text-xs bg-red-50 border border-red-200 rounded px-3 py-1.5">
      <span className="text-red-500">⚠</span>
      <span className="text-red-700">
        <span className="font-semibold">{flag.topic.replace(/_/g, ' ')}</span> requires{' '}
        <span className="font-semibold">{flag.prerequisite_topic.replace(/_/g, ' ')}</span>{' '}
        (currently {Math.round(flag.prerequisite_mastery * 100)}%)
      </span>
    </div>
  );
}

export default function StudentDetail({ studentId }) {
  const navigate = useNavigate();
  const [knowledgeMap, setKnowledgeMap] = useState(null);
  const [agentOutput, setAgentOutput] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loadingKm, setLoadingKm] = useState(true);
  const [loadingAgent, setLoadingAgent] = useState(false);
  const [kmError, setKmError] = useState(null);
  const [overrideLog, setOverrideLog] = useState([]);

  useEffect(() => {
    setLoadingKm(true);
    setKmError(null);
    Promise.all([
      api.getKnowledgeMap(studentId),
      api.getActivity(studentId, 10),
    ])
      .then(([km, acts]) => {
        setKnowledgeMap(km);
        setActivity(acts);
        setLoadingKm(false);
        if (km) {
          setLoadingAgent(true);
          api.getDiagnosis(km)
            .then(diag => { setAgentOutput(diag); setLoadingAgent(false); })
            .catch(() => setLoadingAgent(false));
        }
      })
      .catch(err => {
        setKmError(err.message || 'Failed to load student data.');
        setLoadingKm(false);
      });
  }, [studentId]);

  const handleAction = (action, log) => {
    setOverrideLog(prev => [...prev, log]);
  };

  if (loadingKm) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (kmError) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/teacher')} className="text-sm text-blue-600 hover:underline mb-4">← Back</button>
      <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-700 text-sm">
        Failed to load student data: {kmError}
      </div>
    </div>
  );

  if (!knowledgeMap) {
    return <div className="text-center py-16 text-gray-400">No data found for this student.</div>;
  }

  const {
    student_name,
    overall_mastery,
    last_active,
    topic_masteries = [],
    prerequisite_flags = [],
  } = knowledgeMap;

  const overallVelocity = topic_masteries.length
    ? (() => {
        const counts = { improving: 0, regressing: 0, plateauing: 0 };
        topic_masteries.forEach(t => counts[t.velocity]++);
        if (counts.regressing > counts.improving) return 'regressing';
        if (counts.improving > counts.regressing) return 'improving';
        return 'plateauing';
      })()
    : 'plateauing';

  const sortedTopics = [...topic_masteries].sort((a, b) => a.mastery_score - b.mastery_score);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/teacher')}
        className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1"
      >
        ← Back to Class Overview
      </button>

      {/* Student Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{student_name}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <VelocityBadge velocity={overallVelocity} />
              <span className="text-sm text-gray-500">Last active: {timeAgo(last_active)}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{Math.round(overall_mastery * 100)}%</p>
            <p className="text-xs text-gray-500">Overall Mastery</p>
            <div className="w-32 mt-1">
              <MasteryBar score={overall_mastery} showPct={false} />
            </div>
          </div>
        </div>

        {/* Prerequisite flags */}
        {prerequisite_flags?.length > 0 && (
          <div className="mt-4 space-y-1">
            <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Prerequisite Gaps Detected</p>
            {prerequisite_flags.map((f, i) => <PrerequisiteFlag key={i} flag={f} />)}
          </div>
        )}
      </div>

      {/* Main two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Knowledge Map (55%) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Per-topic mastery table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 text-sm">Topic Mastery Breakdown</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-2 text-left">Topic</th>
                  <th className="px-4 py-2 text-left">Mastery</th>
                  <th className="px-4 py-2 text-left">Velocity</th>
                  <th className="px-4 py-2 text-left">Attempts</th>
                  <th className="px-4 py-2 text-left">Last Practiced</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedTopics.map((t, i) => (
                  <tr key={i} className={t.mastery_score < 0.4 ? 'bg-red-50' : ''}>
                    <td className="px-4 py-3 font-medium text-gray-800">{t.topic.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</td>
                    <td className="px-4 py-3 w-36">
                      <MasteryBar score={t.mastery_score} />
                    </td>
                    <td className="px-4 py-3">
                      <VelocityBadge velocity={t.velocity} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{t.attempt_count}</td>
                    <td className="px-4 py-3 text-gray-500">{timeAgo(t.last_practiced)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Knowledge map graph */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Prerequisite Dependency Graph</h3>
            <KnowledgeMapGraph knowledgeMap={
              Object.fromEntries(
                (knowledgeMap?.topic_masteries ?? []).map(t => [
                  t.topic.toLowerCase().replace(/ /g, '_'),
                  { mastery_score: t.mastery_score, velocity: t.velocity, attempt_count: t.attempt_count }
                ])
              )
            } />
          </div>
        </div>

        {/* Right: AI Diagnosis + Recommendations (45%) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Diagnosis card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800 text-sm">AI Diagnosis</h2>
              {loadingAgent && (
                <div className="animate-spin h-4 w-4 border-b-2 border-blue-500 rounded-full" />
              )}
            </div>
            {agentOutput ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-700">{agentOutput.diagnosis.root_cause_analysis}</p>

                {(agentOutput.diagnosis.error_classifications ?? []).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Error Types</p>
                    {(agentOutput.diagnosis.error_classifications ?? []).map((ec, i) => (
                      <div key={i} className="text-xs flex items-start gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 rounded font-medium ${
                          ec.error_type === 'conceptual_gap' ? 'bg-red-100 text-red-700' :
                          ec.error_type === 'time_pressure' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {ec.error_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-gray-600">{ec.evidence}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{agentOutput.diagnosis.data_points_used} data points</span>
                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                    agentOutput.overall_confidence === 'high' ? 'bg-green-100 text-green-700' :
                    agentOutput.overall_confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {agentOutput.overall_confidence} confidence
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                {loadingAgent ? 'Running AI diagnosis...' : 'No diagnosis available.'}
              </p>
            )}
          </div>

          {/* Recommendations with Accept/Modify/Reject */}
          {agentOutput && (
            <div>
              <h2 className="font-semibold text-gray-800 text-sm mb-2 px-0.5">Study Plan — Review & Override</h2>
              <RecommendationReview agentOutput={agentOutput} onAction={handleAction} />
            </div>
          )}

          {/* Override history log */}
          <OverrideLog entries={overrideLog} studentName={student_name} />
        </div>
      </div>

      {/* Recent Activity Log — last 10 interactions */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">Recent Activity</h2>
        </div>
        {activity.length === 0 ? (
          <p className="text-sm text-gray-400 px-4 py-6 text-center">No recent activity recorded.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-2 text-left">When</th>
                <th className="px-4 py-2 text-left">Topic</th>
                <th className="px-4 py-2 text-left">Question</th>
                <th className="px-4 py-2 text-left">Difficulty</th>
                <th className="px-4 py-2 text-left">Result</th>
                <th className="px-4 py-2 text-left">Time Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activity.map((a, i) => (
                <tr key={i} className={a.is_correct ? '' : 'bg-red-50'}>
                  <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{timeAgo(a.timestamp)}</td>
                  <td className="px-4 py-2 text-gray-800">{a.topic}</td>
                  <td className="px-4 py-2 text-gray-500 font-mono text-xs">{a.question_id}</td>
                  <td className="px-4 py-2 capitalize text-gray-600">{a.difficulty}</td>
                  <td className="px-4 py-2">
                    {a.is_correct
                      ? <span className="text-green-700 font-medium">✓ Correct</span>
                      : <span className="text-red-600 font-medium">✗ Wrong</span>}
                  </td>
                  <td className="px-4 py-2 text-gray-500">{a.time_taken_sec}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
