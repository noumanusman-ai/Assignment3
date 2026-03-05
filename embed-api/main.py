import os
import re
from contextlib import asynccontextmanager

import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

model: SentenceTransformer | None = None
MODEL_NAME = os.getenv("MODEL_NAME", "all-MiniLM-L6-v2")


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    print(f"Loading model: {MODEL_NAME}")
    model = SentenceTransformer(MODEL_NAME)
    print(f"Model loaded: {MODEL_NAME} (dim={model.get_sentence_embedding_dimension()})")
    yield
    model = None


app = FastAPI(title="Embedding API", lifespan=lifespan)


# ── Existing schemas ──────────────────────────────────────────────


class EmbedRequest(BaseModel):
    texts: list[str]


class EmbedQueryRequest(BaseModel):
    text: str


class EmbedResponse(BaseModel):
    embeddings: list[list[float]]
    model: str
    dimensions: int


class EmbedQueryResponse(BaseModel):
    embedding: list[float]
    model: str
    dimensions: int


# ── Semantic chunking schemas ─────────────────────────────────────


class SemanticChunkRequest(BaseModel):
    text: str
    similarity_threshold: float = 0.5
    max_chunk_size: int = 1500
    min_chunk_size: int = 100


class SemanticChunk(BaseModel):
    content: str
    embedding: list[float]
    chunk_index: int
    start_offset: int
    end_offset: int
    sentence_count: int


class SemanticChunkResponse(BaseModel):
    chunks: list[SemanticChunk]
    model: str
    dimensions: int
    total_sentences: int


# ── Helpers ───────────────────────────────────────────────────────


