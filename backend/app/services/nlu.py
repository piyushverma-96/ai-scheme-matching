"""
ArthSetu AI — Natural Language Understanding & Field Extractor (Step 3)
========================================================================
Supports: English, Hindi (Devanagari), and Hinglish.
Extracts structured parameters and confidence indicators without hallucinations.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict, List, Optional

from app.config import settings
from app.schemas.ai import ExtractedUserProfile
from app.services.ai_provider import get_llm_provider

logger = logging.getLogger("arthsetu.nlu")

# ---------------------------------------------------------------------------
# Multilingual Pattern Matchers (for deterministic fallback & validation)
# ---------------------------------------------------------------------------

HINDI_CHAR_PATTERN = re.compile(r"[\u0900-\u097F]")


def detect_language(text: str) -> str:
    """Detects whether text is primarily English, Hindi (Devanagari), or Hinglish."""
    if HINDI_CHAR_PATTERN.search(text):
        return "hindi"
    
    # Distinct romanized Hindi/Hinglish vocabulary
    hinglish_keywords = {
        "mujhe", "chahiye", "karna", "meri", "mera", "parivar", "aamadani", "aamdani",
        "padhai", "shiksha", "vyapar", "dukaan", "dukan", "kheti", "hai", "hain",
        "ka", "ki", "ke", "liye", "batao", "kaise", "milega", "kare", "kitna",
        "bataiye", "kholna", "shuru", "hoga"
    }
    words = set(re.findall(r"\w+", text.lower()))
    if len(words & hinglish_keywords) >= 1:
        return "hinglish"
    return "english"


def parse_indian_number(text: str) -> Optional[float]:
    """Parses Indian currency numbers e.g. '3 lakh', '3.5L', '50 हजार', '45,00,000'."""
    clean = text.lower().replace(",", "").replace("₹", "").replace("rs", "").strip()

    # Pattern: X lakh / lac / L / लाख
    lakh_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|l\b|लाख)", clean)
    if lakh_match:
        return float(lakh_match.group(1)) * 100000.0

    # Pattern: X crore / cr / करोड़
    cr_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:crores?|cr\b|करोड़)", clean)
    if cr_match:
        return float(cr_match.group(1)) * 10000000.0

    # Pattern: X thousand / k / hazar / हजार
    k_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:thousands?|hazar|k\b|हजार)", clean)
    if k_match:
        return float(k_match.group(1)) * 1000.0

    # Direct digits
    num_match = re.search(r"\b(\d{4,9})\b", clean)
    if num_match:
        return float(num_match.group(1))

    return None


def extract_purpose_heuristic(text: str) -> str:
    """Categorizes intent into standard domains."""
    t = text.lower()
    if any(w in t for w in ["education", "study", "studies", "college", "course", "btech", "mbbs", "mba", "padhai", "shiksha", "university", "abroad"]):
        return "education"
    if any(w in t for w in ["kheti", "agriculture", "farming", "dairy", "tractor", "crop"]):
        return "agriculture"
    if any(w in t for w in ["micro", "chhota vyapar", "dukan", "handicraft", "silai", "artisan", "thela"]):
        return "micro_business"
    return "entrepreneurship"


class NLUExtractor:
    """Extracts structured fields from natural language text using Groq LLM + Deterministic Fallback."""

    SYSTEM_PROMPT = """You are the UdyamNex Natural Language Understanding Engine for Government Scheme Discovery.
Your job is to extract structured loan requirements from user queries in English, Hindi, or Hinglish.

Extract the following JSON strictly:
{
  "purpose": "entrepreneurship" | "business" | "micro_business" | "education" | "agriculture" | "services" | "trade",
  "loan_amount": <number in INR or null>,
  "annual_income": <number in INR or null>,
  "education_status": "not_applicable" | "12th_pass" | "graduate" | "post_graduate",
  "study_location": "india" | "abroad" | null,
  "location": "<city/state or null>",
  "caste": "SC" | "other",
  "gender": "female" | "male" | "other" | null,
  "missing_fields": ["loan_amount" | "annual_income" | "purpose"],
  "confidence": "high confidence" | "low confidence" | "missing information",
  "language_detected": "english" | "hindi" | "hinglish",
  "clarification_question": "<polite clarification question in user's language if missing critical info, else null>"
}

