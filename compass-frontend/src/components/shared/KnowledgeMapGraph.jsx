import { useState, useEffect, useMemo } from 'react';
import dagre from 'dagre';
import { api } from '../../api/client';

// ─── Layout constants ────────────────────────────────────────────────────────
const NODE_W = 130;
const NODE_H = 50;
const PADDING = 40;

// Category → colour mapping (5 IB topic areas)
const CATEGORY_COLORS = {
  'Topic 1: Number and Algebra':       { fill: '#eff6ff', stroke: '#3b82f6', text: '#1e40af', bar: '#3b82f6' },
  'Topic 2: Functions':                 { fill: '#fef3c7', stroke: '#d97706', text: '#92400e', bar: '#d97706' },
  'Topic 3: Geometry and Trigonometry': { fill: '#f0fdf4', stroke: '#16a34a', text: '#15803d', bar: '#16a34a' },
  'Topic 4: Statistics and Probability':{ fill: '#fdf2f8', stroke: '#db2777', text: '#9d174d', bar: '#db2777' },
  'Topic 5: Calculus':                  { fill: '#faf5ff', stroke: '#9333ea', text: '#6b21a8', bar: '#9333ea' },
};
const DEFAULT_CAT_COLOR = { fill: '#f9fafb', stroke: '#6b7280', text: '#374151', bar: '#6b7280' };

// ─── Helpers ─────────────────────────────────────────────────────────────────
function masteryStyle(mastery) {
  if (mastery == null) return { fill: '#f9fafb', stroke: '#d1d5db', text: '#9ca3af', bar: '#e5e7eb' };
  if (mastery >= 0.7)  return { fill: '#f0fdf4', stroke: '#16a34a', text: '#15803d', bar: '#16a34a' };
  if (mastery >= 0.4)  return { fill: '#fefce8', stroke: '#ca8a04', text: '#92400e', bar: '#f59e0b' };
                       return { fill: '#fef2f2', stroke: '#dc2626', text: '#991b1b', bar: '#ef4444' };
}
function velIcon(v)  { return v === 'improving' ? '↑' : v === 'regressing' ? '↓' : '→'; }
function velColor(v) { return v === 'improving' ? '#16a34a' : v === 'regressing' ? '#dc2626' : '#9ca3af'; }

function splitLabel(name) {
  if (name.length <= 14) return [name, ''];
  const mid = Math.ceil(name.length / 2);
  let best = mid;
  for (let d = 0; d < mid; d++) {
    if (name[mid - d] === ' ') { best = mid - d; break; }
    if (name[mid + d] === ' ') { best = mid + d; break; }
  }
  if (name[best] !== ' ') return [name, ''];
  return [name.slice(0, best), name.slice(best + 1)];
}

function edgePath(src, tgt) {
  const x1 = src.x, y1 = src.y + NODE_H / 2;
  const x2 = tgt.x, y2 = tgt.y - NODE_H / 2;
  const mid = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${mid} ${x2} ${mid} ${x2} ${y2}`;
}

// ─── Use dagre to compute layout from API graph ─────────────────────────────
function layoutGraph(graphData) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: 30, ranksep: 70, marginx: PADDING, marginy: PADDING });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of graphData.nodes) {
    g.setNode(node.id, { width: NODE_W, height: NODE_H });
  }
  for (const edge of graphData.edges) {
    g.setEdge(edge.from, edge.to);
  }
  dagre.layout(g);

  const laid = {};
  for (const node of graphData.nodes) {
    const pos = g.node(node.id);
    if (!pos) continue; // dagre failed to place this node — skip it
    laid[node.id] = { ...node, x: pos.x, y: pos.y, label: splitLabel(node.name) };
  }

  const dims = g.graph();
  return { nodes: laid, width: (dims.width || 900) + PADDING, height: (dims.height || 500) + PADDING };
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function Node({ topic, mastery, velocity, selected, categoryColor, onClick }) {
  const s = mastery != null ? masteryStyle(mastery) : categoryColor;
  const lx = topic.x - NODE_W / 2;
  const ly = topic.y - NODE_H / 2;
  const pct = mastery != null ? Math.round(mastery * 100) : null;
  const [line1, line2] = topic.label;

  return (
    <g
      transform={`translate(${lx},${ly})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <rect x={2} y={2} width={NODE_W} height={NODE_H} rx={9} fill="rgba(0,0,0,0.06)" />
      <rect
        width={NODE_W} height={NODE_H} rx={9}
        fill={s.fill} stroke={selected ? '#6366f1' : s.stroke}
        strokeWidth={selected ? 2.5 : 1.5}
      />
      {/* Category color indicator bar at top */}
      <rect x={0} y={0} width={NODE_W} height={4} rx={2} fill={categoryColor.bar} opacity={0.6} />
      {mastery != null && (
        <>
          <rect x={8} y={NODE_H - 6} width={NODE_W - 16} height={3} rx={1.5} fill="#e5e7eb" />
          <rect x={8} y={NODE_H - 6} width={Math.max(0, (NODE_W - 16) * mastery)} height={3} rx={1.5} fill={s.bar} />
        </>
      )}
      <text x={NODE_W / 2} y={17} textAnchor="middle" fontSize={9} fontWeight="700" fill={s.text} fontFamily="system-ui, sans-serif">
        {line1}
      </text>
      {line2 && (
        <text x={NODE_W / 2} y={28} textAnchor="middle" fontSize={9} fontWeight="700" fill={s.text} fontFamily="system-ui, sans-serif">
          {line2}
        </text>
      )}
      <text x={NODE_W / 2} y={line2 ? 41 : 34} textAnchor="middle" fontSize={10} fontWeight="800" fill={s.text} fontFamily="system-ui, sans-serif">
        {pct != null ? `${pct}%` : '—'}
      </text>
      {velocity && (
        <text x={NODE_W - 8} y={16} textAnchor="middle" fontSize={12} fill={velColor(velocity)} fontFamily="system-ui, sans-serif">
          {velIcon(velocity)}
        </text>
      )}
    </g>
  );
}

