import React, { useState, useEffect, useRef } from 'react';
import { QuestionItem, GameSettings } from '../types';
import { Abacus } from './Abacus';

interface SingleQuestionViewProps {
  question: QuestionItem;
  questionIndex: number;
  totalQuestions: number;
  settings: GameSettings;
  onSubmitAnswer: (answer: number | null) => void;
  onSkip: () => void;
}

export const SingleQuestionView: React.FC<SingleQuestionViewProps> = ({
  question,
  questionIndex,
  totalQuestions,
  settings,
  onSubmitAnswer,
  onSkip,
}) => {
  const [userAnswerStr, setUserAnswerStr] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setUserAnswerStr('');
    setShowAnswer(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [questionIndex]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = userAnswerStr.trim();
    if (trimmed === '') return;
    const parsed = parseInt(trimmed, 10);
    if (!isNaN(parsed)) {
      onSubmitAnswer(parsed);
      setUserAnswerStr('');
    }
  };

  const handleRevealAnswer = () => {
    setShowAnswer(true);
    setUserAnswerStr(question.answer.toString());
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <span className="text-sm font-bold text-gray-500">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
        <div className="w-40 sm:w-56 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C9B194] transition-all duration-300"
            style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Container: Abacus on left/top, Numbers on right */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xl">
        {/* Abacus */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <Abacus
            rodCount={settings.digits1 > 2 || settings.digits2 > 2 ? 9 : 7}
            interactive={true}
            showValueReadout={true}
          />
        </div>

        {/* Numbers Column & Answer Inputs */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
          {/* Numbers Display in Column */}
          <div className="w-full min-h-[180px] flex flex-col items-center justify-center py-4 mb-4">
            <div className="flex flex-col items-center font-mono">
              {question.numbers.map((num, idx) => (
                <div
                  key={idx}
                  className={`text-5xl sm:text-6xl font-black tracking-wider leading-tight ${
                    num < 0 ? 'text-red-500' : 'text-[#C9B194]'
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Reveal / Hint if clicked */}
          {showAnswer && (
            <div className="mb-3 text-sm font-bold text-[#A88E70]">
              Correct Answer: {question.answer}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-3">
            <input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              pattern="[0-9\-]*"
              value={userAnswerStr}
              onChange={e => setUserAnswerStr(e.target.value)}
              placeholder="Enter your answer"
              className="w-full py-3.5 px-6 bg-white border-2 border-gray-200 focus:border-[#C9B194] rounded-full text-center text-2xl font-bold text-gray-900 focus:outline-none transition-all shadow-sm"
              autoFocus
            />

            {/* Buttons: All beige #C9B194 with white text! */}
            <div className="flex flex-col gap-2.5 mt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#C9B194] hover:bg-[#b89f81] text-white font-bold text-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Submit
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRevealAnswer}
                  className="flex-1 py-2.5 rounded-full bg-[#C9B194] hover:bg-[#b89f81] text-white font-bold text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  Show Answer
                </button>

                <button
                  type="button"
                  onClick={onSkip}
                  className="flex-1 py-2.5 rounded-full bg-[#C9B194] hover:bg-[#b89f81] text-white font-bold text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  Skip
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
