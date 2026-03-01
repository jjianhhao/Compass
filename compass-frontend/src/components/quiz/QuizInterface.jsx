import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, Trophy, RotateCcw } from 'lucide-react';
import QuestionCard from './QuestionCard';

const formatTopic = (t) =>
  t
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

export default function QuizInterface({ questions, studentId, onAnswer, onComplete }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [timer, setTimer] = useState(0);
  const [results, setResults] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const current = questions[currentIndex];

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimer(0);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimer(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [currentIndex, startTimer]);

  const handleSelect = (option) => {
    if (answered) return;
    clearInterval(timerRef.current);
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const isCorrect = option === current.correct_answer;
    setSelected(option);
    setAnswered(true);

    const answerData = {
      question_id: current.id,
      topic: current.topic,
      subtopic: current.subtopic,
      difficulty: current.difficulty,
      student_answer: option,
      correct_answer: current.correct_answer,
      is_correct: isCorrect,
      time_taken_sec: timeTaken,
      timestamp: new Date().toISOString(),
    };

    setResults((prev) => [...prev, answerData]);
    onAnswer?.(answerData);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setShowSummary(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  if (showSummary) {
    const correct = results.filter((r) => r.is_correct).length;
    const total = results.length;
    const totalTime = results.reduce((sum, r) => sum + r.time_taken_sec, 0);
    const topicBreakdown = results.reduce((acc, r) => {
      if (!acc[r.topic]) acc[r.topic] = { correct: 0, total: 0 };
      acc[r.topic].total += 1;
      if (r.is_correct) acc[r.topic].correct += 1;
      return acc;
    }, {});

    const percentage = Math.round((correct / total) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-lg">
          <div className="text-center mb-6">
            <Trophy className="mx-auto text-yellow-400 mb-3" size={48} />
            <h1 className="text-2xl font-bold text-gray-900">Quiz Complete!</h1>
            <div className="text-5xl font-bold mt-3 mb-1">
              <span className={percentage >= 70 ? 'text-green-500' : percentage >= 50 ? 'text-yellow-500' : 'text-red-500'}>
                {correct}/{total}
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              {percentage}% correct · {Math.floor(totalTime / 60)}m {totalTime % 60}s total
            </p>
          </div>

          <div className="border-t border-gray-100 pt-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Topic Breakdown</h2>
            <div className="space-y-2">
              {Object.entries(topicBreakdown).map(([topic, data]) => {
                const pct = Math.round((data.correct / data.total) * 100);
                return (
                  <div key={topic} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-40 truncate">{formatTopic(topic)}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 70 ? 'bg-green-400' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-500 w-12 text-right">
                      {data.correct}/{data.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              className="flex-1 flex items-center justify-center gap-2 border border-indigo-200 text-indigo-600 text-sm font-medium py-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
              onClick={() => {
                setCurrentIndex(0);
                setSelected(null);
                setAnswered(false);
                setResults([]);
                setShowSummary(false);
              }}
            >
              <RotateCcw size={14} /> Try Again
            </button>
            <button
              className="flex-1 bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
              onClick={() => {
                onComplete?.();
                navigate(`/dashboard/${studentId}`);
              }}
            >
              View Dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => navigate(`/dashboard/${studentId}`)}
          >
            ← Dashboard
          </button>
          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 bg-white border border-gray-100 px-3 py-1.5 rounded-full shadow-sm">
            <Clock size={14} className="text-indigo-400" />
            {timer}s
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{results.filter((r) => r.is_correct).length} correct so far</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex + (answered ? 1 : 0)) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          {/* Topic badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2.5 py-1 rounded-full">
              {formatTopic(current.topic)}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              current.difficulty === 'easy'
                ? 'bg-green-50 text-green-600'
                : current.difficulty === 'medium'
                ? 'bg-yellow-50 text-yellow-600'
                : 'bg-red-50 text-red-600'
            }`}>
              {current.difficulty}
            </span>
          </div>

          <p className="text-gray-900 font-medium leading-relaxed mb-6">{current.question}</p>

          <div className="space-y-2.5">
            {current.options.map((option, i) => (
              <QuestionCard
                key={i}
                option={option}
                index={i}
                selected={selected}
                correct={current.correct_answer}
                answered={answered}
                onClick={() => handleSelect(option)}
              />
            ))}
          </div>

          {/* Hint */}
          {answered && (
            <div className={`mt-5 p-4 rounded-xl text-sm leading-relaxed ${
              selected === current.correct_answer
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-amber-50 border border-amber-200 text-amber-800'
            }`}>
              <span className="font-semibold">
                {selected === current.correct_answer ? '✓ Correct! ' : '✗ Not quite. '}
              </span>
              {current.hint}
            </div>
          )}
        </div>

        {/* Next button */}
        {answered && (
          <button
            className="w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            onClick={handleNext}
          >
            {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
