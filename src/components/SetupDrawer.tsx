import React from 'react';
import { GameSettings, MathMode } from '../types';
import { X, Play } from 'lucide-react';

interface SetupDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onStartGame: () => void;
}

export const SetupDrawer: React.FC<SetupDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onStartGame,
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Side Div coming from left with smooth slide animation, beige #C9B194, rounded circular borders */}
      <div
        className={`fixed top-0 left-0 h-full w-[88%] sm:w-[480px] bg-[#C9B194] z-50 shadow-2xl transition-transform duration-500 ease-in-out p-6 sm:p-8 flex flex-col justify-between overflow-y-auto text-white rounded-r-[2.5rem] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-black tracking-tight text-white">Kids Center Pro</h1>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#C9B194] flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Direct Input Fields (Number of Digits 1, 2, Operands, Questions, Time, Name) */}
          <div className="flex flex-col gap-3.5">
            {/* Equation Mode Selector (Simple, 5, Standard) */}
            <div className="w-full">
              <label className="block text-xs font-bold text-white/90 mb-1.5 px-2">
                Equation Mode:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'simple', label: 'Simple' },
                    { id: 'friends_of_5', label: 'Friends of 5' },
                    { id: 'standard', label: 'Standard' },
                  ] as { id: MathMode; label: string }[]
                ).map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onUpdateSettings({ mathMode: m.id })}
                    className={`py-2 px-2 rounded-full font-bold text-xs transition-all ${
                      settings.mathMode === m.id
                        ? 'bg-white text-[#C9B194] shadow-md'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Digits 1 */}
            <div className="w-full">
              <label className="block text-xs font-bold text-white/90 mb-1 px-2">
                Number of Digits 1:
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={settings.digits1}
                onChange={e => onUpdateSettings({ digits1: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full py-2.5 px-4 bg-white text-black font-semibold rounded-full text-center text-base focus:outline-none focus:ring-2 focus:ring-white shadow-sm"
                placeholder="Number of Digits 1"
              />
            </div>

            {/* Digits 2 */}
            <div className="w-full">
              <label className="block text-xs font-bold text-white/90 mb-1 px-2">
                Number of Digits 2:
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={settings.digits2}
                onChange={e => onUpdateSettings({ digits2: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full py-2.5 px-4 bg-white text-black font-semibold rounded-full text-center text-base focus:outline-none focus:ring-2 focus:ring-white shadow-sm"
                placeholder="Number of Digits 2"
              />
            </div>

            {/* Numbers in Problem (Operands) */}
            <div className="w-full">
              <label className="block text-xs font-bold text-white/90 mb-1 px-2">
                Numbers in Problem:
              </label>
              <input
                type="number"
                min={2}
                max={20}
                value={settings.numOperands}
                onChange={e => onUpdateSettings({ numOperands: Math.max(2, parseInt(e.target.value) || 2) })}
                className="w-full py-2.5 px-4 bg-white text-black font-semibold rounded-full text-center text-base focus:outline-none focus:ring-2 focus:ring-white shadow-sm"
                placeholder="Numbers in Problem"
              />
            </div>

            {/* Number of Questions */}
            <div className="w-full">
              <label className="block text-xs font-bold text-white/90 mb-1 px-2">
                Number of Questions:
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={settings.numQuestions}
                onChange={e => onUpdateSettings({ numQuestions: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full py-2.5 px-4 bg-white text-black font-semibold rounded-full text-center text-base focus:outline-none focus:ring-2 focus:ring-white shadow-sm"
                placeholder="Number of Questions"
              />
            </div>

            {/* Total Time */}
            <div className="w-full">
              <label className="block text-xs font-bold text-white/90 mb-1 px-2">
                Total Time (minutes):
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={settings.totalTimeMinutes}
                onChange={e => onUpdateSettings({ totalTimeMinutes: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full py-2.5 px-4 bg-white text-black font-semibold rounded-full text-center text-base focus:outline-none focus:ring-2 focus:ring-white shadow-sm"
                placeholder="Total Time (minutes)"
              />
            </div>

            {/* Presentation Mode: 1 (Single) or 2 (Sheet) */}
            <div className="w-full mt-1">
              <label className="block text-xs font-bold text-white/90 mb-1.5 px-2">
                Exam Mode:
              </label>
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ examMode: 1 })}
                  className={`w-12 h-12 rounded-full font-black text-xl flex items-center justify-center transition-colors shadow-md ${
                    settings.examMode === 1
                      ? 'bg-white text-[#C9B194]'
                      : 'bg-[#b89f81] text-white border-2 border-white/60'
                  }`}
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ examMode: 2 })}
                  className={`w-12 h-12 rounded-full font-black text-xl flex items-center justify-center transition-colors shadow-md ${
                    settings.examMode === 2
                      ? 'bg-white text-[#C9B194]'
                      : 'bg-[#b89f81] text-white border-2 border-white/60'
                  }`}
                >
                  2
                </button>
              </div>
              <p className="text-[11px] text-white/80 text-center mt-1">
                {settings.examMode === 1 ? 'Mode 1: Step-by-Step with Abacus' : 'Mode 2: Full Exam Sheet'}
              </p>
            </div>

            {/* Player Name */}
            <div className="w-full mt-1">
              <label className="block text-xs font-bold text-white/90 mb-1 px-2">
                Player Name:
              </label>
              <input
                type="text"
                value={settings.playerName}
                onChange={e => onUpdateSettings({ playerName: e.target.value })}
                className="w-full py-2.5 px-4 bg-white text-black font-semibold rounded-full text-center text-base focus:outline-none focus:ring-2 focus:ring-white shadow-sm"
                placeholder="Enter your name"
              />
            </div>
          </div>
        </div>

        {/* Start Test Button: Beige button with white text and border */}
        <div className="pt-6 pb-2 flex justify-center">
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartGame();
            }}
            className="w-full py-3.5 px-8 bg-[#C9B194] border-2 border-white text-white font-black text-xl rounded-full hover:bg-white hover:text-[#C9B194] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play size={20} className="fill-current" />
            <span>Start Test</span>
          </button>
        </div>
      </div>
    </>
  );
};
