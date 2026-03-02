import { formatTopicName } from '../../utils/topicNames';

export default function ClassSummary({ students }) {
  const total = students.length;
  const avgMastery = total
    ? Math.round((students.reduce((s, st) => s + st.overall_mastery, 0) / total) * 100)
    : 0;
  const needsAttention = students.filter(s => s.overall_mastery < 0.5).length;
  const allWeakTopics = students.flatMap(s => {
    if (!s.topic_masteries?.length) return [];
    const weakest = [...s.topic_masteries].sort((a, b) => a.mastery_score - b.mastery_score)[0];
    return weakest ? [weakest.topic] : [];
  });
  const mostCommon = allWeakTopics.length
    ? Object.entries(
        allWeakTopics.reduce((acc, t) => ({ ...acc, [t]: (acc[t] || 0) + 1 }), {})
      ).sort((a, b) => b[1] - a[1])[0]?.[0]
    : '—';

  const cards = [
    { label: 'Total Students', value: total, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: 'Average Mastery', value: `${avgMastery}%`, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    { label: 'Needs Attention', value: needsAttention, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'Most Common Weak Topic', value: mostCommon !== '—' ? formatTopicName(mostCommon) : '—', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', small: true },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map(c => (
        <div key={c.label} className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{c.label}</p>
          <p className={`mt-1 font-bold ${c.color} ${c.small ? 'text-sm mt-2' : 'text-3xl'}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
