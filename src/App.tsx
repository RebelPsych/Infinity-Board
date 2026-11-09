import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Keyboard } from './components/Keyboard';
import { KeyboardMode, KeyboardSettings } from './types/keyboard';
import { Download, Copy, Check, Trash2, Wand2 } from 'lucide-react';
import { GradientInfinityIcon } from './components/GradientInfinityIcon';
import { autocorrectLastWord } from './utils/autocorrect';
import { PurpleParticles, PurpleParticlesRef } from './components/PurpleParticles';

export default function App() {
  const [typedText, setTypedText] = useState<string>('');
  const [mode, setMode] = useState<KeyboardMode>('alpha');
  const [activePhysicalKey, setActivePhysicalKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [autocorrectNotice, setAutocorrectNotice] = useState<string | null>(null);
  const [isDissolving, setIsDissolving] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const particlesRef = useRef<PurpleParticlesRef>(null);
  const dissolveTimerRef = useRef<number | null>(null);

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

  const showAutocorrectBadge = useCallback((message: string) => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    setAutocorrectNotice(message);
    noticeTimerRef.current = window.setTimeout(() => {
      setAutocorrectNotice(null);
    }, 2200);
  }, []);

  // Insert character with selection-replace, background autocorrect, and purple dissolve effects
  const handleInsertChar = useCallback((char: string) => {
    const isFirstChar = typedText.length === 0;
    if (isFirstChar) {
      if (dissolveTimerRef.current) clearTimeout(dissolveTimerRef.current);
      setIsDissolving(true);
      dissolveTimerRef.current = window.setTimeout(() => {
        setIsDissolving(false);
      }, 750);
      particlesRef.current?.burst(undefined, undefined, 50, true);
    } else {
      particlesRef.current?.burst(undefined, undefined, 14, false);
    }

    const ta = textareaRef.current;
    let start = typedText.length;
    let end = typedText.length;

    if (ta) {
      start = ta.selectionStart ?? typedText.length;
      end = ta.selectionEnd ?? typedText.length;
    }

    // Replace selected text or insert at cursor
    let newText = typedText.slice(0, start) + char + typedText.slice(end);
    let newCursor = start + char.length;

    // Background autocorrect: automatically triggers when completing a word
    if (char === ' ' || char === '.' || char === ',' || char === '!' || char === '?' || char === '\n') {
      const result = autocorrectLastWord(newText, newCursor);
      if (result.didCorrect) {
        newText = result.newText;
        newCursor = result.newCursor;
        showAutocorrectBadge('Autocorrected');
      }
    }

    setTypedText(newText);
    setTimeout(() => {
      if (ta) {
        ta.focus();
        ta.setSelectionRange(newCursor, newCursor);
      }
    }, 0);
  }, [typedText, showAutocorrectBadge]);

  // Backspace: deletes highlighted text if selected, or deletes 1 char before cursor
  const handleBackspace = useCallback(() => {
    const ta = textareaRef.current;
    let start = typedText.length;
    let end = typedText.length;

    if (ta) {
      start = ta.selectionStart ?? typedText.length;
      end = ta.selectionEnd ?? typedText.length;
    }

    // Highlighting a word/range and hitting backspace: delete highlighted text!
    if (start !== end) {
      const newText = typedText.slice(0, start) + typedText.slice(end);
      setTypedText(newText);
      setTimeout(() => {
        if (ta) {
          ta.focus();
          ta.setSelectionRange(start, start);
        }
      }, 0);
      return;
    }

    // No selection: delete 1 character before cursor
    if (start > 0) {
      const newText = typedText.slice(0, start - 1) + typedText.slice(start);
      const newCursor = start - 1;
      setTypedText(newText);
      setTimeout(() => {
        if (ta) {
          ta.focus();
          ta.setSelectionRange(newCursor, newCursor);
        }
      }, 0);
    }
  }, [typedText]);

  const handleTab = useCallback(() => {
    handleInsertChar('    ');
  }, [handleInsertChar]);

  const handleEnter = useCallback(() => {
    handleInsertChar('\n');
  }, [handleInsertChar]);

  const handleClear = useCallback(() => {
    setTypedText('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
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

  // Handle direct textarea changes (e.g. typing or pasting directly in preview)
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let val = e.target.value;
    const cur = e.target.selectionStart ?? val.length;

    // Check if the typed character is a word boundary
    if (cur > 0 && [' ', '.', ',', '!', '?', '\n'].includes(val[cur - 1])) {
      const result = autocorrectLastWord(val, cur);
      if (result.didCorrect) {
        val = result.newText;
        setTypedText(val);
        showAutocorrectBadge('Autocorrected');
        setTimeout(() => {
          e.target.setSelectionRange(result.newCursor, result.newCursor);
        }, 0);
        return;
      }
    }
    setTypedText(val);
  };

  // Physical keyboard listener: integrates selection deletion and autocorrect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't duplicate if typing directly inside the textarea
      if (document.activeElement === textareaRef.current) {
        setActivePhysicalKey(e.key);
        return;
      }

      setActivePhysicalKey(e.key);
      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        handleTab();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleEnter();
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
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
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
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
          <span>Hold , for ?</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Hold . for !</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Background autocorrect active</span>
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
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-300">Live Editor</span>
                {autocorrectNotice && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium animate-in fade-in duration-150">
                    <Wand2 className="w-3 h-3" />
                    <span>{autocorrectNotice}</span>
                  </span>
                )}
              </div>

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

            {/* Note Canvas Body: Interactive highlightable textarea */}
            <div className="min-h-[80px] sm:min-h-[100px] max-h-[180px] flex items-start relative">
              <textarea
                ref={textareaRef}
                value={typedText}
                onChange={handleTextareaChange}
                placeholder="Highlight any word and tap Backspace to delete. Hold , for ? and . for ! (autocorrect active)..."
                className="w-full h-full min-h-[80px] sm:min-h-[100px] max-h-[180px] bg-transparent text-white text-lg sm:text-2xl font-normal leading-relaxed resize-none focus:outline-none selection:bg-sky-500/30 selection:text-white caret-sky-400 placeholder:text-slate-500 placeholder:text-sm sm:placeholder:text-base font-sans"
                rows={3}
              />
            </div>

            {/* Note Canvas Footer */}
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-2 font-mono">
              <div className="flex items-center gap-2">
                <span>{typedText.length} chars</span>
                <span aria-hidden="true">·</span>
                <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400/90 font-medium hidden sm:inline">Autocorrect On</span>
                <span aria-hidden="true" className="text-slate-600 hidden sm:inline">·</span>
                <span className="text-slate-400">
                  Mode: <strong className="text-slate-300 font-semibold">{mode === 'symbols' ? 'Symbols' : 'QWERTY'}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Keyboard Overlay */}
      <div className="w-full relative z-30 shrink-0">
        <div className="w-full max-w-4xl mx-auto relative">
          {/* Shimmering Purple Particles Effect Layer */}
          <PurpleParticles ref={particlesRef} />
          <Keyboard
            onInsertChar={handleInsertChar}
            onBackspace={handleBackspace}
            onEnter={handleEnter}
            onTab={handleTab}
            mode={mode}
            setMode={setMode}
            settings={settings}
            activePhysicalKey={activePhysicalKey}
            isDissolving={isDissolving}
          />
        </div>
      </div>
    </div>
  );
}
