"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Button } from "@/components/ui/button";
import { CitationList } from "./citation-list";
import { BranchNavigator } from "./branch-navigator";
import {
  Copy,
  Check,
  Pencil,
  RefreshCw,
  User,
  Bot,
} from "lucide-react";
import type { Citation } from "@/types";

interface MessageBubbleProps {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[] | null;
  createdAt?: Date;
  isStreaming?: boolean;
  // Branch info
  siblingIndex?: number;
  totalSiblings?: number;
  onSwitchBranch?: (direction: "prev" | "next") => void;
  // Actions
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

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={`max-w-[80%] space-y-1 ${isUser ? "items-end" : ""}`}>
        {/* Branch navigator */}
        {totalSiblings > 1 && onSwitchBranch && (
          <BranchNavigator
            currentIndex={siblingIndex}
            totalSiblings={totalSiblings}
            onPrev={() => onSwitchBranch("prev")}
            onNext={() => onSwitchBranch("next")}
          />
        )}

        <div
          className={`rounded-lg px-4 py-3 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
        >
          {editing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[60px] rounded border bg-background p-2 text-sm text-foreground"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEditSubmit}>
                  Save & Submit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setEditContent(content);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap text-sm">{content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-background/50 [&_pre]:p-3 [&_code]:text-xs">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block h-4 w-1.5 animate-pulse bg-foreground ml-0.5" />
              )}
            </div>
          )}
        </div>

        {/* Citations */}
        {!isUser && citations && citations.length > 0 && (
          <CitationList citations={citations} />
        )}

        {/* Actions bar */}
        <div className={`flex items-center gap-1 ${isUser ? "justify-end" : ""}`}>
          {createdAt && (
            <span className="text-[10px] text-muted-foreground">
              {new Date(createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}

          {!isStreaming && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCopy}
                aria-label="Copy message"
              >
                {copied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>

              {isUser && onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setEditing(true)}
                  aria-label="Edit message"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              )}

              {!isUser && onRegenerate && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={onRegenerate}
                  aria-label="Regenerate response"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
