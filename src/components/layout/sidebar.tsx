"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquarePlus,
  FileText,
  MessagesSquare,
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

  // Refresh when navigating to a new chat
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

  const navItems = [
    { href: "/chat", label: "New Chat", icon: MessageSquarePlus },
    { href: "/documents", label: "Documents", icon: FileText },
  ];

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-muted/30">
      <div className="flex h-14 items-center border-b px-4">
        <MessagesSquare className="mr-2 h-5 w-5" />
        <span className="font-semibold">Chat History</span>
      </div>

      <nav className="p-2">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            asChild
            className={cn(
              "w-full justify-start mb-1",
              pathname === item.href && "bg-accent"
            )}
          >
            <Link href={item.href}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>

      {/* Search */}
      <div className="px-2 pb-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-7 text-xs"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        {filtered.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            {search ? "No matching conversations" : "No conversations yet"}
          </div>
        ) : (
          <div className="space-y-0.5">
            {filtered.map((conv) => (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className={cn(
                  "group flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
                  pathname === `/chat/${conv.id}` && "bg-accent"
                )}
              >
                <span className="truncate flex-1">{conv.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => handleDelete(conv.id, e)}
                  aria-label="Delete conversation"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Link>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
