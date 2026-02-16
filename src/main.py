from pydantic import BaseModel
from typing import List

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer

import faiss
import numpy as np
import json
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from config.ollama import check_ollama_model

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -------------------
# Config
# -------------------
PDF_PATH = "snow-white.pdf"
FAISS_INDEX_PATH = "faiss_index.bin"
METADATA_PATH = "chunks_metadata.json"

# -------------------
# App
# -------------------
app = FastAPI(title="PDF RAG API")

# -------------------
# Global objects (loaded once)
# -------------------
model = SentenceTransformer("all-MiniLM-L6-v2")
index = None
chunks_data = None

# -------------------
# Schemas
# -------------------
class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


class SearchResponse(BaseModel):
    text: str
    score: float
    metadata: dict


# -------------------
# Helpers
# -------------------
def ingest_pdf():
    global index, chunks_data

    loader = PyPDFLoader(PDF_PATH)
    documents = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100,
        separators=["\n\n", "\n", " ", ""]
    )

    chunks = splitter.split_documents(documents)
    texts = [chunk.page_content for chunk in chunks]

    embeddings = model.encode(
        texts,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=True
    )

    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)

    faiss.write_index(index, FAISS_INDEX_PATH)

    chunks_data = [
        {"text": chunk.page_content, "metadata": chunk.metadata}
        for chunk in chunks
    ]

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(chunks_data, f, ensure_ascii=False, indent=2)


def load_index():
    global index, chunks_data

    if os.path.exists(FAISS_INDEX_PATH):
        index = faiss.read_index(FAISS_INDEX_PATH)

    if os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            chunks_data = json.load(f)


# -------------------
# Startup
# -------------------
@app.on_event("startup")
def startup():
    load_index()


# -------------------
# Routes
# -------------------
@app.post("/ingest")
def ingest():
    ingest_pdf()
    return {"status": "PDF ingested and index built"}

@app.get("/test")
def test():
    print("API called")
    return {"status": "hello world"}

@app.post("/search", response_model=List[SearchResponse])
def search(request: SearchRequest):
    if index is None or chunks_data is None:
        return []

    query_embedding = model.encode(
        request.query,
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    scores, indices = index.search(
        np.array([query_embedding]),
        request.top_k
    )

    results = []
    for score, idx in zip(scores[0], indices[0]):
        results.append({
            "text": chunks_data[idx]["text"],
            "score": float(score),
            "metadata": chunks_data[idx]["metadata"]
        })

    return results

@app.get("/model")
def get_model():
    model = check_ollama_model()
    print("Model is ", model)
    return JSONResponse(content={"model": [model]})
