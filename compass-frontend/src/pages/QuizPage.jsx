import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import QuizInterface from '../components/quiz/QuizInterface';
import { api } from '../api/client';
import { saveInteraction } from '../api/localStore';

const DIFFICULTIES = [
  { value: '', label: 'All Difficulties' },
  { value: 'easy', label: 'Easy (1-6 marks)' },
  { value: 'medium', label: 'Medium (7-10 marks)' },
  { value: 'hard', label: 'Hard (11+ marks)' },
];

const QUESTIONS_PER_QUIZ = 5;

export default function QuizPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('');
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchQuestions(difficulty || null, QUESTIONS_PER_QUIZ, 0);
      if (!data.questions || data.questions.length === 0) {
        setError('No questions found. Try a different difficulty.');
        return;
      }
      setQuestions(data.questions);
    } catch (err) {
      setError(`Failed to load questions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answerData) => {
    // Always save locally so dashboard updates immediately
    saveInteraction(studentId, answerData);
    try {
      await api.logInteraction({ student_id: studentId, ...answerData });
    } catch {
      // API not available — local store already saved it
    }
  };

  const handleComplete = () => {
    // Trigger background re-computation so next dashboard load is instant
    const resolvedId = studentId === 'sarah' ? 'sarah_001'
      : studentId === 'james' ? 'james_001'
      : studentId === 'aisha' ? 'aisha_001'
      : studentId;
    fetch(`http://localhost:8001/api/diagnosis/${resolvedId}/refresh`, { method: 'POST' }).catch(() => {});
    navigate(`/dashboard/${studentId}`);
  };

  if (questions) {
    return (
      <QuizInterface
        questions={questions}
        studentId={studentId}
        onAnswer={handleAnswer}
        onComplete={handleComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <button
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-5"
          onClick={() => navigate(`/dashboard/${studentId}`)}
        >
          <ArrowLeft size={15} /> Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Start a Quiz</h1>
        <p className="text-gray-500 text-sm mb-6">
          IB Math AA HL free-response questions graded by AI
        </p>

        <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
        <select
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 mb-6 focus:outline-none focus:ring-2 focus:ring-teal-300"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          {DIFFICULTIES.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>

        <div className="bg-teal-50 rounded-xl p-3 mb-6 text-sm text-teal-700">
          You'll get <strong>{QUESTIONS_PER_QUIZ} questions</strong>. Write your answers by hand or upload a photo — AI will grade your work.
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          className="w-full bg-teal-600 text-white font-semibold py-3 rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onClick={handleStart}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Loading questions...
            </>
          ) : (
            'Start Quiz →'
          )}
        </button>
      </div>
    </div>
  );
}
