"use client";

import { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ChatInputProps {
  input: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function ChatInput({
  input,
  onChange,
  onSubmit,
  isLoading,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [isLoading]);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 192) + "px";
    }
  }, [input]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSubmit();
      }
    }
  }

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-20">
      <div className="relative group">
        {/* Gradient glow behind input on focus */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6467f2]/20 via-[#6467f2]/5 to-[#6467f2]/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />

        <div className="relative bg-[#0a0a0a]/80 backdrop-blur-xl border border-[#262626] rounded-xl shadow-2xl focus-within:border-[#6467f2]/50 transition-all flex flex-col">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask ArborVect to analyze your documents..."
            className="w-full bg-transparent border-none focus:ring-0 text-[15px] p-4 resize-none h-[56px] min-h-[56px] max-h-48 text-slate-200 placeholder:text-slate-600 focus:outline-none"
            disabled={isLoading}
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#262626 transparent",
            }}
          />
          <div className="flex items-center justify-end px-3 py-2 border-t border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Shift + Enter for new line
              </span>
              <button
                onClick={onSubmit}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className="bg-[#6467f2] hover:bg-[#6467f2]/90 text-white size-8 rounded-lg flex items-center justify-center shadow-lg shadow-[#6467f2]/20 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-sm">
                    arrow_upward
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <p className="text-center text-[10px] text-slate-600 mt-4 uppercase tracking-[0.2em] font-semibold opacity-50">
        AI Powered Insight &bull; ArborVect 
      </p>
    </div>
  );
}
