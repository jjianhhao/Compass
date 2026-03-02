import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '../../api/client';

// ─── Fallback A-Math graph ────────────────────────────────────────────────────
const FALLBACK_NODES = [
  { id: 'algebraic_manipulation',          name: 'Algebraic Manipulation',  subtopics: ['Expansion', 'Factorisation', 'Algebraic fractions'] },
  { id: 'quadratic_equations',             name: 'Quadratic Equations',     subtopics: ['Factorisation', 'Completing the square', 'Quadratic formula', 'Discriminant'] },
  { id: 'surds',                           name: 'Surds',                   subtopics: ['Simplification', 'Rationalisation', 'Operations with surds'] },
  { id: 'indices_and_logarithms',          name: 'Indices & Logarithms',    subtopics: ['Laws of indices', 'Laws of logs', 'Exponential equations'] },
  { id: 'trigonometric_functions',         name: 'Trig Functions',          subtopics: ['Six trig ratios', 'Graphs', 'Trig equations'] },
  { id: 'polynomials',                     name: 'Polynomials',             subtopics: ['Remainder theorem', 'Factor theorem', 'Partial fractions'] },
  { id: 'binomial_theorem',                name: 'Binomial Theorem',        subtopics: ['Expansion of (a+b)^n', 'General term'] },
  { id: 'coordinate_geometry',             name: 'Coordinate Geometry',     subtopics: ['Distance & midpoint', 'Gradient', 'Equation of line'] },
  { id: 'trigonometric_identities',        name: 'Trig Identities',         subtopics: ['Addition formulae', 'Double angle', 'R-formula'] },
  { id: 'differentiation',                 name: 'Differentiation',         subtopics: ['Power rule', 'Chain rule', 'Product rule', 'Quotient rule'] },
  { id: 'applications_of_differentiation', name: 'Applications of Diff.',   subtopics: ['Stationary points', 'Rate of change', 'Optimisation'] },
  { id: 'integration',                     name: 'Integration',             subtopics: ['Definite integrals', 'Area under curve'] },
  { id: 'linear_law',                      name: 'Linear Law',              subtopics: ['Reducing to linear form', 'Y–X graphs'] },
  { id: 'proofs_in_plane_geometry',        name: 'Plane Geometry',          subtopics: ['Circle properties', 'Tangent-chord angle'] },
  { id: 'kinematics',                      name: 'Kinematics',              subtopics: ['Displacement', 'Velocity', 'Acceleration'] },
];
const FALLBACK_EDGES = [
  { from: 'algebraic_manipulation', to: 'quadratic_equations' },
  { from: 'algebraic_manipulation', to: 'surds' },
  { from: 'algebraic_manipulation', to: 'indices_and_logarithms' },
  { from: 'algebraic_manipulation', to: 'trigonometric_functions' },
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

const STAGE_NAMES = ['Foundation', 'Building Blocks', 'Core Topics', 'Advanced', 'Applied'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function computeLevels(nodes, edges) {
  const inDeg = Object.fromEntries(nodes.map(n => [n.id, 0]));
  for (const e of edges) { if (inDeg[e.to] !== undefined) inDeg[e.to]++; }
  const level = {};
  const queue = nodes.filter(n => inDeg[n.id] === 0).map(n => ({ id: n.id, lvl: 0 }));
  while (queue.length) {
    const { id, lvl } = queue.shift();
    if (level[id] !== undefined && level[id] >= lvl) continue;
    level[id] = lvl;
    edges.filter(e => e.from === id).forEach(e => queue.push({ id: e.to, lvl: lvl + 1 }));
  }
  nodes.forEach(n => { if (level[n.id] === undefined) level[n.id] = 0; });
  return level;
}

function dotColor(mastery) {
  if (mastery == null) return '#d1d5db';
  if (mastery >= 0.7)  return '#22c55e';
  if (mastery >= 0.4)  return '#f59e0b';
  return '#ef4444';
}
function cardTheme(mastery) {
  if (mastery == null) return { bg: '#f9fafb', border: '#e5e7eb', text: '#6b7280', bar: '#e5e7eb' };
  if (mastery >= 0.7)  return { bg: '#f0fdf4', border: '#86efac', text: '#15803d', bar: '#22c55e' };
  if (mastery >= 0.4)  return { bg: '#fefce8', border: '#fde68a', text: '#92400e', bar: '#f59e0b' };
                       return { bg: '#fef2f2', border: '#fca5a5', text: '#b91c1c', bar: '#ef4444' };
}
function VelBadge({ v }) {
  if (v === 'improving')  return <span className="font-bold text-green-600">↑</span>;
  if (v === 'regressing') return <span className="font-bold text-red-500">↓</span>;
  if (v === 'plateauing') return <span className="font-bold text-gray-400">→</span>;
  return null;
}

// ─── Compact topic card (shown when stage is expanded) ────────────────────────
function TopicCard({ topic, data, selected, highlighted, dimmed, onClick }) {
  const mastery = data?.mastery_score ?? null;
  const th = cardTheme(mastery);
  const pct = mastery != null ? Math.round(mastery * 100) : null;

  return (
    <button
      onClick={onClick}
      style={{
        background: selected ? '#eef2ff' : th.bg,
        borderColor: selected ? '#6366f1' : th.border,
        opacity: dimmed ? 0.3 : 1,
        outline: highlighted ? '2px solid #a5b4fc' : 'none',
        outlineOffset: 1,
        flex: '1 1 110px',
        minWidth: 100,
        maxWidth: 150,
      }}
      className="text-left rounded-lg p-2.5 border transition-all hover:shadow-sm"
    >
      <div className="flex items-center gap-1 mb-1">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColor(mastery) }} />
        <span className="text-xs font-bold tabular-nums" style={{ color: th.text }}>
          {pct != null ? `${pct}%` : '—'}
        </span>
        {data?.velocity && <span className="text-xs"><VelBadge v={data.velocity} /></span>}
      </div>
      <p className="text-[11px] font-semibold text-gray-700 leading-tight">{topic.name}</p>
      <div className="mt-1.5 h-0.5 rounded-full bg-gray-200">
        {mastery != null && (
          <div className="h-0.5 rounded-full" style={{ width: `${mastery * 100}%`, background: th.bar }} />
        )}
      </div>
    </button>
  );
}

