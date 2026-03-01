import { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, ChevronRight, Trophy, RotateCcw, CheckCircle, XCircle, BookOpen, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import QuestionCard from './QuestionCard';
import MathInput from './MathInput';

const formatTopic = (t) =>
  t
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

// Normalise a string for loose comparison
const normalise = (s) =>
  s
    .toLowerCase()
    .replace(/\s+/g, '')          // strip ALL whitespace
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-');

// Split a product of bracketed factors like "(2x+5)(3x-2)" → ["(2x+5)","(3x-2)"]
const splitFactors = (s) => {
  const factors = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') { if (depth === 0) start = i; depth++; }
    else if (s[i] === ')') {
      depth--;
      if (depth === 0) factors.push(s.slice(start, i + 1));
    }
  }
  return factors.length > 1 ? factors.sort() : null;
};

const checkFreeText = (studentAnswer, correctAnswer) => {
  const a = normalise(studentAnswer);
  const b = normalise(correctAnswer);
  if (a === b) return true;

  // Accept omitted "x=" prefix (e.g. "3" for "x=3")
  const bStripped = b.replace(/^[a-z]=/, '');
  if (a === bStripped) return true;

  // Accept bracketed factors in any order: (3x-2)(2x+5) == (2x+5)(3x-2)
  const aFactors = splitFactors(a);
  const bFactors = splitFactors(b);
  if (aFactors && bFactors && JSON.stringify(aFactors) === JSON.stringify(bFactors)) return true;

  // Accept "or"/"and" separated values in any order
  const splitOr = (str) => str.split(/or|and|,/i).map(normalise).filter(Boolean).sort();
  const aParts = splitOr(a);
  const bParts = splitOr(b);
  if (aParts.length > 1 && JSON.stringify(aParts) === JSON.stringify(bParts)) return true;

  return false;
};

