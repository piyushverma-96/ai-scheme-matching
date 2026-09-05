"""
Step 4 Beneficiary Flow End-to-End Test Suite for ArthSetu AI
=============================================================
Verifies:
  1. Consistency Check: Canonical field names match across backend, DB, AI layer, and frontend contracts.
  2. Verdict Integrity: Rule engine verdict is strictly "Potentially Eligible", NEVER "Loan Approved".
  3. AI Requirement Understanding: Natural language queries map to canonical fields.
  4. "Why This Scheme?" Factors: Matching factors (✓), and verification caveats.
  5. Deterministic EMI Calculator Math: Correct reducing balance math and moratorium deduction.
"""

import math
import pytest
from app.services.eligibility import check_all_schemes, get_best_match
from app.services.nlu import NLUExtractor
from app.schemas.schemes import EligibilityCheckRequest, SchemeMatchResult


def calculate_deterministic_emi(principal: float, annual_rate_pct: float, tenure_months: int, moratorium_months: int = 0):
    """Deterministic reducing balance EMI formula."""
    repayment_months = max(1, tenure_months - moratorium_months)
    monthly_rate = annual_rate_pct / (12.0 * 100.0)
    if monthly_rate == 0:
        emi = principal / repayment_months
    else:
        emi = (principal * monthly_rate * math.pow(1 + monthly_rate, repayment_months)) / (
            math.pow(1 + monthly_rate, repayment_months) - 1
        )
    total_repayment = emi * repayment_months
    total_interest = max(0.0, total_repayment - principal)
    return round(emi, 2), round(total_interest, 2), round(total_repayment, 2), repayment_months


def test_canonical_field_name_consistency():
    """Verify that EligibilityCheckRequest accepts canonical field names."""
    req = EligibilityCheckRequest(
        purpose="business",
        annual_family_income=250000.0,
        loan_amount=100000.0,
        sc_caste_declared=True,
        education_status="not_applicable",
        study_location="india",
        gender="female",
    )
    assert req.annual_family_income == 250000.0
    assert req.loan_amount == 100000.0
    assert req.project_cost == round(100000.0 / 0.9, 2)
    assert req.sc_caste_declared is True
    assert req.purpose == "business"


def test_verdict_never_says_loan_approved():
    """Rule engine MUST output 'Potentially Eligible' and NEVER 'Loan Approved'."""
    results = check_all_schemes(
        purpose="micro_business",
        annual_family_income=150000.0,
        loan_amount=100000.0,
        sc_caste_declared=True,
    )
    assert len(results) > 0
    for r in results:
        assert "Loan Approved" not in r.verdict
        assert r.verdict in ("Potentially Eligible", "Does Not Match Current Criteria")
        if r.eligible:
            assert r.verdict == "Potentially Eligible"


def test_why_this_scheme_factors_present():
    """'Why This Scheme' breakdown must contain matching factors and transparent explanation."""
    best = get_best_match(
        purpose="micro_business",
        annual_family_income=120000.0,
        loan_amount=100000.0,
        sc_caste_declared=True,
    )
    assert best is not None
    assert best.scheme_name == "Micro Credit Finance"
    assert len(best.matching_factors) > 0
    assert best.explanation != ""
    assert "Micro Credit Finance" in best.explanation


def test_ai_natural_language_to_canonical_fields():
    """AI NLU layer extracts canonical purpose, loan amount, and income from Hindi/Hinglish/English."""
    query = "Mujhe dairy farm ke liye 3 lakh ka loan chahiye, family income 2.5 lakh hai."
    profile = NLUExtractor._deterministic_fallback_extract(query, "hinglish")
    
    assert profile.purpose in ("business", "agriculture", "entrepreneurship")
    assert profile.loan_amount == 300000.0
    assert profile.annual_income == 250000.0
    assert profile.caste == "SC"


def test_deterministic_emi_math_micro_credit():
    """Test mathematical accuracy of EMI calculation for Micro Credit Finance (₹1,25,000 @ 6.5% for 3 years with 3m moratorium)."""
    principal = 125000.0
    rate = 6.5
    tenure_months = 36
    moratorium_months = 3

    emi, total_interest, total_repayment, rep_months = calculate_deterministic_emi(
        principal, rate, tenure_months, moratorium_months
    )

    assert rep_months == 33
    # Monthly rate = 0.065 / 12 = 0.00541666...
    # EMI should be ~ ₹4,147
    assert 4100 <= emi <= 4200
    assert total_repayment > principal
    assert total_interest == round(total_repayment - principal, 2)


def test_deterministic_emi_math_term_loan_vs_commercial():
    """Test EMI savings comparison vs Commercial Banks (13% p.a.)."""
    principal = 500000.0
    tenure_months = 60
    moratorium_months = 3

    # NSFDC Concessional @ 5%
    nsfdc_emi, nsfdc_interest, nsfdc_repayment, _ = calculate_deterministic_emi(
        principal, 5.0, tenure_months, moratorium_months
    )

    # Commercial Bank @ 13%
    comm_emi, comm_interest, comm_repayment, _ = calculate_deterministic_emi(
        principal, 13.0, tenure_months, moratorium_months
    )

    assert comm_emi > nsfdc_emi
    assert comm_interest > nsfdc_interest
    savings = comm_repayment - nsfdc_repayment
    assert savings > 100000.0  # Significant savings over 5 years
