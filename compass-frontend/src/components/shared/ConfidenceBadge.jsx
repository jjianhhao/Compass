export default function ConfidenceBadge({ level }) {
  const styles = {
    high: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-red-100 text-red-800 border-red-200',
  };

  const icons = { high: '🟢', medium: '🟡', low: '🔴' };

  const safeLevel = ['high', 'medium', 'low'].includes(level) ? level : 'medium';

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${styles[safeLevel]}`}>
      {icons[safeLevel]} {safeLevel} confidence
    </span>
  );
}