function SummaryReviewCard({ question, result }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-800 line-clamp-2">{question.question}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Your answer: <span className="font-mono text-red-500">{result.student_answer || '—'}</span>
            {' · '}Correct: <span className="font-mono text-green-600">{question.correct_answer}</span>
          </p>
        </div>
        {open ? <ChevronUp size={14} className="text-gray-400 mt-1 shrink-0" /> : <ChevronDown size={14} className="text-gray-400 mt-1 shrink-0" />}
      </button>
      {open && question.explanation && (
        <div className="px-4 pb-4 bg-indigo-50 border-t border-indigo-100">
          <p className="text-xs font-semibold text-indigo-700 mt-3 mb-1.5 flex items-center gap-1">
            <BookOpen size={11} /> Step-by-step solution
          </p>
          <div className="space-y-1">
            {question.explanation.split('\n').map((line, i) => (
              <p key={i} className={`text-xs ${line.startsWith('Step') ? 'font-medium text-gray-800' : 'text-gray-600 pl-2'}`}>
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizInterface({ questions, studentId, onAnswer, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMCQ, setSelectedMCQ] = useState(null);
  const [freeTextInput, setFreeTextInput] = useState('');
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [timer, setTimer] = useState(0);
  const [results, setResults] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showQuitWarning, setShowQuitWarning] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

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
          <p className="text-gray-500">No questions available for this topic.</p>
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
  const isFreeText = current?.type === 'free_text';

  const submitAnswer = (studentAnswer) => {
    if (answered) return;
    clearInterval(timerRef.current);
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

    const correct = isFreeText
      ? checkFreeText(studentAnswer, current.correct_answer)
      : studentAnswer === current.correct_answer;

    setIsCorrect(correct);
    setAnswered(true);

    const answerData = {
      question_id: current.id,
      topic: current.topic,
      subtopic: current.subtopic,
      difficulty: current.difficulty,
      type: current.type,
      student_answer: studentAnswer,
      correct_answer: current.correct_answer,
      is_correct: correct,
      time_taken_sec: timeTaken,
      timestamp: new Date().toISOString(),
    };

    setResults((prev) => [...prev, answerData]);
    onAnswer?.(answerData);
  };

  const handleMCQSelect = (option) => {
    if (answered) return;
    setSelectedMCQ(option);
    submitAnswer(option);
  };

  const handleFreeTextSubmit = () => {
    if (!freeTextInput.trim() || answered) return;
    submitAnswer(freeTextInput.trim());
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setShowSummary(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedMCQ(null);
      setFreeTextInput('');
      setAnswered(false);
      setIsCorrect(null);
      setShowExplanation(false);
    }
  };

  // ── Summary screen ──────────────────────────────────────────────
  if (showSummary) {
    const correctCount = results.filter((r) => r.is_correct).length;
    const total = results.length;
    const totalTime = results.reduce((sum, r) => sum + r.time_taken_sec, 0);
    const percentage = Math.round((correctCount / total) * 100);

    const topicBreakdown = results.reduce((acc, r) => {
      if (!acc[r.topic]) acc[r.topic] = { correct: 0, total: 0 };
      acc[r.topic].total += 1;
      if (r.is_correct) acc[r.topic].correct += 1;
      return acc;
    }, {});

    const wrongResults = results.filter((r) => !r.is_correct);

    return (
      <div className="h-full overflow-y-auto bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-lg">
          <div className="text-center mb-6">
            <Trophy className="mx-auto text-yellow-400 mb-3" size={48} />
            <h1 className="text-2xl font-bold text-gray-900">Quiz Complete!</h1>
            <div className={`text-5xl font-bold mt-3 mb-1 ${percentage >= 70 ? 'text-green-500' : percentage >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
              {correctCount}/{total}
            </div>
            <p className="text-gray-500 text-sm">
              {percentage}% correct · {Math.floor(totalTime / 60)}m {totalTime % 60}s total
            </p>
          </div>

          <div className="border-t border-gray-100 pt-5 mb-4">
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

          {/* Review wrong answers with explanations */}
          {wrongResults.length > 0 && (
            <div className="border-t border-gray-100 pt-4 mb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                <BookOpen size={14} className="text-indigo-500" /> Review incorrect answers
              </h2>
              <div className="space-y-2">
                {wrongResults.map((r) => {
                  const q = questions.find((qs) => qs.id === r.question_id);
                  return q ? <SummaryReviewCard key={r.question_id} question={q} result={r} /> : null;
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              className="flex-1 flex items-center justify-center gap-2 border border-indigo-200 text-indigo-600 text-sm font-medium py-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
              onClick={() => {
                setCurrentIndex(0);
                setSelectedMCQ(null);
                setFreeTextInput('');
                setAnswered(false);
                setIsCorrect(null);
                setResults([]);
                setShowSummary(false);
                setShowExplanation(false);
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

      <div className="w-full max-w-xl">
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
          {/* Topic badges */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
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
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isFreeText ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-500'
            }`}>
              {isFreeText ? '✏️ Free text' : '☑ MCQ'}
            </span>
          </div>

          <p className="text-gray-900 font-medium leading-relaxed mb-4">{current.question}</p>

          {/* Diagram image (optional) */}
          {current.diagram && (
            <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
              <img
                src={current.diagram}
                alt="Question diagram"
                className="max-w-full max-h-72 object-contain p-2"
              />
            </div>
          )}

          {/* MCQ options */}
          {!isFreeText && (
            <div className="space-y-2.5">
              {current.options.map((option, i) => (
                <QuestionCard
                  key={i}
                  option={option}
                  index={i}
                  selected={selectedMCQ}
                  correct={current.correct_answer}
                  answered={answered}
                  onClick={() => handleMCQSelect(option)}
                />
              ))}
            </div>
          )}

          {/* Free-text input */}
          {isFreeText && (
            <div className="space-y-3">
              <MathInput
                value={freeTextInput}
                onChange={setFreeTextInput}
                placeholder="Type your answer using the keyboard or symbol palette…"
                disabled={answered}
              />
              {!answered && (
                <button
                  className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={handleFreeTextSubmit}
                  disabled={!freeTextInput.trim()}
                >
                  Submit Answer
                </button>
              )}
            </div>
          )}

          {/* Feedback after answering */}
          {answered && (
            <>
              <div className={`mt-5 p-4 rounded-xl text-sm leading-relaxed border ${
                isCorrect
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                <div className="flex items-center gap-2 font-semibold mb-1">
                  {isCorrect
                    ? <><CheckCircle size={15} className="text-green-600" /> Correct!</>
                    : <><XCircle size={15} className="text-red-500" /> Not quite.</>
                  }
                </div>
                {!isCorrect && (
                  <p className="mb-1">
                    <span className="font-medium">Correct answer: </span>
                    <span className="font-mono">{current.correct_answer}</span>
                  </p>
                )}
                <p className="opacity-80">{current.hint}</p>
              </div>

              {/* Detailed Explanation Toggle */}
              {current.explanation && (
                <div className="mt-3">
                  <button
                    className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium transition-colors"
                    onClick={() => setShowExplanation((v) => !v)}
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen size={14} />
                      {showExplanation ? 'Hide detailed explanation' : 'Show detailed explanation'}
                    </span>
                    {showExplanation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {showExplanation && (
                    <div className="mt-2 p-4 rounded-xl border border-indigo-100 bg-white text-sm text-gray-700 leading-relaxed">
                      <p className="font-semibold text-indigo-700 mb-2 flex items-center gap-1.5">
                        <BookOpen size={13} /> Step-by-step solution
                      </p>
                      <div className="space-y-1.5">
                        {current.explanation.split('\n').map((line, i) => (
                          <p key={i} className={line.startsWith('Step') ? 'font-medium text-gray-800' : 'text-gray-600 pl-3'}>
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
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
