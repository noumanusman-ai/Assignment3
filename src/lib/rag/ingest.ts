import { db } from "@/lib/db";
import { documents, chunks, embeddings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { chunkText } from "./chunker";
import { generateEmbeddings } from "./embeddings";

export async function ingestDocument(documentId: string): Promise<void> {
  // Set status to processing
  await db
    .update(documents)
    .set({ status: "processing", updatedAt: new Date() })
    .where(eq(documents.id, documentId));

  try {
    // Load document
    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId));

    if (!doc) throw new Error("Document not found");

    let textContent = doc.content;

    // For PDF files, content is already extracted during upload
    if (!textContent.trim()) {
      throw new Error("Document has no content");
    }

    // Chunk the text
    const textChunks = chunkText(textContent);

    if (textChunks.length === 0) {
      throw new Error("No chunks generated from document");
    }

    // Generate embeddings in batches of 50
    const batchSize = 50;
    for (let i = 0; i < textChunks.length; i += batchSize) {
      const batch = textChunks.slice(i, i + batchSize);
      const texts = batch.map((c) => c.content);
      const vectors = await generateEmbeddings(texts);

      // Insert chunks and embeddings
      for (let j = 0; j < batch.length; j++) {
        const chunk = batch[j];
        const [insertedChunk] = await db
          .insert(chunks)
          .values({
            documentId,
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            startOffset: chunk.startOffset,
            endOffset: chunk.endOffset,
            tokenCount: Math.ceil(chunk.content.length / 4),
          })
          .returning({ id: chunks.id });

        await db.insert(embeddings).values({
          chunkId: insertedChunk.id,
          embedding: vectors[j],
          model: "all-MiniLM-L6-v2",
        });
      }
    }

    // Set status to ready
    await db
      .update(documents)
      .set({ status: "ready", updatedAt: new Date() })
      .where(eq(documents.id, documentId));
  } catch (error) {
    console.error(`Ingestion failed for document ${documentId}:`, error);
    await db
      .update(documents)
      .set({ status: "error", updatedAt: new Date() })
      .where(eq(documents.id, documentId));
    throw error;
  }
}
