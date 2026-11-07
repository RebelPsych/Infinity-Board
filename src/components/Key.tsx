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

    if (!didTriggerHoldRef.current && !onLongPress) {
      onClick();
    } else if (onLongPress && !timerRef.current) {
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
  // When a key is tapped it appears a lighter shade of grey
  const getKeyClasses = () => {
    if (isSpecial) {
      return active
        ? 'bg-[#3a3f4e] text-white border-[#555d72] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.4)]'
        : 'bg-[#15171d] text-slate-200 border-[#232732] hover:bg-[#1a1c24] shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)]';
    }
    return active
      ? 'bg-[#484f63] text-white border-[#626b84] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.4)]'
      : 'bg-[#20222a] text-white border-[#2c303c] hover:bg-[#252832] shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]';
  };

  const displayLabel = isHoldingCapital && typeof label === 'string' ? label.toUpperCase() : label;

  return (
    <div
      style={{
        flexGrow,
        flexShrink: 1,
        flexBasis: 0,
        minWidth: width || 'auto',
      }}
      className="relative flex items-center justify-center p-[1px] touch-none select-none h-full"
    >
      {/* Key Popup bubble when pressed */}
      {settings.showKeyPopup && isPressed && typeof label === 'string' && label.length === 1 && (
        <div className="absolute -top-14 z-50 pointer-events-none transform -translate-x-1/2 left-1/2 flex flex-col items-center animate-in fade-in zoom-in-95 duration-75">
          <div className="bg-[#2a2e3a] text-white text-2xl font-bold px-4 py-1.5 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.7)] border border-white/10 flex items-center justify-center min-w-[50px] min-h-[50px]">
            {isHoldingCapital ? label.toUpperCase() : label}
          </div>
          <div className="w-2.5 h-2.5 bg-[#2a2e3a] rotate-45 -mt-1.5 shadow-sm border-r border-b border-white/10" />
        </div>
      )}

      <button
        type="button"
        aria-label={ariaLabel || (typeof label === 'string' ? label : value || 'key')}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerLeave}
        onPointerLeave={handlePointerLeave}
        className={`key-tactile w-full h-full rounded-[7px] border flex flex-col items-center justify-center relative cursor-pointer select-none transition-colors duration-75 ${getKeyClasses()} ${className}`}
      >
        {children || (
          <>
            <span
              className={`text-[19px] sm:text-[21px] md:text-[23px] font-semibold tracking-normal leading-none select-none pointer-events-none ${
                isHoldingCapital ? 'text-sky-300 font-bold' : 'text-white'
              }`}
            >
              {displayLabel}
            </span>
            {subLabel && (
              <span className="text-[10px] text-slate-400 leading-none mt-0.5 select-none pointer-events-none font-medium">
                {subLabel}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
};
