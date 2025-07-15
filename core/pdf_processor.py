import os
import re
import fitz  # PyMuPDF
import faiss
import numpy as np
from django.conf import settings
from sentence_transformers import SentenceTransformer

# Load the embedding model once
model = SentenceTransformer('all-MiniLM-L6-v2')


def extract_text_from_pdf(file_path: str) -> str:
    """Extract full text from a PDF file using PyMuPDF."""
    doc = fitz.open(file_path)
    text = "".join(page.get_text() for page in doc)
    doc.close()
    return text


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """
    Split text into sentence‑aware chunks.

    - Splits by sentence boundaries (Arabic/English punctuation).
    - Ensures each chunk ≤ `chunk_size` words.
    - Adds `overlap` words from the previous chunk to maintain context.
    """
    sentences = re.split(r'(?<=[.!؟])\s+', text)
    chunks, current_chunk = [], []
    current_len = 0

    for sentence in sentences:
        sent_len = len(sentence.split())

        if current_len + sent_len <= chunk_size:
            current_chunk.append(sentence)
            current_len += sent_len
        else:
            chunks.append(" ".join(current_chunk))
            # start next chunk with overlap from previous chunk’s tail
            current_chunk = sentence.split()[-overlap:]
            current_len = len(current_chunk)

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks


def generate_faiss_index(chunks: list[str]):
    """
    Create a FAISS index from a list of text chunks and return:
      - the FAISS index object
      - the numpy array of embeddings (optional use)
    """
    embeddings = model.encode(chunks, show_progress_bar=True)
    dim = embeddings[0].shape[0]
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings, dtype="float32"))
    return index, embeddings
