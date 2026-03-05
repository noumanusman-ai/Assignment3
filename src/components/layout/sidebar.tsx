"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquarePlus,
  FileText,
  Trash2,
  Search,
} from "lucide-react";
import { toast } from "sonner";

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState("");

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        setConversations(await res.json());
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    fetchConversations();
  }, [pathname, fetchConversations]);

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;

    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Conversation deleted");
        fetchConversations();
        if (pathname === `/chat/${id}`) {
          router.push("/chat");
        }
      }
    } catch {
      toast.error("Failed to delete conversation");
    }
  }

  const filtered = search
    ? conversations.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase())
      )
    : conversations;

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[#262626] bg-[#0f0f0f]">
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
          History
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
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname === `/chat/${conv.id}`
                    ? "bg-white/5 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <span className="truncate flex-1">{conv.title}</span>
                <button
                  className="h-6 w-6 shrink-0 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all text-slate-500 hover:text-red-400"
                  onClick={(e) => handleDelete(conv.id, e)}
                  aria-label="Delete conversation"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Link>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
