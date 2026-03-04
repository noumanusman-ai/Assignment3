import os
from contextlib import asynccontextmanager

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


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model": MODEL_NAME,
        "ready": model is not None,
    }
