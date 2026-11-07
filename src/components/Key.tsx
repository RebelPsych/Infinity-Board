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
  onHoldCapitalize?: (upperChar: string) => void;
  canCapitalize?: boolean;
  settings: KeyboardSettings;
  soundType?: 'mechanical' | 'soft-click' | 'typewriter' | 'bubble';
  specialType?: 'enter' | 'delete' | 'space';
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
  onHoldCapitalize,
  canCapitalize = false,
  settings,
  specialType,
  ariaLabel,
  children,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHoldingCapital, setIsHoldingCapital] = useState(false);
  const timerRef = useRef<number | null>(null);
  const repeatTimerRef = useRef<number | null>(null);
  const holdCapitalTimerRef = useRef<number | null>(null);
  const didTriggerHoldRef = useRef(false);

  const active = isPressed || isPhysicalActive || isActive;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsPressed(true);
    didTriggerHoldRef.current = false;

    if (settings.soundEnabled) {
      if (specialType) {
        soundManager.playSpecialClick(specialType);
      } else {
        soundManager.playKeyClick(settings.soundType, settings.soundVolume);
      }
    }

    triggerHaptic(isSpecial ? 'medium' : 'light', settings.hapticsEnabled);

    // If this is a letter key that can be held down to capitalize
    if (canCapitalize && typeof label === 'string' && label.length === 1 && onHoldCapitalize) {
      const upper = label.toUpperCase();
      holdCapitalTimerRef.current = window.setTimeout(() => {
        didTriggerHoldRef.current = true;
        setIsHoldingCapital(true);
        triggerHaptic('medium', settings.hapticsEnabled);
        if (settings.soundEnabled) {
          soundManager.playKeyClick('mechanical', settings.soundVolume);
        }
        onHoldCapitalize(upper);
      }, 280);
    }

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
    if (holdCapitalTimerRef.current) {
      clearTimeout(holdCapitalTimerRef.current);
      holdCapitalTimerRef.current = null;
    }

    // If hold-to-capitalize did not trigger, it's a normal tap
    if (!didTriggerHoldRef.current && !onLongPress) {
      onClick();
    } else if (onLongPress && !timerRef.current) {
      // For backspace, click on tap if not already long-pressing
      onClick();
    }

    setIsPressed(false);
    setIsHoldingCapital(false);

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
    if (holdCapitalTimerRef.current) {
      clearTimeout(holdCapitalTimerRef.current);
      holdCapitalTimerRef.current = null;
    }
    setIsPressed(false);
    setIsHoldingCapital(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (repeatTimerRef.current) {
      clearInterval(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (repeatTimerRef.current) clearInterval(repeatTimerRef.current);
      if (holdCapitalTimerRef.current) clearTimeout(holdCapitalTimerRef.current);
    };
  }, []);

  // Simple Keyboard Black and grey with high contrast white lettering
  const getKeyClasses = () => {
    if (isSpecial) {
      return active
        ? 'bg-slate-700 text-white border-slate-500 shadow-md scale-[0.97]'
        : 'bg-[#181a22] text-slate-200 border-[#2b303e] hover:bg-[#20242e] shadow-sm';
    }
    return active
      ? 'bg-slate-300 text-black border-white font-bold shadow-lg scale-[0.97]'
      : 'bg-[#252834] text-white border-[#383f50] hover:bg-[#2e3342] shadow-sm';
  };

  // Label display when holding capital
  const displayLabel = isHoldingCapital && typeof label === 'string' ? label.toUpperCase() : label;

  return (
    <div
      style={{
        flexGrow,
        flexShrink: 1,
        flexBasis: 0,
        minWidth: width || 'auto',
      }}
      className="relative flex items-center justify-center p-[2.5px] touch-none select-none h-full"
    >
      {/* Key Popup bubble when pressed */}
      {settings.showKeyPopup && isPressed && typeof label === 'string' && label.length === 1 && (
        <div className="absolute -top-12 z-50 pointer-events-none transform -translate-x-1/2 left-1/2 flex flex-col items-center animate-in fade-in zoom-in-95 duration-75">
          <div className="bg-[#1c202a] text-white text-2xl font-bold px-3.5 py-1 rounded-xl shadow-2xl border-2 border-sky-400 flex items-center justify-center min-w-[46px] min-h-[46px]">
            {isHoldingCapital ? label.toUpperCase() : label}
          </div>
          <div className="w-2.5 h-2.5 bg-[#1c202a] rotate-45 -mt-1.5 shadow-sm border-r-2 border-b-2 border-sky-400" />
        </div>
      )}

      <button
        type="button"
        aria-label={ariaLabel || (typeof label === 'string' ? label : value || 'key')}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerLeave}
        onPointerLeave={handlePointerLeave}
        className={`key-tactile w-full h-full rounded-[8px] border flex flex-col items-center justify-center relative cursor-pointer select-none transition-all duration-75 ${getKeyClasses()} ${className}`}
      >
        {children || (
          <>
            <span
              className={`text-[18px] sm:text-[20px] md:text-[22px] font-semibold tracking-wide leading-none select-none pointer-events-none ${
                isHoldingCapital ? 'text-sky-300 font-bold' : ''
              }`}
            >
              {displayLabel}
            </span>
            {subLabel && (
              <span className="text-[9px] text-slate-400 leading-none mt-0.5 select-none pointer-events-none font-medium">
                {subLabel}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
};
