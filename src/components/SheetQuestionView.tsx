import React, { useState } from 'react';
import { QuestionItem, GameSettings } from '../types';
import { Abacus } from './Abacus';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SheetQuestionViewProps {
  questions: QuestionItem[];
  settings: GameSettings;
  onSubmitAll: (answersMap: Record<number, number | null>) => void;
}

export const SheetQuestionView: React.FC<SheetQuestionViewProps> = ({
  questions,
  settings,
  onSubmitAll,
}) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showAbacus, setShowAbacus] = useState<boolean>(true);

  const handleInputChange = (qId: number, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result: Record<number, number | null> = {};
    questions.forEach(q => {
      const str = (answers[q.id] || '').trim();
      result[q.id] = str === '' ? null : parseInt(str, 10);
    });
    onSubmitAll(result);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4">
      {/* Abacus Drawer / Collapsible Box */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-sm font-bold text-gray-700">Exam Abacus Helper</span>
          <button
            type="button"
            onClick={() => setShowAbacus(!showAbacus)}
            className="flex items-center gap-1 text-xs font-semibold px-4 py-1.5 rounded-full bg-[#C9B194] text-white hover:bg-[#b89f81] shadow-sm transition-all"
          >
            {showAbacus ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span>{showAbacus ? 'Hide Abacus' : 'Open Abacus'}</span>
          </button>
        </div>

        {showAbacus && (
          <div className="max-w-2xl mx-auto mb-6">
            <Abacus compact={true} rodCount={7} />
          </div>
        )}
      </div>

      {/* Questions Grid */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 mb-8">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-[#C9B194] rounded-2xl p-4 flex flex-col items-center justify-between text-white shadow-lg transition-transform hover:scale-[1.02]"
            >
              <div className="text-xs font-bold text-white/80 mb-2">#{idx + 1}</div>

              {/* Numbers */}
              <div className="flex flex-col items-center font-mono py-2 text-2xl font-bold leading-tight">
                {q.numbers.map((n, i) => (
                  <span key={i} className={n < 0 ? 'text-red-200' : 'text-white'}>
                    {n}
                  </span>
                ))}
              </div>

              {/* Input */}
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9\-]*"
                value={answers[q.id] || ''}
                onChange={e => handleInputChange(q.id, e.target.value)}
                placeholder="?"
                className="w-full py-2 px-3 mt-3 bg-white text-black font-bold rounded-full text-center text-lg focus:outline-none focus:ring-2 focus:ring-white shadow-sm"
              />
            </div>
          ))}
        </div>

        {/* Submit Button: Beige with white text */}
        <div className="flex justify-center pb-8">
          <button
            type="submit"
            className="py-4 px-10 rounded-full bg-[#C9B194] hover:bg-[#b89f81] text-white font-bold text-2xl shadow-xl transition-all active:scale-95 cursor-pointer"
          >
            Submit Answers
          </button>
        </div>
      </form>
    </div>
  );
};
