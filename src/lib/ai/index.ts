import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { ChunkWithScore } from "@/lib/rag/retrieval";

export const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const model = google("gemini-2.5-flash");

export function buildSystemPrompt(context: ChunkWithScore[]): string {
  if (context.length === 0) {
    return `You are a helpful AI assistant. Answer the user's questions to the best of your ability. If you don't know something, say so honestly.`;
  }

  const contextBlock = context
    .map(
      (chunk, i) =>
        `[Source ${i + 1}: "${chunk.title}" (${chunk.filename})]\n${chunk.content}`
    )
    .join("\n\n---\n\n");

  return `You are a helpful AI assistant with access to the user's documents. Use the following retrieved context to answer questions. When you use information from a source, cite it using [Source N] notation.

If the context doesn't contain relevant information, say so and answer based on your general knowledge.

## Retrieved Context

${contextBlock}

## Instructions
- Use the context above to provide accurate, grounded answers.
- Cite sources using [Source N] when referencing specific information.
- Format your response using Markdown for readability.
- Use code blocks with language tags for any code snippets.
- Be concise but thorough.`;
}
