import { useState } from 'react';

// ─── Layout ──────────────────────────────────────────────────────────────────
const NODE_W = 122;
const NODE_H = 48;
const SVG_W  = 940;
const SVG_H  = 490;

// Fixed positions (cx = horizontal centre, y = top of rect) for the A-Math graph
const TOPICS = [
  // Layer 0 — foundation
  { id: 'algebraic_manipulation',      label: ['Algebraic', 'Manipulation'],     cx: 470, y: 16,  subtopics: ['Expansion', 'Factorisation', 'Algebraic fractions'] },
  // Layer 1
  { id: 'quadratic_equations',         label: ['Quadratic', 'Equations'],        cx: 140, y: 115, subtopics: ['Factorisation', 'Completing the square', 'Quadratic formula', 'Discriminant'] },
  { id: 'indices_and_logarithms',      label: ['Indices &', 'Logarithms'],       cx: 340, y: 115, subtopics: ['Laws of indices', 'Laws of logs', 'Exponential equations', 'Change of base'] },
  { id: 'trigonometric_functions',     label: ['Trig', 'Functions'],             cx: 570, y: 115, subtopics: ['Six trig ratios', 'Graphs', 'Trig equations', 'Basic identities'] },
  { id: 'surds',                       label: ['Surds', ''],                     cx: 780, y: 115, subtopics: ['Simplification', 'Rationalisation', 'Operations with surds'] },
  // Layer 2
  { id: 'polynomials',                 label: ['Polynomials', '& Part. Frac.'],  cx:  90, y: 222, subtopics: ['Remainder theorem', 'Factor theorem', 'Partial fractions'] },
  { id: 'binomial_theorem',            label: ['Binomial', 'Theorem'],           cx: 270, y: 222, subtopics: ['Expansion of (a+b)^n', 'General term', 'Applications'] },
  { id: 'coordinate_geometry',         label: ['Coordinate', 'Geometry'],        cx: 460, y: 222, subtopics: ['Distance & midpoint', 'Gradient', 'Equation of line', 'Parallel & perpendicular'] },
  { id: 'trigonometric_identities',    label: ['Trig', 'Identities'],            cx: 650, y: 222, subtopics: ['Addition formulae', 'Double angle', 'R-formula', 'Proving identities'] },
  { id: 'differentiation',             label: ['Differentiation', ''],           cx: 840, y: 222, subtopics: ['Power rule', 'Chain rule', 'Product rule', 'Quotient rule', 'Tangent & normal'] },
  // Layer 3
  { id: 'applications_of_differentiation', label: ['Applications', 'of Diff.'], cx: 185, y: 335, subtopics: ['Stationary points', 'Rate of change', 'Optimisation'] },
  { id: 'integration',                 label: ['Integration', ''],               cx: 390, y: 335, subtopics: ['Definite integrals', 'Area under curve', 'Area between curves'] },
  { id: 'linear_law',                  label: ['Linear', 'Law'],                 cx: 590, y: 335, subtopics: ['Reducing to linear form', 'Y–X graphs', 'Estimating values'] },
  { id: 'proofs_in_plane_geometry',    label: ['Plane', 'Geometry'],             cx: 800, y: 335, subtopics: ['Circle properties', 'Tangent-chord angle', 'Alternate segment'] },
  // Layer 4
  { id: 'kinematics',                  label: ['Kinematics', ''],               cx: 287, y: 432, subtopics: ['Displacement', 'Velocity', 'Acceleration', 'v-t graphs'] },
];

