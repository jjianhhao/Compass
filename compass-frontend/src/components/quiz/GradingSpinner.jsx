import { Loader2 } from 'lucide-react';

export default function GradingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <Loader2 size={40} className="text-teal-500 animate-spin" />
      <div className="text-center">
        <p className="text-gray-700 font-medium">AI is grading your work...</p>
        <p className="text-gray-400 text-sm mt-1">This usually takes 3-8 seconds</p>
      </div>
    </div>
  );
}
