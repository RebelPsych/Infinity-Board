import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Keyboard } from './components/Keyboard';
import { KeyboardMode, KeyboardSettings } from './types/keyboard';
import { Download, Copy, Check, Trash2, ArrowUpRight } from 'lucide-react';
import { GradientInfinityIcon } from './components/GradientInfinityIcon';

export default function App() {
  const [typedText, setTypedText] = useState<string>('');
  const [mode, setMode] = useState<KeyboardMode>('alpha');
  const [activePhysicalKey, setActivePhysicalKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const settings: KeyboardSettings = {
    theme: 'charcoal',
    soundEnabled: true,
    soundVolume: 0.5,
    soundType: 'mechanical',
    hapticsEnabled: true,
    keyHeightRatio: 'standard',
    showKeyPopup: true,
    autoCapitalize: true,
    showPhoneFrame: false,
    swipeSensitivity: 35,
  };

  const handleInsertChar = useCallback((char: string) => {
    setTypedText((prev) => prev + char);
  }, []);

  const handleBackspace = useCallback(() => {
    setTypedText((prev) => prev.slice(0, -1));
  }, []);

  const handleTab = useCallback(() => {
    setTypedText((prev) => prev + '    ');
  }, []);

  const handleEnter = useCallback(() => {
    setTypedText((prev) => prev + '\n');
  }, []);

  const handleClear = useCallback(() => {
    setTypedText('');
  }, []);

  const handleCopy = useCallback(async () => {
    if (!typedText) return;
    try {
      await navigator.clipboard.writeText(typedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }, [typedText]);

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setActivePhysicalKey(e.key);
      if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        handleTab();
      } else if (e.key === 'Enter') {
        handleEnter();
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        handleInsertChar(e.key);
      }
    };

    const handleKeyUp = () => {
      setActivePhysicalKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleBackspace, handleTab, handleEnter, handleInsertChar]);

  const wordCount = typedText.trim() ? typedText.trim().split(/\s+/).length : 0;

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0c0d12] flex flex-col justify-between font-sans select-none relative text-slate-100">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(56,189,248,0.08),transparent_70%)] pointer-events-none" />

      {/* Top 3-Zone Clean Header */}
      <header className="relative z-20 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-white/5 bg-[#10121a]/95 backdrop-blur-md shrink-0">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <GradientInfinityIcon size={22} />
          <span className="text-sm sm:text-base font-bold tracking-tight text-white whitespace-nowrap">
            Infinity Board
          </span>
          <span className="text-[11px] font-mono text-slate-400 border border-white/10 px-1.5 py-0.5 rounded text-xs leading-none">
            test
          </span>
        </div>

        {/* Zone 2: Concise Unboxed Helper Text */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span>Instant tap to type</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Tap ∞ for symbols</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Shift ⇧ · Swapped ? and ⌫</span>
        </div>

        {/* Zone 3: Primary Action CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/downloads/app-test.apk"
            download="app-test.apk"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/10 text-white font-medium text-xs shadow-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Download APK</span>
          </a>
        </div>
      </header>

      {/* Live typing canvas area */}
      <main className="flex-1 flex flex-col justify-end p-4 sm:p-6 relative z-10 overflow-hidden">
        <div className="w-full max-w-2xl mx-auto flex flex-col justify-end min-h-[160px] pb-2">
          <div className="relative bg-[#13151e]/90 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-[0_12px_36px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all">
            {/* Note Canvas Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 text-xs text-slate-400">
              <span className="font-medium text-slate-300">Live Typing Preview</span>
              <div className="flex items-center gap-1">
                {typedText.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px]"
                      title="Copy text"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="p-1.5 rounded-md bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Clear text"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Note Canvas Body */}
            <div className="min-h-[70px] sm:min-h-[90px] max-h-[180px] overflow-y-auto flex items-start">
              {typedText.length > 0 ? (
                <div className="text-lg sm:text-2xl font-normal text-white break-words whitespace-pre-wrap leading-relaxed w-full">
                  {typedText}
                  <span className="inline-block w-2 sm:w-2.5 h-5 sm:h-6 bg-sky-400 ml-1 translate-y-1 animate-pulse rounded-xs" />
                </div>
              ) : (
                <div className="flex flex-col justify-center py-2 text-slate-400">
                  <p className="text-sm sm:text-base font-normal text-slate-300">
                    Type on the keyboard below to test...
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Super-fast typing · Numbers 1-0 on top · Tap ∞ for symbols
                  </p>
                </div>
              )}
            </div>

            {/* Note Canvas Footer */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-2 font-mono">
              <div className="flex items-center gap-2">
                <span>{typedText.length} chars</span>
                <span aria-hidden="true">·</span>
                <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
              </div>
              <span className="text-slate-400">
                Mode: <strong className="text-slate-300 font-semibold">{mode === 'symbols' ? 'Symbols' : 'QWERTY'}</strong>
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Keyboard Overlay */}
      <div className="w-full relative z-30 shrink-0">
        <div className="w-full max-w-4xl mx-auto">
          <Keyboard
            onInsertChar={handleInsertChar}
            onBackspace={handleBackspace}
            onEnter={handleEnter}
            onTab={handleTab}
            mode={mode}
            setMode={setMode}
            settings={settings}
            activePhysicalKey={activePhysicalKey}
          />
        </div>
      </div>
    </div>
  );
}
