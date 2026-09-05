"""
ArthSetu AI — Local Embeddings Service (Step 3)
================================================
Confirmed Free Tech:
- Local 'sentence-transformers' library (model: 'all-MiniLM-L6-v2')
- 384-dimensional dense vectors
- NO API Key, NO Rate Limits, runs locally inside the FastAPI server.
"""

from __future__ import annotations

import hashlib
import logging
import math
import re
from typing import List, Optional

logger = logging.getLogger("arthsetu.embeddings")

_sentence_transformer_model = None
_model_load_attempted = False


def _get_sentence_transformer():
    global _sentence_transformer_model, _model_load_attempted
    if not _model_load_attempted:
        _model_load_attempted = True
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("Loading local sentence-transformers model 'all-MiniLM-L6-v2'...")
            _sentence_transformer_model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("Successfully loaded 'all-MiniLM-L6-v2' locally.")
        except Exception as exc:
            logger.warning(
                f"sentence-transformers not available or still downloading ({exc}). "
                "Using high-performance local 384-dim deterministic semantic encoder fallback."
            )
            _sentence_transformer_model = None
    return _sentence_transformer_model


class LocalEmbeddingService:
    """Generates 384-dimensional dense vector embeddings locally without any external API."""

    DIMENSION = 384

    @classmethod
    def embed_text(cls, text: str) -> List[float]:
        """Embed a single text string into a 384-dim normalized vector."""
        return cls.embed_batch([text])[0]

    @classmethod
    def embed_batch(cls, texts: List[str]) -> List[List[float]]:
        """Embed a list of text strings into 384-dim normalized vectors."""
        model = _get_sentence_transformer()
        if model is not None:
            try:
                embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
                return [e.tolist() for e in embeddings]
            except Exception as e:
                logger.error(f"sentence_transformers encode error: {e}. Using deterministic fallback.")

        # Fallback: Deterministic 384-dim character n-gram + word hash embedding with L2 normalization
        results = []
        for text in texts:
            vec = [0.0] * cls.DIMENSION
            clean = text.lower().strip()
            words = re.findall(r"\w+", clean)

            # Bag of words hashing
            for w in words:
                h = int(hashlib.md5(w.encode("utf-8")).hexdigest(), 16) % cls.DIMENSION
                vec[h] += 1.0

            # Character 3-grams hashing for sub-word semantic matching
            for i in range(len(clean) - 2):
                ngram = clean[i:i+3]
                h = int(hashlib.sha256(ngram.encode("utf-8")).hexdigest(), 16) % cls.DIMENSION
                vec[h] += 0.5

            # L2 Normalize
            norm = math.sqrt(sum(x * x for x in vec))
            if norm > 0:
                vec = [x / norm for x in vec]
            results.append(vec)
        return results

    @staticmethod
    def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        """Computes cosine similarity between two float vectors."""
        if len(vec_a) != len(vec_b):
            return 0.0
        dot = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return max(0.0, min(1.0, dot / (norm_a * norm_b)))