// Direct prerequisite edges from topics.json
const EDGES = [
  { from: 'algebraic_manipulation', to: 'quadratic_equations' },
  { from: 'algebraic_manipulation', to: 'indices_and_logarithms' },
  { from: 'algebraic_manipulation', to: 'trigonometric_functions' },
  { from: 'algebraic_manipulation', to: 'surds' },
  { from: 'algebraic_manipulation', to: 'polynomials' },
  { from: 'quadratic_equations',    to: 'polynomials' },
  { from: 'algebraic_manipulation', to: 'binomial_theorem' },
  { from: 'indices_and_logarithms', to: 'binomial_theorem' },
  { from: 'algebraic_manipulation', to: 'coordinate_geometry' },
  { from: 'quadratic_equations',    to: 'coordinate_geometry' },
  { from: 'algebraic_manipulation', to: 'trigonometric_identities' },
  { from: 'trigonometric_functions','to': 'trigonometric_identities' },
  { from: 'algebraic_manipulation', to: 'differentiation' },
  { from: 'indices_and_logarithms', to: 'differentiation' },
  { from: 'trigonometric_functions','to': 'differentiation' },
  { from: 'differentiation',        to: 'applications_of_differentiation' },
  { from: 'coordinate_geometry',    to: 'applications_of_differentiation' },
  { from: 'algebraic_manipulation', to: 'integration' },
  { from: 'differentiation',        to: 'integration' },
  { from: 'coordinate_geometry',    to: 'linear_law' },
  { from: 'indices_and_logarithms', to: 'linear_law' },
  { from: 'trigonometric_functions','to': 'proofs_in_plane_geometry' },
  { from: 'coordinate_geometry',    to: 'proofs_in_plane_geometry' },
  { from: 'differentiation',        to: 'kinematics' },
  { from: 'integration',            to: 'kinematics' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function masteryStyle(mastery) {
  if (mastery == null) return { fill: '#f9fafb', stroke: '#d1d5db', text: '#9ca3af', bar: '#e5e7eb' };
  if (mastery >= 0.7)  return { fill: '#f0fdf4', stroke: '#16a34a', text: '#15803d', bar: '#16a34a' };
  if (mastery >= 0.4)  return { fill: '#fefce8', stroke: '#ca8a04', text: '#92400e', bar: '#f59e0b' };
                       return { fill: '#fef2f2', stroke: '#dc2626', text: '#991b1b', bar: '#ef4444' };
}
function velIcon(v)  { return v === 'improving' ? '↑' : v === 'regressing' ? '↓' : '→'; }
function velColor(v) { return v === 'improving' ? '#16a34a' : v === 'regressing' ? '#dc2626' : '#9ca3af'; }

function edgePath(src, tgt) {
  const x1 = src.cx, y1 = src.y + NODE_H;
  const x2 = tgt.cx, y2 = tgt.y;
  const mid = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${mid} ${x2} ${mid} ${x2} ${y2}`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function Node({ topic, mastery, velocity, selected, onClick }) {
  const s  = masteryStyle(mastery);
  const lx = topic.cx - NODE_W / 2;
  const pct = mastery != null ? Math.round(mastery * 100) : null;
  const [line1, line2] = topic.label;

  return (
    <g
      transform={`translate(${lx},${topic.y})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Shadow */}
      <rect x={2} y={2} width={NODE_W} height={NODE_H} rx={9} fill="rgba(0,0,0,0.06)" />
      {/* Main rect */}
      <rect
        width={NODE_W} height={NODE_H} rx={9}
        fill={s.fill} stroke={selected ? '#6366f1' : s.stroke}
        strokeWidth={selected ? 2.5 : 1.5}
      />
      {/* Mastery bar at bottom */}
      {mastery != null && (
        <>
          <rect x={8} y={NODE_H - 6} width={NODE_W - 16} height={3} rx={1.5} fill="#e5e7eb" />
          <rect x={8} y={NODE_H - 6} width={Math.max(0, (NODE_W - 16) * mastery)} height={3} rx={1.5} fill={s.bar} />
        </>
      )}
      {/* Topic name lines */}
      <text x={NODE_W / 2} y={15} textAnchor="middle" fontSize={9.5} fontWeight="700" fill={s.text} fontFamily="system-ui, sans-serif">
        {line1}
      </text>
      {line2 && (
        <text x={NODE_W / 2} y={26} textAnchor="middle" fontSize={9.5} fontWeight="700" fill={s.text} fontFamily="system-ui, sans-serif">
          {line2}
        </text>
      )}
      {/* Mastery % */}
      <text x={NODE_W / 2} y={line2 ? 39 : 32} textAnchor="middle" fontSize={10} fontWeight="800" fill={s.text} fontFamily="system-ui, sans-serif">
        {pct != null ? `${pct}%` : '—'}
      </text>
      {/* Velocity icon */}
      {velocity && (
        <text x={NODE_W - 8} y={14} textAnchor="middle" fontSize={12} fill={velColor(velocity)} fontFamily="system-ui, sans-serif">
          {velIcon(velocity)}
        </text>
      )}
    </g>
  );
}

