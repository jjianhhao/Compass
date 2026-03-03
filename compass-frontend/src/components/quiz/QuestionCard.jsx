import { CheckCircle, XCircle } from 'lucide-react';

export default function QuestionCard({ option, index, selected, correct, answered, onClick }) {
  const letters = ['A', 'B', 'C', 'D'];
  const letter = letters[index] ?? String.fromCharCode(65 + index);

  let baseStyle =
    'w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 group';

  if (!answered) {
    baseStyle += ' border-gray-200 hover:border-teal-300 hover:bg-teal-50 cursor-pointer';
  } else if (option === correct) {
    baseStyle += ' border-green-400 bg-green-50 cursor-default';
  } else if (option === selected && option !== correct) {
    baseStyle += ' border-red-400 bg-red-50 cursor-default';
  } else {
    baseStyle += ' border-gray-100 bg-gray-50 opacity-60 cursor-default';
  }

  const letterStyle =
    answered && option === correct
      ? 'bg-green-500 text-white'
      : answered && option === selected && option !== correct
      ? 'bg-red-500 text-white'
      : 'bg-gray-100 text-gray-600 group-hover:bg-teal-100 group-hover:text-teal-700';

  return (
    <button className={baseStyle} onClick={!answered ? onClick : undefined} disabled={answered}>
      <span
        className={`flex-shrink-0 w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${letterStyle}`}
      >
        {letter}
      </span>
      <span className="text-sm text-gray-800 flex-1">{option}</span>
      {answered && option === correct && (
        <CheckCircle size={18} className="flex-shrink-0 text-green-500" />
      )}
      {answered && option === selected && option !== correct && (
        <XCircle size={18} className="flex-shrink-0 text-red-500" />
      )}
    </button>
  );
}
