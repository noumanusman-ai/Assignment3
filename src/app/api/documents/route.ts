import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documents, chunks } from "@/lib/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { ingestDocument } from "@/lib/rag/ingest";
import pdf from "pdf-parse";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const docs = await db
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
    .where(eq(documents.userId, session.user.id))
    .orderBy(desc(documents.createdAt));

  return NextResponse.json(docs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const filename = file.name;
  const ext = filename.split(".").pop()?.toLowerCase();

  if (!ext || !["txt", "pdf"].includes(ext)) {
    return NextResponse.json(
      { error: "Only .txt and .pdf files are supported" },
      { status: 400 }
    );
  }

  let content: string;
  const fileType = ext === "pdf" ? "pdf" : "text";

  try {
    if (fileType === "pdf") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfData = await pdf(buffer);
      content = pdfData.text;
    } else {
      content = await file.text();
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to parse file" },
      { status: 400 }
    );
  }

  if (!content.trim()) {
    return NextResponse.json(
      { error: "File has no extractable text" },
      { status: 400 }
    );
  }

  const title = filename.replace(/\.[^.]+$/, "");

  const [doc] = await db
    .insert(documents)
    .values({
      userId: session.user.id,
      title,
      filename,
      fileType: fileType as "text" | "pdf",
      content,
      status: "pending",
    })
    .returning();

  // Trigger ingestion in background (don't await)
  ingestDocument(doc.id).catch((err) =>
    console.error("Background ingestion failed:", err)
  );

  return NextResponse.json(doc, { status: 201 });
}