Rules:
1. Handle 'lakh', 'L', 'लाख', 'hazar', 'हजार' correctly (e.g. '3.5 lakh' = 350000).
2. 'business start karna' or 'startup' -> purpose = 'entrepreneurship'.
3. 'padhai' or 'study' or 'course' -> purpose = 'education'.
4. Do not invent numbers. If not stated, set to null and add to missing_fields.
5. If both loan_amount and annual_income are present, confidence = "high confidence". If missing one, confidence = "missing information".
6. Output JSON only. No markdown fences, no preamble."""

    @classmethod
    async def extract_profile(cls, query: str, preferred_language: Optional[str] = "auto") -> ExtractedUserProfile:
        lang = detect_language(query) if preferred_language == "auto" else preferred_language

        if not settings.GROQ_API_KEY or settings.GROQ_API_KEY.strip() == "":
            return cls._deterministic_fallback_extract(query, lang)

        llm = get_llm_provider()
        messages = [
            {"role": "system", "content": cls.SYSTEM_PROMPT},
            {"role": "user", "content": f"User Query: {query}"}
        ]

        try:
            raw_response = await llm.generate_chat_completion(messages, temperature=0.1, json_mode=True)
            clean_json = raw_response.strip()
            if clean_json.startswith("```json"):
                clean_json = clean_json[7:]
            if clean_json.startswith("```"):
                clean_json = clean_json[3:]
            if clean_json.endswith("```"):
                clean_json = clean_json[:-3]
            clean_json = clean_json.strip()

            parsed = json.loads(clean_json)

            conf = parsed.get("confidence", "high confidence")
            if conf not in ("high confidence", "low confidence", "missing information"):
                conf = "high confidence" if parsed.get("loan_amount") and parsed.get("annual_income") else "missing information"

            return ExtractedUserProfile(
                purpose=parsed.get("purpose") or extract_purpose_heuristic(query),
                loan_amount=float(parsed["loan_amount"]) if parsed.get("loan_amount") is not None else None,
                annual_income=float(parsed["annual_income"]) if parsed.get("annual_income") is not None else None,
                education_status=parsed.get("education_status") or "not_applicable",
                study_location=parsed.get("study_location"),
                location=parsed.get("location"),
                caste=parsed.get("caste") or "SC",
                gender=parsed.get("gender"),
                missing_fields=parsed.get("missing_fields") or [],
                confidence=conf,
                language_detected=parsed.get("language_detected") or lang,
                clarification_question=parsed.get("clarification_question"),
            )
        except Exception as exc:
            logger.warning(f"LLM NLU extraction fallback: {exc}")
            return cls._deterministic_fallback_extract(query, lang)

    @classmethod
    def _deterministic_fallback_extract(cls, query: str, lang: str) -> ExtractedUserProfile:
        """Deterministic extractor for Hindi/Hinglish/English."""
        purpose = extract_purpose_heuristic(query)

        income: Optional[float] = None
        loan: Optional[float] = None

        # Look for income patterns e.g. "family income 3.5 lakh" or "aamadani 2 lakh"
        income_match = re.search(
            r"(?:family\s+income|annual\s+income|income|aamadani|aamdani|kamai|aaye|parivar ki aay|aay)\s*(?:hai|is|=|:)?\s*([0-9\.,\s]+(?:lakhs?|lacs?|k\b|crores?|hazar|लाख|हजार)?)",
            query.lower()
        )
        if income_match:
            income = parse_indian_number(income_match.group(1))

        # Look for loan/support patterns e.g. "3 lakh ka loan" or "2 lakhs support"
        loan_match = re.search(
            r"([0-9\.,\s]+(?:lakhs?|lacs?|k\b|crores?|hazar|लाख|हजार)?)\s*(?:ka\s+loan|loan|chahiye|ka\s+business|ka\s+project|ki\s+padhai|ka\s+vyapar|support|funding|assistance)",
            query.lower()
        )
        if loan_match:
            loan = parse_indian_number(loan_match.group(1))
        elif not income:
            # First number in query
            loan = parse_indian_number(query)

        missing: List[str] = []
        if loan is None:
            missing.append("loan_amount")
        if income is None:
            missing.append("annual_income")

        confidence = "high confidence" if (loan is not None and income is not None) else "missing information"

        study_loc = (
            "abroad"
            if any(w in query.lower() for w in ["abroad", "foreign", "videsh", "usa", "uk", "germany"])
            else "india" if purpose == "education" else None
        )

        clarification = None
        if missing:
            if lang == "hindi":
                clarification = "कृपया अपने व्यवसाय/कोर्स की कुल लागत और परिवार की वार्षिक आय बताएं।"
            elif lang == "hinglish":
                clarification = "Kripya apna desired loan amount aur family ki annual income specify karein."
            else:
                clarification = "Please provide your estimated project cost / loan requirement and annual family income."

        return ExtractedUserProfile(
            purpose=purpose,
            loan_amount=loan,
            annual_income=income,
            education_status="not_applicable" if purpose != "education" else "graduate",
            study_location=study_loc,
            location=None,
            caste="SC",
            gender="female" if any(w in query.lower() for w in ["mahila", "female", "woman", "girl", "ladki"]) else None,
            missing_fields=missing,
            confidence=confidence,
            language_detected=lang,
            clarification_question=clarification,
        )
