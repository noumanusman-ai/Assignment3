"use client";

import { Button } from "@/components/ui/button";
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
    <div className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5"
        onClick={onPrev}
        disabled={currentIndex === 0}
        aria-label="Previous branch"
      >
        <ChevronLeft className="h-3 w-3" />
      </Button>
      <span>
        {currentIndex + 1}/{totalSiblings}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5"
        onClick={onNext}
        disabled={currentIndex === totalSiblings - 1}
        aria-label="Next branch"
      >
        <ChevronRight className="h-3 w-3" />
      </Button>
    </div>
  );
}
