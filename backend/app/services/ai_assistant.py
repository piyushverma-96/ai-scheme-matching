"""
ArthSetu AI — Assistant Orchestrator & Scheme Q&A Engine (Step 3)
=================================================================
Pipeline:
  1. AI UNDERSTANDS (NLU)
  2. RAG RETRIEVES VERIFIED INFORMATION
  3. RULE ENGINE VERIFIES ELIGIBILITY (DETERMINISTIC)
  4. SYSTEM EXPLAINS RESULT
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from app.schemas.ai import (
    AskSchemeQuestionRequest,
    AskSchemeQuestionResponse,
    ExtractedUserProfile,
    RAGContextChunk,
    SchemeSourceCitation,
    UnderstandRequirementRequest,
    UnderstandRequirementResponse,
)
from app.schemas.schemes import SchemeMatchResult
from app.services.ai_provider import get_llm_provider
from app.services.eligibility import check_all_schemes, get_best_match
from app.services.nlu import NLUExtractor
from app.services.rag import get_rag_retriever

logger = logging.getLogger("arthsetu.ai_assistant")


def _to_match_schema(r) -> SchemeMatchResult:
    return SchemeMatchResult(
        scheme_id=r.scheme_id,
        scheme_name=r.scheme_name,
        scheme_type=r.scheme_type,
        verdict=r.verdict,
        eligible=r.eligible,
        matched=r.matched,
        match_score=r.match_score,
        matching_factors=r.matching_factors,
        reasons=r.reasons,
        failed_factors=r.failed_factors,
        disqualifiers=r.disqualifiers,
        missing_information=r.missing_information,
        explanation=r.explanation,
        recommended_loan_amount=r.recommended_loan_amount,
        interest_rate_display=r.interest_rate_display,
        repayment_years=r.repayment_years,
        moratorium_note=r.moratorium_note,
        benefit_type=getattr(r, "benefit_type", "loan"),
        benefit_summary=getattr(r, "benefit_summary", None),
        has_financial_calculation=getattr(r, "has_financial_calculation", True),
        support_type_display=getattr(r, "support_type_display", None),
        benefit_amount_display=getattr(r, "benefit_amount_display", None),
        application_channel_type=getattr(r, "application_channel_type", "channel_partner"),
        application_channel_details=getattr(r, "application_channel_details", None),
        application_mode=getattr(r, "application_mode", "channel_agency"),
        official_application_url=getattr(r, "official_application_url", "https://nsfdc.nic.in/scheme"),
        required_documents=getattr(r, "required_documents", []),
        ministry=getattr(r, "ministry", "Ministry of Social Justice and Empowerment"),
        target_beneficiary=getattr(r, "target_beneficiary", None),
        source_name=r.source_name,
        source_url=r.source_url,
        last_verified_at=r.last_verified_at,
        needs_manual_verification=r.needs_manual_verification,
        verification_note=r.verification_note,
    )


class AIAssistantService:
    """Core intelligence layer orchestrating NLU, RAG, Rule Engine, and Explanation."""

    @classmethod
    async def understand_and_evaluate(cls, request: UnderstandRequirementRequest) -> UnderstandRequirementResponse:
        # Step 1: AI Understands
        profile: ExtractedUserProfile = await NLUExtractor.extract_profile(
            query=request.query,
            preferred_language=request.language
        )

        # Step 2: RAG Retrieves Verified Info
        retriever = get_rag_retriever()
        retrieved_raw = retriever.retrieve(query=request.query, top_k=3)
        context_chunks = [
            RAGContextChunk(
                scheme_name=c["scheme_name"],
                scheme_id=c["scheme_id"],
                relevance_score=c["relevance_score"],
                content=c["content"],
                source_name=c["source_name"],
                source_url=c["source_url"],
                last_verified_at=c["last_verified_at"],
                needs_manual_verification=c["needs_manual_verification"],
            )
            for c in retrieved_raw
        ]

        # Step 3: Rule Engine Verifies Eligibility (Deterministic)
        # Use default assumptions if profile has missing fields for preview
        eval_income = profile.annual_income if profile.annual_income is not None else 300000.0
        eval_loan = profile.loan_amount if profile.loan_amount is not None else 100000.0
        eval_cost = round(eval_loan / 0.9, 2)

        rule_results = check_all_schemes(
            purpose=profile.purpose,
            annual_family_income=eval_income,
            project_cost=eval_cost,
            loan_amount=eval_loan,
            sc_caste_declared=(profile.caste.upper() == "SC"),
            education_status=profile.education_status,
            study_location=profile.study_location,
            gender=profile.gender,
        )

        matched_schemes = [r for r in rule_results if r.eligible]
        best_rule_match = matched_schemes[0] if matched_schemes else None

        # Step 4: System Explains Result (LLM grounded in Rule Engine + Verified RAG)
        explanation = await cls._generate_grounded_explanation(
            query=request.query,
            profile=profile,
            retrieved_context=retrieved_raw,
            rule_results=rule_results,
            best_match=best_rule_match,
            lang=profile.language_detected,
        )

        return UnderstandRequirementResponse(
            query=request.query,
            extracted_profile=profile,
            retrieved_schemes_context=context_chunks,
            rule_engine_results=[_to_match_schema(r) for r in rule_results],
            matched_count=len(matched_schemes),
            best_match=_to_match_schema(best_rule_match) if best_rule_match else None,
            explanation=explanation,
            confidence=profile.confidence,
        )

    @classmethod
    async def _generate_grounded_explanation(
        cls,
        query: str,
        profile: ExtractedUserProfile,
        retrieved_context: List[Dict[str, Any]],
        rule_results: List[Any],
        best_match: Optional[Any],
        lang: str,
    ) -> str:
        """Generates natural language explanation strictly faithful to rule engine output."""
        llm = get_llm_provider()

        context_summary = "\n".join([f"- {c['scheme_name']}: {c['content']}" for c in retrieved_context])
        verdicts_summary = "\n".join([
            f"- {r.scheme_name}: Verdict={r.verdict}, Loan=₹{r.recommended_loan_amount or 0:,.0f}, Rate={r.interest_rate_display}, Repayment={r.repayment_years}y, FailedRules={r.failed_factors}"
            for r in rule_results
        ])

        system_prompt = f"""You are the official UdyamNex Scheme Explainer.