function Legend({ categories }) {
  const masteryItems = [
    { color: '#16a34a', fill: '#f0fdf4', label: '≥70% Mastered' },
    { color: '#ca8a04', fill: '#fefce8', label: '40–70% Developing' },
    { color: '#dc2626', fill: '#fef2f2', label: '<40% Needs Work' },
    { color: '#d1d5db', fill: '#f9fafb', label: 'No data yet' },
  ];
  return (
    <div className="mt-2 px-1 space-y-1.5">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {masteryItems.map(it => (
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
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {categories.map(cat => {
          const c = CATEGORY_COLORS[cat] || DEFAULT_CAT_COLOR;
          return (
            <div key={cat} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-1.5 rounded-sm inline-block" style={{ background: c.bar }} />
              {cat}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function KnowledgeMapGraph({ knowledgeMap = {} }) {
  const [selectedId, setSelectedId] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [fetchError, setFetchError] = useState(false);

  // Fetch graph structure from API
  useEffect(() => {
    let cancelled = false;
    api.getTopicGraph()
      .then(data => { if (!cancelled) setGraphData(data); })
      .catch(() => { if (!cancelled) setFetchError(true); });
    return () => { cancelled = true; };
  }, []);

  // Compute layout with dagre
  const layout = useMemo(() => {
    if (!graphData) return null;
    return layoutGraph(graphData);
  }, [graphData]);

  if (fetchError) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-red-500">
        <span>⚠</span> Could not load topic graph — using offline data.
      </div>
    );
  }
  if (!layout) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400" />
        <span className="ml-2 text-sm text-gray-400">Loading knowledge map…</span>
      </div>
    );
  }

  const { nodes: topicMap, width: svgW, height: svgH } = layout;
  const topics = Object.values(topicMap);
  const edges = graphData.edges;

  const selected = selectedId ? topicMap[selectedId] : null;
  const selData  = selectedId ? knowledgeMap[selectedId] : null;

  const prereqIds  = selected ? edges.filter(e => e.to   === selectedId).map(e => e.from) : [];
  const dependsIds = selected ? edges.filter(e => e.from === selectedId).map(e => e.to)   : [];

  const categories = [...new Set(topics.map(t => t.category).filter(Boolean))];

  function handleClick(id) {
    setSelectedId(prev => prev === id ? null : id);
  }

  return (
    <div className="select-none">
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          style={{ width: '100%', minWidth: 580, height: 'auto' }}
          aria-label="Topic prerequisite graph"
        >
          <defs>
            <marker id="km-arrow" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
              <polygon points="0 0, 7 2.5, 0 5" fill="#cbd5e1" />
            </marker>
            <marker id="km-arrow-hi" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
              <polygon points="0 0, 7 2.5, 0 5" fill="#6366f1" />
            </marker>
          </defs>

          {edges.map((e, i) => {
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
                markerEnd={isHighlit ? 'url(#km-arrow-hi)' : 'url(#km-arrow)'}
                opacity={selected && !isHighlit ? 0.25 : 1}
              />
            );
          })}

          {topics.map(t => {
            const data = knowledgeMap[t.id];
            const catColor = CATEGORY_COLORS[t.category] || DEFAULT_CAT_COLOR;
            return (
              <Node
                key={t.id}
                topic={t}
                mastery={data?.mastery_score ?? null}
                velocity={data?.velocity ?? null}
                selected={t.id === selectedId}
                categoryColor={catColor}
                onClick={() => handleClick(t.id)}
              />
            );
          })}
        </svg>
      </div>

      <Legend categories={categories} />

      {selected && (
        <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-gray-900">{selected.name}</h3>
              {selected.category && (
                <p className="text-xs text-indigo-500 mt-0.5">{selected.category}</p>
              )}
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

          {selected.subtopics && selected.subtopics.length > 0 && (
            <p className="text-xs text-gray-600 mb-2">
              <span className="font-semibold">Subtopics:</span> {selected.subtopics.join(', ')}
            </p>
          )}

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
                        {weak ? '⚠️' : '✓'} {t?.name || id}
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
                        → {t?.name || id}
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
