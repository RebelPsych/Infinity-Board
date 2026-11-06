import React, { useRef, useState } from 'react';
import { Key } from './Key';
import { SymbolsLayout } from './SymbolsLayout';
import { KeyboardMode, ShiftState, KeyboardSettings } from '../types/keyboard';
import {
  ArrowBigUp,
  Delete,
  CornerDownLeft,
  Infinity as InfinityIcon,
} from 'lucide-react';

interface KeyboardProps {
  onInsertChar: (char: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  onTab: () => void;
  mode: KeyboardMode;
  setMode: (mode: KeyboardMode) => void;
  settings: KeyboardSettings;
  activePhysicalKey?: string | null;
}

export const Keyboard: React.FC<KeyboardProps> = ({
  onInsertChar,
  onBackspace,
  onEnter,
  onTab,
  mode,
  setMode,
  settings,
  activePhysicalKey,
}) => {
  const [shiftState, setShiftState] = useState<ShiftState>('off');
  const lastShiftTapRef = useRef<number>(0);

  // Spacebar swipe detection
  const spaceTouchStart = useRef<{ x: number; y: number } | null>(null);
  const [spaceDragOffset, setSpaceDragOffset] = useState<number>(0);

  // Keyboard Rows definition
  const row1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  const row2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
  const row3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

  // Handle shift toggle
  const handleShiftClick = () => {
    const now = Date.now();
    const isDoubleTap = now - lastShiftTapRef.current < 300;
    lastShiftTapRef.current = now;

    if (isDoubleTap) {
      setShiftState((prev) => (prev === 'caps' ? 'off' : 'caps'));
    } else {
      setShiftState((prev) => {
        if (prev === 'off') return 'shift';
        if (prev === 'shift') return 'off';
        return 'off';
      });
    }
  };

  // When a character is typed:
  const handleCharClick = (char: string) => {
    const output = shiftState !== 'off' ? char.toUpperCase() : char.toLowerCase();
    onInsertChar(output);

    // If it was a one-time shift, reset to lowercase
    if (shiftState === 'shift') {
      setShiftState('off');
    }
  };

  // Spacebar swipe detection (Left = Symbols)
  const handleSpaceTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    spaceTouchStart.current = { x: clientX, y: clientY };
    setSpaceDragOffset(0);
  };

