import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudent } from '../hooks/useStudent';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

const STUDENT_NAMES = {
  sarah: 'Sarah Tan',
  james: 'James Lim',
  aisha: 'Aisha Rahman',
};

function SkeletonDashboard() {
  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-6 w-28 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-5 w-40 bg-gray-100 rounded-lg animate-pulse" />
          </div>
          <div className="h-9 w-28 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-6">
          {[200, 160, 240].map((h) => (
            <div key={h} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
              <div style={{ height: h }} className="bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-96">
            <div className="h-4 w-40 bg-gray-200 rounded mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { knowledgeMap, velocity, agentOutput, loading, error, refresh } = useStudent(studentId);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const studentName = STUDENT_NAMES[studentId] || studentId;

  if (loading) return <SkeletonDashboard />;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {error && !bannerDismissed && (
        <div className="flex-shrink-0 flex items-center justify-between gap-3 bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-amber-500 shrink-0" />
            <span>Backend unavailable — showing demo data.</span>
            <button
              className="underline underline-offset-2 hover:text-amber-900 transition-colors"
              onClick={refresh}
            >
              <RefreshCw size={12} className="inline mr-0.5" />Retry
            </button>
          </div>
          <button onClick={() => setBannerDismissed(true)} className="text-amber-400 hover:text-amber-700 transition-colors">
            <X size={14} />
          </button>
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <StudentDashboard
          studentName={studentName}
          studentId={studentId}
          knowledgeMap={knowledgeMap}
          velocity={velocity}
          agentOutput={agentOutput}
          onStartQuiz={() => navigate(`/quiz/${studentId}`)}
        />
      </div>
    </div>
  );
}
