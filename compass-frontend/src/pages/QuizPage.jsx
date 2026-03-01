import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import QuizInterface from '../components/quiz/QuizInterface';
import allQuestions from '../data/questions.json';
import { api } from '../api/client';
import { saveInteraction } from '../api/localStore';

export default function QuizPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [topicFilter, setTopicFilter] = useState('all');
  const [quizStarted, setQuizStarted] = useState(false);

  const topics = useMemo(() => {
    const unique = [...new Set(allQuestions.map((q) => q.topic))];
    return unique.sort();
  }, []);

  const questions = useMemo(() => {
    const filtered =
      topicFilter === 'all'
        ? allQuestions
        : allQuestions.filter((q) => q.topic === topicFilter);
    return filtered.slice(0, 10);
  }, [topicFilter]);

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
    navigate(`/dashboard/${studentId}`);
  };

  const formatTopic = (t) =>
    t
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  if (!quizStarted) {
    return (
      <div className="h-full overflow-y-auto bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
          <button
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-5"
            onClick={() => navigate(`/dashboard/${studentId}`)}
          >
            <ArrowLeft size={15} /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Start a Quiz</h1>
          <p className="text-gray-500 text-sm mb-6">Select a topic or practice all topics</p>

          <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
          <select
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
          >
            <option value="all">All Topics ({allQuestions.length} questions)</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {formatTopic(t)} ({allQuestions.filter((q) => q.topic === t).length} questions)
              </option>
            ))}
          </select>

          <div className="bg-indigo-50 rounded-xl p-3 mb-6 text-sm text-indigo-700">
            You'll get up to <strong>10 questions</strong> from the selected topic.
          </div>

          <button
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
            onClick={() => setQuizStarted(true)}
          >
            Start Quiz →
          </button>
        </div>
      </div>
    );
  }

  return (
    <QuizInterface
      questions={questions}
      studentId={studentId}
      onAnswer={handleAnswer}
      onComplete={handleComplete}
    />
  );
}
