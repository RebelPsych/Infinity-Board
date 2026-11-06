import React, { useState } from 'react';
import { Key } from './Key';
import { KeyboardSettings } from '../types/keyboard';
import { Delete, CornerDownLeft, ArrowLeft } from 'lucide-react';

interface SymbolsLayoutProps {
  onInsertChar: (char: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  onTab: () => void;
  onSwitchToAlpha: () => void;
  settings: KeyboardSettings;
}

export const SymbolsLayout: React.FC<SymbolsLayoutProps> = ({
  onInsertChar,
  onBackspace,
  onEnter,
  onSwitchToAlpha,
  settings,
}) => {
  const [symbolPage, setSymbolPage] = useState<1 | 2>(1);

  // Row 1: Numbers
  const row1 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  // Row 2: Page 1 vs Page 2
  const row2Page1 = ['@', '#', '$', '%', '&', '*', '-', '+', '(', ')'];
  const row2Page2 = ['`', '|', '•', '€', '£', '¥', '∞', '÷', '×', '^'];

  // Row 3: Page 1 vs Page 2
  const row3Page1 = ['!', '"', '\'', ':', ';', '/', '?', '='];
  const row3Page2 = ['_', '\\', '<', '>', '{', '}', '[', ']'];

  const touchStartX = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff > 50) {
      // Swiping right returns to alpha
      onSwitchToAlpha();
    }
    touchStartX.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="w-full h-full flex flex-col justify-between select-none p-1 sm:p-1.5"
    >
      {/* Row 1: Numbers 1-0 */}
      <div className="flex w-full h-[24%] items-stretch justify-center gap-1">
        {row1.map((num) => (
          <Key
            key={num}
            label={num}
            value={num}
            onClick={() => onInsertChar(num)}
            settings={settings}
            flexGrow={1}
          />
        ))}
      </div>

      {/* Row 2: Primary or Secondary Symbols */}
      <div className="flex w-full h-[24%] items-stretch justify-center gap-1">
        {(symbolPage === 1 ? row2Page1 : row2Page2).map((sym) => (
          <Key
            key={sym}
            label={sym}
            value={sym}
            onClick={() => onInsertChar(sym)}
            settings={settings}
            flexGrow={1}
          />
        ))}
      </div>

      {/* Row 3: Alt toggle, punctuation, backspace */}
      <div className="flex w-full h-[24%] items-stretch justify-center gap-1">
        {/* Toggle between Symbol Page 1 & 2 */}
        <Key
          label={symbolPage === 1 ? '½' : '2/2'}
          isSpecial
          onClick={() => setSymbolPage((prev) => (prev === 1 ? 2 : 1))}
          settings={settings}
          flexGrow={1.4}
          ariaLabel="More symbols"
          className="font-mono text-xs font-bold"
        />

        {(symbolPage === 1 ? row3Page1 : row3Page2).map((sym) => (
          <Key
            key={sym}
            label={sym}
            value={sym}
            onClick={() => onInsertChar(sym)}
            settings={settings}
            flexGrow={1}
          />
        ))}

        {/* Backspace */}
        <Key
          label={<Delete className="w-5 h-5" />}
          isSpecial
          onClick={onBackspace}
          onLongPress={onBackspace}
          settings={settings}
          specialType="delete"
          flexGrow={1.4}
          ariaLabel="Backspace"
        />
      </div>

      {/* Row 4: ABC, Comma, Space, Period, Enter */}
      <div className="flex w-full h-[24%] items-stretch justify-center gap-1">
        {/* Return to ABC */}
        <Key
          label={
            <div className="flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="font-bold text-xs sm:text-sm">ABC</span>
            </div>
          }
          isSpecial
          onClick={onSwitchToAlpha}
          settings={settings}
          flexGrow={1.4}
          ariaLabel="Return to Alphabet keyboard"
        />

        {/* Comma */}
        <Key
          label=","
          value=","
          onClick={() => onInsertChar(',')}
          settings={settings}
          flexGrow={1.1}
        />

        {/* Spacebar */}
        <Key
          label={
            <div className="w-full flex items-center justify-center text-slate-400">
              <div className="w-16 h-1 rounded-full bg-slate-600/70" />
            </div>
          }
          onClick={() => onInsertChar(' ')}
          settings={settings}
          specialType="space"
          flexGrow={5.4}
          ariaLabel="Space bar"
        />

        {/* Period */}
        <Key
          label="."
          value="."
          onClick={() => onInsertChar('.')}
          settings={settings}
          flexGrow={1.1}
        />

        {/* Enter */}
        <Key
          label={<CornerDownLeft className="w-5 h-5 text-sky-400" />}
          isSpecial
          onClick={onEnter}
          settings={settings}
          specialType="enter"
          flexGrow={1.5}
          ariaLabel="Enter"
          className="border-sky-500/40 bg-sky-950/40 hover:bg-sky-900/60"
        />
      </div>
    </div>
  );
};