def split_sentences(text: str) -> list[dict]:
    """Split text into sentences, tracking their offsets."""
    # Match sentence-ending punctuation followed by whitespace or end-of-string,
    # or split on double newlines (paragraph breaks).
    pattern = r"(?<=[.!?])\s+|\n{2,}"
    sentences = []
    last_end = 0

    for match in re.finditer(pattern, text):
        sentence = text[last_end : match.start()].strip()
        if sentence:
            sentences.append(
                {"text": sentence, "start": last_end, "end": match.start()}
            )
        last_end = match.end()

    # Capture the final sentence
    remainder = text[last_end:].strip()
    if remainder:
        sentences.append({"text": remainder, "start": last_end, "end": len(text)})

    return sentences


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Cosine similarity between two vectors (already normalized → just dot)."""
    return float(np.dot(a, b))


def build_semantic_chunks(
    sentences: list[dict],
    sentence_embeddings: np.ndarray,
    full_text: str,
    similarity_threshold: float,
    max_chunk_size: int,
    min_chunk_size: int,
) -> list[dict]:
    """
    Group consecutive sentences into chunks based on semantic similarity.

    Algorithm:
    1. Compute cosine similarity between each consecutive sentence pair.
    2. Walk through sentences; accumulate into current chunk.
    3. When similarity to the next sentence drops below threshold AND the
       current chunk exceeds min_chunk_size, finalize the chunk and start
       a new one.
    4. If accumulation exceeds max_chunk_size, force a split.
    """
    if len(sentences) == 0:
        return []

    if len(sentences) == 1:
        return [
            {
                "content": sentences[0]["text"],
                "start": sentences[0]["start"],
                "end": sentences[0]["end"],
                "sentence_indices": [0],
            }
        ]

    # Compute pairwise similarities between consecutive sentences
    similarities = []
    for i in range(len(sentences) - 1):
        sim = cosine_similarity(sentence_embeddings[i], sentence_embeddings[i + 1])
        similarities.append(sim)

    chunks = []
    current_indices: list[int] = [0]

    for i in range(1, len(sentences)):
        current_text_len = sum(
            len(sentences[j]["text"]) for j in current_indices
        ) + len(current_indices)  # approximate whitespace

        sim = similarities[i - 1]
        exceeds_max = current_text_len + len(sentences[i]["text"]) > max_chunk_size
        below_threshold = sim < similarity_threshold
        meets_min = current_text_len >= min_chunk_size

        # Decide whether to split
        if exceeds_max or (below_threshold and meets_min):
            chunks.append(
                {
                    "content": full_text[
                        sentences[current_indices[0]]["start"] : sentences[
                            current_indices[-1]
                        ]["end"]
                    ].strip(),
                    "start": sentences[current_indices[0]]["start"],
                    "end": sentences[current_indices[-1]]["end"],
                    "sentence_indices": list(current_indices),
                }
            )
            current_indices = [i]
        else:
            current_indices.append(i)

    # Final chunk
    if current_indices:
        chunks.append(
            {
                "content": full_text[
                    sentences[current_indices[0]]["start"] : sentences[
                        current_indices[-1]
                    ]["end"]
                ].strip(),
                "start": sentences[current_indices[0]]["start"],
                "end": sentences[current_indices[-1]]["end"],
                "sentence_indices": list(current_indices),
            }
        )

    return chunks


# ── Endpoints ─────────────────────────────────────────────────────


@app.post("/embed", response_model=EmbedResponse)
async def embed_texts(request: EmbedRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    if not request.texts:
        raise HTTPException(status_code=400, detail="No texts provided")
    if len(request.texts) > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 texts per request")

    embeddings = model.encode(request.texts, normalize_embeddings=True)
    return EmbedResponse(
        embeddings=embeddings.tolist(),
        model=MODEL_NAME,
        dimensions=embeddings.shape[1],
    )


@app.post("/embed-query", response_model=EmbedQueryResponse)
async def embed_query(request: EmbedQueryRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Empty text provided")

    embedding = model.encode(request.text, normalize_embeddings=True)
    return EmbedQueryResponse(
        embedding=embedding.tolist(),
        model=MODEL_NAME,
        dimensions=len(embedding),
    )


@app.post("/semantic-chunk", response_model=SemanticChunkResponse)
async def semantic_chunk(request: SemanticChunkRequest):
    """
    Semantic-level chunking: splits text into sentences, embeds each one,
    then groups consecutive sentences by cosine similarity. Returns chunks
    with their pre-computed embeddings (mean-pooled from sentence embeddings).
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Empty text provided")

    # 1. Split into sentences
    sentences = split_sentences(request.text)
    if not sentences:
        raise HTTPException(status_code=400, detail="No sentences found in text")

    # 2. Embed all sentences in one batch
    sentence_texts = [s["text"] for s in sentences]
    sentence_embeddings = model.encode(sentence_texts, normalize_embeddings=True)

    # 3. Build semantic chunks
    raw_chunks = build_semantic_chunks(
        sentences=sentences,
        sentence_embeddings=sentence_embeddings,
        full_text=request.text,
        similarity_threshold=request.similarity_threshold,
        max_chunk_size=request.max_chunk_size,
        min_chunk_size=request.min_chunk_size,
    )

    # 4. Compute chunk-level embeddings (mean-pool sentence embeddings, re-normalize)
    result_chunks = []
    for idx, chunk in enumerate(raw_chunks):
        indices = chunk["sentence_indices"]
        chunk_embedding = np.mean(sentence_embeddings[indices], axis=0)
        # Re-normalize
        norm = np.linalg.norm(chunk_embedding)
        if norm > 0:
            chunk_embedding = chunk_embedding / norm

        result_chunks.append(
            SemanticChunk(
                content=chunk["content"],
                embedding=chunk_embedding.tolist(),
                chunk_index=idx,
                start_offset=chunk["start"],
                end_offset=chunk["end"],
                sentence_count=len(indices),
            )
        )

    dim = model.get_sentence_embedding_dimension()
    return SemanticChunkResponse(
        chunks=result_chunks,
        model=MODEL_NAME,
        dimensions=dim,
        total_sentences=len(sentences),
    )


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model": MODEL_NAME,
        "ready": model is not None,
    }
