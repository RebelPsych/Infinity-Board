import React, { useState } from 'react';
import { Key } from './Key';
import { SymbolsLayout } from './SymbolsLayout';
import { KeyboardMode, KeyboardSettings } from '../types/keyboard';
import { Delete, CornerDownLeft } from 'lucide-react';
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
  const [showUppercase, setShowUppercase] = useState(false);

  // Row 1: Numbers (Top row: 1234567890)
  const rowNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  // Row 2: qwertyuiop
  const rowLetters1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];

  // Row 3: asdfghjkl followed by backspace
  const rowLetters2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];

  // Row 4: : ! z x c v b n m ?
  const rowRow4Keys = [
    { key: ':', isChar: true, isLetter: false },
    { key: '!', isChar: true, isLetter: false },
    { key: 'z', isChar: true, isLetter: true },
    { key: 'x', isChar: true, isLetter: true },
    { key: 'c', isChar: true, isLetter: true },
    { key: 'v', isChar: true, isLetter: true },
    { key: 'b', isChar: true, isLetter: true },
    { key: 'n', isChar: true, isLetter: true },
    { key: 'm', isChar: true, isLetter: true },
    { key: '?', isChar: true, isLetter: false },
  ];

  // Normal tap on letter -> types lowercase
  const handleLetterTap = (letter: string) => {
    const char = showUppercase ? letter.toUpperCase() : letter.toLowerCase();
    onInsertChar(char);
    if (showUppercase) {
      setShowUppercase(false);
    }
  };

  // Hold down key to capitalize
  const handleHoldCapitalize = (upperLetter: string) => {
    onInsertChar(upperLetter);
    setShowUppercase(true);
    // Auto-revert display after brief visual confirmation
    setTimeout(() => {
      setShowUppercase(false);
    }, 800);
  };

  return (
    <div className="w-full h-[40vh] min-h-[300px] max-h-[410px] bg-[#090b10] border-t border-slate-800/80 shadow-2xl flex flex-col justify-between p-1 sm:p-2 select-none relative z-30 transition-all duration-150">
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
          {/* Row 1: Numbers (1 2 3 4 5 6 7 8 9 0) */}
          <div className="flex w-full h-[19%] items-stretch justify-center gap-1">
            {rowNumbers.map((num) => (
              <Key
                key={num}
                label={num}
                value={num}
                onClick={() => onInsertChar(num)}
                settings={settings}
                isSpecial={false}
                flexGrow={1}
              />
            ))}
          </div>

          {/* Row 2: qwertyuiop (lowercase by default, uppercase if held/pressed) */}
          <div className="flex w-full h-[19%] items-stretch justify-center gap-1">
            {rowLetters1.map((letter) => {
              const displayChar = showUppercase ? letter.toUpperCase() : letter.toLowerCase();
              const isPhysicallyPressed =
                activePhysicalKey?.toLowerCase() === letter.toLowerCase();

              return (
                <Key
                  key={letter}
                  label={displayChar}
                  value={displayChar}
                  onClick={() => handleLetterTap(letter)}
                  onHoldCapitalize={() => handleHoldCapitalize(letter.toUpperCase())}
                  canCapitalize
                  settings={settings}
                  isPhysicalActive={isPhysicallyPressed}
                  flexGrow={1}
                />
              );
            })}
          </div>

          {/* Row 3: asdfghjkl backspace */}
          <div className="flex w-full h-[19%] items-stretch justify-center gap-1">
            {rowLetters2.map((letter) => {
              const displayChar = showUppercase ? letter.toUpperCase() : letter.toLowerCase();
              const isPhysicallyPressed =
                activePhysicalKey?.toLowerCase() === letter.toLowerCase();

              return (
                <Key
                  key={letter}
                  label={displayChar}
                  value={displayChar}
                  onClick={() => handleLetterTap(letter)}
                  onHoldCapitalize={() => handleHoldCapitalize(letter.toUpperCase())}
                  canCapitalize
                  settings={settings}
                  isPhysicalActive={isPhysicallyPressed}
                  flexGrow={1}
                />
              );
            })}

            {/* Backspace at the end of Row 3 */}
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

          {/* Row 4: : ! z x c v b n m ? */}
          <div className="flex w-full h-[19%] items-stretch justify-center gap-1">
            {rowRow4Keys.map(({ key, isLetter }) => {
              const displayChar =
                isLetter && showUppercase ? key.toUpperCase() : key;
              const isPhysicallyPressed =
                activePhysicalKey?.toLowerCase() === key.toLowerCase();

              return (
                <Key
                  key={key}
                  label={displayChar}
                  value={displayChar}
                  onClick={() => (isLetter ? handleLetterTap(key) : onInsertChar(key))}
                  onHoldCapitalize={
                    isLetter
                      ? () => handleHoldCapitalize(key.toUpperCase())
                      : undefined
                  }
                  canCapitalize={isLetter}
                  settings={settings}
                  isPhysicalActive={isPhysicallyPressed}
                  flexGrow={1}
                  className={!isLetter ? 'text-sky-300 font-bold' : ''}
                />
              );
            })}
          </div>

          {/* Row 5: Infinity Key, comma, space, period, Enter key */}
          <div className="flex w-full h-[22%] items-stretch justify-center gap-1">
            {/* Infinity Key (replaces tab): blue on left, pink on right, purple in middle */}
            <Key
              label={
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <GradientInfinityIcon size={24} />
                  <span className="text-[8px] font-bold tracking-tight text-slate-300 uppercase leading-none">
                    123
                  </span>
                </div>
              }
              isSpecial
              onClick={() => setMode('symbols')}
              settings={settings}
              flexGrow={1.5}
              ariaLabel="Switch to Symbol Board"
              className="border-purple-500/40 bg-purple-950/20 hover:bg-purple-900/40"
            />

            {/* Comma (,) */}
            <Key
              label=","
              value=","
              onClick={() => onInsertChar(',')}
              settings={settings}
              flexGrow={1.1}
            />

            {/* Space Bar (clean, no word 'space') */}
            <Key
              label={
                <div className="w-full flex items-center justify-center text-slate-400">
                  <div className="w-24 sm:w-36 h-1 rounded-full bg-slate-500/50" />
                </div>
              }
              onClick={() => onInsertChar(' ')}
              settings={settings}
              specialType="space"
              flexGrow={5.4}
              ariaLabel="Space bar"
            />

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
