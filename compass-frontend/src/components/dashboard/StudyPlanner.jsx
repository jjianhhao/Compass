import { useState, useMemo } from 'react';
import { Plus, Trash2, CalendarDays, Clock, BookOpen, ChevronDown, ChevronUp, Loader2, CheckCircle } from 'lucide-react';
import { saveExamResult, loadExamResults, deleteExamResult } from '../../api/localStore';
import { api } from '../../api/client';
import { formatTopicName } from '../../utils/topicNames';

const PRIORITY_STYLES = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high:     'bg-orange-100 text-orange-700 border-orange-200',
  medium:   'bg-blue-100 text-blue-700 border-blue-200',
  low:      'bg-gray-100 text-gray-600 border-gray-200',
};

// ─── Exam Result Logger ───────────────────────────────────────────────────────

function ExamLogger({ studentId, allTopics }) {
  const [results, setResults] = useState(() => loadExamResults(studentId));
  const [form, setForm] = useState({
    exam_name: '',
    date: '',
    score_pct: '',
    topics_tested: [],
    notes: '',
  });
  const [topicSearch, setTopicSearch] = useState('');
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const [error, setError] = useState('');

  const filteredTopics = allTopics.filter(
    t => formatTopicName(t).toLowerCase().includes(topicSearch.toLowerCase()) &&
         !form.topics_tested.includes(t)
  );

  const toggleTopic = (topic) => {
    setForm(f => ({
      ...f,
      topics_tested: f.topics_tested.includes(topic)
        ? f.topics_tested.filter(t => t !== topic)
        : [...f.topics_tested, topic],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.exam_name.trim()) return setError('Exam name is required.');
    if (!form.date) return setError('Date is required.');
    if (!form.score_pct || isNaN(Number(form.score_pct))) return setError('Enter a valid score.');
    if (form.topics_tested.length === 0) return setError('Select at least one topic.');
    setError('');

    const entry = {
      exam_name: form.exam_name.trim(),
      date: form.date,
      score_pct: Number(form.score_pct),
      topics_tested: form.topics_tested,
      notes: form.notes.trim() || null,
    };
    saveExamResult(studentId, entry);
    const updated = loadExamResults(studentId);
    setResults(updated);
    setForm({ exam_name: '', date: '', score_pct: '', topics_tested: [], notes: '' });
    setTopicSearch('');
  };

  const handleDelete = (id) => {
    deleteExamResult(studentId, id);
    setResults(loadExamResults(studentId));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-700">Past Exam Results</h2>
        <p className="text-xs text-gray-400 mt-0.5">Log your exam scores to improve AI recommendations</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Exam Name</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="e.g. Mid-year Exam"
              value={form.exam_name}
              onChange={e => setForm(f => ({ ...f, exam_name: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Date</label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Score (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="e.g. 72"
            value={form.score_pct}
            onChange={e => setForm(f => ({ ...f, score_pct: e.target.value }))}
          />
        </div>

        {/* Topic multi-select */}
        <div className="relative">
          <label className="text-xs font-medium text-gray-600 block mb-1">Topics Tested</label>
          <div
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm cursor-pointer focus-within:ring-2 focus-within:ring-indigo-300 min-h-[38px]"
            onClick={() => setShowTopicDropdown(v => !v)}
          >
            {form.topics_tested.length === 0 ? (
              <span className="text-gray-400">Select topics…</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {form.topics_tested.map(t => (
                  <span key={t} className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    {formatTopicName(t)}
                    <button type="button" onClick={e => { e.stopPropagation(); toggleTopic(t); }} className="hover:text-indigo-900">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          {showTopicDropdown && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              <div className="p-2 border-b border-gray-100">
                <input
                  className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  placeholder="Search topics…"
                  value={topicSearch}
                  onChange={e => setTopicSearch(e.target.value)}
                  onClick={e => e.stopPropagation()}
                />
              </div>
              {filteredTopics.length === 0 ? (
                <p className="text-xs text-gray-400 p-3 text-center">No more topics</p>
              ) : (
                filteredTopics.map(t => (
                  <button
                    key={t}
                    type="button"
                    className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 text-gray-700"
                    onClick={e => { e.stopPropagation(); toggleTopic(t); }}
                  >
                    {formatTopicName(t)}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Notes (optional)</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="e.g. Struggled with integration by parts"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <Plus size={14} /> Log Result
        </button>
      </form>

      {/* History */}
      {results.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">History</h3>
          {[...results].reverse().map(r => (
            <div key={r.id} className="border border-gray-100 rounded-xl p-3 flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-800">{r.exam_name}</span>
                  <span className={`text-xs font-bold ${r.score_pct >= 70 ? 'text-green-600' : r.score_pct >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                    {r.score_pct}%
                  </span>
                  <span className="text-xs text-gray-400">{r.date}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {r.topics_tested.map(t => (
                    <span key={t} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{formatTopicName(t)}</span>
                  ))}
                </div>
                {r.notes && <p className="text-xs text-gray-400 mt-1 italic">{r.notes}</p>}
              </div>
              <button onClick={() => handleDelete(r.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Study Plan Generator ─────────────────────────────────────────────────────

const PRIORITY_LABEL = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };

function StudyPlanGenerator({ studentId, knowledgeMap, allTopics }) {
  const weakTopics = useMemo(() =>
    Object.entries(knowledgeMap || {})
      .filter(([, d]) => d.mastery_score < 0.6)
      .sort((a, b) => a[1].mastery_score - b[1].mastery_score)
      .map(([t]) => t),
    [knowledgeMap]
  );

  const [form, setForm] = useState({
    deadline_name: '',
    deadline_date: '',
    mode: 'daily',         // 'daily' | 'weekly'
    study_hours_per_day: '2',
    study_days_per_week: '5',
    topics_to_cover: weakTopics.slice(0, 5),
  });
  const [topicSearch, setTopicSearch] = useState('');
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');
  const [reasoningExpanded, setReasoningExpanded] = useState(false);

  const filteredTopics = allTopics.filter(
    t => formatTopicName(t).toLowerCase().includes(topicSearch.toLowerCase()) &&
         !form.topics_to_cover.includes(t)
  );

  const toggleTopic = (topic) => {
    setForm(f => ({
      ...f,
      topics_to_cover: f.topics_to_cover.includes(topic)
        ? f.topics_to_cover.filter(t => t !== topic)
        : [...f.topics_to_cover, topic],
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.deadline_name.trim()) return setError('Deadline name is required.');
    if (!form.deadline_date) return setError('Deadline date is required.');
    if (form.topics_to_cover.length === 0) return setError('Select at least one topic.');
    setError('');
    setLoading(true);
    setPlan(null);

    const examResults = loadExamResults(studentId);
    const kmList = Object.entries(knowledgeMap || {}).map(([topic, d]) => ({
      topic,
      mastery_score: d.mastery_score,
      velocity: d.velocity,
    }));

    try {
      const result = await api.generateStudyPlan({
        student_id: studentId,
        knowledge_map: kmList,
        exam_results: examResults,
        deadline_name: form.deadline_name.trim(),
        deadline_date: form.deadline_date,
        study_hours_per_day: form.mode === 'daily' ? Number(form.study_hours_per_day) : null,
        study_days_per_week: form.mode === 'weekly' ? Number(form.study_days_per_week) : null,
        topics_to_cover: form.topics_to_cover,
      });
      setPlan(result);
    } catch (err) {
      setError(`Failed to generate plan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-700">AI Study Plan</h2>
        <p className="text-xs text-gray-400 mt-0.5">Generate a personalised schedule towards your deadline</p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Deadline Name</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="e.g. Final Exam"
              value={form.deadline_name}
              onChange={e => setForm(f => ({ ...f, deadline_name: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Deadline Date</label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={form.deadline_date}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm(f => ({ ...f, deadline_date: e.target.value }))}
            />
          </div>
        </div>

        {/* Study time mode toggle */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Study Time</label>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-2">
            <button
              type="button"
              className={`flex-1 text-xs font-medium py-2 transition-colors ${form.mode === 'daily' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setForm(f => ({ ...f, mode: 'daily' }))}
            >
              Hours per day
            </button>
            <button
              type="button"
              className={`flex-1 text-xs font-medium py-2 transition-colors border-l border-gray-200 ${form.mode === 'weekly' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setForm(f => ({ ...f, mode: 'weekly' }))}
            >
              Days per week
            </button>
          </div>
          {form.mode === 'daily' ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0.5"
                max="12"
                step="0.5"
                className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.study_hours_per_day}
                onChange={e => setForm(f => ({ ...f, study_hours_per_day: e.target.value }))}
              />
              <span className="text-xs text-gray-500">hours per day</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="7"
                className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.study_days_per_week}
                onChange={e => setForm(f => ({ ...f, study_days_per_week: e.target.value }))}
              />
              <span className="text-xs text-gray-500">days per week</span>
            </div>
          )}
        </div>

        {/* Topics multi-select */}
        <div className="relative">
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Topics to Cover
            <span className="text-gray-400 font-normal ml-1">(pre-filled with your weakest topics)</span>
          </label>
          <div
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm cursor-pointer focus-within:ring-2 focus-within:ring-indigo-300 min-h-[38px]"
            onClick={() => setShowTopicDropdown(v => !v)}
          >
            {form.topics_to_cover.length === 0 ? (
              <span className="text-gray-400">Select topics…</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {form.topics_to_cover.map(t => {
                  const mastery = knowledgeMap?.[t]?.mastery_score;
                  return (
                    <span key={t} className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      {formatTopicName(t)}{mastery != null ? ` ${Math.round(mastery * 100)}%` : ''}
                      <button type="button" onClick={e => { e.stopPropagation(); toggleTopic(t); }} className="hover:text-indigo-900">×</button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          {showTopicDropdown && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              <div className="p-2 border-b border-gray-100">
                <input
                  className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  placeholder="Search topics…"
                  value={topicSearch}
                  onChange={e => setTopicSearch(e.target.value)}
                  onClick={e => e.stopPropagation()}
                />
              </div>
              {filteredTopics.length === 0 ? (
                <p className="text-xs text-gray-400 p-3 text-center">No more topics</p>
              ) : (
                filteredTopics.map(t => {
                  const mastery = knowledgeMap?.[t]?.mastery_score;
                  return (
                    <button
                      key={t}
                      type="button"
                      className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 text-gray-700 flex items-center justify-between"
                      onClick={e => { e.stopPropagation(); toggleTopic(t); }}
                    >
                      <span>{formatTopicName(t)}</span>
                      {mastery != null && (
                        <span className={`text-xs font-medium ${mastery >= 0.7 ? 'text-green-600' : mastery >= 0.4 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {Math.round(mastery * 100)}%
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 size={15} className="animate-spin" /> Generating plan…</>
          ) : (
            <><CalendarDays size={15} /> Generate Study Plan</>
          )}
        </button>
      </form>

      {/* Plan output */}
      {plan && (
        <div className="space-y-3 mt-1">
          {/* Summary */}
          <div className="bg-indigo-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={14} className="text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Your Study Plan</span>
              <span className="text-xs text-indigo-500 ml-auto">{plan.total_days} sessions</span>
            </div>
            <p className="text-sm text-indigo-800 leading-relaxed">{plan.plan_summary}</p>
          </div>

          {/* Sessions */}
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {plan.sessions.map((s, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 w-12">Day {s.day}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <CalendarDays size={11} /> {s.date}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={11} /> {s.duration_hours}h
                    </span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[s.priority] || PRIORITY_STYLES.medium}`}>
                    {PRIORITY_LABEL[s.priority] || s.priority}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800 mb-1">{s.focus}</p>
                <div className="flex flex-wrap gap-1">
                  {s.topics.map(t => (
                    <span key={t} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <BookOpen size={9} /> {formatTopicName(t)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Reasoning */}
          {plan.reasoning && (
            <div>
              <button
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setReasoningExpanded(v => !v)}
              >
                Why this plan?
                {reasoningExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              {reasoningExpanded && (
                <div className="mt-2 bg-gray-50 rounded-xl p-3 text-xs text-gray-600 leading-relaxed">
                  {plan.reasoning}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main StudyPlanner tab ────────────────────────────────────────────────────

export default function StudyPlanner({ studentId, knowledgeMap }) {
  const allTopics = useMemo(
    () => Object.keys(knowledgeMap || {}),
    [knowledgeMap]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
      <ExamLogger studentId={studentId} allTopics={allTopics} />
      <StudyPlanGenerator studentId={studentId} knowledgeMap={knowledgeMap} allTopics={allTopics} />
    </div>
  );
}
