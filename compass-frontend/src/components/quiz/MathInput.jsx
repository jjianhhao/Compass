import { useRef, useState } from 'react';
import { Delete } from 'lucide-react';

const SYMBOL_GROUPS = [
  {
    label: 'Powers & Roots',
    symbols: [
      { display: 'x²', insert: '²' },
      { display: 'x³', insert: '³' },
      { display: 'xⁿ', insert: '^' },
      { display: '√', insert: '√' },
      { display: '∛', insert: '∛' },
      { display: '¹⁄₂', insert: '1/2' },
    ],
  },
  {
    label: 'Operators',
    symbols: [
      { display: '×', insert: '×' },
      { display: '÷', insert: '÷' },
      { display: '±', insert: '±' },
      { display: '≠', insert: '≠' },
      { display: '≤', insert: '≤' },
      { display: '≥', insert: '≥' },
    ],
  },
  {
    label: 'Greek',
    symbols: [
      { display: 'π', insert: 'π' },
      { display: 'θ', insert: 'θ' },
      { display: 'α', insert: 'α' },
      { display: 'β', insert: 'β' },
      { display: 'λ', insert: 'λ' },
      { display: 'Δ', insert: 'Δ' },
    ],
  },
  {
    label: 'Calculus',
    symbols: [
      { display: '∫', insert: '∫' },
      { display: '∑', insert: '∑' },
      { display: 'd/dx', insert: 'd/dx' },
      { display: '∞', insert: '∞' },
      { display: '→', insert: '→' },
      { display: '∈', insert: '∈' },
    ],
  },
  {
    label: 'Brackets',
    symbols: [
      { display: '( )', insert: '()' },
      { display: '[ ]', insert: '[]' },
      { display: '|x|', insert: '|' },
      { display: '⌊ ⌋', insert: '⌊⌋' },
    ],
  },
];

export default function MathInput({ value, onChange, placeholder, disabled }) {
  const inputRef = useRef(null);
  const [activeGroup, setActiveGroup] = useState(0);

  const insertAtCursor = (insert) => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newVal = value.slice(0, start) + insert + value.slice(end);
    onChange(newVal);
    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + insert.length, start + insert.length);
    });
  };

  const handleBackspace = () => {
    const el = inputRef.current;
    if (!el || value.length === 0) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    let newVal;
    if (start !== end) {
      newVal = value.slice(0, start) + value.slice(end);
    } else if (start > 0) {
      newVal = value.slice(0, start - 1) + value.slice(start);
    } else {
      return;
    }
    onChange(newVal);
    requestAnimationFrame(() => {
      el.focus();
      const pos = Math.max(0, start - 1);
      el.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="space-y-3">
      {/* Text input */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-base font-mono text-gray-900 focus:outline-none focus:border-indigo-400 transition-colors placeholder-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={placeholder || 'Type your answer here…'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        <button
          type="button"
          className="p-3 border-2 border-gray-200 rounded-xl text-gray-400 hover:text-red-400 hover:border-red-200 transition-colors disabled:opacity-30"
          onClick={handleBackspace}
          disabled={disabled}
          title="Backspace"
        >
          <Delete size={18} />
        </button>
      </div>

      {/* Symbol palette */}
      {!disabled && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
          {/* Group tabs */}
          <div className="flex overflow-x-auto border-b border-gray-200 bg-white">
            {SYMBOL_GROUPS.map((group, i) => (
              <button
                key={group.label}
                type="button"
                className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeGroup === i
                    ? 'text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveGroup(i)}
              >
                {group.label}
              </button>
            ))}
          </div>

          {/* Symbol buttons */}
          <div className="flex flex-wrap gap-2 p-3">
            {SYMBOL_GROUPS[activeGroup].symbols.map((sym) => (
              <button
                key={sym.display}
                type="button"
                className="min-w-[44px] h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-800 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors shadow-sm"
                onClick={() => insertAtCursor(sym.insert)}
                title={`Insert ${sym.insert}`}
              >
                {sym.display}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
