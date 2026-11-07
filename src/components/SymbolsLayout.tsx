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
  // Row 1: tab key > / : " ~ ' ; \ <
  const row1Symbols = ['>', '/', ':', '"', '~', '\'', ';', '\\', '<'];

  // Row 2: * @ [ ♥ = ∞ ] ★ & followed by backspace
  const row2Symbols = ['*', '@', '[', '♥', '=', '∞', ']', '★', '&'];

  // Row 3: $ ( + - # ÷ x ) %
  const row3Symbols = ['$', '(', '+', '-', '#', '÷', 'x', ')', '%'];

  return (
    <div className="w-full h-full flex flex-col justify-between select-none p-1 sm:p-1.5 gap-1">
      {/* Row 1: Tab key followed by > / : " ~ ' ; \ < */}
      <div className="flex w-full h-[19%] items-stretch justify-center gap-1">
        <Key
          label={
            <div className="flex items-center gap-1">
              <span className="text-[12px] sm:text-[14px] font-bold tracking-tight text-slate-200">Tab</span>
              <span className="text-[9px] text-slate-400 font-mono">⇥</span>
            </div>
          }
          isSpecial
          onClick={onTab}
          settings={settings}
          flexGrow={1.4}
          ariaLabel="Tab key"
        />

        {row1Symbols.map((sym) => (
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

      {/* Row 2: * @ [ ♥ = ∞ ] ★ & followed by backspace */}
      <div className="flex w-full h-[19%] items-stretch justify-center gap-1">
        {row2Symbols.map((sym) => (
          <Key
            key={sym}
            label={
              sym === '♥' ? (
                <span className="text-rose-500 font-bold">{sym}</span>
              ) : sym === '★' ? (
                <span className="text-amber-400 font-bold">{sym}</span>
              ) : sym === '∞' ? (
                <GradientInfinityIcon size={18} />
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

        {/* Backspace at the end of Row 2 */}
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

      {/* Row 3: $ ( + - # ÷ x ) % */}
      <div className="flex w-full h-[19%] items-stretch justify-center gap-1 px-[2%]">
        {row3Symbols.map((sym) => (
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

      {/* Row 4: ABC key (where infinity key was on main keyboard), Comma, Space, Period, Enter */}
      <div className="flex w-full h-[22%] items-stretch justify-center gap-1">
        {/* ABC Key to switch back to Main Keyboard */}
        <Key
          label={
            <div className="flex items-center gap-1 font-bold text-sky-400">
              <span className="text-[14px] sm:text-[16px] font-black tracking-wide">ABC</span>
            </div>
          }
          isSpecial
          onClick={onSwitchToAlpha}
          settings={settings}
          flexGrow={1.5}
          ariaLabel="Switch to ABC Keyboard"
          className="border-sky-500/40 bg-sky-950/40 hover:bg-sky-900/60"
        />

        {/* Comma (,) */}
        <Key
          label=","
          value=","
          onClick={() => onInsertChar(',')}
          settings={settings}
          flexGrow={1.1}
        />

        {/* Spacebar (clean, no word "space") */}
        <Key
          label={
            <div className="w-full flex items-center justify-center text-slate-400">
              <div className="w-20 sm:w-28 h-1 rounded-full bg-slate-500/50" />
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
          ariaLabel="Enter"
          className="border-sky-500/40 bg-sky-950/40 hover:bg-sky-900/60"
        />
      </div>
    </div>
  );
};
