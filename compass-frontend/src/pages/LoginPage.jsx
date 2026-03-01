import { useNavigate } from 'react-router-dom';
import { BookOpen, Brain, Target } from 'lucide-react';

const STUDENTS = [
  {
    id: 'sarah',
    name: 'Sarah Tan',
    description: 'Strong in algebra and logarithms. Struggles with integration and trigonometry.',
    avatar: '👩‍🎓',
    level: 'Intermediate',
    levelColor: 'text-blue-600 bg-blue-50',
    icon: Brain,
  },
  {
    id: 'james',
    name: 'James Lim',
    description: 'Just started A-Math. Needs foundational work across most topics.',
    avatar: '👨‍🎓',
    level: 'Beginner',
    levelColor: 'text-orange-600 bg-orange-50',
    icon: BookOpen,
  },
  {
    id: 'aisha',
    name: 'Aisha Rahman',
    description: 'High performer aiming for A1. Focused on mastering hard topics like calculus.',
    avatar: '👩‍💻',
    level: 'Advanced',
    levelColor: 'text-green-600 bg-green-50',
    icon: Target,
  },
];

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            🧭 COMPASS
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Personalised A-Math Learning
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Select a student profile to explore their personalised learning dashboard and quiz experience.
          </p>
        </div>

        {/* Student Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {STUDENTS.map((student) => {
            const Icon = student.icon;
            return (
              <div
                key={student.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
                onClick={() => navigate(`/dashboard/${student.id}`)}
              >
                <div className="text-5xl mb-4">{student.avatar}</div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">{student.name}</h2>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${student.levelColor} mb-3`}>
                  <Icon size={11} />
                  {student.level}
                </span>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">{student.description}</p>
                <div className="flex flex-col gap-2">
                  <button
                    className="w-full bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-indigo-700 transition-colors group-hover:shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/${student.id}`);
                    }}
                  >
                    View Dashboard
                  </button>
                  <button
                    className="w-full border border-indigo-200 text-indigo-600 text-sm font-medium py-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/quiz/${student.id}`);
                    }}
                  >
                    Take a Quiz
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-400 mb-2">Demo mode — no authentication required</p>
          <button
            className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline transition-colors"
            onClick={() => navigate('/teacher')}
          >
            Teacher view →
          </button>
        </div>
      </div>
    </div>
  );
}
