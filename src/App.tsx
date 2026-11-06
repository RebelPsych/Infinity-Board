import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Keyboard } from './components/Keyboard';
import { KeyboardMode, KeyboardSettings } from './types/keyboard';
import { Download, Sparkles, X } from 'lucide-react';

export default function App() {
  const [typedText, setTypedText] = useState<string>('');
  const [mode, setMode] = useState<KeyboardMode>('alpha');
  const [activePhysicalKey, setActivePhysicalKey] = useState<string | null>(null);

  const settings: KeyboardSettings = {
    theme: 'charcoal',
    soundEnabled: true,
    soundVolume: 0.5,
    soundType: 'mechanical',
    hapticsEnabled: true,
    keyHeightRatio: 'standard', // Takes 1/3 of screen
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

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#090b10] flex flex-col justify-between font-sans select-none relative">
      {/* Background ambient texture */}
      <div className="absolute inset-0 bg-radial from-slate-900/40 via-transparent to-black pointer-events-none" />

      {/* Top minimal header bar with Direct APK download */}
      <header className="relative z-20 flex items-center justify-between px-4 py-3 border-b border-slate-800/60 bg-[#0c0e14]/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="text-sm font-bold tracking-tight text-white">OnyxKey</h1>
          <span className="text-xs text-slate-500 font-medium">· Keyboard Overlay App</span>
        </div>

        <a
          href="/downloads/app-debug.apk"
          download="app-debug.apk"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download APK</span>
        </a>
      </header>

      {/* Screen area above keyboard: Live overlay typing display */}
      <main className="flex-1 flex flex-col justify-end p-4 sm:p-6 relative z-10 overflow-hidden">
        <div className="w-full max-w-3xl mx-auto flex flex-col justify-end min-h-[160px] pb-2">
          {typedText.length > 0 ? (
            <div className="relative group bg-slate-900/80 border border-slate-700/60 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl transition-all">
              <button
                type="button"
                onClick={handleClear}
                title="Clear text"
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-lg sm:text-2xl font-medium text-white break-words whitespace-pre-wrap leading-relaxed pr-8">
                {typedText}
                <span className="inline-block w-2 sm:w-2.5 h-5 sm:h-6 bg-sky-400 ml-1 translate-y-1 animate-pulse rounded-xs" />
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono border-t border-slate-800/80 pt-2">
                <span>{typedText.length} characters</span>
                <span className="text-slate-400">Keyboard active</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 px-4 border border-dashed border-slate-800/80 rounded-2xl bg-slate-950/40 backdrop-blur-sm">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-sky-400 mb-2 border border-slate-800">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-300">
                Tap the keyboard below or type on your device
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Standard QWERTY · Tab key · Comma & Period · Swipe left on spacebar (∞) for symbols
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom 1/3 of the screen: The Keyboard Overlay */}
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
