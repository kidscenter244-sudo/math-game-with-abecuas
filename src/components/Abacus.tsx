import React, { useEffect, useRef, useState, useCallback } from 'react';
import { soundManager } from '../utils/sound';
import { RotateCcw, Eye, EyeOff, Volume2, VolumeX } from 'lucide-react';

interface BeadState {
  id: number;
  rodIndex: number;
  deck: 'upper' | 'lower';
  beadIndex: number;
  value: number;
  active: boolean;
  currentY: number;
  targetY: number;
  width: number;
  height: number;
}

interface AbacusProps {
  rodCount?: number;
  onValueChange?: (val: number) => void;
  showValueReadout?: boolean;
  interactive?: boolean;
  compact?: boolean;
  className?: string;
}

export const Abacus: React.FC<AbacusProps> = ({
  rodCount = 7,
  onValueChange,
  showValueReadout = true,
  interactive = true,
  compact = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showValues, setShowValues] = useState<boolean>(showValueReadout);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [soundActive, setSoundActive] = useState<boolean>(soundManager.isEnabled());

  const beadsRef = useRef<BeadState[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const dragInfoRef = useRef<{
    isDragging: boolean;
    startMouseY: number;
    activeBeadId: number | null;
  }>({
    isDragging: false,
    startMouseY: 0,
    activeBeadId: null,
  });

  const metricsRef = useRef({
    width: 600,
    height: 270,
    paddingX: 28,
    paddingY: 18,
    rodSpacing: 70,
    beamY: 82,
    beamHeight: 14,
    beadHeight: 26,
    beadWidth: 52,
    lowerTravel: 38,
  });

  const calculateTotal = useCallback((beads: BeadState[]) => {
    let sum = 0;
    for (let r = 0; r < rodCount; r++) {
      let rodVal = 0;
      const rodBeads = beads.filter(b => b.rodIndex === r);
      for (const b of rodBeads) {
        if (b.active) rodVal += b.value;
      }
      const placePower = rodCount - 1 - r;
      sum += rodVal * Math.pow(10, placePower);
    }
    return sum;
  }, [rodCount]);

  const updateBeadTargets = useCallback((beads: BeadState[]) => {
    const m = metricsRef.current;
    for (const b of beads) {
      if (b.deck === 'upper') {
        const restY = m.paddingY + 6;
        const activeY = m.beamY - b.height - 2;
        b.targetY = b.active ? activeY : restY;
      } else {
        const activeBaseY = m.beamY + m.beamHeight + 2;
        const inactiveBaseY = m.height - m.paddingY - 6 - (4 * b.height);
        const lowerInRod = beads.filter(other => other.rodIndex === b.rodIndex && other.deck === 'lower');
        const activeCount = lowerInRod.filter(other => other.active).length;

        if (b.active) {
          b.targetY = activeBaseY + b.beadIndex * b.height;
        } else {
          b.targetY = inactiveBaseY + (b.beadIndex + (4 - activeCount) * 0.12) * b.height + m.lowerTravel;
        }
      }
    }
  }, []);

  const initBeads = useCallback((w: number, h: number) => {
    const m = metricsRef.current;
    m.width = w;
    m.height = h;

    const availableWidth = w - m.paddingX * 2;
    m.rodSpacing = availableWidth / (rodCount + 0.2);
    m.beadWidth = Math.min(56, Math.max(32, m.rodSpacing * 0.8));
    m.beadHeight = compact ? 22 : 26;
    m.beamHeight = compact ? 12 : 14;
    m.beamY = m.paddingY + m.beadHeight * 1.55 + 8;
    m.lowerTravel = m.beadHeight * 1.3;

    const newBeads: BeadState[] = [];
    let idCounter = 0;

    for (let r = 0; r < rodCount; r++) {
      newBeads.push({
        id: idCounter++,
        rodIndex: r,
        deck: 'upper',
        beadIndex: 0,
        value: 5,
        active: false,
        currentY: m.paddingY + 6,
        targetY: m.paddingY + 6,
        width: m.beadWidth,
        height: m.beadHeight,
      });

      for (let j = 0; j < 4; j++) {
        newBeads.push({
          id: idCounter++,
          rodIndex: r,
          deck: 'lower',
          beadIndex: j,
          value: 1,
          active: false,
          currentY: m.beamY + m.beamHeight + 15 + j * m.beadHeight,
          targetY: m.beamY + m.beamHeight + 15 + j * m.beadHeight,
          width: m.beadWidth,
          height: m.beadHeight,
        });
      }
    }

    updateBeadTargets(newBeads);
    for (const b of newBeads) {
      b.currentY = b.targetY;
    }

    beadsRef.current = newBeads;
    const initialSum = calculateTotal(newBeads);
    setTotalValue(initialSum);
  }, [rodCount, compact, updateBeadTargets, calculateTotal]);

  const handleBeadInteraction = useCallback((beadId: number) => {
    if (!interactive) return;
    const beads = beadsRef.current;
    const target = beads.find(b => b.id === beadId);
    if (!target) return;

    soundManager.playBeadClack(0.95 + (target.rodIndex / rodCount) * 0.3);

    if (target.deck === 'upper') {
      target.active = !target.active;
    } else {
      const rodLower = beads.filter(b => b.rodIndex === target.rodIndex && b.deck === 'lower');
      const clickedActive = target.active;

      if (!clickedActive) {
        for (const b of rodLower) {
          if (b.beadIndex <= target.beadIndex) b.active = true;
        }
      } else {
        for (const b of rodLower) {
          if (b.beadIndex >= target.beadIndex) b.active = false;
        }
      }
    }

    updateBeadTargets(beads);
    const newTotal = calculateTotal(beads);
    setTotalValue(newTotal);
    if (onValueChange) onValueChange(newTotal);
  }, [interactive, rodCount, updateBeadTargets, calculateTotal, onValueChange]);

  const resetAbacus = useCallback(() => {
    soundManager.playBeadResetWave(rodCount);
    const beads = beadsRef.current;

    for (let r = 0; r < rodCount; r++) {
      setTimeout(() => {
        const rodBeads = beads.filter(b => b.rodIndex === r);
        for (const b of rodBeads) {
          b.active = false;
        }
        updateBeadTargets(beads);
        const sum = calculateTotal(beads);
        setTotalValue(sum);
        if (onValueChange) onValueChange(sum);
      }, r * 25);
    }
  }, [rodCount, updateBeadTargets, calculateTotal, onValueChange]);

  // Modern Clean Canvas Drawing
  const drawModernSoroban = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const m = metricsRef.current;
    ctx.clearRect(0, 0, width, height);

    // Frame Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.08)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 4;

    // Modern Outer Frame (Crisp Slate Charcoal)
    const frameGrad = ctx.createLinearGradient(0, 0, 0, height);
    frameGrad.addColorStop(0, '#1E293B');
    frameGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = frameGrad;
    ctx.beginPath();
    ctx.roundRect(m.paddingX - 12, m.paddingY - 8, width - (m.paddingX - 12) * 2, height - (m.paddingY - 8) * 2, 16);
    ctx.fill();
    ctx.restore();

    // Inner Cutout / Light Modern Board
    const innerBg = ctx.createLinearGradient(0, m.paddingY, 0, height - m.paddingY);
    innerBg.addColorStop(0, '#F8FAFC');
    innerBg.addColorStop(1, '#F1F5F9');
    ctx.fillStyle = innerBg;
    ctx.fillRect(m.paddingX, m.paddingY, width - m.paddingX * 2, height - m.paddingY * 2);

    // Subtle inner stroke
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.strokeRect(m.paddingX, m.paddingY, width - m.paddingX * 2, height - m.paddingY * 2);

    // Modern Metallic Rods
    for (let r = 0; r < rodCount; r++) {
      const rodX = m.paddingX + m.rodSpacing * (r + 0.6);
      const rodGrad = ctx.createLinearGradient(rodX - 3, 0, rodX + 3, 0);
      rodGrad.addColorStop(0, '#CBD5E1');
      rodGrad.addColorStop(0.5, '#FFFFFF');
      rodGrad.addColorStop(1, '#94A3B8');

      ctx.fillStyle = rodGrad;
      ctx.fillRect(rodX - 2.5, m.paddingY, 5, height - m.paddingY * 2);
    }

    // Modern Reckoning Beam
    const beamGrad = ctx.createLinearGradient(0, m.beamY, 0, m.beamY + m.beamHeight);
    beamGrad.addColorStop(0, '#334155');
    beamGrad.addColorStop(1, '#1E293B');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(m.paddingX - 8, m.beamY, width - (m.paddingX - 8) * 2, m.beamHeight);

    // Modern Silver Reckoning Dots (every 3 rods)
    for (let r = 0; r < rodCount; r++) {
      const isReckoningDot = (rodCount - 1 - r) % 3 === 0;
      if (isReckoningDot) {
        const dotX = m.paddingX + m.rodSpacing * (r + 0.6);
        const dotY = m.beamY + m.beamHeight / 2;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Modern Beads Drawing with Spring Physics
    const beads = beadsRef.current;
    let needsContinueAnim = false;

    for (const b of beads) {
      const diff = b.targetY - b.currentY;
      if (Math.abs(diff) > 0.15) {
        b.currentY += diff * 0.3;
        needsContinueAnim = true;
      } else {
        b.currentY = b.targetY;
      }

      const rodX = m.paddingX + m.rodSpacing * (b.rodIndex + 0.6);
      const beadX = rodX - b.width / 2;
      const beadY = b.currentY;
      const bw = b.width;
      const bh = b.height;

      const waistY = beadY + bh / 2;
      const bevelX = bw * 0.2;

      ctx.save();
      // Modern Clean Shadow
      ctx.shadowColor = b.active ? 'rgba(201, 177, 148, 0.45)' : 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = b.active ? 8 : 4;
      ctx.shadowOffsetY = 2;

      // Modern Bi-conical Diamond Path
      ctx.beginPath();
      ctx.moveTo(beadX + bevelX, beadY);
      ctx.lineTo(beadX + bw - bevelX, beadY);
      ctx.lineTo(beadX + bw, waistY);
      ctx.lineTo(beadX + bw - bevelX, beadY + bh);
      ctx.lineTo(beadX + bevelX, beadY + bh);
      ctx.lineTo(beadX, waistY);
      ctx.closePath();

      // Modern Color Scheme
      const beadGrad = ctx.createLinearGradient(beadX, beadY, beadX, beadY + bh);
      if (b.active) {
        // Warm Modern Beige / Caramel (Theme matching #C9B194)
        beadGrad.addColorStop(0, '#E5D5C1');
        beadGrad.addColorStop(0.35, '#C9B194');
        beadGrad.addColorStop(0.8, '#A88E70');
        beadGrad.addColorStop(1, '#8C7456');
      } else {
        // Sleek Clean Matte Slate
        beadGrad.addColorStop(0, '#F8FAFC');
        beadGrad.addColorStop(0.4, '#E2E8F0');
        beadGrad.addColorStop(0.8, '#CBD5E1');
        beadGrad.addColorStop(1, '#94A3B8');
      }

      ctx.fillStyle = beadGrad;
      ctx.fill();
      ctx.restore();

      // Sharp Equator Center Line
      ctx.strokeStyle = b.active ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(beadX + 2, waistY);
      ctx.lineTo(beadX + bw - 2, waistY);
      ctx.stroke();

      // Subtle crisp outline
      ctx.strokeStyle = b.active ? '#997E5D' : '#94A3B8';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    if (needsContinueAnim) {
      animFrameRef.current = requestAnimationFrame(() => {
        if (canvasRef.current) {
          const c = canvasRef.current.getContext('2d');
          if (c) drawModernSoroban(c, width, height);
        }
      });
    }
  }, [rodCount]);

  const requestDraw = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    drawModernSoroban(ctx, metricsRef.current.width, metricsRef.current.height);
  }, [drawModernSoroban]);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const targetWidth = Math.max(320, rect.width);
      const targetHeight = compact ? 210 : 260;

      canvasRef.current.width = targetWidth * dpr;
      canvasRef.current.height = targetHeight * dpr;
      canvasRef.current.style.width = `${targetWidth}px`;
      canvasRef.current.style.height = `${targetHeight}px`;

      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        initBeads(targetWidth, targetHeight);
        requestDraw();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [compact, initBeads, requestDraw]);

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const findBeadAtCoord = (x: number, y: number): BeadState | null => {
    const m = metricsRef.current;
    const beads = beadsRef.current;
    for (const b of beads) {
      const rodX = m.paddingX + m.rodSpacing * (b.rodIndex + 0.6);
      const beadX = rodX - b.width / 2;
      const beadY = b.currentY;
      if (
        x >= beadX - 6 &&
        x <= beadX + b.width + 6 &&
        y >= beadY - 4 &&
        y <= beadY + b.height + 4
      ) {
        return b;
      }
    }
    return null;
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCanvasCoords(e);
    const bead = findBeadAtCoord(coords.x, coords.y);
    if (bead) {
      dragInfoRef.current = {
        isDragging: true,
        startMouseY: coords.y,
        activeBeadId: bead.id,
      };
      handleBeadInteraction(bead.id);
      requestDraw();
    }
  };

  const rodValues = Array.from({ length: rodCount }, (_, r) => {
    const beads = beadsRef.current.filter(b => b.rodIndex === r);
    return beads.reduce((acc, b) => acc + (b.active ? b.value : 0), 0);
  });

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center bg-white border border-gray-200 rounded-3xl p-4 shadow-xl select-none transition-all ${className}`}
    >
      {/* Abacus Top Controls Bar */}
      <div className="w-full flex items-center justify-between px-2 py-1 mb-2 text-xs text-gray-600 font-medium border-b border-gray-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C9B194] animate-pulse" />
          <span className="font-bold text-gray-800">Modern Soroban</span>
          <span className="text-gray-400 text-[11px] hidden sm:inline">({rodCount} rods)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const res = soundManager.toggleSound();
              setSoundActive(res);
            }}
            title={soundActive ? 'Mute' : 'Unmute'}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            {soundActive ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          <button
            onClick={() => setShowValues(!showValues)}
            title="Toggle Values"
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors text-xs font-semibold"
          >
            {showValues ? <EyeOff size={14} /> : <Eye size={14} />}
            <span className="hidden sm:inline">{showValues ? 'Hide Values' : 'Show Values'}</span>
          </button>

          {/* Reset button: Beige background, white text */}
          <button
            onClick={resetAbacus}
            title="Reset All Beads"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#C9B194] hover:bg-[#b89f81] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reset Abacus</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Element */}
      <div className="relative w-full flex justify-center overflow-hidden rounded-2xl bg-white p-1">
        <canvas
          ref={canvasRef}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          className="cursor-pointer touch-none block"
        />
      </div>

      {/* Numerical Column Values */}
      {showValues && (
        <div className="w-full flex justify-around items-center mt-3 px-3 py-2 bg-gray-50 rounded-2xl border border-gray-100 text-center font-mono">
          {rodValues.map((digit, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center flex-1 transition-transform ${
                digit > 0 ? 'text-[#C9B194] font-black scale-110' : 'text-gray-400'
              }`}
            >
              <span className="text-base sm:text-lg font-bold">{digit}</span>
              <span className="text-[10px] text-gray-400 font-sans hidden sm:inline">
                {idx === rodCount - 1
                  ? 'Ones'
                  : idx === rodCount - 2
                  ? 'Tens'
                  : idx === rodCount - 3
                  ? 'Hundreds'
                  : idx === rodCount - 4
                  ? 'Thousands'
                  : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Total Reading Display */}
      {showValues && (
        <div className="w-full flex items-center justify-between mt-2.5 px-4 py-2 bg-gradient-to-r from-stone-50 via-stone-100/60 to-stone-50 rounded-2xl border border-[#C9B194]/30 text-gray-700">
          <span className="text-xs font-semibold text-gray-500">Represented Value:</span>
          <span className="text-xl font-black text-[#A88E70] font-mono">
            {totalValue.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
};
