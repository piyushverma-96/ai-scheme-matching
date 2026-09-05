"""
Stage 6 & Full Project Consistency Acceptance Test Suite
========================================================
Validates:
1. Reconciled Scheme Schema & Models (Target shape fields, no duplicate columns)
2. Scheme-Specific Document Checklists (ELS vs Term Loan vs Micro Credit)
3. Recommendation Engine Pipeline Flow (Scheme Suitability over Loan Suitability)
4. Dynamic Application Channel Assignment (Channel Partner vs Direct Portal)
5. AI / RAG Role Separation (NLU Extraction & RAG Facts vs Deterministic Eligibility Rules)
6. Authenticated User Application Submission & Tracking
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.schemes import SchemeOut, SchemeMatchResult
from app.services.eligibility import SCHEME_RULES, check_all_schemes
from app.services.application_service import ApplicationService

client = TestClient(app)


def test_schema_reconciliation_audit():
    """Verify target model shape and reconciled fields without duplicate columns."""
    sample_data = {
        "id": "a1111111-1111-1111-1111-111111111111",
        "name": "NSFDC Micro Credit Finance",
        "scheme_type": "micro_finance",
        "short_description": "Micro finance up to 1.25L",
        "issuing_body": "NSFDC",
        "project_cost_min": 0,
        "max_loan_amount": 125000,
        "financing_pct": 90,
        "rate_beneficiary_min": 6.5,
        "rate_beneficiary_max": 6.5,
        "rate_to_sca": 2.0,
        "repayment_years_max": 3,
        "moratorium_months": 0,
        "max_income_eligibility": 300000,
        "eligible_purposes": ["business", "micro_business"],
        # Reconciled fields
        "benefit_type": "loan",
        "benefit_summary": "Micro-finance credit up to 1.25 Lakh",
        "has_financial_calculation": True,
        "application_channel_type": "channel_partner",
        "application_channel_details": {"nodal": "SCA"},
        # Target shape fields
        "ministry": "Ministry of Social Justice and Empowerment",
        "department": "Department of Social Justice and Empowerment",
        "scheme_category": "Microfinance",
        "target_beneficiary": "SC micro-entrepreneurs",
        "sectors": ["Trade", "Services"],
        "applicable_states": ["All States and UTs"],
        "application_mode": "channel_agency",
        "official_application_url": "https://nsfdc.nic.in/scheme",
        "status": "active",
        "source_name": "NSFDC Official Portal",
        "source_url": "https://nsfdc.nic.in/scheme",
        "last_verified_at": "2026-09-05",
        "needs_manual_verification": False,
    }

    scheme_out = SchemeOut(**sample_data)
    assert scheme_out.benefit_type == "loan"
    assert scheme_out.benefit_summary == "Micro-finance credit up to 1.25 Lakh"
    assert scheme_out.has_financial_calculation is True
    assert scheme_out.application_channel_type == "channel_partner"
    assert scheme_out.ministry == "Ministry of Social Justice and Empowerment"
    assert scheme_out.status == "active"
    assert "benefit_description" not in scheme_out.__dict__, "Must not create duplicate benefit_description column"


def test_scheme_specific_documents_differentiation():
    """Verify that document requirements are scheme-specific and not generic."""
    els_docs = ApplicationService.get_scheme_document_checklist(scheme_name="Educational Loan Scheme (ELS)")
    els_types = [d.document_type for d in els_docs.documents]

    assert "admission_letter" in els_types, "ELS must require confirmed admission letter"
    assert "fee_structure" in els_types, "ELS must require official fee structure schedule"
    assert "academic_marksheets" in els_types, "ELS must require academic mark sheets"
    assert "project_report" not in els_types, "ELS must NOT require business DPR"

    term_docs = ApplicationService.get_scheme_document_checklist(scheme_name="NSFDC Term Loan Scheme")
    term_types = [d.document_type for d in term_docs.documents]

    assert "project_report" in term_types, "Term Loan must require detailed project report"
    assert "quotation_machinery" in term_types, "Term Loan must require machinery quotation"
    assert "admission_letter" not in term_types, "Term Loan must NOT require admission letter"


def test_recommendation_engine_scheme_suitability():
    """Verify recommendation engine optimizes for scheme suitability based on entrepreneur profile."""
    # Test Education purpose routes to ELS
    res_edu = client.post("/schemes/match", json={
        "purpose": "education",
        "annual_family_income": 200000,
        "loan_amount": 1500000,
        "sc_caste_declared": True,
        "education_status": "graduate",
        "study_location": "india"
    })
    assert res_edu.status_code == 200
    data_edu = res_edu.json()
    assert len(data_edu["results"]) > 0
    top_edu = data_edu["results"][0]
    assert top_edu["scheme_type"] == "education_loan"
    assert top_edu["benefit_type"] == "loan"
    assert top_edu["application_channel_type"] == "channel_partner"
    assert "benefit_summary" in top_edu

    # Test Tiny Self-employment routes to Micro Credit Finance
    res_micro = client.post("/schemes/match", json={
        "purpose": "micro_business",
        "annual_family_income": 120000,
        "loan_amount": 80000,
        "sc_caste_declared": True,
        "education_status": "secondary"
    })
    assert res_micro.status_code == 200
    data_micro = res_micro.json()
    top_micro = data_micro["results"][0]
    assert top_micro["scheme_type"] == "micro_finance"
    assert top_micro["recommended_loan_amount"] == 72000.0 or top_micro["recommended_loan_amount"] <= 125000


def test_ai_rag_role_separation():
    """Verify AI/NLU extracts structured intent and deterministic rules make eligibility verdict."""
    from app.services.nlu import NLUExtractor

    # Query extraction
    extracted = NLUExtractor._deterministic_fallback_extract(
        "I want to open a small grocery shop in Bhopal, need 2 lakhs support, family income is 1.8 lakhs.",
        "english"
    )
    assert extracted.purpose in ["business", "entrepreneurship", "trade"]
    assert extracted.annual_income == 180000.0
    assert extracted.loan_amount == 200000.0

    # Deterministic rule engine evaluation (no hallucinated approval)
    results = check_all_schemes(
        annual_family_income=extracted.annual_income,
        project_cost=222222.0,
        loan_amount=extracted.loan_amount,
        purpose=extracted.purpose,
        sc_caste_declared=True,
    )
    assert len(results) >= 1
    for r in results:
        assert r.verdict in ["Potentially Eligible", "Partially Eligible", "Does Not Match Current Criteria"]
        assert isinstance(r.matching_factors, list)
        assert isinstance(r.failed_factors, list)


def test_application_creation_and_tracking_flow():
    """Verify application creation with scheme-specific documents and timeline tracking."""
    payload = {
        "scheme_name": "NSFDC Term Loan Scheme",
        "partner_name": "M.P. Rajya Sahakari Anusuchit Jati Vitta Nigam (SCA)",
        "applicant_name": "Priya Verma",
        "applicant_phone": "9876543210",
        "annual_family_income": 200000,
        "loan_amount": 300000,
        "project_cost": 333333,
        "purpose": "business",
        "sc_caste_declared": True,
        "documents": [
            {"document_type": "aadhaar_card", "document_name": "Aadhaar Card", "is_mandatory": True, "is_uploaded": True},
            {"document_type": "project_report", "document_name": "Detailed Project Report", "is_mandatory": True, "is_uploaded": True}
        ]
    }

    res = client.post("/applications", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["applicant_name"] == "Priya Verma"
    assert "ARTH-" in data["application_number"]
    assert data["status"] == "Submitted"
    assert len(data["timeline"]) >= 1

    # Tracking check
    track_res = client.get(f"/applications/{data['application_number']}")
    assert track_res.status_code == 200
    track_data = track_res.json()
    assert track_data["application_number"] == data["application_number"]
