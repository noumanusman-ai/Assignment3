import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";
import type { ChatMessage } from "@/types";

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: ChatPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [conv] = await db
    .select()
    .from(conversations)
    .where(
      and(eq(conversations.id, id), eq(conversations.userId, session.user.id))
    );

  if (!conv) {
    redirect("/chat");
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  const chatMessages: ChatMessage[] = msgs.map((m) => ({
    id: m.id,
    conversationId: m.conversationId,
    parentId: m.parentId,
    role: m.role as ChatMessage["role"],
    content: m.content,
    citations: m.citations as ChatMessage["citations"],
    siblingIndex: m.siblingIndex,
    createdAt: m.createdAt,
  }));

  return (
    <ChatInterface conversationId={id} initialMessages={chatMessages} />
  );
}