function Legend() {
  const items = [
    { color: '#16a34a', fill: '#f0fdf4', label: '≥70% Mastered' },
    { color: '#ca8a04', fill: '#fefce8', label: '40–70% Developing' },
    { color: '#dc2626', fill: '#fef2f2', label: '<40% Needs Work' },
    { color: '#d1d5db', fill: '#f9fafb', label: 'No data yet' },
  ];
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 px-1">
      {items.map(it => (
        <div key={it.label} className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-sm border inline-block" style={{ background: it.fill, borderColor: it.color }} />
          {it.label}
        </div>
      ))}
      <div className="flex items-center gap-2 ml-2 text-xs text-gray-500">
        <span className="text-green-600 font-bold">↑</span> Improving
        <span className="text-red-500 font-bold">↓</span> Regressing
        <span className="text-gray-400 font-bold">→</span> Plateauing
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function KnowledgeMapGraph({ knowledgeMap = {} }) {
  const [selectedId, setSelectedId] = useState(null);

  const topicMap = Object.fromEntries(TOPICS.map(t => [t.id, t]));
  const selected = selectedId ? topicMap[selectedId] : null;
  const selData  = selectedId ? knowledgeMap[selectedId] : null;

  // Prerequisites and dependents for the selected topic
  const prereqIds  = selected ? EDGES.filter(e => e.to   === selectedId).map(e => e.from) : [];
  const dependsIds = selected ? EDGES.filter(e => e.from === selectedId).map(e => e.to)   : [];

  function handleClick(id) {
    setSelectedId(prev => prev === id ? null : id);
  }

  return (
    <div className="select-none">
      {/* SVG graph */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ width: '100%', minWidth: 580, height: 'auto' }}
          aria-label="A-Math topic prerequisite graph"
        >
          <defs>
            <marker id="km-arrow" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
              <polygon points="0 0, 7 2.5, 0 5" fill="#cbd5e1" />
            </marker>
            <marker id="km-arrow-hi" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
              <polygon points="0 0, 7 2.5, 0 5" fill="#6366f1" />
            </marker>
          </defs>

          {/* Edges — drawn behind nodes */}
          {EDGES.map((e, i) => {
            const src = topicMap[e.from];
            const tgt = topicMap[e.to];
            if (!src || !tgt) return null;
            const isHighlit = selected && (e.from === selectedId || e.to === selectedId);
            return (
              <path
                key={i}
                d={edgePath(src, tgt)}
                fill="none"
                stroke={isHighlit ? '#6366f1' : '#cbd5e1'}
                strokeWidth={isHighlit ? 2 : 1.2}
                strokeDasharray={isHighlit ? undefined : undefined}
                markerEnd={isHighlit ? 'url(#km-arrow-hi)' : 'url(#km-arrow)'}
                opacity={selected && !isHighlit ? 0.25 : 1}
              />
            );
          })}

          {/* Nodes */}
          {TOPICS.map(t => {
            const data = knowledgeMap[t.id];
            return (
              <Node
                key={t.id}
                topic={t}
                mastery={data?.mastery_score ?? null}
                velocity={data?.velocity ?? null}
                selected={t.id === selectedId}
                onClick={() => handleClick(t.id)}
              />
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <Legend />

      {/* Info panel for selected topic */}
      {selected && (
        <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-gray-900">{selected.label.filter(Boolean).join(' ')}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {selData
                  ? `${Math.round(selData.mastery_score * 100)}% mastery · ${selData.attempt_count ?? 0} attempts · ${selData.velocity ?? 'plateauing'}`
                  : 'No quiz data yet for this topic'}
              </p>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none ml-4"
            >✕</button>
          </div>

          <p className="text-xs text-gray-600 mb-2">
            <span className="font-semibold">Subtopics:</span> {selected.subtopics.join(', ')}
          </p>

          <div className="flex gap-6 text-xs">
            {prereqIds.length > 0 && (
              <div>
                <p className="font-semibold text-gray-700 mb-1">Prerequisites</p>
                <ul className="space-y-0.5">
                  {prereqIds.map(id => {
                    const d = knowledgeMap[id];
                    const t = topicMap[id];
                    const pct = d ? Math.round(d.mastery_score * 100) : null;
                    const weak = d && d.mastery_score < 0.5;
                    return (
                      <li key={id} className={`flex items-center gap-1 ${weak ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                        {weak ? '⚠️' : '✓'} {t?.label.filter(Boolean).join(' ')}
                        {pct != null && <span className="text-gray-400">({pct}%)</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {dependsIds.length > 0 && (
              <div>
                <p className="font-semibold text-gray-700 mb-1">Unlocks</p>
                <ul className="space-y-0.5">
                  {dependsIds.map(id => {
                    const t = topicMap[id];
                    return (
                      <li key={id} className="text-gray-600 flex items-center gap-1">
                        → {t?.label.filter(Boolean).join(' ')}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      {!selected && (
        <p className="text-xs text-gray-400 mt-2 px-1">Click any topic node to see details, prerequisites, and what it unlocks.</p>
      )}
    </div>
  );
}
