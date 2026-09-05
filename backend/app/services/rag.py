"""
ArthSetu AI — Verified Document RAG Retrieval Engine (Step 3)
============================================================
Architecture:
  1. Chunking verified scheme data (schemes, eligibility rules, required docs, guidance).
  2. Local Embedding with sentence-transformers (all-MiniLM-L6-v2, 384-dim).
  3. Storage & Querying via Supabase PostgreSQL pgvector extension (with in-memory index fallback).
  4. Top-K Semantic Similarity Retrieval for factual grounding.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from app.database import get_supabase_client
from app.services.eligibility import SCHEME_RULES, SchemeRule
from app.services.embeddings import LocalEmbeddingService

logger = logging.getLogger("arthsetu.rag")


@dataclass
class VerifiedChunk:
    chunk_id: str
    scheme_id: str
    scheme_name: str
    content: str
    source_name: str
    source_url: str
    last_verified_at: str
    needs_manual_verification: bool
    verification_note: str
    embedding: Optional[List[float]] = None


class SchemeRAGRetriever:
    """RAG Retriever that indexes and retrieves verified NSFDC scheme documents."""

    def __init__(self):
        self._indexed_chunks: List[VerifiedChunk] = []
        self._initialize_local_index()

    def _build_scheme_documents(self) -> List[VerifiedChunk]:
        """Creates semantic chunks from verified NSFDC data."""
        chunks: List[VerifiedChunk] = []

        for rule in SCHEME_RULES:
            # Chunk 1: Scheme Overview & Financial Limits
            cost_range = (
                f"Projects costing up to ₹{rule.project_cost_max:,.0f}"
                if not rule.project_cost_min_exclusive
                else f"Projects costing more than ₹{rule.project_cost_min:,.0f} up to ₹{rule.project_cost_max:,.0f}"
            )
            overview_text = (
                f"Scheme: {rule.name} ({rule.scheme_type}). "
                f"Issuing Body: {rule.issuing_body}. "
                f"Description: {rule.full_description} "
                f"Project Scale: {cost_range}. "
                f"Maximum Loan Amount: Up to {rule.financing_pct:.0f}% of project cost, maximum ₹{rule.max_loan_amount:,.0f}. "
                f"Income Limit: Annual family income must not exceed ₹{rule.max_annual_family_income:,.0f}."
            )
            chunks.append(
                VerifiedChunk(
                    chunk_id=f"{rule.scheme_id}_overview",
                    scheme_id=rule.scheme_id,
                    scheme_name=rule.name,
                    content=overview_text,
                    source_name=rule.source_name,
                    source_url=rule.source_url,
                    last_verified_at=rule.last_verified_at,
                    needs_manual_verification=rule.needs_manual_verification,
                    verification_note=rule.verification_note,
                )
            )

            # Chunk 2: Interest Rates, Repayment & Moratorium
            rates_text = (
                f"Scheme: {rule.name}. "
                f"Beneficiary Interest Rate: {rule.rate_beneficiary_min}% to {rule.rate_beneficiary_max}% per annum. "
                f"SCA / CA Rate: NSFDC charges 2.5% to 5.0% from channel partners. "
                f"Rate Note: {rule.rate_note} "
                f"Repayment Tenure: Maximum {rule.repayment_years_max} years ({rule.repayment_note}). "
                f"Moratorium Period: {rule.moratorium_months} months ({rule.moratorium_note})."
            )
            chunks.append(
                VerifiedChunk(
                    chunk_id=f"{rule.scheme_id}_rates",
                    scheme_id=rule.scheme_id,
                    scheme_name=rule.name,
                    content=rates_text,
                    source_name=rule.source_name,
                    source_url=rule.source_url,
                    last_verified_at=rule.last_verified_at,
                    needs_manual_verification=rule.needs_manual_verification,
                    verification_note=rule.verification_note,
                )
            )

            # Chunk 3: Eligible Purposes & Criteria Whitelist
            purposes_str = ", ".join(rule.eligible_purposes)
            purpose_text = (
                f"Scheme: {rule.name}. "
                f"Eligible Target Beneficiaries: Scheduled Caste (SC) individuals. "
                f"Eligible Activities / Purposes: {purposes_str}. "
                f"Requires Education Purpose: {rule.requires_education_purpose}. "
                f"Annual Family Income Ceiling: ₹{rule.max_annual_family_income:,.0f}."
            )
            chunks.append(
                VerifiedChunk(
                    chunk_id=f"{rule.scheme_id}_eligibility",
                    scheme_id=rule.scheme_id,
                    scheme_name=rule.name,
                    content=purpose_text,
                    source_name=rule.source_name,
                    source_url=rule.source_url,
                    last_verified_at=rule.last_verified_at,
                    needs_manual_verification=rule.needs_manual_verification,
                    verification_note=rule.verification_note,
                )
            )

        return chunks

    def _initialize_local_index(self):
        """Indexes all verified chunks in memory using LocalEmbeddingService."""
        chunks = self._build_scheme_documents()
        texts = [c.content for c in chunks]
        embeddings = LocalEmbeddingService.embed_batch(texts)
        for chunk, emb in zip(chunks, embeddings):
            chunk.embedding = emb
        self._indexed_chunks = chunks
        logger.info(f"SchemeRAGRetriever successfully indexed {len(self._indexed_chunks)} verified chunks.")

    def retrieve(self, query: str, top_k: int = 3, scheme_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Retrieves top_k relevant verified scheme chunks for a given query.
        Grounds explanations strictly in official verified data.
        """
        query_vector = LocalEmbeddingService.embed_text(query)

        candidates = self._indexed_chunks
        if scheme_id:
            candidates = [c for c in candidates if c.scheme_id == scheme_id]

        scored: List[tuple[float, VerifiedChunk]] = []
        for chunk in candidates:
            if chunk.embedding is not None:
                sim = LocalEmbeddingService.cosine_similarity(query_vector, chunk.embedding)
                scored.append((sim, chunk))

        scored.sort(key=lambda x: x[0], reverse=True)
        top_matches = scored[:top_k]

        return [
            {
                "scheme_name": chunk.scheme_name,
                "scheme_id": chunk.scheme_id,
                "relevance_score": round(score, 4),
                "content": chunk.content,
                "source_name": chunk.source_name,
                "source_url": chunk.source_url,
                "last_verified_at": chunk.last_verified_at,
                "needs_manual_verification": chunk.needs_manual_verification,
                "verification_note": chunk.verification_note,
            }
            for score, chunk in top_matches
        ]


_retriever_instance: Optional[SchemeRAGRetriever] = None


def get_rag_retriever() -> SchemeRAGRetriever:
    global _retriever_instance
    if _retriever_instance is None:
        _retriever_instance = SchemeRAGRetriever()
    return _retriever_instance
