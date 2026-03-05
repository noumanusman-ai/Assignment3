"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { buildMessagePath, getSiblings, switchBranch } from "@/lib/chat/tree";
import type { ChatMessage, Citation } from "@/types";

interface ChatInterfaceProps {
  conversationId?: string;
  initialMessages?: ChatMessage[];
}

export function ChatInterface({
  conversationId: initialConvId,
  initialMessages = [],
}: ChatInterfaceProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [convId, setConvId] = useState(initialConvId);
  const [dbMessages, setDbMessages] = useState<ChatMessage[]>(initialMessages);
  const [messagePath, setMessagePath] = useState<ChatMessage[]>([]);
  const [citationsMap, setCitationsMap] = useState<Record<string, Citation[]>>(
    {}
  );
  const [streamingCitations, setStreamingCitations] = useState<Citation[]>([]);
  const [isStreamingActive, setIsStreamingActive] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (dbMessages.length > 0) {
      const path = buildMessagePath(dbMessages);
      setMessagePath(path);

      const map: Record<string, Citation[]> = {};
      for (const msg of dbMessages) {
        if (msg.citations) {
          map[msg.id] = msg.citations;
        }
      }
      setCitationsMap(map);
    }
  }, [dbMessages]);

  const refreshMessages = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDbMessages(data.messages);
      }
    } catch (err) {
      console.error("Failed to refresh messages:", err);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messagePath, streamedContent]);

  async function sendMessage(content: string, parentId?: string | null) {
    if (!content.trim()) return;
    setIsStreamingActive(true);
    setStreamedContent("");
    setInputValue("");

    const historyMessages =
      parentId !== undefined
        ? messagePath
            .slice(
              0,
              messagePath.findIndex((m) => m.id === parentId) + 1
            )
            .map((m) => ({ role: m.role, content: m.content }))
        : messagePath.map((m) => ({ role: m.role, content: m.content }));

    const chatHistory = [
      ...historyMessages,
      { role: "user" as const, content },
    ];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          conversationId: convId,
          parentId:
            parentId !== undefined
              ? parentId
              : messagePath.length > 0
                ? messagePath[messagePath.length - 1]?.id
                : null,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const newConvId = res.headers.get("X-Conversation-Id");
      const citationsHeader = res.headers.get("X-Citations");

      if (newConvId && !convId) {
        setConvId(newConvId);
        router.replace(`/chat/${newConvId}`);
      }

      if (citationsHeader) {
        try {
          const decoded = atob(citationsHeader);
          setStreamingCitations(JSON.parse(decoded));
        } catch {}
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          setStreamedContent(fullContent);
        }
      }

      const finalConvId = newConvId || convId;
      if (finalConvId) {
        await refreshMessages(finalConvId);
      }
    } catch (err) {
      console.error("Send message failed:", err);
    } finally {
      setIsStreamingActive(false);
      setStreamedContent("");
      setStreamingCitations([]);
    }
  }

  function handleSwitchBranch(messageId: string, direction: "prev" | "next") {
    const newPath = switchBranch(
      dbMessages,
      messagePath,
      messageId,
      direction
    );
    setMessagePath(newPath);
  }

  function handleEdit(messageId: string, newContent: string) {
    const msg = dbMessages.find((m) => m.id === messageId);
    if (!msg) return;
    sendMessage(newContent, msg.parentId);
  }

  async function handleRegenerate(messageId: string) {
    const msg = dbMessages.find((m) => m.id === messageId);
    if (!msg || !msg.parentId || !convId) return;

    const parentMsg = dbMessages.find((m) => m.id === msg.parentId);
    if (!parentMsg) return;

    sendMessage(parentMsg.content, parentMsg.parentId);
  }

  function onSubmit() {
    if (!inputValue.trim() || isStreamingActive) return;
    sendMessage(inputValue);
  }

  return (
    <div
      className="flex h-full flex-col relative overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(#262626 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        backgroundColor: "#0a0a0a",
      }}
    >
      {/* Scrollable message area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pb-48"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#262626 transparent",
        }}
      >
        <div className="mx-auto max-w-3xl p-6 space-y-4">
          {/* Messages */}
          {messagePath.map((msg) => {
            const siblings = getSiblings(dbMessages, msg.id);
            const sibIdx = siblings.findIndex((s) => s.id === msg.id);

            return (
              <MessageBubble
                key={msg.id}
                id={msg.id}
                role={msg.role as "user" | "assistant"}
                content={msg.content}
                citations={citationsMap[msg.id]}
                createdAt={msg.createdAt}
                siblingIndex={sibIdx}
                totalSiblings={siblings.length}
                onSwitchBranch={
                  siblings.length > 1
                    ? (dir) => handleSwitchBranch(msg.id, dir)
                    : undefined
                }
                onEdit={
                  msg.role === "user"
                    ? (content) => handleEdit(msg.id, content)
                    : undefined
                }
                onRegenerate={
                  msg.role === "assistant"
                    ? () => handleRegenerate(msg.id)
                    : undefined
                }
              />
            );
          })}

          {/* Streaming */}
          {isStreamingActive && (
            <>
              <MessageBubble
                id="streaming-user"
                role="user"
                content={inputValue || "..."}
              />
              <MessageBubble
                id="streaming-assistant"
                role="assistant"
                content={streamedContent || ""}
                citations={
                  streamingCitations.length > 0
                    ? streamingCitations
                    : undefined
                }
                isStreaming={true}
              />
            </>
          )}

          {/* Empty state */}
          {messagePath.length === 0 && !isStreamingActive && (
            <div className="flex h-[50vh] items-center justify-center">
              <div className="text-center max-w-md">
                <div className="relative mx-auto mb-8 w-20 h-20">
                  <div className="absolute inset-0 bg-[#6467f2]/20 blur-2xl rounded-full" />
                  <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
                    <span
                      className="material-symbols-outlined text-4xl text-[#6467f2]"
                      style={{ fontVariationSettings: "'wght' 300" }}
                    >
                      grid_view
                    </span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
                  AI Insight Canvas
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Ask ArborVect anything about your uploaded documents.
                  Responses appear as interactive widget cards with code
                  snippets, citations, and more.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    "Vector Search",
                    "PDF Analysis",
                    "Code Generation",
                    "Data Insights",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-[#262626] text-[11px] font-medium text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom input */}
      <ChatInput
        input={inputValue}
        onChange={setInputValue}
        onSubmit={onSubmit}
        isLoading={isStreamingActive}
      />
    </div>
  );
}
