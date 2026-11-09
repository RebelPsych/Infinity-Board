import React from 'react';
import { Key } from './Key';
import { KeyboardSettings } from '../types/keyboard';
import { Delete, CornerDownLeft } from 'lucide-react';
import { GradientInfinityIcon } from './GradientInfinityIcon';

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
  onTab,
  onSwitchToAlpha,
  settings,
}) => {
  // Row 1: Number keys (1 2 3 4 5 6 7 8 9 0) moved to symbol keyboard
  const rowNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  // Row 2: tab key > \ : " ~ ' ; / < (swapped \ and /)
  const row2Symbols = ['>', '\\', ':', '"', '~', '\'', ';', '/', '<'];

  // Row 3: * @ [ ♥ = ∞ ] ★ & followed by backspace
  const row3Symbols = ['*', '@', '[', '♥', '=', '∞', ']', '★', '&'];

  // Row 4: $ ( + - # ÷ x ) %
  const row4Symbols = ['$', '(', '+', '-', '#', '÷', 'x', ')', '%'];

  return (
    <div className="w-full h-full flex flex-col justify-between select-none p-0.5 gap-1">
      {/* Row 1: Numbers (1 2 3 4 5 6 7 8 9 0) */}
      <div className="flex w-full h-[19%] items-stretch justify-center gap-0.5">
        {rowNumbers.map((num) => (
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

      {/* Row 2: Tab key followed by > / : " ~ ' ; \ < */}
      <div className="flex w-full h-[19%] items-stretch justify-center gap-0.5">
        <Key
          label={
            <div className="flex items-center gap-1">
              <span className="text-[12px] sm:text-[14px] font-bold tracking-tight text-slate-200">Tab</span>
              <span className="text-[10px] text-slate-400 font-mono">⇥</span>
            </div>
          }
          isSpecial
          onClick={onTab}
          settings={settings}
          flexGrow={1.4}
          ariaLabel="Tab key"
        />

        {row2Symbols.map((sym) => (
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

      {/* Row 3: * @ [ ♥ = ∞ ] ★ & followed by backspace */}
      <div className="flex w-full h-[19%] items-stretch justify-center gap-0.5">
        {row3Symbols.map((sym) => (
          <Key
            key={sym}
            label={
              sym === '♥' ? (
                <span className="text-rose-400 font-bold text-[15px] leading-none select-none">{sym}</span>
              ) : sym === '★' ? (
                <span className="text-amber-300 font-bold text-lg leading-none select-none drop-shadow-[0_0_8px_rgba(56,189,248,0.85)]">{sym}</span>
              ) : sym === '∞' ? (
                <span className="text-[#b989f8] font-bold text-xl leading-none flex items-center justify-center drop-shadow-[0_0_8px_rgba(185,137,248,0.4)]">
                  ∞
                </span>
              ) : (
                sym
              )
            }
            value={sym}
            onClick={() => onInsertChar(sym)}
            settings={settings}
            flexGrow={1}
          />
        ))}

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

      {/* Row 4: $ ( + - # ÷ x ) % */}
      <div className="flex w-full h-[19%] items-stretch justify-center gap-0.5 px-[1.5%]">
        {row4Symbols.map((sym) => (
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

      {/* Row 5: ABC key, Comma, Space, Period, Enter */}
      <div className="flex w-full h-[22%] items-stretch justify-center gap-0.5">
        {/* ABC Key to switch back to Main Keyboard */}
        <Key
          label={
            <div className="flex items-center gap-1 font-bold text-sky-400">
              <span className="text-[14px] sm:text-[16px] font-black tracking-wider">ABC</span>
            </div>
          }
          isSpecial
          onClick={onSwitchToAlpha}
          settings={settings}
          flexGrow={1.4}
          ariaLabel="Switch to ABC Keyboard"
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

        {/* Spacebar */}
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

        {/* Enter Key: bigger symbol and centered */}
        <Key
          label={
            <div className="w-full h-full flex items-center justify-center">
              <CornerDownLeft className="w-7 h-7 text-sky-400 stroke-[2.4]" />
            </div>
          }
          isSpecial
          onClick={onEnter}
          settings={settings}
          specialType="enter"
          flexGrow={1.5}
          ariaLabel="Enter"
          className="border-sky-500/25 bg-[#141824] hover:bg-[#1c2233]"
        />
      </div>
    </div>
  );
};
