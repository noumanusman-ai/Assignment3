"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { CitationList } from "./citation-list";
import { BranchNavigator } from "./branch-navigator";
import { Copy, Check, Pencil, RefreshCw } from "lucide-react";
import type { Citation } from "@/types";

interface MessageBubbleProps {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[] | null;
  createdAt?: Date;
  isStreaming?: boolean;
  siblingIndex?: number;
  totalSiblings?: number;
  onSwitchBranch?: (direction: "prev" | "next") => void;
  onEdit?: (content: string) => void;
  onRegenerate?: () => void;
}

export function MessageBubble({
  id,
  role,
  content,
  citations,
  createdAt,
  isStreaming,
  siblingIndex = 0,
  totalSiblings = 1,
  onSwitchBranch,
  onEdit,
  onRegenerate,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  const isUser = role === "user";

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleEditSubmit() {
    if (editContent.trim() && editContent !== content) {
      onEdit?.(editContent.trim());
    }
    setEditing(false);
  }

  // Widget card style matching chat.html
  return (
    <div
      className="group rounded-xl shadow-2xl overflow-hidden"
      style={{
        background: "rgba(13, 13, 13, 0.8)",
        backdropFilter: "blur(12px)",
        border: "1px solid #262626",
      }}
    >
      {/* Card header */}
      <div
        className={`px-4 py-2 border-b border-[#262626] flex items-center justify-between ${
          isUser ? "bg-white/5" : "bg-[#6467f2]/10"
        }`}
      >
        <div className="flex items-center gap-2">
          {!isUser && (
            <span className="material-symbols-outlined text-xs text-[#6467f2]">
              auto_awesome
            </span>
          )}
          <span
            className={`text-[10px] font-bold uppercase tracking-widest ${
              isUser ? "text-slate-500" : "text-[#6467f2]"
            }`}
          >
            {isUser ? "Query Intent" : "AI Implementation Strategy"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {totalSiblings > 1 && onSwitchBranch && (
            <BranchNavigator
              currentIndex={siblingIndex}
              totalSiblings={totalSiblings}
              onPrev={() => onSwitchBranch("prev")}
              onNext={() => onSwitchBranch("next")}
            />
          )}
          {createdAt && (
            <span className="text-[10px] text-slate-600">
              {new Date(createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          <span className="material-symbols-outlined text-xs text-slate-600">
            drag_indicator
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
        {isUser && (
          <div className="flex items-center gap-3 mb-3">
            <div className="size-6 rounded bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase">
              You
            </div>
          </div>
        )}

        {editing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[80px] rounded-lg bg-black/40 border border-[#262626] p-3 text-[13px] text-white focus:outline-none focus:border-[#6467f2]/50 transition-colors"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleEditSubmit}
                className="px-4 py-1.5 bg-[#6467f2] hover:bg-[#6467f2]/90 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Save & Submit
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditContent(content);
                }}
                className="px-4 py-1.5 bg-white/5 border border-[#262626] text-slate-400 text-xs font-medium rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : isUser ? (
          <p className="text-[13px] leading-relaxed text-slate-300 whitespace-pre-wrap">
            {content}
          </p>
        ) : (
          <div className="text-[14px] leading-relaxed text-slate-300 prose prose-sm prose-invert max-w-none [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-[#050505] [&_pre]:border [&_pre]:border-[#262626] [&_pre]:p-5 [&_pre]:font-mono [&_pre]:text-[13px] [&_pre]:leading-6 [&_code]:text-[#6467f2] [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_a]:text-[#6467f2] [&_strong]:text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {content}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block h-4 w-1.5 animate-pulse bg-[#6467f2] ml-0.5 rounded-full" />
            )}
          </div>
        )}

        {/* Citations */}
        {!isUser && citations && citations.length > 0 && (
          <CitationList citations={citations} />
        )}
      </div>

      {/* Actions footer — visible on hover */}
      {!isStreaming && (
        <div className="px-4 py-2 border-t border-[#262626] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            aria-label="Copy message"
            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-[#6467f2] transition-colors px-2 py-1 rounded"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">
                  content_copy
                </span>
                Copy
              </>
            )}
          </button>

          {isUser && onEdit && (
            <button
              onClick={() => setEditing(true)}
              aria-label="Edit message"
              className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-[#6467f2] transition-colors border-l border-[#262626] pl-3 ml-1 px-2 py-1 rounded"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
          )}

          {!isUser && onRegenerate && (
            <button
              onClick={onRegenerate}
              aria-label="Regenerate response"
              className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-[#6467f2] transition-colors border-l border-[#262626] pl-3 ml-1 px-2 py-1 rounded"
            >
              <RefreshCw className="h-3 w-3" />
              Regenerate
            </button>
          )}
        </div>
      )}
    </div>
  );
}
