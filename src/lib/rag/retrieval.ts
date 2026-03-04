import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export interface ChunkWithScore {
  chunkId: string;
  documentId: string;
  content: string;
  filename: string;
  title: string;
  score: number;
}

export async function retrieveRelevantChunks(
  queryEmbedding: number[],
  topK: number = 5,
  userId?: string
): Promise<ChunkWithScore[]> {
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  const result = await db.execute(sql`
    SELECT
      c.id AS chunk_id,
      c.document_id,
      c.content,
      d.filename,
      d.title,
      1 - (e.embedding <=> ${embeddingStr}::vector) AS score
    FROM embeddings e
    JOIN chunks c ON c.id = e.chunk_id
    JOIN documents d ON d.id = c.document_id
    WHERE d.status = 'ready'
      ${userId ? sql`AND d.user_id = ${userId}` : sql``}
    ORDER BY e.embedding <=> ${embeddingStr}::vector
    LIMIT ${topK}
  `);

  return (result.rows as any[]).map((row) => ({
    chunkId: row.chunk_id,
    documentId: row.document_id,
    content: row.content,
    filename: row.filename,
    title: row.title,
    score: Number(row.score),
  }));
}
