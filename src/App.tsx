import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Keyboard } from './components/Keyboard';
import { EditorScreen } from './components/EditorScreen';
import { KeyboardMode, KeyboardSettings } from './types/keyboard';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

export default function App() {
  const [text, setText] = useState<string>(
    'Tap the keys below to test the high-contrast 1/3 screen keyboard.'
  );
  const [selection, setSelection] = useState<{ start: number; end: number }>({
    start: 65,
    end: 65,
  });
  const [mode, setMode] = useState<KeyboardMode>('alpha');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [activePhysicalKey, setActivePhysicalKey] = useState<string | null>(null);

  const [settings, setSettings] = useState<KeyboardSettings>({
    theme: 'charcoal',
    soundEnabled: true,
    soundVolume: 0.5,
    soundType: 'mechanical',
    hapticsEnabled: true,
    keyHeightRatio: 'standard', // 1/3 of screen
    showKeyPopup: true,
    autoCapitalize: true,
    showPhoneFrame: true,
    swipeSensitivity: 35,
  });

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  }, []);

  // Sync cursor position helper
  const updateTextAndSelection = useCallback(
    (newText: string, newCursor: number) => {
      setText(newText);
      setSelection({ start: newCursor, end: newCursor });
      if (textareaRef.current) {
        textareaRef.current.value = newText;
        textareaRef.current.setSelectionRange(newCursor, newCursor);
        textareaRef.current.focus();
      }
    },
    []
  );

  // Insert character (from virtual or physical keyboard)
  const handleInsertChar = useCallback(
    (char: string) => {
      const { start, end } = selection;
      const newText = text.slice(0, start) + char + text.slice(end);
      const newCursor = start + char.length;
      updateTextAndSelection(newText, newCursor);
    },
    [text, selection, updateTextAndSelection]
  );

  // Backspace key
  const handleBackspace = useCallback(() => {
    const { start, end } = selection;
    if (start !== end) {
      const newText = text.slice(0, start) + text.slice(end);
      updateTextAndSelection(newText, start);
    } else if (start > 0) {
      const newText = text.slice(0, start - 1) + text.slice(start);
      updateTextAndSelection(newText, start - 1);
    }
  }, [text, selection, updateTextAndSelection]);

  // Tab key
  const handleTab = useCallback(() => {
    handleInsertChar('    '); // 4-space tab indentation
    showToast('Tab indentation inserted');
  }, [handleInsertChar, showToast]);

  // Enter key
  const handleEnter = useCallback(() => {
    handleInsertChar('\n');
  }, [handleInsertChar]);

  // Physical keyboard support listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        document.activeElement !== textareaRef.current &&
        (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT')
      ) {
        return;
      }
      setActivePhysicalKey(e.key);
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
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#07080b] flex flex-col items-center justify-center font-sans antialiased">
      {/* Container: either Mobile Phone Frame or Fullscreen Docked */}
      {settings.showPhoneFrame ? (
        <div className="w-full max-w-[440px] h-full sm:h-[94vh] sm:max-h-[920px] bg-[#0c0e14] sm:rounded-[36px] sm:border-[4px] sm:border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden relative">
          {/* Mobile Status Bar (matching 4:02, LTE, 20% in screenshot) */}
          <div className="h-7 px-5 bg-[#090b10] flex items-center justify-between text-[11px] font-medium text-slate-400 select-none shrink-0 border-b border-slate-900/60">
            <span>4:02</span>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-[10px] font-bold tracking-tight text-slate-400">HD LTE</span>
              <Signal className="w-3 h-3 text-slate-300" />
              <Wifi className="w-3 h-3 text-slate-300" />
              <div className="flex items-center gap-0.5">
                <BatteryMedium className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-[10px] font-mono">20%</span>
              </div>
            </div>
          </div>

          {/* Top 2/3 of screen: Editor / Scratchpad */}
          <EditorScreen
            text={text}
            setText={setText}
            selection={selection}
            setSelection={setSelection}
            textareaRef={textareaRef}
            toastMessage={toastMessage}
            showPhoneFrame={settings.showPhoneFrame}
            setShowPhoneFrame={(val) => setSettings((s) => ({ ...s, showPhoneFrame: val }))}
          />

          {/* Bottom 1/3 of screen: The High-Contrast Keyboard */}
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

          {/* Mobile Bottom Navigation Bar (triangle, circle, square - matching user screenshot) */}
          <div className="h-9 bg-[#08090d] border-t border-slate-900/80 flex items-center justify-around text-slate-500 select-none shrink-0 px-8">
            {/* Back (Triangle) */}
            <button
              type="button"
              onClick={() => {
                if (mode === 'symbols') setMode('alpha');
              }}
              title="Back"
              className="hover:text-slate-200 transition-colors"
            >
              <div className="w-0 h-0 border-t-[7px] border-t-transparent border-r-[11px] border-r-slate-400 border-b-[7px] border-b-transparent" />
            </button>
            {/* Home (Circle) */}
            <button
              type="button"
              onClick={() => setMode('alpha')}
              title="Home"
              className="hover:text-slate-200 transition-colors"
            >
              <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400" />
            </button>
            {/* Recents (Square) */}
            <button
              type="button"
              onClick={() => setMode((m) => (m === 'alpha' ? 'symbols' : 'alpha'))}
              title="Toggle Layout"
              className="hover:text-slate-200 transition-colors"
            >
              <div className="w-3.5 h-3.5 rounded-sm border-2 border-slate-400" />
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col overflow-hidden">
          {/* Top 2/3 of screen: Editor */}
          <EditorScreen
            text={text}
            setText={setText}
            selection={selection}
            setSelection={setSelection}
            textareaRef={textareaRef}
            toastMessage={toastMessage}
            showPhoneFrame={settings.showPhoneFrame}
            setShowPhoneFrame={(val) => setSettings((s) => ({ ...s, showPhoneFrame: val }))}
          />

          {/* Bottom 1/3 of screen: Keyboard */}
          <div className="w-full flex justify-center bg-[#07080b]">
            <div className="w-full max-w-4xl">
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
      )}
    </div>
  );
}
