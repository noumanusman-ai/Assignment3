"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface BranchNavigatorProps {
  currentIndex: number;
  totalSiblings: number;
  onPrev: () => void;
  onNext: () => void;
}

export function BranchNavigator({
  currentIndex,
  totalSiblings,
  onPrev,
  onNext,
}: BranchNavigatorProps) {
  if (totalSiblings <= 1) return null;

  return (
    <div className="inline-flex items-center gap-0.5 text-[10px] text-slate-500">
      <button
        onClick={onPrev}
        disabled={currentIndex === 0}
        aria-label="Previous branch"
        className="h-5 w-5 flex items-center justify-center rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="h-3 w-3" />
      </button>
      <span className="font-medium">
        {currentIndex + 1}/{totalSiblings}
      </span>
      <button
        onClick={onNext}
        disabled={currentIndex === totalSiblings - 1}
        aria-label="Next branch"
        className="h-5 w-5 flex items-center justify-center rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}
