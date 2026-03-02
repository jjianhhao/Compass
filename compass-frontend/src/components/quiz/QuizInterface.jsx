import { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, ChevronRight, Trophy, RotateCcw, CheckCircle, XCircle, Pencil, ImageUp, AlertTriangle } from 'lucide-react';
import QuestionBody from './QuestionBody';
import DrawingCanvas from './DrawingCanvas';
import PhotoUpload from './PhotoUpload';
import GradingSpinner from './GradingSpinner';
import { api } from '../../api/client';

export default function QuizInterface({ questions, studentId, onAnswer, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputTab, setInputTab] = useState('draw'); // 'draw' | 'upload'
  const [answered, setAnswered] = useState(false);
  const [grading, setGrading] = useState(false);
  const [gradingResult, setGradingResult] = useState(null);
  const [timer, setTimer] = useState(0);
  const [results, setResults] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [showQuitWarning, setShowQuitWarning] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const canvasRef = useRef(null);
  const uploadRef = useRef(null);

  // All hooks must come before any conditional returns (Rules of Hooks)
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimer(0);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimer(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, []);

  useEffect(() => {
    if (!questions || questions.length === 0) return;
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [currentIndex, startTimer, questions]);

  if (!questions || questions.length === 0) {
    return (
      <div className="h-full overflow-y-auto bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-sm">
          <p className="text-gray-500">No questions available.</p>
          <button
            className="mt-4 bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
            onClick={() => onComplete?.()}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];

  const handleSubmit = async () => {
    if (answered || grading) return;

    // Get image from the active input
    const activeRef = inputTab === 'draw' ? canvasRef : uploadRef;
    const image = activeRef.current?.getImage();

    if (!image) return;

    setGrading(true);
    clearInterval(timerRef.current);
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

    try {
      const result = await api.gradeAnswer(studentId, current.id, image);
      setGradingResult(result);
      setAnswered(true);

      const answerData = {
        question_id: current.id,
        topic: current.subject || 'Mathematics',
        subtopic: current.question_number || '',
        difficulty: current.difficulty,
        student_answer: '[handwritten]',
        correct_answer: '[markscheme]',
        is_correct: result.is_correct,
        time_taken_sec: timeTaken,
        timestamp: new Date().toISOString(),
        marks_available: result.marks_available,
        marks_awarded: result.marks_awarded,
        mark_percentage: result.mark_percentage,
        ai_feedback: result.feedback,
      };

      setResults((prev) => [...prev, answerData]);
      onAnswer?.(answerData);
    } catch (err) {
      setGradingResult({
        marks_awarded: 0,
        marks_available: current.marks || 6,
        mark_percentage: 0,
        feedback: `Grading failed: ${err.message}. Please try again.`,
        strengths: [],
        errors: ['Could not connect to grading service.'],
        is_correct: false,
      });
      setAnswered(true);
    } finally {
      setGrading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setShowSummary(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswered(false);
      setGradingResult(null);
      setInputTab('draw');
    }
  };

  // ── Summary screen ──────────────────────────────────────────────
  if (showSummary) {
    const totalMarksEarned = results.reduce((s, r) => s + (r.marks_awarded || 0), 0);
    const totalMarksAvailable = results.reduce((s, r) => s + (r.marks_available || 0), 0);
    const totalTime = results.reduce((s, r) => s + r.time_taken_sec, 0);
    const percentage = totalMarksAvailable > 0 ? Math.round((totalMarksEarned / totalMarksAvailable) * 100) : 0;

    return (
      <div className="h-full overflow-y-auto bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-lg">
          <div className="text-center mb-6">
            <Trophy className="mx-auto text-yellow-400 mb-3" size={48} />
            <h1 className="text-2xl font-bold text-gray-900">Quiz Complete!</h1>
            <div className={`text-5xl font-bold mt-3 mb-1 ${percentage >= 70 ? 'text-green-500' : percentage >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
              {totalMarksEarned}/{totalMarksAvailable}
            </div>
            <p className="text-gray-500 text-sm">
              {percentage}% marks earned · {Math.floor(totalTime / 60)}m {totalTime % 60}s total
            </p>
          </div>

          <div className="border-t border-gray-100 pt-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Question Breakdown</h2>
            <div className="space-y-2">
              {results.map((r, i) => {
                const pct = r.marks_available > 0 ? Math.round((r.marks_awarded / r.marks_available) * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-20 truncate">Q{i + 1}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 70 ? 'bg-green-400' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-500 w-16 text-right">
                      {r.marks_awarded}/{r.marks_available}
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
                setAnswered(false);
                setGradingResult(null);
                setResults([]);
                setShowSummary(false);
                setInputTab('draw');
              }}
            >
              <RotateCcw size={14} /> Try Again
            </button>
            <button
              className="flex-1 bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
              onClick={() => onComplete?.()}
            >
              View Dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Question screen ─────────────────────────────────────────────
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">

      {/* Quit warning modal */}
      {showQuitWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-7 w-full max-w-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={18} className="text-amber-500" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">Quit this quiz?</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Your progress will be lost and this session <span className="font-medium text-gray-700">will not count</span> towards your overall mastery score.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                onClick={() => setShowQuitWarning(false)}
              >
                Continue Quiz
              </button>
              <button
                className="flex-1 bg-red-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-red-600 transition-colors"
                onClick={() => { setShowQuitWarning(false); onComplete?.(); }}
              >
                Quit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setShowQuitWarning(true)}
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
            <span>
              {results.reduce((s, r) => s + (r.marks_awarded || 0), 0)} marks earned
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex + (answered ? 1 : 0)) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2.5 py-1 rounded-full">
              {current.question_number || `Q${currentIndex + 1}`}
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
            <span className="text-xs bg-purple-50 text-purple-600 font-medium px-2 py-0.5 rounded-full">
              {current.marks} marks
            </span>
          </div>

          {/* Question body with KaTeX */}
          <QuestionBody html={current.question_body} diagram={current.question_diagram} />

          {/* Grading in progress */}
          {grading && <GradingSpinner />}

          {/* Input area (hidden while grading or after answer) */}
          {!grading && !answered && (
            <div className="mt-6">
              {/* Tab switcher */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-4">
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium py-2 transition-colors ${
                    inputTab === 'draw'
                      ? 'bg-indigo-50 text-indigo-700 border-r border-gray-200'
                      : 'text-gray-500 hover:bg-gray-50 border-r border-gray-200'
                  }`}
                  onClick={() => setInputTab('draw')}
                >
                  <Pencil size={14} /> Draw
                </button>
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium py-2 transition-colors ${
                    inputTab === 'upload'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                  onClick={() => setInputTab('upload')}
                >
                  <ImageUp size={14} /> Upload Photo
                </button>
              </div>

              {/* Canvas or Upload */}
              <div className={inputTab === 'draw' ? '' : 'hidden'}>
                <DrawingCanvas ref={canvasRef} disabled={false} />
              </div>
              <div className={inputTab === 'upload' ? '' : 'hidden'}>
                <PhotoUpload ref={uploadRef} disabled={false} />
              </div>

              {/* Submit button */}
              <button
                className="w-full mt-4 bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={handleSubmit}
              >
                Submit Answer
              </button>
            </div>
          )}

          {/* Grading result */}
          {answered && gradingResult && (
            <div className="mt-5 space-y-3">
              {/* Marks banner */}
              <div className={`p-4 rounded-xl border ${
                gradingResult.is_correct
                  ? 'bg-green-50 border-green-200'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {gradingResult.is_correct
                    ? <CheckCircle size={18} className="text-green-600" />
                    : <XCircle size={18} className="text-red-500" />
                  }
                  <span className={`text-2xl font-bold ${
                    gradingResult.is_correct ? 'text-green-700' : 'text-amber-700'
                  }`}>
                    {gradingResult.marks_awarded}/{gradingResult.marks_available} marks
                  </span>
                  <span className="text-sm text-gray-500 ml-auto">
                    {gradingResult.mark_percentage}%
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{gradingResult.feedback}</p>
              </div>

              {/* Strengths */}
              {gradingResult.strengths?.length > 0 && (
                <div className="bg-green-50/50 border border-green-100 rounded-xl p-3">
                  <h4 className="text-xs font-semibold text-green-700 mb-1.5">Strengths</h4>
                  <ul className="text-sm text-green-800 space-y-0.5">
                    {gradingResult.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-green-400 shrink-0">+</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Errors */}
              {gradingResult.errors?.length > 0 && (
                <div className="bg-red-50/50 border border-red-100 rounded-xl p-3">
                  <h4 className="text-xs font-semibold text-red-700 mb-1.5">Areas to Improve</h4>
                  <ul className="text-sm text-red-800 space-y-0.5">
                    {gradingResult.errors.map((e, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-red-400 shrink-0">-</span> {e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
