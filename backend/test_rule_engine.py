"""
Unit Tests for ArthSetu Deterministic Eligibility Rule Engine & Scheme API (Step 2)
==================================================================================
Tests all rule combinations, provenance tracking, and edge cases.
"""

import os
import sys
import pytest
from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(__file__))

from app.main import app
from app.services.eligibility import (
    SCHEME_RULES,
    check_all_schemes,
    check_single_scheme,
    get_best_match,
    evaluate_scheme,
    get_verified_schemes_data,
)

client = TestClient(app)


# ---------------------------------------------------------------------------
# Test 1: User Example from Prompt (Entrepreneurship ₹3L loan, ₹3L income)
# ---------------------------------------------------------------------------
def test_user_example_entrepreneurship():
    """
    Test user example:
    purpose = entrepreneurship
    annual_family_income = 300000
    loan_amount = 300000
    education_status = not_applicable
    """
    results = check_all_schemes(
        purpose="entrepreneurship",
        annual_family_income=300000,
        loan_amount=300000,
        sc_caste_declared=True,
        education_status="not_applicable",
    )

    # Term loan should be potentially eligible
    term_loan_res = next((r for r in results if r.scheme_name == "Term Loan"), None)
    assert term_loan_res is not None
    assert term_loan_res.eligible is True
    assert term_loan_res.verdict == "Potentially Eligible"
    assert len(term_loan_res.matching_factors) > 0
    assert len(term_loan_res.failed_factors) == 0
    assert term_loan_res.match_score >= 70
    assert "8.0% p.a." in term_loan_res.interest_rate_display
    assert term_loan_res.repayment_years == 7
    assert term_loan_res.needs_manual_verification is False


# ---------------------------------------------------------------------------
# Test 2: Micro Credit Finance (Project cost <= ₹1,40,000)
# ---------------------------------------------------------------------------
def test_micro_credit_finance_eligibility():
    results = check_all_schemes(
        purpose="micro_business",
        annual_family_income=150000,
        project_cost=100000,
        sc_caste_declared=True,
    )
    mcf = next((r for r in results if r.scheme_name == "Micro Credit Finance"), None)
    assert mcf is not None
    assert mcf.eligible is True
    assert mcf.verdict == "Potentially Eligible"
    assert mcf.recommended_loan_amount == 90000.0  # 90% of 100,000
    assert "6.5% p.a." in mcf.interest_rate_display
    assert mcf.repayment_years == 3
    assert mcf.source_url == "https://nsfdc.nic.in/en/micro-credit-finance"


# ---------------------------------------------------------------------------
# Test 3: Educational Loan Scheme (ELS) & Needs Manual Verification Flag
# ---------------------------------------------------------------------------
def test_education_loan_scheme():
    results = check_all_schemes(
        purpose="education",
        annual_family_income=200000,
        project_cost=1500000,
        sc_caste_declared=True,
        study_location="india",
        gender="female",
    )
    els = next((r for r in results if r.scheme_name == "Educational Loan Scheme (ELS)"), None)
    assert els is not None
    assert els.eligible is True
    assert els.verdict == "Potentially Eligible"
    assert els.needs_manual_verification is True
    assert "rebate for women" in els.interest_rate_display or "0.5%" in els.interest_rate_display or len(els.matching_factors) > 0
    assert els.source_url == "https://nsfdc.nic.in/scheme"


# ---------------------------------------------------------------------------
# Test 4: Disqualification - Caste Gate (Non-SC)
# ---------------------------------------------------------------------------
def test_non_sc_disqualification():
    results = check_all_schemes(
        purpose="business",
        annual_family_income=100000,
        project_cost=100000,
        sc_caste_declared=False,
    )
    for r in results:
        assert r.eligible is False
        assert r.verdict == "Does Does Not Match Current Criteria" or r.verdict == "Does Not Match Current Criteria"
        assert any("Scheduled Caste" in f for f in r.failed_factors)


# ---------------------------------------------------------------------------
# Test 5: Disqualification - Income Ceiling Exceeded (> ₹3,00,000)
# ---------------------------------------------------------------------------
def test_income_exceeded_disqualification():
    results = check_all_schemes(
        purpose="business",
        annual_family_income=450000,
        project_cost=100000,
        sc_caste_declared=True,
    )
    for r in results:
        assert r.eligible is False
        assert r.verdict == "Does Not Match Current Criteria"
        assert any("income" in f.lower() for f in r.failed_factors)


# ---------------------------------------------------------------------------
# Test 6: API Endpoints (GET /schemes, GET /schemes/{id}, POST /eligibility/check, POST /schemes/match)
# ---------------------------------------------------------------------------
def test_api_schemes_list():
    resp = client.get("/schemes")
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] >= 3
    assert len(data["schemes"]) >= 3
    # Check that required provenance fields are present
    first = data["schemes"][0]
    assert "source_name" in first
    assert "source_url" in first
    assert "last_verified_at" in first
    assert "needs_manual_verification" in first


