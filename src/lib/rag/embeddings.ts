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

export interface SemanticChunk {
  content: string;
  embedding: number[];
  chunk_index: number;
  start_offset: number;
  end_offset: number;
  sentence_count: number;
}

interface SemanticChunkResponse {
  chunks: SemanticChunk[];
  model: string;
  dimensions: number;
  total_sentences: number;
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

export async function semanticChunk(
  text: string,
  options: {
    similarityThreshold?: number;
    maxChunkSize?: number;
    minChunkSize?: number;
  } = {}
): Promise<SemanticChunkResponse> {
  const res = await fetch(`${EMBEDDING_API_URL}/semantic-chunk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      similarity_threshold: options.similarityThreshold ?? 0.5,
      max_chunk_size: options.maxChunkSize ?? 1500,
      min_chunk_size: options.minChunkSize ?? 100,
    }),
  });

  if (!res.ok) {
    throw new Error(`Semantic chunk API error: ${res.status} ${await res.text()}`);
  }

  return res.json();
}
