import { db } from "@/lib/db";
import { documents, chunks, embeddings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { semanticChunk } from "./embeddings";

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

    const textContent = doc.content;

    if (!textContent.trim()) {
      throw new Error("Document has no content");
    }

    // Semantic chunking — returns chunks with pre-computed embeddings
    const result = await semanticChunk(textContent, {
      similarityThreshold: 0.5,
      maxChunkSize: 1500,
      minChunkSize: 100,
    });

    if (result.chunks.length === 0) {
      throw new Error("No chunks generated from document");
    }

    console.log(
      `Document ${documentId}: ${result.total_sentences} sentences → ${result.chunks.length} semantic chunks`
    );

    // Insert chunks and their pre-computed embeddings
    for (const chunk of result.chunks) {
      const [insertedChunk] = await db
        .insert(chunks)
        .values({
          documentId,
          content: chunk.content,
          chunkIndex: chunk.chunk_index,
          startOffset: chunk.start_offset,
          endOffset: chunk.end_offset,
          tokenCount: Math.ceil(chunk.content.length / 4),
          metadata: { sentenceCount: chunk.sentence_count },
        })
        .returning({ id: chunks.id });

      await db.insert(embeddings).values({
        chunkId: insertedChunk.id,
        embedding: chunk.embedding,
        model: result.model,
      });
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
