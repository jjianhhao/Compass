import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { getRecStatus } from '../../api/localStore';
import ClassSummary from './ClassSummary';
import StudentRow from './StudentRow';
import { LogOut, RefreshCw } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'mastery_asc', label: 'Mastery (Low → High)' },
  { value: 'mastery_desc', label: 'Mastery (High → Low)' },
  { value: 'last_active', label: 'Last Active' },
  { value: 'name', label: 'Name' },
];

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('mastery_asc');
  const [recStatuses, setRecStatuses] = useState({});

  useEffect(() => {
    api.listStudents()
      .then(list => {
        setStudents(list);
        const storedStatuses = {};
        list.forEach(s => { storedStatuses[s.student_id] = getRecStatus(s.student_id); });
        setRecStatuses(storedStatuses);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load students.');
        setLoading(false);
      });
  }, []);

  const FOURTEEN_DAYS_MS = 14 * 86400000;
  const alertStudents = useMemo(() => students.filter(s => {
    if (s.overall_mastery < 0.3) return true;
    if (!s.last_active) return true; // no recorded activity → always flag
    const msSince = Date.now() - new Date(s.last_active).getTime();
    return !isNaN(msSince) && msSince > FOURTEEN_DAYS_MS;
  }), [students]);

  const sorted = useMemo(() => {
    return [...students].sort((a, b) => {
      if (sortBy === 'mastery_asc') return a.overall_mastery - b.overall_mastery;
      if (sortBy === 'mastery_desc') return b.overall_mastery - a.overall_mastery;
      if (sortBy === 'last_active') return new Date(b.last_active) - new Date(a.last_active);
      if (sortBy === 'name') return (a.student_name || '').localeCompare(b.student_name || '');
      return 0;
    });
  }, [students, sortBy]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-700 text-sm">
        Failed to load class data: {error}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-indigo-600 font-bold text-lg tracking-tight">🧭 COMPASS</span>
            <span className="text-gray-300">|</span>
            <div>
              <span className="font-semibold text-gray-800">Teacher Dashboard</span>
              <span className="ml-2 text-sm text-gray-400">IB Mathematics AA HL</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setLoading(true); api.listStudents().then(list => { setStudents(list); const s = {}; list.forEach(st => { s[st.student_id] = getRecStatus(st.student_id); }); setRecStatuses(s); setLoading(false); }).catch(() => setLoading(false)); }}
              className="flex items-center gap-1.5 border border-gray-200 text-gray-500 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 border border-gray-200 text-gray-500 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-colors"
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Class Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor student progress and manage AI recommendations</p>
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
    </div>
  );
}
