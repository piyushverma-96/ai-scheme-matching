"""
Unit Tests for ArthSetu AI Intelligence Layer (Step 3)
======================================================
Tests NLU Extraction, Multilingual Hinglish/Hindi/English parsing,
RAG semantic retrieval, Rule Engine integration, and Scheme Q&A.
"""

import asyncio
import os
import sys
import pytest
from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(__file__))

from app.main import app
from app.services.nlu import NLUExtractor, detect_language, parse_indian_number
from app.services.rag import get_rag_retriever
from app.services.ai_assistant import AIAssistantService
from app.schemas.ai import UnderstandRequirementRequest, AskSchemeQuestionRequest

client = TestClient(app)


# ---------------------------------------------------------------------------
# Test 1: Multilingual Detection & Indian Number Parsing
# ---------------------------------------------------------------------------
def test_language_detection():
    assert detect_language("I want a business loan of 3 lakhs") == "english"
    assert detect_language("Mujhe 3 lakh ka business start karna hai") == "hinglish"
    assert detect_language("मुझे 3 लाख का ऋण चाहिए") == "hindi"


def test_indian_number_parsing():
    assert parse_indian_number("3 lakh") == 300000.0
    assert parse_indian_number("3.5 Lakhs") == 350000.0
    assert parse_indian_number("40 लाख") == 4000000.0
    assert parse_indian_number("50 हजार") == 50000.0
    assert parse_indian_number("250000") == 250000.0


# ---------------------------------------------------------------------------
# Test 2: NLU Extraction from Prompt Example (Hinglish)
# ---------------------------------------------------------------------------
def test_nlu_extraction_prompt_example():
    """
    User: "Mujhe 3 lakh ka business start karna hai aur meri family income 3.5 lakh hai."
    Extracts:
    purpose = entrepreneurship / business
    loan_amount = 300000
    annual_family_income = 350000
    """
    query = "Mujhe 3 lakh ka business start karna hai aur meri family income 3.5 lakh hai."
    profile = asyncio.run(NLUExtractor.extract_profile(query))

    assert profile.purpose in ("entrepreneurship", "business")
    assert profile.loan_amount == 300000.0
    assert profile.annual_income == 350000.0
    assert profile.confidence == "high confidence"
    assert profile.language_detected == "hinglish"


# ---------------------------------------------------------------------------
# Test 3: NLU Extraction with Missing Fields & Clarification
# ---------------------------------------------------------------------------
def test_nlu_missing_information():
    query = "Mujhe dukaan kholne ke liye loan chahiye"
    profile = asyncio.run(NLUExtractor.extract_profile(query))

    assert profile.purpose in ("entrepreneurship", "business", "micro_business")
    assert profile.confidence == "missing information"
    assert len(profile.missing_fields) > 0
    assert profile.clarification_question is not None


# ---------------------------------------------------------------------------
# Test 4: RAG Semantic Retriever Grounding
# ---------------------------------------------------------------------------
def test_rag_retriever():
    retriever = get_rag_retriever()
    chunks = retriever.retrieve("What is the interest rate and moratorium for Educational Loan Scheme?", top_k=2)

    assert len(chunks) > 0
    top = chunks[0]
    assert "source_name" in top
    assert "source_url" in top
    assert "Educational Loan Scheme" in top["scheme_name"] or "Term Loan" in top["scheme_name"]


# ---------------------------------------------------------------------------
# Test 5: End-to-End Pipeline API (POST /ai/understand-requirement)
# ---------------------------------------------------------------------------
def test_api_understand_requirement_pipeline():
    payload = {
        "query": "Mujhe 3 lakh ka business start karna hai aur meri family income 6 lakh hai."
    }
    resp = client.post("/ai/understand-requirement", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    # Step 1: Extracted profile
    assert data["extracted_profile"]["loan_amount"] == 300000.0
    assert data["extracted_profile"]["annual_income"] == 600000.0

    # Step 2: RAG Context
    assert len(data["retrieved_schemes_context"]) > 0
    assert "source_url" in data["retrieved_schemes_context"][0]

    # Step 3: Rule Engine Evaluation
    # Since income is 6L (> 5.0L NSFDC ceiling), schemes evaluate deterministically as Does Not Match Current Criteria
    assert len(data["rule_engine_results"]) > 0
    for r in data["rule_engine_results"]:
        assert r["verdict"] == "Does Not Match Current Criteria"
        assert any("income" in f.lower() for f in r["failed_factors"])

    # Step 4: Explanation
    assert len(data["explanation"]) > 0


# ---------------------------------------------------------------------------
# Test 6: Scheme Q&A API (POST /ai/ask)
# ---------------------------------------------------------------------------
def test_api_ask_scheme_question():
    payload = {
        "question": "What is the maximum loan limit and interest rate for Micro Credit Finance?"
    }
    resp = client.post("/ai/ask", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert len(data["answer"]) > 0
    assert len(data["sources"]) > 0
    assert data["sources"][0]["is_verified"] is True
    assert "https://nsfdc.nic.in" in data["sources"][0]["source_url"]


def test_api_embed_schemes_refresh():
    resp = client.post("/ai/embed-schemes")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["dimension"] == 384


if __name__ == "__main__":
    pytest.main(["-v", __file__])