  const handleSpaceTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!spaceTouchStart.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diffX = clientX - spaceTouchStart.current.x;
    const clamped = Math.max(-60, Math.min(20, diffX));
    setSpaceDragOffset(clamped);
  };

  const handleSpaceTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!spaceTouchStart.current) return;
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const diffX = clientX - spaceTouchStart.current.x;
    const diffY = ('changedTouches' in e ? e.changedTouches[0].clientY : e.clientY) - spaceTouchStart.current.y;

    setSpaceDragOffset(0);

    const threshold = settings.swipeSensitivity || 35;
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < -threshold) {
        // Swipe LEFT on spacebar -> numbers and symbols
        setMode('symbols');
        spaceTouchStart.current = null;
        return;
      }
    }

    // Tap on spacebar without swipe -> insert space
    if (Math.abs(diffX) < 15 && Math.abs(diffY) < 15) {
      onInsertChar(' ');
    }

    spaceTouchStart.current = null;
  };

  // Keyboard height ratio calculation for taking 1/3 of the screen
  const getHeightStyle = () => {
    switch (settings.keyHeightRatio) {
      case 'compact':
        return 'h-[30vh] min-h-[220px] max-h-[300px]';
      case 'tall':
        return 'h-[38vh] min-h-[260px] max-h-[360px]';
      case 'standard':
      default:
        // Exactly ~1/3 of the screen
        return 'h-[33.3vh] min-h-[240px] max-h-[330px]';
    }
  };

  return (
    <div
      className={`w-full ${getHeightStyle()} bg-[#0b0d12] border-t border-slate-800/80 shadow-2xl flex flex-col justify-between p-1 select-none relative z-30 transition-all duration-150`}
    >
      {/* Gesture hint banner if user hovers / subtle indicator */}
      <div className="absolute -top-6 left-0 right-0 flex items-center justify-center px-3 text-[10px] text-slate-500 font-medium select-none pointer-events-none">
        <span className="flex items-center gap-1 opacity-70">
          <span className="text-sky-400">← Swipe Left on Spacebar</span> or tap (∞) for Numbers & Symbols
        </span>
      </div>

      {mode === 'symbols' ? (
        <SymbolsLayout
          onInsertChar={onInsertChar}
          onBackspace={onBackspace}
          onEnter={onEnter}
          onTab={onTab}
          onSwitchToAlpha={() => setMode('alpha')}
          settings={settings}
        />
      ) : (
        <div className="w-full h-full flex flex-col justify-between gap-1 p-0.5">
          {/* Row 1: q w e r t y u i o p */}
          <div className="flex w-full h-[24%] items-stretch justify-center gap-1">
            {row1.map((letter) => {
              const displayChar = shiftState !== 'off' ? letter.toUpperCase() : letter;
              const isPhysicallyPressed =
                activePhysicalKey?.toLowerCase() === letter.toLowerCase();
              return (
                <Key
                  key={letter}
                  label={displayChar}
                  value={displayChar}
                  onClick={() => handleCharClick(letter)}
                  settings={settings}
                  isPhysicalActive={isPhysicallyPressed}
                  flexGrow={1}
                />
              );
            })}
          </div>

          {/* Row 2: a s d f g h j k l (with slight ergonomic side padding) */}
          <div className="flex w-full h-[24%] items-stretch justify-center gap-1 px-[2%]">
            {row2.map((letter) => {
              const displayChar = shiftState !== 'off' ? letter.toUpperCase() : letter;
              const isPhysicallyPressed =
                activePhysicalKey?.toLowerCase() === letter.toLowerCase();
              return (
                <Key
                  key={letter}
                  label={displayChar}
                  value={displayChar}
                  onClick={() => handleCharClick(letter)}
                  settings={settings}
                  isPhysicalActive={isPhysicallyPressed}
                  flexGrow={1}
                />
              );
            })}
          </div>

          {/* Row 3: Shift, z x c v b n m, Backspace */}
          <div className="flex w-full h-[24%] items-stretch justify-center gap-1">
            {/* Shift Key */}
            <Key
              label={
                <div className="relative flex items-center justify-center">
                  <ArrowBigUp
                    className={`w-5 h-5 transition-transform duration-75 ${
                      shiftState !== 'off'
                        ? 'fill-current text-sky-400 scale-110'
                        : 'text-slate-300'
                    }`}
                  />
                  {shiftState === 'caps' && (
                    <span className="absolute -bottom-2 text-[7px] font-black uppercase text-sky-400 tracking-wider">
                      CAPS
                    </span>
                  )}
                </div>
              }
              isSpecial
              isActive={shiftState !== 'off'}
              onClick={handleShiftClick}
              settings={settings}
              flexGrow={1.4}
              ariaLabel="Shift / Caps Lock"
              className={shiftState !== 'off' ? 'ring-2 ring-sky-400/80 bg-sky-950/40' : ''}
            />

            {/* Z X C V B N M */}
            {row3.map((letter) => {
              const displayChar = shiftState !== 'off' ? letter.toUpperCase() : letter;
              const isPhysicallyPressed =
                activePhysicalKey?.toLowerCase() === letter.toLowerCase();
              return (
                <Key
                  key={letter}
                  label={displayChar}
                  value={displayChar}
                  onClick={() => handleCharClick(letter)}
                  settings={settings}
                  isPhysicalActive={isPhysicallyPressed}
                  flexGrow={1}
                />
              );
            })}

            {/* Backspace Key */}
            <Key
              label={<Delete className="w-5 h-5 text-slate-200" />}
              isSpecial
              onClick={onBackspace}
              onLongPress={onBackspace}
              settings={settings}
              specialType="delete"
              flexGrow={1.4}
              ariaLabel="Backspace"
            />
          </div>

          {/* Row 4 (Bottom Row):
              - Tab key (on the left)
              - comma (,)
              - Spacebar (with infinity symbol ∞ on left for swipe left to numbers/symbols)
              - period (.)
              - Enter key
          */}
          <div className="flex w-full h-[24%] items-stretch justify-center gap-1">
            {/* Tab Key */}
            <Key
              label={
                <div className="flex flex-col items-center justify-center leading-none">
                  <span className="text-[13px] sm:text-[14px] font-bold tracking-tight text-slate-200">
                    Tab
                  </span>
                  <span className="text-[8px] text-slate-400 font-mono">⇥</span>
                </div>
              }
              isSpecial
              onClick={onTab}
              settings={settings}
              flexGrow={1.4}
              ariaLabel="Tab key"
            />

            {/* Comma (,) */}
            <Key
              label=","
              value=","
              onClick={() => onInsertChar(',')}
              settings={settings}
              flexGrow={1.1}
            />

            {/* Spacebar with Infinity Symbol (left) -> swipe left or click for numbers & symbols */}
            <div
              style={{ flexGrow: 5.4, flexShrink: 1, flexBasis: 0 }}
              className="relative flex items-center justify-center p-[2px] touch-none select-none h-full"
            >
              <div
                onMouseDown={handleSpaceTouchStart}
                onMouseMove={handleSpaceTouchMove}
                onMouseUp={handleSpaceTouchEnd}
                onTouchStart={handleSpaceTouchStart}
                onTouchMove={handleSpaceTouchMove}
                onTouchEnd={handleSpaceTouchEnd}
                className="key-tactile w-full h-full rounded-[6px] border border-slate-700/60 bg-[#1e232e] text-white flex items-center justify-between px-3 relative cursor-pointer select-none transition-all duration-75 shadow-sm active:scale-[0.98] active:bg-slate-700 hover:bg-[#252c3a] group"
              >
                {/* Left side: small infinity symbol (∞) -> swipe left or click to access numbers & symbols */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMode('symbols');
                  }}
                  title="Swipe left or tap for numbers & symbols"
                  className="flex items-center gap-1 text-slate-400 hover:text-sky-300 p-1 -ml-1 rounded transition-colors group-hover:scale-105 active:scale-95"
                >
                  <InfinityIcon className="w-4 h-4 text-sky-400" />
                  <span className="text-[10px] font-bold hidden sm:inline text-sky-400/80">123</span>
                </button>

                {/* Center: Spacebar label & slide indicator */}
                <div
                  style={{
                    transform: `translateX(${spaceDragOffset}px)`,
                    transition: spaceDragOffset === 0 ? 'transform 0.2s ease' : 'none',
                  }}
                  className="flex flex-col items-center justify-center pointer-events-none select-none"
                >
                  <div className="w-16 sm:w-20 h-1 rounded-full bg-slate-500/60 mb-0.5" />
                  <span className="text-[10px] font-medium tracking-widest text-slate-400/80 uppercase">
                    Space
                  </span>
                </div>

                {/* Subtle right balance indicator */}
                <div className="w-6" />
              </div>
            </div>

            {/* Period (.) */}
            <Key
              label="."
              value="."
              onClick={() => onInsertChar('.')}
              settings={settings}
              flexGrow={1.1}
            />

            {/* Enter Key */}
            <Key
              label={<CornerDownLeft className="w-5 h-5 text-sky-400" />}
              isSpecial
              onClick={onEnter}
              settings={settings}
              specialType="enter"
              flexGrow={1.5}
              ariaLabel="Enter / Return"
              className="border-sky-500/40 bg-sky-950/40 hover:bg-sky-900/60"
            />
          </div>
        </div>
      )}
    </div>
  );
};