Language preference: {lang} (Respond in the same language as the user: English, Hindi, or Hinglish).

CRITICAL GROUNDING RULES:
1. Every statement you make MUST strictly agree with the Deterministic Rule Engine verdicts below.
2. If the rule engine says 'Does Not Match Current Criteria' or failed on income/caste, explain the exact reason.
3. If 'Potentially Eligible', state the recommended loan amount, interest rate, repayment tenure, and moratorium.
4. State clearly that this is an indicative eligibility check and not a formal loan approval.
5. If critical information (income or loan amount) was missing from the user's query, politely ask them for it.
6. Keep explanation clear, helpful, and concise (under 4-5 sentences)."""

        user_prompt = f"""User Query: "{query}"

Extracted Profile:
- Purpose: {profile.purpose}
- Loan Amount: ₹{profile.loan_amount or 'Not specified'}
- Family Income: ₹{profile.annual_income or 'Not specified'}
- Missing Fields: {profile.missing_fields}

Retrieved Verified Scheme Facts:
{context_summary}

Deterministic Rule Engine Verdicts:
{verdicts_summary}

Generate the user explanation now:"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        try:
            return await llm.generate_chat_completion(messages, temperature=0.2, max_tokens=400)
        except Exception as e:
            logger.error(f"Explanation generation failed: {e}")
            if best_match:
                return best_match.explanation
            return "Based on your criteria, please review the evaluated scheme factors below."

    @classmethod
    async def answer_question(cls, request: AskSchemeQuestionRequest) -> AskSchemeQuestionResponse:
        """Answers scheme-related queries strictly from verified RAG documents."""
        retriever = get_rag_retriever()
        retrieved_raw = retriever.retrieve(query=request.question, top_k=3, scheme_id=request.scheme_id)

        if not retrieved_raw:
            return AskSchemeQuestionResponse(
                question=request.question,
                answer="This information cannot be verified from the official NSFDC source documents.",
                sources=[],
                confidence="low confidence",
                needs_manual_verification=False,
            )

        context_text = "\n".join([f"[{c['scheme_name']}] {c['content']}" for c in retrieved_raw])
        has_manual_verification = any(c.get("needs_manual_verification", False) for c in retrieved_raw)

        llm = get_llm_provider()

        system_prompt = """You are the official UdyamNex Assistant answering questions regarding NSFDC government schemes.
Rules:
1. Answer ONLY using the facts provided in the Verified Context.
2. If the verified context does not contain the answer, say: 'This information cannot be verified from the official NSFDC source documents.'
3. Do NOT make up interest rates, loan amounts, or policies.
4. Answer concisely in the language of the user's question (English / Hindi / Hinglish)."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Verified Context:\n{context_text}\n\nQuestion: {request.question}"}
        ]

        answer = await llm.generate_chat_completion(messages, temperature=0.1, max_tokens=350)

        sources = [
            SchemeSourceCitation(
                source_name=c["source_name"],
                source_url=c["source_url"],
                last_verified_at=c["last_verified_at"],
                is_verified=True,
                needs_manual_verification=c["needs_manual_verification"],
                verification_note=c.get("verification_note"),
            )
            for c in retrieved_raw
        ]

        return AskSchemeQuestionResponse(
            question=request.question,
            answer=answer,
            sources=sources,
            confidence="high confidence" if len(retrieved_raw) > 0 else "low confidence",
            needs_manual_verification=has_manual_verification,
        )