// ─── Collapsed stage summary row ──────────────────────────────────────────────
function StageSummary({ name, topics, knowledgeMap, expanded, onToggle }) {
  const mastered   = topics.filter(t => (knowledgeMap[t.id]?.mastery_score ?? -1) >= 0.7).length;
  const needsWork  = topics.filter(t => { const m = knowledgeMap[t.id]?.mastery_score; return m != null && m < 0.4; }).length;
  const noData     = topics.filter(t => knowledgeMap[t.id] == null).length;

  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 py-1.5 hover:bg-gray-50 rounded-lg px-1 transition-colors group"
    >
      {/* Chevron */}
      <span className="text-gray-400 group-hover:text-gray-600 flex-shrink-0">
        {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
      </span>

      {/* Stage name */}
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest w-28 text-left flex-shrink-0">
        {name}
      </span>

      {/* Mini dot strip — one dot per topic */}
      <div className="flex gap-1 items-center flex-shrink-0">
        {topics.map(t => (
          <span
            key={t.id}
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: dotColor(knowledgeMap[t.id]?.mastery_score ?? null) }}
            title={t.name}
          />
        ))}
      </div>

      {/* Stats pill */}
      <div className="flex items-center gap-2 text-[10px] ml-1">
        {mastered > 0  && <span className="text-green-600 font-semibold">{mastered} mastered</span>}
        {needsWork > 0 && <span className="text-red-500 font-semibold">{needsWork} needs work</span>}
        {noData === topics.length && <span className="text-gray-400">not started</span>}
      </div>

      <span className="ml-auto text-[10px] text-gray-300 group-hover:text-gray-400">{topics.length} topics</span>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function KnowledgeMapGraph({ knowledgeMap = {} }) {
  const [selectedId, setSelectedId]   = useState(null);
  const [expandedSet, setExpandedSet] = useState(new Set());
  const [graphData, setGraphData]     = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.getTopicGraph()
      .then(data => { if (!cancelled) { setGraphData(data); setLoading(false); } })
      .catch(() => { if (!cancelled) { setGraphData({ nodes: FALLBACK_NODES, edges: FALLBACK_EDGES }); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const { stages, nodeMap, edges } = useMemo(() => {
    if (!graphData) return { stages: [], nodeMap: {}, edges: [] };
    const levels = computeLevels(graphData.nodes, graphData.edges);
    const max = Math.max(...Object.values(levels), 0);
    const stageArr = Array.from({ length: max + 1 }, (_, i) =>
      graphData.nodes.filter(n => levels[n.id] === i)
    );
    return {
      stages: stageArr,
      nodeMap: Object.fromEntries(graphData.nodes.map(n => [n.id, n])),
      edges: graphData.edges,
    };
  }, [graphData]);

  function toggleStage(idx) {
    setExpandedSet(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-gray-400">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400" />
        Loading…
      </div>
    );
  }

  const selected   = selectedId ? nodeMap[selectedId] : null;
  const selData    = selectedId ? knowledgeMap[selectedId] : null;
  const prereqIds  = selected ? edges.filter(e => e.to   === selectedId).map(e => e.from) : [];
  const dependsIds = selected ? edges.filter(e => e.from === selectedId).map(e => e.to)   : [];
  const connectedSet = new Set([selectedId, ...prereqIds, ...dependsIds].filter(Boolean));

  return (
    <div className="space-y-0.5">
      {stages.map((topicsInStage, idx) => {
        const isExpanded = expandedSet.has(idx);
        return (
          <div key={idx}>
            <StageSummary
              name={STAGE_NAMES[idx] ?? `Stage ${idx + 1}`}
              topics={topicsInStage}
              knowledgeMap={knowledgeMap}
              expanded={isExpanded}
              onToggle={() => toggleStage(idx)}
            />

            {isExpanded && (
              <div className="flex flex-wrap gap-1.5 mt-1 mb-2 pl-8">
                {topicsInStage.map(topic => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    data={knowledgeMap[topic.id] ?? null}
                    selected={topic.id === selectedId}
                    highlighted={selectedId && connectedSet.has(topic.id) && topic.id !== selectedId}
                    dimmed={!!selectedId && !connectedSet.has(topic.id)}
                    onClick={() => setSelectedId(prev => prev === topic.id ? null : topic.id)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Detail panel */}
      {selected && (
        <div className="mt-2 bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-sm">
          <div className="flex items-start justify-between mb-1.5">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{selected.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {selData
                  ? `${Math.round(selData.mastery_score * 100)}% mastery · ${selData.attempt_count ?? 0} attempts · ${selData.velocity ?? 'plateauing'}`
                  : 'No quiz data yet'}
              </p>
            </div>
            <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600 ml-4">✕</button>
          </div>

          {selected.subtopics?.length > 0 && (
            <p className="text-xs text-gray-500 mb-2">
              <span className="font-semibold text-gray-600">Covers:</span> {selected.subtopics.join(', ')}
            </p>
          )}

          <div className="flex flex-wrap gap-4">
            {prereqIds.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Needs first</p>
                <div className="flex flex-wrap gap-1">
                  {prereqIds.map(id => {
                    const d = knowledgeMap[id];
                    const weak = d && d.mastery_score < 0.5;
                    const pct = d ? Math.round(d.mastery_score * 100) : null;
                    return (
                      <span key={id} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${weak ? 'bg-red-50 border-red-300 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                        {weak ? '⚠ ' : '✓ '}{nodeMap[id]?.name ?? id}{pct != null ? ` ${pct}%` : ''}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            {dependsIds.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Unlocks</p>
                <div className="flex flex-wrap gap-1">
                  {dependsIds.map(id => (
                    <span key={id} className="text-xs px-2 py-0.5 rounded-full border bg-indigo-50 border-indigo-200 text-indigo-700 font-medium">
                      → {nodeMap[id]?.name ?? id}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <p className="text-[10px] text-gray-400 pt-1">
        Click a stage to expand · Click a topic for details
      </p>
    </div>
  );
}
