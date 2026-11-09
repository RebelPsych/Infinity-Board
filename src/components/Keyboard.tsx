import React, { useState, useRef } from 'react';
import { Key } from './Key';
import { SymbolsLayout } from './SymbolsLayout';
import { KeyboardMode, ShiftState, KeyboardSettings } from '../types/keyboard';
import { Delete, CornerDownLeft, ArrowBigUp } from 'lucide-react';
import { GradientInfinityIcon } from './GradientInfinityIcon';

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

  // Row 1: Numbers 1 2 3 4 5 6 7 8 9 0
  const rowNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  // Row 2: qwertyuiop (10 keys)
  const row1Letters = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];

  // Row 3: asdfghjkl ? (10 keys: 9 letters + ? swapped from row 3)
  const row2Letters = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];

  // Row 4: ⇧ ! z x c v b n m ⌫
  // Starts with Shift (replaced :), then !, then 7 letters, ends with Backspace (swapped from row 2)
  const row3MiddleLetters = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

  // Standard Shift function handler
  const handleShiftClick = () => {
    const now = Date.now();
    const isDoubleTap = now - lastShiftTapRef.current < 320;
    lastShiftTapRef.current = now;

    if (isDoubleTap) {
      setShiftState((prev) => (prev === 'caps' ? 'off' : 'caps'));
    } else {
      setShiftState((prev) => (prev === 'off' ? 'shift' : 'off'));
    }
  };

  // Normal tap on letter -> types lowercase or uppercase if shifted
  const handleLetterTap = (letter: string) => {
    const char = shiftState !== 'off' ? letter.toUpperCase() : letter.toLowerCase();
    onInsertChar(char);
    if (shiftState === 'shift') {
      setShiftState('off');
    }
  };

  const isUppercase = shiftState !== 'off';

  return (
    <div className="w-full h-[275px] sm:h-[295px] bg-gradient-to-r from-[#120621] via-[#2b0e4c] to-[#18082d] border-t border-purple-500/20 shadow-[0_-8px_32px_rgba(15,4,28,0.8)] flex flex-col justify-between pt-1 px-1 pb-2 sm:pb-3 select-none relative z-30 animate-in fade-in duration-300">
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
          {/* Top Row: Numbers 1 2 3 4 5 6 7 8 9 0 */}
          <div className="flex w-full h-[19%] items-stretch justify-center gap-0.5">
            {rowNumbers.map((num) => {
              const isPhysicallyPressed = activePhysicalKey === num;
              return (
                <Key
                  key={num}
                  label={num}
                  value={num}
                  onClick={() => onInsertChar(num)}
                  settings={settings}
                  isPhysicalActive={isPhysicallyPressed}
                  flexGrow={1}
                />
              );
            })}
          </div>

          {/* Row 2: qwertyuiop */}
          <div className="flex w-full h-[19%] items-stretch justify-center gap-0.5">
            {row1Letters.map((letter) => {
              const displayChar = isUppercase ? letter.toUpperCase() : letter.toLowerCase();
              const isPhysicallyPressed =
                activePhysicalKey?.toLowerCase() === letter.toLowerCase();

              return (
                <Key
                  key={letter}
                  label={displayChar}
                  value={displayChar}
                  onClick={() => handleLetterTap(letter)}
                  settings={settings}
                  isPhysicalActive={isPhysicallyPressed}
                  flexGrow={1}
                />
              );
            })}
          </div>

          {/* Row 3: asdfghjkl (9 letters) */}
          <div className="flex w-full h-[19%] items-stretch justify-center gap-0.5 px-[2%]">
            {row2Letters.map((letter) => {
              const displayChar = isUppercase ? letter.toUpperCase() : letter.toLowerCase();
              const isPhysicallyPressed =
                activePhysicalKey?.toLowerCase() === letter.toLowerCase();

              return (
                <Key
                  key={letter}
                  label={displayChar}
                  value={displayChar}
                  onClick={() => handleLetterTap(letter)}
                  settings={settings}
                  isPhysicalActive={isPhysicallyPressed}
                  flexGrow={1}
                />
              );
            })}
          </div>

          {/* Row 4: ⇧ Shift key, z x c v b n m, ⌫ Backspace */}
          <div className="flex w-full h-[19%] items-stretch justify-center gap-0.5">
            {/* Shift Key with Standard Function */}
            <Key
              label={
                <div className="relative flex items-center justify-center">
                  <ArrowBigUp
                    className={`w-6 h-6 transition-all duration-100 ${
                      shiftState !== 'off'
                        ? 'fill-sky-400 text-sky-400 scale-105'
                        : 'text-slate-200'
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
              className={shiftState !== 'off' ? 'border-sky-500/50 bg-[#1c2433] text-sky-300' : ''}
            />

            {/* z x c v b n m */}
            {row3MiddleLetters.map((letter) => {
              const displayChar = isUppercase ? letter.toUpperCase() : letter.toLowerCase();
              const isPhysicallyPressed =
                activePhysicalKey?.toLowerCase() === letter.toLowerCase();

              return (
                <Key
                  key={letter}
                  label={displayChar}
                  value={displayChar}
                  onClick={() => handleLetterTap(letter)}
                  settings={settings}
                  isPhysicalActive={isPhysicallyPressed}
                  flexGrow={1}
                />
              );
            })}

            {/* Backspace Key at the end of Row 4 */}
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

          {/* Row 5 (Bottom Row): Infinity Key, comma (hold for ?), space, period (hold for !), Enter key */}
          <div className="flex w-full h-[22%] items-stretch justify-center gap-0.5">
            {/* Infinity Key (NO numbers 123 - clean blue-to-pink gradient infinity icon) */}
            <Key
              label={
                <div className="flex items-center justify-center">
                  <GradientInfinityIcon size={25} />
                </div>
              }
              isSpecial
              onClick={() => setMode('symbols')}
              settings={settings}
              flexGrow={1.4}
              ariaLabel="Switch to Symbol Board"
              className="border-[#272b38] bg-[#14161d] hover:bg-[#1a1d25]"
            />

            {/* Comma (,) - Hold for (?) */}
            <Key
              label=","
              value=","
              subLabel="?"
              longPressChar="?"
              onClick={() => onInsertChar(',')}
              onLongPressChar={(char) => onInsertChar(char)}
              settings={settings}
              flexGrow={1.1}
              ariaLabel="Comma, hold for question mark"
            />

            {/* Spacebar (clean, tactile look) */}
            <Key
              label={
                <div className="w-full flex items-center justify-center">
                  <div className="w-24 sm:w-36 h-1 rounded-full bg-white/20" />
                </div>
              }
              onClick={() => onInsertChar(' ')}
              settings={settings}
              specialType="space"
              flexGrow={5.4}
              ariaLabel="Space bar"
            />

            {/* Period (.) - Hold for (!) */}
            <Key
              label="."
              value="."
              subLabel="!"
              longPressChar="!"
              onClick={() => onInsertChar('.')}
              onLongPressChar={(char) => onInsertChar(char)}
              settings={settings}
              flexGrow={1.1}
              ariaLabel="Period, hold for exclamation mark"
            />

            {/* Enter Key */}
            <Key
              label={<CornerDownLeft className="w-6 h-6 text-sky-400" />}
              isSpecial
              onClick={onEnter}
              settings={settings}
              specialType="enter"
              flexGrow={1.5}
              ariaLabel="Enter / Return"
              className="border-sky-500/25 bg-[#141824] hover:bg-[#1c2233]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
