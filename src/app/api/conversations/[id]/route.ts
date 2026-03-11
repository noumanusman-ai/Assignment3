import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [conv] = await db
    .select()
    .from(conversations)
    .where(
      and(eq(conversations.id, id), eq(conversations.userId, session.user.id))
    );

  if (!conv) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  return NextResponse.json({ ...conv, messages: msgs });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { title } = body as { title?: string };

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const [conv] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(
      and(eq(conversations.id, id), eq(conversations.userId, session.user.id))
    );

  if (!conv) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(conversations)
    .set({ title: title.trim(), updatedAt: new Date() })
    .where(eq(conversations.id, id))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [conv] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(
      and(eq(conversations.id, id), eq(conversations.userId, session.user.id))
    );

  if (!conv) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.delete(conversations).where(eq(conversations.id, id));

  return NextResponse.json({ success: true });
}
