import { useEffect, useState, useMemo } from 'react';
import { api } from '../../api/client';
import ClassSummary from './ClassSummary';
import StudentRow from './StudentRow';

const SORT_OPTIONS = [
  { value: 'mastery_asc', label: 'Mastery (Low → High)' },
  { value: 'mastery_desc', label: 'Mastery (High → Low)' },
  { value: 'last_active', label: 'Last Active' },
  { value: 'name', label: 'Name' },
];

export default function TeacherDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('mastery_asc');
  // recStatuses tracks teacher actions from the detail page; keyed by student_id
  const [recStatuses, setRecStatuses] = useState({});

  useEffect(() => {
    // listStudents() already enriches with student_name + topic_masteries (see api/client.js)
    api.listStudents().then(list => {
      setStudents(list);
      // Default all to 'pending' — updated when teacher acts on detail page
      const defaultStatuses = {};
      list.forEach(s => { defaultStatuses[s.student_id] = 'pending'; });
      setRecStatuses(prev => ({ ...defaultStatuses, ...prev }));
      setLoading(false);
    });
  }, []);

  const alertStudents = students.filter(s =>
    s.overall_mastery < 0.3 ||
    (s.last_active && Date.now() - new Date(s.last_active).getTime() > 14 * 86400000)
  );

  const sorted = useMemo(() => {
    return [...students].sort((a, b) => {
      if (sortBy === 'mastery_asc') return a.overall_mastery - b.overall_mastery;
      if (sortBy === 'mastery_desc') return b.overall_mastery - a.overall_mastery;
      if (sortBy === 'last_active') return new Date(b.last_active) - new Date(a.last_active);
      if (sortBy === 'name') return (a.student_name || '').localeCompare(b.student_name || '');
      return 0;
    });
  }, [students, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Class Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Sec 4A — Additional Mathematics</p>
      </div>

      {/* Alert Banner */}
      {alertStudents.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-300 rounded-lg px-4 py-3 flex items-start gap-3">
          <span className="text-red-500 text-lg mt-0.5">⚠</span>
          <div>
            <p className="text-sm font-semibold text-red-800">
              {alertStudents.length} student{alertStudents.length > 1 ? 's' : ''} need{alertStudents.length === 1 ? 's' : ''} immediate attention
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {alertStudents.map(s => s.student_name).join(', ')} — mastery below 30% or inactive for 14+ days
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <ClassSummary students={students} />

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">{students.length} Students</p>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Sort by:</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-2 text-left">Student</th>
              <th className="px-4 py-2 text-left">Overall Mastery</th>
              <th className="px-4 py-2 text-left">Weakest Topic</th>
              <th className="px-4 py-2 text-left">Velocity</th>
              <th className="px-4 py-2 text-left">Last Active</th>
              <th className="px-4 py-2 text-left">AI Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map(s => (
              <StudentRow
                key={s.student_id}
                student={s}
                recStatus={recStatuses[s.student_id] || 'none'}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
