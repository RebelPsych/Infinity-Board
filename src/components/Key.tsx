import React, { useRef, useState, useEffect, memo } from 'react';
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
  specialType?: 'enter' | 'delete' | 'space';
  ariaLabel?: string;
  children?: React.ReactNode;
}

export const Key: React.FC<KeyProps> = memo(({
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

  // Ultra-fast tap: trigger insertion immediately on pointerdown (0ms input latency)
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsPressed(true);

    // Audio & haptic feedback
    if (settings.soundEnabled) {
      if (specialType) {
        soundManager.playSpecialClick(specialType);
      } else {
        soundManager.playKeyClick(settings.soundType, settings.soundVolume);
      }
    }
    triggerHaptic(isSpecial ? 'medium' : 'light', settings.hapticsEnabled);

    // Instant input execution
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
      {settings.showKeyPopup && isPressed && typeof label === 'string' && label.length === 1 && (
        <div className="absolute -top-14 z-50 pointer-events-none transform -translate-x-1/2 left-1/2 flex flex-col items-center animate-in fade-in zoom-in-95 duration-50">
          <div className="bg-[#2a2e3a] text-white text-2xl font-bold px-4 py-1.5 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.7)] border border-white/10 flex items-center justify-center min-w-[50px] min-h-[50px]">
            {label}
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
              <span className="text-[10px] text-slate-400 leading-none mt-0.5 select-none pointer-events-none font-medium">
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
