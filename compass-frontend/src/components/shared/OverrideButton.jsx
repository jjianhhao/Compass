import { useState, useRef, useEffect } from 'react';
import { ChevronDown, CheckCircle } from 'lucide-react';

const OVERRIDE_OPTIONS = [
  { id: 'revised_offline', label: 'I already revised this topic offline' },
  { id: 'wrong_recommendation', label: 'I think this recommendation is wrong' },
  { id: 'different_focus', label: 'I want to focus on something else instead' },
];

export default function OverrideButton({ recommendationId, onOverride }) {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (option) => {
    setOpen(false);
    setConfirmed(true);
    onOverride?.({
      recommendation_id: recommendationId,
      override_reason: option.id,
      timestamp: new Date().toISOString(),
    });
  };

  if (confirmed) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
        <CheckCircle size={13} />
        Noted — we'll adjust your recommendations
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-1 text-xs text-gray-400 border border-gray-200 px-2.5 py-1 rounded-lg hover:border-gray-300 hover:text-gray-600 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        I already know this
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-60 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
          {OVERRIDE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
              onClick={() => handleSelect(opt)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
