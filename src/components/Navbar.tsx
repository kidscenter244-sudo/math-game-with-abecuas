import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import { GameSettings } from '../types';

interface NavbarProps {
  currentView: 'setup' | 'question' | 'result';
  settings: GameSettings;
  timeLeft: number;
  currentQuestionIndex: number;
  onToggleSetupDrawer: () => void;
  onBackToSetup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  settings,
  timeLeft,
  currentQuestionIndex,
  onToggleSetupDrawer,
  onBackToSetup,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleSound = () => {
    const state = soundManager.toggleSound();
    setSoundEnabled(state);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full pt-4 pb-2 sticky top-0 z-40">
      {/* 80% width, white background, rounded circular border, black shadow */}
      <nav className="w-[92%] sm:w-[85%] md:w-[80%] mx-auto bg-white rounded-full px-5 sm:px-8 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.12)] border border-gray-100 flex items-center justify-between transition-all">
        {/* Brand */}
        <div
          onClick={onBackToSetup}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-full bg-[#C9B194] text-white flex items-center justify-center font-black text-sm shadow-md">
            KC
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base text-gray-900 tracking-tight leading-none">
              Kids Center Pro
            </span>
            <span className="text-[10px] text-gray-400 font-semibold tracking-wide uppercase">
              Mental Math
            </span>
          </div>
        </div>

        {/* Center Timer / Question counter in game view */}
        {currentView === 'question' && (
          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 rounded-full bg-stone-50 border border-[#C9B194]/40 font-mono text-sm font-bold text-[#A88E70]">
              <span className="text-[11px] font-sans text-gray-400 mr-1.5">Time:</span>
              <span>{formatTimer(timeLeft)}</span>
            </div>

            {settings.examMode === 1 && (
              <div className="hidden sm:flex px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600">
                Q {currentQuestionIndex + 1} of {settings.numQuestions}
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute' : 'Unmute'}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            {soundEnabled ? <Volume2 size={16} className="text-[#C9B194]" /> : <VolumeX size={16} />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title="Fullscreen"
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors hidden sm:flex"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Settings Drawer Button: Beige background, white text */}
          <button
            onClick={onToggleSetupDrawer}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#C9B194] hover:bg-[#b89f81] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Sliders size={14} />
            <span>Setup</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
