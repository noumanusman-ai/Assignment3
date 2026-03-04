const EMBEDDING_API_URL =
  process.env.EMBEDDING_API_URL || "http://localhost:8000";

interface EmbedResponse {
  embeddings: number[][];
  model: string;
  dimensions: number;
}

interface EmbedQueryResponse {
  embedding: number[];
  model: string;
  dimensions: number;
}

export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const res = await fetch(`${EMBEDDING_API_URL}/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts }),
  });

  if (!res.ok) {
    throw new Error(`Embedding API error: ${res.status} ${await res.text()}`);
  }

  const data: EmbedResponse = await res.json();
  return data.embeddings;
}

export async function generateQueryEmbedding(
  text: string
): Promise<number[]> {
  const res = await fetch(`${EMBEDDING_API_URL}/embed-query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error(`Embedding API error: ${res.status} ${await res.text()}`);
  }

  const data: EmbedQueryResponse = await res.json();
  return data.embedding;
}
