import { NextRequest } from "next/server";
import { streamText, generateText } from "ai";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { model, buildSystemPrompt } from "@/lib/ai";
import { generateQueryEmbedding } from "@/lib/rag/embeddings";
import { retrieveRelevantChunks } from "@/lib/rag/retrieval";
import type { Citation } from "@/types";

async function generateConversationTitle(
  userMessage: string,
  convId: string
) {
  try {
    const { text } = await generateText({
      model,
      system:
        "Generate a short, concise title (max 6 words) for a conversation that starts with the following message. Return ONLY the title, no quotes, no punctuation at the end.",
      messages: [{ role: "user", content: userMessage }],
    });
    const title = text.trim().slice(0, 80);
    if (title) {
      await db
        .update(conversations)
        .set({ title })
        .where(eq(conversations.id, convId));
    }
  } catch (error) {
    console.error("Failed to generate conversation title:", error);
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const {
    messages: chatMessages,
    conversationId,
    parentId,
    regenerate,
    userMessageId,
  } = body as {
    messages: { role: string; content: string }[];
    conversationId?: string;
    parentId?: string | null;
    regenerate?: boolean;
    userMessageId?: string;
  };

  const lastUserMessage = chatMessages[chatMessages.length - 1];
  if (!lastUserMessage || lastUserMessage.role !== "user") {
    return new Response("No user message", { status: 400 });
  }
  let convId = conversationId;
  let isNewConversation = false;
  if (!convId) {
    const tempTitle =
      lastUserMessage.content.slice(0, 50) +
      (lastUserMessage.content.length > 50 ? "..." : "");
    const [conv] = await db
      .insert(conversations)
      .values({
        userId: session.user.id,
        title: tempTitle,
      })
      .returning();
    convId = conv.id;
    isNewConversation = true;
  } else {
    const [conv] = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(
        and(
          eq(conversations.id, convId),
          eq(conversations.userId, session.user.id)
        )
      );
    if (!conv) {
      return new Response("Conversation not found", { status: 404 });
    }
  }
  let context: Awaited<ReturnType<typeof retrieveRelevantChunks>> = [];
  let citations: Citation[] = [];
  try {
    const queryEmbedding = await generateQueryEmbedding(
      lastUserMessage.content
    );
    context = await retrieveRelevantChunks(
      queryEmbedding,
      5,
      session.user.id
    );
    citations = context.map((c) => ({
      documentId: c.documentId,
      chunkId: c.chunkId,
      content: c.content.slice(0, 200),
      filename: c.filename,
      score: c.score,
    }));
  } catch (error) {
    console.error("RAG retrieval failed, proceeding without context:", error);
  }
  const systemPrompt = buildSystemPrompt(context);
  const aiMessages = chatMessages.map((m) => ({
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
  }));

  const citationsB64 = Buffer.from(JSON.stringify(citations)).toString("base64");
  if (regenerate && userMessageId && convId) {
    const assistantSiblings = await db
      .select({ siblingIndex: messages.siblingIndex })
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, convId),
          eq(messages.parentId, userMessageId),
          eq(messages.role, "assistant")
        )
      );
    const assistantSiblingIndex = assistantSiblings.length;

    const result = streamText({
      model,
      system: systemPrompt,
      messages: aiMessages,
      onFinish: async ({ text }) => {
        await db.insert(messages).values({
          conversationId: convId!,
          parentId: userMessageId,
          role: "assistant",
          content: text,
          citations: citations.length > 0 ? citations : null,
          siblingIndex: assistantSiblingIndex,
        });

        await db
          .update(conversations)
          .set({ updatedAt: new Date() })
          .where(eq(conversations.id, convId!));
      },
    });

    return result.toTextStreamResponse({
      headers: {
        "X-Conversation-Id": convId,
        "X-User-Message-Id": userMessageId,
        "X-Citations": citationsB64,
      },
    });
  }

  // ── Normal mode: create user message + assistant reply ──

  // Calculate sibling index for the user message
  let siblingIndex = 0;
  if (parentId !== undefined) {
    const siblings = await db
      .select({ siblingIndex: messages.siblingIndex })
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, convId),
          parentId === null
            ? isNull(messages.parentId)
            : eq(messages.parentId, parentId!)
        )
      );
    siblingIndex = siblings.length;
  }

  // Save user message
  const [userMsg] = await db
    .insert(messages)
    .values({
      conversationId: convId,
      parentId: parentId || null,
      role: "user",
      content: lastUserMessage.content,
      siblingIndex,
    })
    .returning();

  const result = streamText({
    model,
    system: systemPrompt,
    messages: aiMessages,
    onFinish: async ({ text }) => {
      // Save assistant message
      await db.insert(messages).values({
        conversationId: convId!,
        parentId: userMsg.id,
        role: "assistant",
        content: text,
        citations: citations.length > 0 ? citations : null,
        siblingIndex: 0,
      });

      // Update conversation timestamp
      await db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, convId!));

      // Generate smart title for new conversations
      if (isNewConversation) {
        generateConversationTitle(lastUserMessage.content, convId!);
      }
    },
  });

  return result.toTextStreamResponse({
    headers: {
      "X-Conversation-Id": convId,
      "X-User-Message-Id": userMsg.id,
      "X-Citations": citationsB64,
    },
  });
}
