import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

const formatTopic = (t) =>
  t
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const COLORS = {
  improving: '#4ade80',
  plateauing: '#9ca3af',
  regressing: '#f87171',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-md px-3 py-2 text-xs">
        <p className="font-semibold text-gray-800 mb-0.5">{formatTopic(d.topic)}</p>
        <p className="text-gray-500">
          Trend:{' '}
          <span
            className={
              d.velocity === 'improving'
                ? 'text-green-600'
                : d.velocity === 'regressing'
                ? 'text-red-500'
                : 'text-gray-500'
            }
          >
            {d.velocity}
          </span>
        </p>
        <p className="text-gray-500">
          Change:{' '}
          <span className={d.mastery_change >= 0 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
            {d.mastery_change >= 0 ? '+' : ''}
            {Math.round(d.mastery_change * 100)}%
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomLabel = ({ x, y, width, value, entry }) => {
  const label = `${entry.mastery_change >= 0 ? '+' : ''}${Math.round(entry.mastery_change * 100)}%`;
  return (
    <text
      x={x + width + 6}
      y={y + 10}
      fill={entry.mastery_change >= 0 ? '#16a34a' : '#dc2626'}
      fontSize={11}
      fontWeight={600}
    >
      {label}
    </text>
  );
};

export default function VelocityChart({ velocity }) {
  if (!velocity || velocity.length === 0) return null;

  const data = velocity.map((v) => ({
    ...v,
    displayTopic: formatTopic(v.topic),
    absChange: Math.abs(v.mastery_change * 100),
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-1">Learning Velocity</h2>
      <p className="text-xs text-gray-400 mb-4">Mastery change per topic over recent sessions</p>

      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
        {['improving', 'plateauing', 'regressing'].map((v) => (
          <span key={v} className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded"
              style={{ background: COLORS[v] }}
            />
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={data.length * 44}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
          barSize={14}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="displayTopic"
            width={160}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
          <Bar dataKey="absChange" radius={[0, 6, 6, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[entry.velocity] || '#9ca3af'} />
            ))}
            <LabelList content={<CustomLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