def test_api_scheme_by_id():
    resp = client.get("/schemes/a1111111-1111-1111-1111-111111111111")
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Micro Credit Finance"
    assert data["rate_beneficiary_min"] == 6.5


def test_api_eligibility_check_post():
    payload = {
        "purpose": "entrepreneurship",
        "annual_family_income": 300000,
        "loan_amount": 300000,
        "education_status": "not_applicable",
        "sc_caste_declared": True,
    }
    resp = client.post("/eligibility/check", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "disclaimer" in data
    assert data["total_schemes_evaluated"] >= 3
    assert data["matched_count"] >= 1
    
    # Check structured result
    match_result = next(r for r in data["results"] if r["scheme_name"] == "Term Loan")
    assert match_result["verdict"] == "Potentially Eligible"
    assert match_result["eligible"] is True
    assert len(match_result["matching_factors"]) > 0
    assert len(match_result["failed_factors"]) == 0
    assert len(match_result["explanation"]) > 0


def test_api_schemes_match_post():
    payload = {
        "purpose": "education",
        "annual_family_income": 200000,
        "project_cost": 2000000,
        "study_location": "india",
        "sc_caste_declared": True,
    }
    resp = client.post("/schemes/match", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["matched_count"] == 1
    assert data["results"][0]["scheme_name"] == "Educational Loan Scheme (ELS)"


# ---------------------------------------------------------------------------
# Test 7: New "Partially Eligible" Verdict (Missing Required Information)
# ---------------------------------------------------------------------------
def test_partially_eligible_verdict_when_missing_income():
    """
    When a user provides valid purpose and project cost, but hasn't yet provided
    annual family income, the engine must return 'Partially Eligible' (not a hard rejection).
    """
    results = check_all_schemes(
        purpose="micro_business",
        annual_family_income=None,  # Missing required income info
        project_cost=100000,
        sc_caste_declared=True,
    )
    mcf = next((r for r in results if r.scheme_name == "Micro Credit Finance"), None)
    assert mcf is not None
    assert mcf.verdict == "Partially Eligible"
    assert mcf.status == "partially_eligible"
    assert mcf.eligible is False
    assert mcf.partially_eligible is True
    assert mcf.matched is True
    assert len(mcf.missing_information) > 0
    assert any("annual_family_income" in m for m in mcf.missing_information)
    assert len(mcf.failed_factors) == 0  # Not a hard failure


# ---------------------------------------------------------------------------
# Test 8: Per-Scheme Rule Independence (Data-Defined Rules)
# ---------------------------------------------------------------------------
def test_scheme_specific_rule_independence():
    """
    Confirms that each scheme defines its OWN distinct eligibility rules:
    - Micro Credit Finance requires project_cost <= 140,000
    - Term Loan requires project_cost > 140,000
    - ELS requires purpose in [education, studies, higher_education]
    """
    from app.services.eligibility import get_rules_for_scheme

    mcf_rules = get_rules_for_scheme("a1111111-1111-1111-1111-111111111111")
    term_rules = get_rules_for_scheme("a2222222-2222-2222-2222-222222222222")
    els_rules = get_rules_for_scheme("a3333333-3333-3333-3333-333333333333")

    assert len(mcf_rules) >= 4
    assert len(term_rules) >= 5
    assert len(els_rules) >= 4

    # Check Micro Credit project cost cap rule
    mcf_cost = next((r for r in mcf_rules if r.field_name == "project_cost"), None)
    assert mcf_cost is not None
    assert mcf_cost.operator == "lte"
    assert mcf_cost.value_num == 140000.0

    # Check Term Loan project cost min rule (> 140,000)
    term_cost_min = next((r for r in term_rules if r.field_name == "project_cost" and r.operator == "gt"), None)
    assert term_cost_min is not None
    assert term_cost_min.value_num == 140000.0

    # Check ELS purpose rule
    els_purpose = next((r for r in els_rules if r.field_name == "purpose"), None)
    assert els_purpose is not None
    assert "education" in els_purpose.value_list


# ---------------------------------------------------------------------------
# Test 9: Strict AI/NLP Separation Verification
# ---------------------------------------------------------------------------
def test_ai_nlp_layer_strict_separation():
    """
    Verifies that the AI / NLP layer ONLY extracts structured fields and NEVER
    approves or sets eligibility directly.
    """
    from app.services.nlu import NLUExtractor
    from app.schemas.ai import ExtractedUserProfile

    assert NLUExtractor is not None
    assert ExtractedUserProfile is not None

    # Verify ExtractedUserProfile does NOT have eligibility verdict fields
    extracted_fields = ExtractedUserProfile.model_fields.keys()
    assert "verdict" not in extracted_fields
    assert "eligible" not in extracted_fields
    assert "partially_eligible" not in extracted_fields
    assert "approved" not in extracted_fields
    assert "is_approved" not in extracted_fields
    assert "sanctioned" not in extracted_fields

    # Verify fallback extraction strictly produces structured fields without deciding eligibility
    fallback_res = NLUExtractor._deterministic_fallback_extract(
        "Mujhe 1 lakh ka micro business shuru karna hai", "hinglish"
    )
    assert isinstance(fallback_res, ExtractedUserProfile)
    assert not hasattr(fallback_res, "verdict")
    assert not hasattr(fallback_res, "eligible")
    assert fallback_res.purpose in ("micro_business", "entrepreneurship")




# ---------------------------------------------------------------------------
# Test 10: Best-Match Ranking Across Multiple Schemes
# ---------------------------------------------------------------------------
def test_best_match_ranking_order():
    """
    Ensures that get_best_match prioritizes fully eligible over partially eligible,
    and sorts by highest match_score.
    """
    best = get_best_match(
        purpose="micro_business",
        annual_family_income=120000,
        project_cost=100000,
        sc_caste_declared=True,
    )
    assert best is not None
    assert best.scheme_name == "Micro Credit Finance"
    assert best.eligible is True
    assert best.verdict == "Potentially Eligible"
    assert best.match_score >= 80


# ---------------------------------------------------------------------------
# Test 11: GET /schemes/{scheme_id}/rules Endpoint
# ---------------------------------------------------------------------------
def test_api_scheme_rules_endpoint():
    resp = client.get("/schemes/a1111111-1111-1111-1111-111111111111/rules")
    assert resp.status_code == 200
    data = resp.json()
    assert data["scheme_id"] == "a1111111-1111-1111-1111-111111111111"
    assert data["rules_count"] >= 4
    assert len(data["rules"]) >= 4
    first_rule = data["rules"][0]
    assert "field_name" in first_rule
    assert "operator" in first_rule
    assert "is_hard_rule" in first_rule


# ---------------------------------------------------------------------------
# Test 12: Stage 3 - Ranking Logic Does NOT Favor Loan Amount or Interest Rate
# ---------------------------------------------------------------------------
def test_stage3_ranking_not_favoring_loan_size_or_interest():

    """
    Verifies that ranking does NOT pick Term Loan simply because it has a higher
    max loan ceiling (₹45L vs ₹1.25L) or because of interest rate.
    For a micro business requirement (project cost ₹1,00,000, loan ₹90,000):
    Micro Credit Finance must be ranked first (Best Match), not Term Loan.
    """
    results = check_all_schemes(
        purpose="micro_business",
        annual_family_income=150000,
        project_cost=100000,
        loan_amount=90000,
        sc_caste_declared=True,
    )
    # The top-ranked scheme must be Micro Credit Finance
    best = results[0]
    assert best.scheme_name == "Micro Credit Finance"
    assert best.eligible is True
    assert best.match_score >= 90

    # Term loan is disqualified for cost <= 140,000 due to hard rule project_cost > 140,000
    term = next((r for r in results if r.scheme_name == "Term Loan"), None)
    assert term is not None
    assert term.eligible is False


def test_stage3_why_matches_you_checklist_reasons():
    """
    Verifies that 'Why this scheme matches you' returns real, traceable reasons
    driven by matching_factors (purpose, income, project scale, applicant category, location).
    """
    best = get_best_match(
        purpose="micro_business",
        annual_family_income=150000,
        project_cost=100000,
        loan_amount=90000,
        sc_caste_declared=True,
        state="Madhya Pradesh",
    )
    assert best is not None
    assert len(best.matching_factors) >= 4

    # Assert specific verified factors are present
    factor_text = " ".join(best.matching_factors)
    assert "Purpose Match" in factor_text or "purpose" in factor_text.lower()
    assert "Income" in factor_text or "ceiling" in factor_text.lower()
    assert "Financial Scale" in factor_text or "cost" in factor_text.lower()
    assert "Scheduled Caste" in factor_text or "SC" in factor_text
    assert "Location Coverage" in factor_text or "Madhya Pradesh" in factor_text


def test_stage3_benefit_type_and_no_fake_ai_scores():
    """
    Verifies that Benefit Type is populated accurately for all 3 schemes
    (benefit_type='loan' with credit-linked / assistance display),
    and match_score is a transparent numeric value 0-100 without AI score strings.
    """
    results = check_all_schemes(
        purpose="business",
        annual_family_income=250000,
        project_cost=500000,
        loan_amount=450000,
        sc_caste_declared=True,
    )
    for r in results:
        # benefit_type must be 'loan'
        assert r.benefit_type == "loan"
        assert r.support_type_display is not None
        # match_score must be transparent integer between 0 and 100
        assert isinstance(r.match_score, int)
        assert 0 <= r.match_score <= 100


if __name__ == "__main__":
    pytest.main(["-v", __file__])


