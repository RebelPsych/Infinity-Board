import React, { useRef, useState, useEffect } from 'react';
import { triggerHaptic } from '../utils/haptics';
import { soundManager } from '../utils/audio';
import { KeyboardSettings } from '../types/keyboard';

interface KeyProps {
  label: React.ReactNode;
  value?: string;
  subLabel?: React.ReactNode;
  isSpecial?: boolean;
  isActive?: boolean;
  isPhysicalActive?: boolean;
  className?: string;
  flexGrow?: number;
  width?: string;
  onClick: () => void;
  onLongPress?: () => void;
  settings: KeyboardSettings;
  soundType?: 'mechanical' | 'soft-click' | 'typewriter' | 'bubble';
  specialType?: 'enter' | 'delete' | 'space' | 'copy' | 'paste' | 'swipe';
  ariaLabel?: string;
  children?: React.ReactNode;
}

export const Key: React.FC<KeyProps> = ({
  label,
  value,
  subLabel,
  isSpecial = false,
  isActive = false,
  isPhysicalActive = false,
  className = '',
  flexGrow = 1,
  width,
  onClick,
  onLongPress,
  settings,
  specialType,
  ariaLabel,
  children,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const timerRef = useRef<number | null>(null);
  const repeatTimerRef = useRef<number | null>(null);

  const active = isPressed || isPhysicalActive || isActive;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsPressed(true);

    if (settings.soundEnabled) {
      if (specialType) {
        soundManager.playSpecialClick(specialType);
      } else {
        soundManager.playKeyClick(settings.soundType, settings.soundVolume);
      }
    }

    triggerHaptic(isSpecial ? 'medium' : 'light', settings.hapticsEnabled);

    onClick();

    // Long press repeat for backspace / delete
    if (onLongPress) {
      timerRef.current = window.setTimeout(() => {
        onLongPress();
        repeatTimerRef.current = window.setInterval(() => {
          onLongPress();
          if (settings.soundEnabled) {
            soundManager.playSpecialClick('delete');
          }
          triggerHaptic('light', settings.hapticsEnabled);
        }, 65);
      }, 350);
    }
  };

  const handlePointerUp = () => {
    setIsPressed(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (repeatTimerRef.current) {
      clearInterval(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
  };

  const handlePointerLeave = () => {
    handlePointerUp();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (repeatTimerRef.current) clearInterval(repeatTimerRef.current);
    };
  }, []);

  // Theme-specific styles
  const getThemeClasses = () => {
    switch (settings.theme) {
      case 'pure-black':
        return isSpecial
          ? active
            ? 'bg-slate-700 text-white border-slate-500 shadow-inner'
            : 'bg-[#181a20] text-slate-200 border-[#2b303c] hover:bg-[#20242c]'
          : active
          ? 'bg-slate-200 text-black border-white shadow-lg'
          : 'bg-[#222733] text-white border-[#343b4d] hover:bg-[#2a303f]';

      case 'high-contrast-neon':
        return isSpecial
          ? active
            ? 'bg-cyan-500 text-black border-cyan-300 font-bold'
            : 'bg-[#12161f] text-cyan-400 border-cyan-900/60 hover:bg-[#181f2c]'
          : active
          ? 'bg-cyan-400 text-black border-cyan-200 font-bold'
          : 'bg-[#1a202c] text-white border-cyan-500/30 hover:border-cyan-400/60';

      case 'matrix-green':
        return isSpecial
          ? active
            ? 'bg-emerald-500 text-black border-emerald-300'
            : 'bg-[#101912] text-emerald-400 border-emerald-900/70 hover:bg-[#162419]'
          : active
          ? 'bg-emerald-400 text-black border-emerald-300'
          : 'bg-[#142117] text-emerald-100 border-emerald-700/40 hover:bg-[#1b2c1f]';

      case 'charcoal':
      default:
        return isSpecial
          ? active
            ? 'bg-slate-700 text-white border-slate-500'
            : 'bg-[#1e222b] text-slate-200 border-[#2e3442] hover:bg-[#252b36]'
          : active
          ? 'bg-white text-slate-950 border-white font-bold'
          : 'bg-[#282e3b] text-white border-[#3c4558] hover:bg-[#313847]';
    }
  };

  return (
    <div
      style={{
        flexGrow,
        flexShrink: 1,
        flexBasis: 0,
        minWidth: width || 'auto',
      }}
      className="relative flex items-center justify-center p-[2px] touch-none select-none h-full"
    >
      {/* Key Popup bubble when pressed (native mobile keyboard feel) */}
      {settings.showKeyPopup && isPressed && typeof label === 'string' && label.length === 1 && (
        <div className="absolute -top-11 z-50 pointer-events-none transform -translate-x-1/2 left-1/2 flex flex-col items-center animate-in fade-in zoom-in-95 duration-75">
          <div className="bg-slate-100 text-slate-950 text-2xl font-bold px-3 py-1.5 rounded-lg shadow-2xl border border-slate-300 flex items-center justify-center min-w-[42px] min-h-[42px]">
            {label}
          </div>
          <div className="w-2.5 h-2.5 bg-slate-100 rotate-45 -mt-1.5 shadow-sm border-r border-b border-slate-300" />
        </div>
      )}

      <button
        type="button"
        aria-label={ariaLabel || (typeof label === 'string' ? label : value || 'key')}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className={`key-tactile w-full h-full rounded-[6px] border flex flex-col items-center justify-center relative cursor-pointer select-none transition-all duration-75 shadow-sm ${getThemeClasses()} ${
          active ? 'ring-1 ring-white/40 scale-[0.97]' : 'active:scale-[0.97]'
        } ${className}`}
      >
        {children || (
          <>
            <span className="text-[17px] sm:text-[18px] md:text-[20px] font-semibold tracking-wide leading-none select-none pointer-events-none">
              {label}
            </span>
            {subLabel && (
              <span className="text-[9px] text-slate-400/80 leading-none mt-0.5 select-none pointer-events-none font-medium">
                {subLabel}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
};
