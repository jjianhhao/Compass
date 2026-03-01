import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const formatTopic = (t) =>
  t
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const VelocityIcon = ({ v }) => {
  if (v === 'improving') return <TrendingUp size={12} className="text-green-500" />;
  if (v === 'regressing') return <TrendingDown size={12} className="text-red-500" />;
  return <Minus size={12} className="text-gray-400" />;
};

export default function MasteryOverview({ knowledgeMap }) {
  if (!knowledgeMap) return null;

  const entries = Object.entries(knowledgeMap).map(([topic, data]) => ({
    topic,
    ...data,
  }));

  const sorted = [...entries].sort((a, b) => b.mastery_score - a.mastery_score);
  const top3 = sorted.slice(0, 3);
  const bottom3 = sorted.slice(-3).reverse();

  const overall = Math.round(
    (entries.reduce((sum, e) => sum + e.mastery_score, 0) / entries.length) * 100
  );

  const distribution = [
    { label: '0–40%', count: entries.filter((e) => e.mastery_score < 0.4).length, color: 'bg-red-400' },
    { label: '40–60%', count: entries.filter((e) => e.mastery_score >= 0.4 && e.mastery_score < 0.6).length, color: 'bg-yellow-400' },
    { label: '60–80%', count: entries.filter((e) => e.mastery_score >= 0.6 && e.mastery_score < 0.8).length, color: 'bg-blue-400' },
    { label: '80–100%', count: entries.filter((e) => e.mastery_score >= 0.8).length, color: 'bg-green-400' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {/* Overall */}
      <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-indigo-50 border-4 border-indigo-100 flex-shrink-0">
          <span className="text-2xl font-bold text-indigo-600">{overall}%</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">Overall Mastery</p>
          <p className="text-xs text-gray-400 mt-0.5">Across {entries.length} topics</p>
          {/* Distribution bar */}
          <div className="flex gap-0.5 mt-2 h-2 rounded-full overflow-hidden w-48">
            {distribution.map((d) => (
              <div
                key={d.label}
                className={`${d.color} h-full`}
                style={{ width: `${(d.count / entries.length) * 100}%` }}
                title={`${d.label}: ${d.count} topics`}
              />
            ))}
          </div>
          <div className="flex gap-3 mt-1">
            {distribution.map((d) => (
              <span key={d.label} className="text-xs text-gray-400">
                <span className={`inline-block w-2 h-2 rounded-full ${d.color} mr-0.5`} />
                {d.count}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Strongest */}
        <div>
          <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
            Strongest
          </h3>
          <div className="space-y-2">
            {top3.map((e) => (
              <div key={e.topic} className="flex items-center gap-2">
                <VelocityIcon v={e.velocity} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 truncate">{formatTopic(e.topic)}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-0.5 overflow-hidden">
                    <div
                      className="h-full bg-green-400 rounded-full"
                      style={{ width: `${e.mastery_score * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-medium text-green-600 flex-shrink-0">
                  {Math.round(e.mastery_score * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weakest */}
        <div>
          <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">
            Needs Work
          </h3>
          <div className="space-y-2">
            {bottom3.map((e) => (
              <div key={e.topic} className="flex items-center gap-2">
                <VelocityIcon v={e.velocity} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 truncate">{formatTopic(e.topic)}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-0.5 overflow-hidden">
                    <div
                      className="h-full bg-red-400 rounded-full"
                      style={{ width: `${e.mastery_score * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-medium text-red-500 flex-shrink-0">
                  {Math.round(e.mastery_score * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
