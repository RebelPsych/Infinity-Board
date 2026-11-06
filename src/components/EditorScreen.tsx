import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  Smartphone,
  Monitor,
  Check,
  FileText,
  Download,
  Package,
} from 'lucide-react';

interface EditorScreenProps {
  text: string;
  setText: (val: string | ((prev: string) => string)) => void;
  selection: { start: number; end: number };
  setSelection: React.Dispatch<React.SetStateAction<{ start: number; end: number }>>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  toastMessage: string | null;
  showPhoneFrame: boolean;
  setShowPhoneFrame: (val: boolean) => void;
}

export const EditorScreen: React.FC<EditorScreenProps> = ({
  text,
  setText,
  selection,
  setSelection,
  textareaRef,
  toastMessage,
  showPhoneFrame,
  setShowPhoneFrame,
}) => {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  // Sync selection state on mouse/keyboard changes in textarea
  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    setSelection({
      start: target.selectionStart,
      end: target.selectionEnd,
    });
  };

  const handleClear = () => {
    setText('');
    setSelection({ start: 0, end: 0 });
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleLoadSample = () => {
    const sample = `Hello world! This is a simple high-contrast dark mode keyboard taking up 1/3 of the screen.

Features:
• Standard QWERTY layout with clean, high-contrast letters
• Dedicated Tab key instead of Control
• Comma (,) and period (.) on the bottom row
• Dedicated Spacebar with infinity symbol (∞) on the left
• Swipe left on the spacebar (or tap ∞) to access numbers & symbols`;
    setText(sample);
    setSelection({ start: sample.length, end: sample.length });
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0f1117] text-slate-100 select-text relative">
      {/* Top Mobile Status & Tool Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800/80 bg-[#141720]/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Scratchpad</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {wordCount} words · {charCount} chars
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleLoadSample}
            title="Load sample text"
            className="px-2 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Sample</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            title="Clear text"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowPhoneFrame(!showPhoneFrame)}
            title={showPhoneFrame ? 'Switch to Full Screen View' : 'Switch to Mobile Frame View'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {showPhoneFrame ? (
              <Monitor className="w-3.5 h-3.5 text-sky-400" />
            ) : (
              <Smartphone className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Download APK & GitHub Package */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              title="Download APK / GitHub Package"
              className="px-2 py-1 text-xs font-semibold rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 transition-colors flex items-center gap-1"
            >
              <Download className="w-3 h-3 text-sky-400" />
              <span>APK</span>
            </button>

            {showDownloadMenu && (
              <div className="absolute right-0 top-8 z-50 w-56 rounded-xl bg-[#141720] border border-slate-700 shadow-2xl p-1.5 space-y-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                <a
                  href="/downloads/app-debug.apk"
                  download="app-debug.apk"
                  onClick={() => setShowDownloadMenu(false)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-white">Download APK</div>
                    <div className="text-[10px] text-slate-400">build-outputs/app-debug.apk</div>
                  </div>
                </a>

                <a
                  href="/downloads/onyxkey-github-package.zip"
                  download="onyxkey-github-package.zip"
                  onClick={() => setShowDownloadMenu(false)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
                >
                  <Package className="w-4 h-4 text-sky-400" />
                  <div>
                    <div className="font-semibold text-white">GitHub Package (.zip)</div>
                    <div className="text-[10px] text-slate-400">Complete repo with APK & CI</div>
                  </div>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="bg-slate-900/95 text-white border border-sky-500/40 px-3.5 py-1.5 rounded-full text-xs font-medium shadow-2xl flex items-center gap-1.5 backdrop-blur-md">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Textarea Container */}
      <div className="flex-1 relative p-3 sm:p-4 overflow-hidden flex flex-col">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSelection({
              start: e.target.selectionStart,
              end: e.target.selectionEnd,
            });
          }}
          onSelect={handleSelect}
          placeholder="Tap keyboard below or type here...
Try:
1. Tap 'Tab' for indentation
2. Use comma (,) and period (.) on the bottom row
3. Swipe left on spacebar or tap (∞) for numbers & symbols"
          className="w-full flex-1 bg-transparent resize-none outline-none border-none text-slate-100 placeholder:text-slate-600 font-sans text-base sm:text-lg leading-relaxed focus:ring-0 selection:bg-sky-500/30 selection:text-white"
        />
      </div>
    </div>
  );
};
