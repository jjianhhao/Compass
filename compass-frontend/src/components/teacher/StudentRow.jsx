import { useNavigate } from 'react-router-dom';

function MasteryBar({ score }) {
  const pct = Math.round(score * 100);
  const color = score >= 0.7 ? 'bg-green-500' : score >= 0.4 ? 'bg-amber-400' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-semibold ${score >= 0.7 ? 'text-green-700' : score >= 0.4 ? 'text-amber-700' : 'text-red-700'}`}>
        {pct}%
      </span>
    </div>
  );
}

function VelocityIcon({ velocity }) {
  if (velocity === 'improving') return <span className="text-green-600 font-bold text-base" title="Improving">↑</span>;
  if (velocity === 'regressing') return <span className="text-red-500 font-bold text-base" title="Regressing">↓</span>;
  return <span className="text-gray-400 font-bold text-base" title="Plateauing">→</span>;
}

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${mins}m ago`;
}

function StatusBadge({ status }) {
  const map = {
    pending: { label: 'Pending Review', cls: 'bg-amber-100 text-amber-800' },
    approved: { label: 'Approved', cls: 'bg-green-100 text-green-700' },
    none: { label: 'No Action Needed', cls: 'bg-gray-100 text-gray-600' },
  };
  const { label, cls } = map[status] || map.none;
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>;
}

export default function StudentRow({ student, recStatus = 'pending' }) {
  const navigate = useNavigate();

  const weakest = student.topic_masteries
    ? [...student.topic_masteries].sort((a, b) => a.mastery_score - b.mastery_score)[0]
    : null;

  const overallVelocity = student.topic_masteries
    ? (() => {
        const counts = { improving: 0, regressing: 0, plateauing: 0 };
        student.topic_masteries.forEach(t => counts[t.velocity]++);
        if (counts.regressing > counts.improving) return 'regressing';
        if (counts.improving > counts.regressing) return 'improving';
        return 'plateauing';
      })()
    : 'plateauing';

  const isAlert = student.overall_mastery < 0.3 ||
    (student.last_active && (Date.now() - new Date(student.last_active).getTime()) > 14 * 86400000);

  return (
    <tr
      onClick={() => navigate(`/teacher/${student.student_id}`)}
      className={`cursor-pointer hover:bg-blue-50 transition-colors ${isAlert ? 'bg-red-50' : ''}`}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {isAlert && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Needs attention" />}
          <span className="font-medium text-gray-900">{student.student_name}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <MasteryBar score={student.overall_mastery} />
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">
        {weakest ? (
          <span>
            {weakest.topic}{' '}
            <span className="text-gray-400">({Math.round(weakest.mastery_score * 100)}%)</span>
          </span>
        ) : '—'}
      </td>
      <td className="px-4 py-3">
        <VelocityIcon velocity={overallVelocity} />
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {student.last_active ? timeAgo(student.last_active) : '—'}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={recStatus} />
      </td>
    </tr>
  );
}
