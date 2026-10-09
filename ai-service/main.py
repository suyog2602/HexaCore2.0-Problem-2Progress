from fastapi import FastAPI
from pydantic import BaseModel
from fastembed import TextEmbedding
import numpy as np

app = FastAPI(title="CivicPulse AI Service")

# Pretrained model. It downloads once on first run (about 90 MB, needs internet).
model = TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")


class Candidate(BaseModel):
    id: str
    text: str


class DuplicateRequest(BaseModel):
    text: str                    # the new report's text
    candidates: list[Candidate]  # existing reports to compare against
    threshold: float = 0.60      # minimum similarity to count as a duplicate


def embed(texts):
    """Turn a list of sentences into unit-length vectors (one row per sentence)."""
    vectors = np.array(list(model.embed(texts)))
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    return vectors / norms


@app.get("/health")
def health():
    return {"ok": True, "model": "all-MiniLM-L6-v2"}


@app.post("/duplicates")
def find_duplicates(req: DuplicateRequest):
    if not req.text.strip() or not req.candidates:
        return {"duplicates": []}

    vectors = embed([req.text] + [c.text for c in req.candidates])
    new_vec = vectors[0]
    others = vectors[1:]

    # Both sides are unit length, so the dot product IS the cosine similarity.
    similarities = others @ new_vec

    matches = [
        {"id": c.id, "similarity": round(float(s), 3)}
        for c, s in zip(req.candidates, similarities)
        if s >= req.threshold
    ]
    matches.sort(key=lambda m: m["similarity"], reverse=True)
    return {"duplicates": matches[:3]}