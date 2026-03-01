import { useState } from 'react';

const ACTION_META = {
  accepted: { icon: '✅', label: 'Accepted', color: 'text-green-700 bg-green-50 border-green-200' },
  modified: { icon: '✏️', label: 'Modified', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  rejected: { icon: '❌', label: 'Rejected', color: 'text-red-700 bg-red-50 border-red-200' },
  student_challenged: { icon: '🙋', label: 'Student Challenged', color: 'text-purple-700 bg-purple-50 border-purple-200' },
};

const FILTERS = ['all', 'accepted', 'modified', 'rejected'];

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${mins}m ago`;
}

export default function OverrideLog({ entries = [], studentName }) {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? entries : entries.filter(e => e.action === filter);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 text-sm">
          Override History {studentName && <span className="text-gray-500 font-normal">— {studentName}</span>}
        </h3>
        <div className="flex gap-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-2 py-1 rounded capitalize transition-colors ${
                filter === f
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          {entries.length === 0
            ? 'No overrides logged yet. Use Accept / Modify / Reject on recommendations.'
            : `No ${filter} entries.`}
        </div>
      ) : (
        <div className="space-y-2">
          {[...filtered].reverse().map((entry, i) => {
            const meta = ACTION_META[entry.action] || ACTION_META.accepted;
            return (
              <div key={i} className={`rounded-lg border px-3 py-2 ${meta.color}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className="text-base leading-tight">{meta.icon}</span>
                    <div>
                      <p className="text-xs font-semibold">{meta.label}</p>
                      <p className="text-xs opacity-80 mt-0.5">
                        {entry.recommendation_id?.replace(/_\d+$/, '').replace(/_/g, ' ')}
                      </p>
                      {entry.reason && (
                        <p className="text-xs mt-0.5 italic">Reason: {entry.reason}</p>
                      )}
                      {entry.teacher_note && (
                        <p className="text-xs mt-0.5 opacity-75">"{entry.teacher_note}"</p>
                      )}
                      {entry.modified_to && (
                        <p className="text-xs mt-0.5">
                          Changed to: <span className="font-medium">{entry.modified_to.topic}</span> ({entry.modified_to.difficulty})
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs opacity-60 shrink-0">{timeAgo(entry.timestamp)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
