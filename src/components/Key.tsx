import React, { useRef, useState, useEffect, memo } from 'react';
import { triggerHaptic } from '../utils/haptics';
import { soundManager } from '../utils/audio';
import { KeyboardSettings } from '../types/keyboard';

interface KeyProps {
  label: React.ReactNode;
  value?: string;
  subLabel?: React.ReactNode;
  longPressChar?: string;
  isSpecial?: boolean;
  isActive?: boolean;
  isPhysicalActive?: boolean;
  className?: string;
  flexGrow?: number;
  width?: string;
  onClick: () => void;
  onLongPress?: () => void;
  onLongPressChar?: (char: string) => void;
  settings: KeyboardSettings;
  soundType?: 'mechanical' | 'soft-click' | 'typewriter' | 'bubble';
  specialType?: 'enter' | 'delete' | 'space';
  ariaLabel?: string;
  children?: React.ReactNode;
}

export const Key: React.FC<KeyProps> = memo(({
  label,
  value,
  subLabel,
  longPressChar,
  isSpecial = false,
  isActive = false,
  isPhysicalActive = false,
  className = '',
  flexGrow = 1,
  width,
  onClick,
  onLongPress,
  onLongPressChar,
  settings,
  specialType,
  ariaLabel,
  children,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [activePopupChar, setActivePopupChar] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const repeatTimerRef = useRef<number | null>(null);
  const didTriggerLongPressRef = useRef(false);

  const active = isPressed || isPhysicalActive || isActive;

  // Ultra-fast tap: trigger insertion immediately on pointerdown (0ms input latency)
  // For keys with a long-press secondary character (comma -> ?, period -> !), wait 240ms before deciding
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsPressed(true);
    didTriggerLongPressRef.current = false;
    setActivePopupChar(typeof label === 'string' ? label : null);

    // Audio & haptic feedback
    if (settings.soundEnabled) {
      if (specialType) {
        soundManager.playSpecialClick(specialType);
      } else {
        soundManager.playKeyClick(settings.soundType, settings.soundVolume);
      }
    }
    triggerHaptic(isSpecial ? 'medium' : 'light', settings.hapticsEnabled);

    // If key has a dedicated long-press character (e.g. , -> ? or . -> !)
    if (longPressChar && onLongPressChar) {
      timerRef.current = window.setTimeout(() => {
        didTriggerLongPressRef.current = true;
        setActivePopupChar(longPressChar);
        triggerHaptic('medium', settings.hapticsEnabled);
        if (settings.soundEnabled) {
          soundManager.playSpecialClick('enter');
        }
        onLongPressChar(longPressChar);
      }, 240);
      return;
    }

    // Instant input execution for all standard keys
    onClick();

    // Fast repeat for delete/backspace if held down
    if (onLongPress) {
      timerRef.current = window.setTimeout(() => {
        onLongPress();
        repeatTimerRef.current = window.setInterval(() => {
          onLongPress();
          if (settings.soundEnabled) {
            soundManager.playSpecialClick('delete');
          }
          triggerHaptic('light', settings.hapticsEnabled);
        }, 50);
      }, 260);
    }
  };

  const handlePointerUp = () => {
    // If long-press character key was tapped and released quickly (<240ms), insert the primary character
    if (longPressChar && onLongPressChar && !didTriggerLongPressRef.current) {
      onClick();
    }

    setIsPressed(false);
    setActivePopupChar(null);
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
    setIsPressed(false);
    setActivePopupChar(null);
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
    };
  }, []);

  // Simple Keyboard Black and grey with high contrast white lettering
  // When a key is tapped it appears an instant lighter shade of grey
  const getKeyClasses = () => {
    if (isSpecial) {
      return active
        ? 'bg-[#3a3f4e] text-white border-[#555d72] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.4)]'
        : 'bg-[#15171D] text-slate-200 border-[#232732] hover:bg-[#1a1c24] shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)]';
    }
    return active
      ? 'bg-[#484f63] text-white border-[#626b84] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.4)]'
      : 'bg-[#20222A] text-white border-[#2c303c] hover:bg-[#252832] shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]';
  };

  const popupDisplay = activePopupChar || (typeof label === 'string' ? label : null);

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
      {/* Key Popup preview bubble on tap */}
      {settings.showKeyPopup && isPressed && popupDisplay && popupDisplay.length === 1 && (
        <div className="absolute -top-14 z-50 pointer-events-none transform -translate-x-1/2 left-1/2 flex flex-col items-center animate-in fade-in zoom-in-95 duration-50">
          <div className="bg-[#2a2e3a] text-white text-2xl font-bold px-4 py-1.5 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.7)] border border-white/10 flex items-center justify-center min-w-[50px] min-h-[50px]">
            {popupDisplay}
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
        className={`key-tactile w-full h-full rounded-[7px] border flex flex-col items-center justify-center relative cursor-pointer select-none transition-colors duration-50 ${getKeyClasses()} ${className}`}
      >
        {children || (
          <>
            <span className="text-[19px] sm:text-[21px] md:text-[23px] font-semibold tracking-normal normal-case leading-none select-none pointer-events-none text-white">
              {label}
            </span>
            {subLabel && (
              <span className="absolute top-1 right-1.5 text-[10px] sm:text-[11px] text-sky-400 font-bold leading-none select-none pointer-events-none">
                {subLabel}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
});

Key.displayName = 'Key';
