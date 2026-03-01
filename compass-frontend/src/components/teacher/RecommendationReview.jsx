import { useState } from 'react';

const REJECT_REASONS = [
  'Student already revised this',
  'Student is focusing on other priorities',
  'AI assessment seems inaccurate',
  'Other',
];

const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard'];
const PRIORITY_COLORS = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  medium: 'bg-blue-100 text-blue-800 border-blue-300',
  low: 'bg-gray-100 text-gray-600 border-gray-300',
};
const CONFIDENCE_COLORS = {
  high: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-red-100 text-red-700',
};
const confidenceClass = (level) => CONFIDENCE_COLORS[level] || 'bg-gray-100 text-gray-600';

function Toast({ message, onDone }) {
  return (
    <div
      className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-pulse"
      onClick={onDone}
    >
      <span>✓</span> {message}
    </div>
  );
}

function ReasoningTrail({ recReasoning, fullTrail, evaluatorVerdict }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="text-xs text-blue-600 hover:underline"
      >
        {open ? 'Hide' : 'Show'} full AI reasoning trail
      </button>
      {open && (
        <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-3 space-y-2">
          <p className="font-semibold text-gray-700">This recommendation:</p>
          <p className="whitespace-pre-wrap">{recReasoning}</p>
          {fullTrail && (
            <>
              <p className="font-semibold text-gray-700 mt-2">Full diagnostic chain:</p>
              <p className="whitespace-pre-wrap">{fullTrail}</p>
            </>
          )}
          {evaluatorVerdict && (
            <div className={`mt-2 flex items-start gap-2 p-2 rounded ${evaluatorVerdict.approved ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-800'}`}>
              <span>{evaluatorVerdict.approved ? '✅' : '⚠️'}</span>
              <span className="text-xs">
                Evaluator: {evaluatorVerdict.approved ? 'Approved' : `Flagged — ${evaluatorVerdict.concerns?.join(', ')}`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ rec, index, confidence, evaluatorVerdict, fullReasoningTrail, onAction }) {
  const [mode, setMode] = useState(null); // null | 'modify' | 'reject'
  const [toast, setToast] = useState(null);
  const [done, setDone] = useState(null); // 'accepted' | 'modified' | 'rejected'

  // Modify form state
  const [modTopic, setModTopic] = useState(rec.topic);
  const [modDifficulty, setModDifficulty] = useState(rec.difficulty);
  const [modAction, setModAction] = useState(rec.action);
  const [modNote, setModNote] = useState('');

  // Reject form state
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [customReason, setCustomReason] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAccept = () => {
    const log = { action: 'accepted', recommendation_id: `${rec.topic}_${index}`, timestamp: new Date().toISOString() };
    console.log('Override log:', log);
    onAction?.('accepted', log);
    setDone('accepted');
    showToast('Override logged — your input helps improve future recommendations.');
  };

  const handleModifySave = () => {
    const log = {
      action: 'modified',
      recommendation_id: `${rec.topic}_${index}`,
      original: { topic: rec.topic, difficulty: rec.difficulty, action: rec.action },
      modified_to: { topic: modTopic, difficulty: modDifficulty, action: modAction },
      teacher_note: modNote,
      timestamp: new Date().toISOString(),
    };
    console.log('Override log:', log);
    onAction?.('modified', log);
    setMode(null);
    setDone('modified');
    showToast('Override logged — your input helps improve future recommendations.');
  };

  const handleRejectSubmit = () => {
    const reason = rejectReason === 'Other' ? customReason : rejectReason;
    if (!reason) return;
    const log = {
      action: 'rejected',
      recommendation_id: `${rec.topic}_${index}`,
      reason,
      teacher_note: rejectNote,
      timestamp: new Date().toISOString(),
    };
    console.log('Override log:', log);
    onAction?.('rejected', log);
    setMode(null);
    setDone('rejected');
    showToast('Override logged — your input helps improve future recommendations.');
  };

  if (done) {
    const doneStyle = done === 'accepted'
      ? 'border-green-300 bg-green-50'
      : done === 'modified'
      ? 'border-blue-300 bg-blue-50'
      : 'border-gray-200 bg-gray-50 opacity-60';
    const doneIcon = done === 'accepted' ? '✅' : done === 'modified' ? '✏️' : '❌';
    return (
      <>
        <div className={`rounded-xl border p-4 ${doneStyle}`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{doneIcon}</span>
            <div>
              <p className="font-medium text-gray-700">{rec.topic}</p>
              <p className="text-xs text-gray-500 capitalize">{done} by teacher</p>
            </div>
          </div>
        </div>
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 flex-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold uppercase ${PRIORITY_COLORS[rec.priority] || PRIORITY_COLORS.low}`}>
              {rec.priority}
            </span>
            <div>
              <p className="font-semibold text-gray-900">{rec.topic}</p>
              {rec.subtopic && <p className="text-xs text-gray-500">{rec.subtopic}</p>}
            </div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${confidenceClass(confidence)}`}>
            {confidence} confidence
          </span>
        </div>

        {/* Action text */}
        <p className="mt-3 text-sm text-gray-700">{rec.action}</p>
        <p className="mt-1 text-xs text-gray-500 italic">Why: {rec.reasoning}</p>

        {/* Modify inline form */}
        {mode === 'modify' && (
          <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
            <p className="text-xs font-semibold text-gray-700">Edit recommendation:</p>
            <input
              className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={modTopic}
              onChange={e => setModTopic(e.target.value)}
              placeholder="Topic"
            />
            <div className="flex gap-2">
              <select
                className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                value={modDifficulty}
                onChange={e => setModDifficulty(e.target.value)}
              >
                {DIFFICULTY_OPTIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <textarea
              className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
              rows={2}
              value={modAction}
              onChange={e => setModAction(e.target.value)}
              placeholder="Updated action..."
            />
            <textarea
              className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
              rows={2}
              value={modNote}
              onChange={e => setModNote(e.target.value)}
              placeholder="Teacher note (optional)..."
            />
            <div className="flex gap-2">
              <button
                onClick={handleModifySave}
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => setMode(null)}
                className="text-xs text-gray-500 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Reject inline form */}
        {mode === 'reject' && (
          <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
            <p className="text-xs font-semibold text-gray-700">Reason for rejection:</p>
            <div className="space-y-1">
              {REJECT_REASONS.map(r => (
                <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name={`reject_${index}`}
                    value={r}
                    checked={rejectReason === r}
                    onChange={() => setRejectReason(r)}
                    className="accent-red-500"
                  />
                  {r}
                </label>
              ))}
            </div>
            {rejectReason === 'Other' && (
              <input
                className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-400"
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                placeholder="Describe your reason..."
              />
            )}
            <textarea
              className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-400"
              rows={2}
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              placeholder="Additional note (optional)..."
            />
            <div className="flex gap-2">
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectReason || (rejectReason === 'Other' && !customReason)}
                className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 disabled:opacity-40"
              >
                Confirm Rejection
              </button>
              <button onClick={() => setMode(null)} className="text-xs text-gray-500 hover:underline">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!mode && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAccept}
              className="flex-1 text-sm font-semibold bg-green-600 text-white rounded-lg py-2 hover:bg-green-700 transition-colors"
            >
              ✓ Accept
            </button>
            <button
              onClick={() => setMode('modify')}
              className="flex-1 text-sm font-semibold bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition-colors"
            >
              ✏ Modify
            </button>
            <button
              onClick={() => setMode('reject')}
              className="flex-1 text-sm font-semibold border border-red-500 text-red-600 rounded-lg py-2 hover:bg-red-50 transition-colors"
            >
              ✕ Reject
            </button>
          </div>
        )}

        <ReasoningTrail recReasoning={rec.reasoning} fullTrail={fullReasoningTrail} evaluatorVerdict={evaluatorVerdict} />
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}

export default function RecommendationReview({ agentOutput, onAction }) {
  if (!agentOutput) return null;
  const { plan, evaluator_verdict, overall_confidence, reasoning_trail } = agentOutput;
  if (!plan) return null;

  const recommendations = plan.recommendations ?? [];

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-indigo-900">AI Study Plan Summary</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${confidenceClass(overall_confidence)}`}>
            {overall_confidence} confidence
          </span>
        </div>
        <p className="text-sm text-indigo-800">{plan.study_plan_summary}</p>
        {plan.estimated_sessions != null && (
          <p className="text-xs text-indigo-600 mt-1">Est. {plan.estimated_sessions} session{plan.estimated_sessions !== 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Evaluator warning */}
      {!evaluator_verdict?.approved && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 flex gap-2">
          <span className="text-yellow-600">⚠️</span>
          <div>
            <p className="text-xs font-semibold text-yellow-800">AI flagged concerns with this analysis</p>
            {evaluator_verdict.concerns?.map((c, i) => (
              <p key={i} className="text-xs text-yellow-700">• {c}</p>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation cards */}
      {recommendations.map((rec, i) => (
        <RecommendationCard
          key={i}
          index={i}
          rec={rec}
          confidence={overall_confidence}
          evaluatorVerdict={evaluator_verdict}
          fullReasoningTrail={reasoning_trail}
          onAction={onAction}
        />
      ))}
    </div>
  );
}
