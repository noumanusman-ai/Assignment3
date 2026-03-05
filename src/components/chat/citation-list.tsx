"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Citation } from "@/types";

interface CitationListProps {
  citations: Citation[];
}

export function CitationList({ citations }: CitationListProps) {
  const [expanded, setExpanded] = useState(false);

  if (citations.length === 0) return null;

  // File type icon color mapping
  function getFileStyle(filename: string) {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "pdf")
      return {
        bg: "bg-red-500/10",
        text: "text-red-500",
        icon: "picture_as_pdf",
      };
    if (ext === "md" || ext === "txt")
      return {
        bg: "bg-blue-500/10",
        text: "text-blue-500",
        icon: "article",
      };
    return {
      bg: "bg-[#6467f2]/10",
      text: "text-[#6467f2]",
      icon: "link",
    };
  }

  return (
    <div className="mt-4 pt-4 border-t border-[#262626]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors"
      >
        Reference Library &middot; {citations.length} source
        {citations.length !== 1 ? "s" : ""}
        {expanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {citations.map((citation, i) => {
            const style = getFileStyle(citation.filename);
            return (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-[#262626] hover:border-[#6467f2]/50 transition-colors cursor-pointer group/ref"
              >
                <div
                  className={`size-10 rounded ${style.bg} flex items-center justify-center ${style.text} shrink-0`}
                >
                  <span className="material-symbols-outlined">
                    {style.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[12px] font-medium text-slate-300 truncate">
                      {citation.filename}
                    </p>
                    <span className="shrink-0 px-1.5 py-0.5 rounded bg-[#6467f2]/10 text-[10px] font-medium text-[#6467f2] border border-[#6467f2]/20">
                      {(citation.score * 100).toFixed(0)}% match
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {citation.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
