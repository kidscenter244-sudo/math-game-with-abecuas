import React, { useState } from 'react';
import { AnswerResult, GameSettings } from '../types';

interface ResultScreenProps {
  results: AnswerResult[];
  settings: GameSettings;
  onBackToSetup: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  results,
  settings,
  onBackToSetup,
}) => {
  const [showIncorrect, setShowIncorrect] = useState<boolean>(false);

  const totalQuestions = results.length;
  const correctCount = results.filter(r => r.isCorrect).length;
  const incorrectList = results.filter(r => !r.isCorrect);

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center text-center">
      {/* Result Score */}
      <div className="text-6xl sm:text-7xl font-extrabold text-[#C9B194] tracking-tight mb-2">
        {correctCount}/{totalQuestions}
      </div>
      <div className="text-xl font-semibold text-[#C9B194] mb-8">
        Your result is shown above.
      </div>

      {/* Buttons: All beige #C9B194 with white text */}
      <div className="w-full max-w-md flex flex-col gap-4">
        {incorrectList.length > 0 && !showIncorrect && (
          <button
            onClick={() => setShowIncorrect(true)}
            className="w-full py-4 text-xl font-bold rounded-full bg-[#C9B194] hover:bg-[#b89f81] text-white transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Show Incorrect Questions
          </button>
        )}

        <button
          onClick={onBackToSetup}
          className="w-full py-4 text-xl font-bold rounded-full bg-[#C9B194] hover:bg-[#b89f81] text-white transition-all shadow-md active:scale-95 cursor-pointer"
        >
          Back to Setup
        </button>
      </div>

      {/* Incorrect Questions Grid */}
      {showIncorrect && incorrectList.length > 0 && (
        <div className="w-full mt-10">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Incorrect Questions ({incorrectList.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
            {incorrectList.map((inc, index) => (
              <div
                key={index}
                className="bg-[#C9B194] p-4 rounded-2xl text-white text-xl flex flex-col items-center justify-between shadow-lg"
              >
                <div className="font-mono text-2xl font-bold leading-tight py-2">
                  {inc.question.numbers.map((n, i) => (
                    <div key={i}>{n}</div>
                  ))}
                </div>

                <div className="w-full mt-3 pt-2 border-t border-white/20">
                  <div className="text-xs text-white/80 mb-1">
                    Your Answer: {inc.userAnswer !== null ? inc.userAnswer : 'None'}
                  </div>
                  <div className="text-sm font-bold bg-white text-[#C9B194] py-1.5 px-3 rounded-full">
                    Correct: {inc.question.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
