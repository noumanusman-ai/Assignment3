export interface Chunk {
  content: string;
  chunkIndex: number;
  startOffset: number;
  endOffset: number;
}

interface ChunkOptions {
  chunkSize?: number;
  overlap?: number;
}

export function chunkText(
  text: string,
  options: ChunkOptions = {}
): Chunk[] {
  const { chunkSize = 500, overlap = 50 } = options;
  const chunks: Chunk[] = [];

  if (!text.trim()) return chunks;

  let start = 0;
  let index = 0;

  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length);

    // Try to break at a sentence or paragraph boundary
    if (end < text.length) {
      const slice = text.slice(start, end);
      const lastPeriod = slice.lastIndexOf(". ");
      const lastNewline = slice.lastIndexOf("\n");
      const breakPoint = Math.max(lastPeriod, lastNewline);
      if (breakPoint > chunkSize * 0.3) {
        end = start + breakPoint + 1;
      }
    }

    const content = text.slice(start, end).trim();
    if (content) {
      chunks.push({
        content,
        chunkIndex: index,
        startOffset: start,
        endOffset: end,
      });
      index++;
    }

    start = end - overlap;
    if (start >= text.length) break;
    // Prevent infinite loop
    if (end === text.length) break;
  }

  return chunks;
}
