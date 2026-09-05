"""
ArthSetu AI — AI Intelligence & Scheme Q&A Routes (Step 3)
===========================================================
Endpoints:
  POST /ai/understand-requirement  – NLU extraction -> Verified RAG -> Deterministic Rule Engine -> Explanation
  POST /ai/ask                     – Factual grounded Scheme Q&A via RAG
  POST /ai/embed-schemes           – Vector embedding index refresh
"""

from __future__ import annotations

import logging
from fastapi import APIRouter, HTTPException, status

from app.schemas.ai import (
    AskSchemeQuestionRequest,
    AskSchemeQuestionResponse,
    UnderstandRequirementRequest,
    UnderstandRequirementResponse,
)
from app.services.ai_assistant import AIAssistantService
from app.services.rag import get_rag_retriever

logger = logging.getLogger("arthsetu.routes.ai")

router = APIRouter(prefix="/ai", tags=["AI Intelligence Layer"])


@router.post(
    "/understand-requirement",
    response_model=UnderstandRequirementResponse,
    summary="Understand natural-language user query and evaluate eligibility",
    description=(
        "1. AI Understands: Extracts structured profile from English/Hindi/Hinglish.\n"
        "2. RAG Retrieves: Fetches top-matching verified NSFDC scheme chunks.\n"
        "3. Rule Engine: Deterministically evaluates eligibility.\n"
        "4. Explains: Compiles transparent explanation strictly grounded in rule output."
    ),
)
async def understand_requirement(body: UnderstandRequirementRequest):
    try:
        response = await AIAssistantService.understand_and_evaluate(body)
        return response
    except Exception as exc:
        logger.error(f"Error in understand_requirement: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process natural language requirement: {str(exc)}",
        )


@router.post(
    "/ask",
    response_model=AskSchemeQuestionResponse,
    summary="Ask questions about verified NSFDC schemes",
    description=(
        "Answers scheme-related queries strictly grounded in retrieved official NSFDC data. "
        "If information cannot be verified, explicitly states so."
    ),
)
async def ask_scheme_question(body: AskSchemeQuestionRequest):
    try:
        response = await AIAssistantService.answer_question(body)
        return response
    except Exception as exc:
        logger.error(f"Error in ask_scheme_question: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process scheme question: {str(exc)}",
        )


@router.post(
    "/embed-schemes",
    summary="Re-index verified scheme vector embeddings",
    description="Refreshes in-memory and pgvector document embeddings using local sentence-transformers.",
)
async def refresh_embeddings():
    try:
        retriever = get_rag_retriever()
        retriever._initialize_local_index()
        return {
            "status": "success",
            "message": f"Successfully indexed {len(retriever._indexed_chunks)} verified scheme chunks.",
            "dimension": 384,
            "model": "all-MiniLM-L6-v2",
        }
    except Exception as exc:
        logger.error(f"Failed to re-index scheme embeddings: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to refresh embeddings: {str(exc)}",
        )
