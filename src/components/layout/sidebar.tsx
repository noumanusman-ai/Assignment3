"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquarePlus, FileText, MessagesSquare } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

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

      <ScrollArea className="flex-1 px-2">
        {/* Conversation list will be populated in Phase 6 */}
        <div className="py-4 text-center text-sm text-muted-foreground">
          No conversations yet
        </div>
      </ScrollArea>
    </aside>
  );
}
