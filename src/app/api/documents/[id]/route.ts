import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documents, chunks } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [doc] = await db
    .select({
      id: documents.id,
      title: documents.title,
      filename: documents.filename,
      fileType: documents.fileType,
      status: documents.status,
      createdAt: documents.createdAt,
      chunkCount: sql<number>`(SELECT COUNT(*) FROM chunks WHERE chunks.document_id = ${documents.id})`,
    })
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, session.user.id)));

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(doc);
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

  const [doc] = await db
    .select({ id: documents.id })
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, session.user.id)));

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.delete(documents).where(eq(documents.id, id));

  return NextResponse.json({ success: true });
}
