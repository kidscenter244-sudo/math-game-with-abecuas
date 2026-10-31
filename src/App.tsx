/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameSettings, QuestionItem, AnswerResult } from './types';
import { generateAllQuestions } from './utils/mathGenerator';
import { soundManager } from './utils/sound';
import { Navbar } from './components/Navbar';
import { SetupDrawer } from './components/SetupDrawer';
import { SingleQuestionView } from './components/SingleQuestionView';
import { SheetQuestionView } from './components/SheetQuestionView';
import { ResultScreen } from './components/ResultScreen';
import { Abacus } from './components/Abacus';
import { Play, Sliders } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'idle' | 'question' | 'result'>('idle');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  const [settings, setSettings] = useState<GameSettings>(() => {
    return {
      playerName: '',
      mathMode: 'simple',
      digits1: 1,
      digits2: 1,
      numOperands: 2,
      numQuestions: 5,
      totalTimeMinutes: 1,
      examMode: 1,
    };
  });

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(60);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const endGame = useCallback((finalResults?: AnswerResult[]) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (finalResults) {
      setResults(finalResults);
    }
    setCurrentView('result');
  }, []);

  useEffect(() => {
    if (currentView === 'question') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          if (prev <= 5) {
            soundManager.playTick();
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [currentView, endGame]);

  const handleStartGame = () => {
    const list = generateAllQuestions(settings);
    setQuestions(list);
    setCurrentQuestionIndex(0);
    setResults([]);
    setTimeLeft(settings.totalTimeMinutes * 60);
    setIsDrawerOpen(false);
    setCurrentView('question');
  };

  const handleSubmitSingleAnswer = (userAnswer: number | null) => {
    const currentQ = questions[currentQuestionIndex];
    const isCorrect = userAnswer === currentQ.answer;

    if (isCorrect) soundManager.playSuccess();
    else soundManager.playError();

    const newResult: AnswerResult = {
      question: currentQ,
      userAnswer,
      isCorrect,
    };

    const updatedResults = [...results, newResult];
    setResults(updatedResults);

    if (currentQuestionIndex + 1 >= questions.length) {
      endGame(updatedResults);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSkipQuestion = () => {
    const currentQ = questions[currentQuestionIndex];
    const newResult: AnswerResult = {
      question: currentQ,
      userAnswer: null,
      isCorrect: false,
    };

    const updatedResults = [...results, newResult];
    setResults(updatedResults);

    if (currentQuestionIndex + 1 >= questions.length) {
      endGame(updatedResults);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmitAllSheet = (answersMap: Record<number, number | null>) => {
    const evaluated: AnswerResult[] = questions.map(q => {
      const userVal = answersMap[q.id] !== undefined ? answersMap[q.id] : null;
      return {
        question: q,
        userAnswer: userVal,
        isCorrect: userVal === q.answer,
      };
    });
    endGame(evaluated);
  };

  const handleBackToSetup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentView('idle');
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 80% Width Navbar with White Background, Rounded Border, Black Shadow */}
      <Navbar
        currentView={currentView === 'idle' ? 'setup' : currentView}
        settings={settings}
        timeLeft={timeLeft}
        currentQuestionIndex={currentQuestionIndex}
        onToggleSetupDrawer={() => setIsDrawerOpen(prev => !prev)}
        onBackToSetup={handleBackToSetup}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Idle Landing View (when test hasn't started yet) */}
        {currentView === 'idle' && (
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center py-8">
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-2">
              Kids Center <span className="text-[#C9B194]">Pro</span>
            </h1>
            <p className="text-base text-gray-500 mb-8 max-w-md">
              Interactive modern mental arithmetic platform with smooth Soroban training.
            </p>

            {/* Interactive Modern Abacus for Free Practice */}
            <div className="w-full max-w-2xl mb-8">
              <Abacus rodCount={7} interactive={true} showValueReadout={true} />
            </div>

            {/* Start & Configure Buttons: Beige #C9B194 with white text */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={handleStartGame}
                className="py-4 px-10 rounded-full bg-[#C9B194] hover:bg-[#b89f81] text-white font-extrabold text-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Play size={20} className="fill-current" />
                <span>Start Test</span>
              </button>

              <button
                onClick={() => setIsDrawerOpen(true)}
                className="py-4 px-8 rounded-full bg-[#C9B194] hover:bg-[#b89f81] text-white font-bold text-lg shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Sliders size={18} />
                <span>Configure Exam</span>
              </button>
            </div>
          </div>
        )}

        {/* Question View: Mode 1 */}
        {currentView === 'question' && settings.examMode === 1 && questions.length > 0 && (
          <SingleQuestionView
            question={questions[currentQuestionIndex]}
            questionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            settings={settings}
            onSubmitAnswer={handleSubmitSingleAnswer}
            onSkip={handleSkipQuestion}
          />
        )}

        {/* Question View: Mode 2 */}
        {currentView === 'question' && settings.examMode === 2 && questions.length > 0 && (
          <SheetQuestionView
            questions={questions}
            settings={settings}
            onSubmitAll={handleSubmitAllSheet}
          />
        )}

        {/* Result Screen */}
        {currentView === 'result' && (
          <ResultScreen
            results={results}
            settings={settings}
            onBackToSetup={handleBackToSetup}
          />
        )}
      </main>

      {/* Side Div Setup Drawer (Beige #C9B194, animated from left, circular rounded border) */}
      <SetupDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onStartGame={handleStartGame}
      />
    </div>
  );
}
