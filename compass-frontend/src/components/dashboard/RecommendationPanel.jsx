import { useState } from 'react';
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import ConfidenceBadge from '../shared/ConfidenceBadge';
import OverrideButton from '../shared/OverrideButton';
import { formatTopicName } from '../../utils/topicNames';

const PRIORITY_STYLES = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high:     'bg-orange-100 text-orange-700 border-orange-200',
  medium:   'bg-blue-100 text-blue-700 border-blue-200',
  low:      'bg-gray-100 text-gray-600 border-gray-200',
};

const PRIORITY_LABELS = {
  critical: 'Critical',
  high:     'High Priority',
  medium:   'Medium Priority',
  low:      'Low Priority',
};

function RecommendationCard({ rec, onOverride }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES.medium}`}>
            {PRIORITY_LABELS[rec.priority] || rec.priority}
          </span>
          <span className="text-sm font-semibold text-gray-800">{formatTopicName(rec.topic)}</span>
        </div>
        <ConfidenceBadge level={rec.confidence} />
      </div>

      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{rec.action}</p>

      <button
        className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors mb-2"
        onClick={() => setExpanded((e) => !e)}
      >
        Why this recommendation?
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {expanded && (
        <div className="bg-indigo-50 rounded-lg px-3 py-2 text-xs text-indigo-700 leading-relaxed mb-3">
          {rec.reasoning}
        </div>
      )}

      <OverrideButton recommendationId={rec.id} onOverride={onOverride} />
    </div>
  );
}

export default function RecommendationPanel({ agentOutput, agentLoading, onOverride }) {
  const [trailExpanded, setTrailExpanded] = useState(false);

  if (agentLoading && !agentOutput) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-3 w-36 bg-gray-200 rounded mb-1.5" />
            <div className="h-2 w-44 bg-gray-100 rounded" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400" />
            <span className="text-xs text-indigo-400">AI analysing…</span>
          </div>
        </div>
        <div className="bg-indigo-50 rounded-xl p-4 mb-4">
          <div className="h-3 w-24 bg-indigo-200 rounded mb-2" />
          <div className="h-3 w-full bg-indigo-100 rounded mb-1" />
          <div className="h-3 w-3/4 bg-indigo-100 rounded" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="border border-gray-100 rounded-xl p-4">
              <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-full bg-gray-100 rounded mb-1" />
              <div className="h-3 w-2/3 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!agentOutput) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center text-sm text-gray-400">
        No recommendations yet. Complete a quiz to get personalised suggestions.
      </div>
    );
  }

  const { plan = [], study_plan_summary, evaluator_verdict, overall_confidence, reasoning_trail } = agentOutput;
  const approved = evaluator_verdict?.approved !== false;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-0.5">What to Study Next</h2>
        <p className="text-xs text-gray-400">Powered by AI agent analysis</p>
      </div>

      {/* Summary card */}
      <div className="bg-indigo-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Study Plan</span>
          <ConfidenceBadge level={overall_confidence} />
        </div>
        <p className="text-sm text-indigo-800 leading-relaxed">{study_plan_summary}</p>
        <div className="flex items-center gap-1.5 mt-2">
          {approved ? (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle size={12} /> AI verified
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-yellow-600">
              <AlertTriangle size={12} /> AI flagged concerns
            </span>
          )}
        </div>
      </div>

      {/* Warning banner */}
      {!approved && evaluator_verdict?.concerns?.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex gap-2">
          <AlertTriangle size={14} className="text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-yellow-700 mb-1">
              AI flagged some concerns with this analysis
            </p>
            <ul className="text-xs text-yellow-600 space-y-0.5 list-disc list-inside">
              {evaluator_verdict.concerns.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Recommendation cards */}
      <div className="space-y-3">
        {plan.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} onOverride={onOverride} />
        ))}
      </div>

      {/* Evaluator verdict */}
      <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${approved ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
        {approved ? <CheckCircle size={13} /> : <AlertTriangle size={13} />}
        Evaluator verdict: {approved ? 'Approved' : 'Flagged'}
      </div>

      {/* Reasoning trail */}
      {reasoning_trail && (
        <div>
          <button
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setTrailExpanded((e) => !e)}
          >
            Full Reasoning Trail
            {trailExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {trailExpanded && (
            <div className="mt-2 bg-gray-50 rounded-xl p-3 text-xs text-gray-600 leading-relaxed font-mono whitespace-pre-wrap">
              {reasoning_trail}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
