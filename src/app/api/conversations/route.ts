import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { eq, desc, ilike, and } from "drizzle-orm";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    const searchLower = search.trim().toLowerCase();

    // Find conversations matching by title
    const matchingByTitle = await db
      .select({
        id: conversations.id,
        title: conversations.title,
        updatedAt: conversations.updatedAt,
        createdAt: conversations.createdAt,
        userId: conversations.userId,
      })
      .from(conversations)
      .where(
        and(
          eq(conversations.userId, session.user.id),
          ilike(conversations.title, term)
        )
      );

    // Find matching messages with their content
    const matchingMessages = await db
      .select({
        conversationId: conversations.id,
        title: conversations.title,
        updatedAt: conversations.updatedAt,
        createdAt: conversations.createdAt,
        userId: conversations.userId,
        messageContent: messages.content,
        messageRole: messages.role,
      })
      .from(conversations)
      .innerJoin(messages, eq(messages.conversationId, conversations.id))
      .where(
        and(
          eq(conversations.userId, session.user.id),
          ilike(messages.content, term)
        )
      );

    // Build results with match snippets
    const seen = new Set<string>();
    const results: Array<{
      id: string;
      title: string;
      updatedAt: Date;
      createdAt: Date;
      userId: string;
      matchSnippet?: string;
      matchRole?: string;
    }> = [];

    // Add title matches first (no snippet needed — title itself is the match)
    for (const c of matchingByTitle) {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        results.push(c);
      }
    }

    // Add content matches with a snippet around the matched text
    for (const m of matchingMessages) {
      if (!seen.has(m.conversationId)) {
        seen.add(m.conversationId);
        const snippet = extractSnippet(m.messageContent, searchLower);
        results.push({
          id: m.conversationId,
          title: m.title,
          updatedAt: m.updatedAt,
          createdAt: m.createdAt,
          userId: m.userId,
          matchSnippet: snippet,
          matchRole: m.messageRole,
        });
      } else {
        // Already added, but if no snippet yet, add one
        const existing = results.find((r) => r.id === m.conversationId);
        if (existing && !existing.matchSnippet) {
          existing.matchSnippet = extractSnippet(
            m.messageContent,
            searchLower
          );
          existing.matchRole = m.messageRole;
        }
      }
    }

    results.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return NextResponse.json(results);
  }

  const results = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, session.user.id))
    .orderBy(desc(conversations.updatedAt));

  return NextResponse.json(results);
}

function extractSnippet(content: string, searchTerm: string): string {
  const lower = content.toLowerCase();
  const idx = lower.indexOf(searchTerm);
  if (idx === -1) return content.slice(0, 80);

  const start = Math.max(0, idx - 30);
  const end = Math.min(content.length, idx + searchTerm.length + 30);
  let snippet = content.slice(start, end).trim();

  if (start > 0) snippet = "..." + snippet;
  if (end < content.length) snippet = snippet + "...";

  return snippet;
}
