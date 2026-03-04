"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import type { Citation } from "@/types";

interface CitationListProps {
  citations: Citation[];
}

export function CitationList({ citations }: CitationListProps) {
  const [expanded, setExpanded] = useState(false);

  if (citations.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <FileText className="h-3 w-3" />
        {citations.length} source{citations.length !== 1 ? "s" : ""}
        {expanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {citations.map((citation, i) => (
            <div
              key={i}
              className="rounded-md border bg-muted/30 p-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  Source {i + 1}: {citation.filename}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {(citation.score * 100).toFixed(0)}% match
                </Badge>
              </div>
              <p className="mt-1 text-muted-foreground line-clamp-3">
                {citation.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
