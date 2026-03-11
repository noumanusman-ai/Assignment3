"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
// dropdown-menu removed — using custom menu instead
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  MessageSquarePlus,
  FileText,
  Trash2,
  Search,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { useSidebar } from "./sidebar-context";

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  matchSnippet?: string;
  matchRole?: string;
}

function HighlightText({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) {
  if (!highlight.trim()) return <>{text}</>;

  const regex = new RegExp(
    `(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-[#6366f1]/30 text-white rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function Sidebar() {
  const { isOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const fetchConversations = useCallback(
    async (query?: string) => {
      try {
        const url = query
          ? `/api/conversations?search=${encodeURIComponent(query)}`
          : "/api/conversations";
        const res = await fetch(url);
        if (res.ok) {
          setConversations(await res.json());
        }
      } catch {}
    },
    []
  );

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => fetchConversations(), 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    fetchConversations(search || undefined);
  }, [pathname, fetchConversations, search]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConversations(search || undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchConversations]);

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  function startRename(conv: Conversation, e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  }

  async function handleRename(id: string) {
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed === conversations.find((c) => c.id === id)?.title) {
      setEditingId(null);
      return;
    }

    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      if (res.ok) {
        toast.success("Chat renamed");
        fetchConversations();
      } else {
        toast.error("Failed to rename chat");
      }
    } catch {
      toast.error("Failed to rename chat");
    }
    setEditingId(null);
  }

  function handleRenameKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    id: string
  ) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRename(id);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`/api/conversations/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Chat deleted");
        fetchConversations();
        if (pathname === `/chat/${deleteTarget.id}`) {
          router.push("/chat");
        }
      }
    } catch {
      toast.error("Failed to delete chat");
    }
    setDeleteTarget(null);
  }

  const filtered = conversations;

  return (
    <>
      <aside
        className={cn(
          "flex h-full flex-col border-r border-[#262626] bg-[#0f0f0f] transition-all duration-300 overflow-hidden",
          isOpen ? "w-64" : "w-0 border-r-0"
        )}
      >
        {/* Nav actions */}
        <div className="p-3 space-y-1">
          <Link
            href="/chat"
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === "/chat"
                ? "bg-[#6366f1]/10 text-[#6366f1]"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <MessageSquarePlus className="h-4 w-4" />
            New Chat
          </Link>
          <Link
            href="/documents"
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === "/documents"
                ? "bg-[#6366f1]/10 text-[#6366f1]"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <FileText className="h-4 w-4" />
            Documents
          </Link>
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-600" />
            <input
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 rounded-lg border border-[#262626] bg-white/5 pl-8 pr-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#6366f1]/50 transition-colors"
            />
          </div>
        </div>

        {/* Divider + label */}
        <div className="px-3 pb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Chat History
          </span>
        </div>

        <ScrollArea className="flex-1 px-2">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-600">
              {search ? "No matching conversations" : "No conversations yet"}
            </div>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    "relative group flex items-center rounded-lg text-sm transition-colors",
                    pathname === `/chat/${conv.id}`
                      ? "bg-white/5 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  )}
                >
                  {editingId === conv.id ? (
                    <div className="flex-1 px-1.5 py-1">
                      <input
                        ref={editInputRef}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => handleRenameKeyDown(e, conv.id)}
                        onBlur={() => handleRename(conv.id)}
                        className="w-full rounded-md border border-[#6366f1]/50 bg-[#1a1a1a] px-2 py-1 text-sm text-white outline-none"
                      />
                    </div>
                  ) : (
                    <>
                      <Link
                        href={`/chat/${conv.id}`}
                        className="min-w-0 flex-1 py-2 pl-3 pr-1"
                      >
                        <span className="block truncate">
                          {search ? (
                            <HighlightText
                              text={conv.title}
                              highlight={search}
                            />
                          ) : (
                            conv.title
                          )}
                        </span>
                        {conv.matchSnippet && search && (
                          <span className="block truncate text-[11px] text-slate-500 mt-0.5">
                            <HighlightText
                              text={conv.matchSnippet}
                              highlight={search}
                            />
                          </span>
                        )}
                      </Link>
                      <div className={cn(
                        "flex shrink-0 items-center gap-1 pr-2 transition-opacity",
                        pathname === `/chat/${conv.id}` ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}>
                        <button
                          type="button"
                          title="Rename"
                          className="h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-[#6366f1]/20 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            startRename(conv);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          className="h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteTarget(conv);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </aside>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
