"""
Pydantic Schemas for AI & RAG Intelligence Layer (Step 3)
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.schemes import SchemeMatchResult


class ExtractedUserProfile(BaseModel):
    """Structured fields extracted from natural language user queries."""
    purpose: str = Field(description="Normalized purpose (e.g. entrepreneurship, education, agriculture)")
    loan_amount: Optional[float] = Field(default=None, description="Extracted loan amount in INR")
    annual_income: Optional[float] = Field(default=None, description="Extracted annual family income in INR")
    education_status: Optional[str] = Field(default="not_applicable", description="e.g. graduate, 12th_pass, not_applicable")
    study_location: Optional[str] = Field(default=None, description="india, abroad, or not_specified")
    location: Optional[str] = Field(default=None, description="Applicant city/state if mentioned")
    caste: Optional[str] = Field(default="SC", description="Caste category mentioned (default SC)")
    gender: Optional[str] = Field(default=None, description="female, male, other")
    missing_fields: List[str] = Field(default_factory=list, description="Crucial fields missing for complete evaluation")
    confidence: str = Field(description="'high confidence' | 'low confidence' | 'missing information'")
    language_detected: str = Field(description="'english' | 'hindi' | 'hinglish'")
    clarification_question: Optional[str] = Field(default=None, description="Question asked to user if important fields are missing")


class UnderstandRequirementRequest(BaseModel):
    query: str = Field(
        ...,
        description="Natural language query in English, Hindi, or Hinglish (e.g. 'Mujhe 3 lakh ka business start karna hai aur meri family income 3.5 lakh hai.')",
        json_schema_extra={"example": "Mujhe 3 lakh ka business start karna hai aur meri family income 3.5 lakh hai."}
    )
    language: Optional[str] = Field(default="auto", description="'auto', 'english', 'hindi', or 'hinglish'")


class RAGContextChunk(BaseModel):
    scheme_name: str
    scheme_id: str
    relevance_score: float
    content: str
    source_name: str
    source_url: str
    last_verified_at: str
    needs_manual_verification: bool


class UnderstandRequirementResponse(BaseModel):
    query: str
    extracted_profile: ExtractedUserProfile
    retrieved_schemes_context: List[RAGContextChunk]
    rule_engine_results: List[SchemeMatchResult]
    matched_count: int
    best_match: Optional[SchemeMatchResult] = None
    explanation: str
    confidence: str
    disclaimer: str = (
        "This response is grounded strictly in official NSFDC verified guidelines and evaluated by a deterministic rule engine. "
        "It provides indicative eligibility and does not constitute official loan sanction."
    )


class AskSchemeQuestionRequest(BaseModel):
    question: str = Field(
        ...,
        description="Question about loan limits, interest rates, eligibility criteria, or documents in English/Hindi/Hinglish.",
        json_schema_extra={"example": "What is the maximum loan limit and interest rate for Term Loan under NSFDC?"}
    )
    scheme_id: Optional[str] = Field(default=None, description="Optional UUID to narrow question to a specific scheme")
    language: Optional[str] = Field(default="auto", description="'auto', 'english', 'hindi', or 'hinglish'")


class SchemeSourceCitation(BaseModel):
    source_name: str
    source_url: str
    last_verified_at: str
    is_verified: bool
    needs_manual_verification: bool
    verification_note: Optional[str] = None


class AskSchemeQuestionResponse(BaseModel):
    question: str
    answer: str
    sources: List[SchemeSourceCitation]
    confidence: str
    needs_manual_verification: bool
    disclaimer: str = (
        "Answers are derived solely from verified NSFDC official policy data. "
        "For final loan applications, contact your State Channelizing Agency or visit nsfdc.nic.in."
    )
