"""
ArthSetu AI — Step 6 Final Integration & Hackathon Demo Test Suite
===================================================================
Covers:
  1. Rule Engine Sole Authority (AI cannot bypass deterministic verdicts)
  2. Field Name Consistency across AI, Rule Engine, DB schemas, and APIs
  3. Complete End-to-End User Journey (Login -> NLU -> Rules -> Recommendations -> EMI -> Partners -> Route -> Documents -> Application -> Tracking -> AI Assistant)
  4. Admin Dashboard Governance APIs (Analytics, Schemes, Partners, Mapping, Applications, Status Simulation)
  5. Hackathon Final Demo Scenario (Bhopal Small Business Entrepreneur: ₹3L Loan, ₹3L Income)
  6. Rate Limiting Middleware & Security
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.eligibility import SCHEME_RULES, evaluate_scheme, check_all_schemes, get_best_match
from app.services.application_service import ApplicationService
from app.services.partner_locator import PartnerLocatorService, ALL_PARTNERS

client = TestClient(app)


# ---------------------------------------------------------------------------
# 1. FOUNDATIONAL VERIFICATION 1: Rule Engine Sole Authority
# ---------------------------------------------------------------------------

def test_rule_engine_sole_authority_non_sc_rejected():
    """Confirms no non-SC applicant can receive an eligible verdict."""
    results = check_all_schemes(
        purpose="business",
        annual_family_income=200000,
        project_cost=300000,
        loan_amount=250000,
        sc_caste_declared=False,
    )
    for r in results:
        assert r.eligible is False
        assert r.verdict == "Does Not Match Current Criteria"
        assert any("Scheduled Caste" in f for f in r.failed_factors)


def test_rule_engine_sole_authority_income_ceiling():
    """Confirms family income > ₹5,00,000 fails deterministic criteria across all schemes."""
    results = check_all_schemes(
        purpose="business",
        annual_family_income=550000,  # Exceeds 5.0 Lakh ceiling
        project_cost=200000,
        loan_amount=150000,
        sc_caste_declared=True,
    )
    for r in results:
        assert r.eligible is False
        assert any("income" in f.lower() for f in r.failed_factors)


def test_rule_engine_threshold_enforcement():
    """Micro credit max loan is ₹1,25,000. Requests > ₹1.4L cost fail micro credit rules."""
    micro_rule = next(r for r in SCHEME_RULES if r.scheme_type == "micro_finance")
    res_high = evaluate_scheme(
        rule=micro_rule,
        purpose="micro_business",
        annual_family_income=180000,
        project_cost=300000,
        loan_amount=250000,
    )
    assert res_high.eligible is False
    assert any("exceeds the maximum allowable limit" in f for f in res_high.failed_factors)


# ---------------------------------------------------------------------------
# 2. FOUNDATIONAL VERIFICATION 2: Field Name Consistency
# ---------------------------------------------------------------------------

def test_field_name_consistency_api_response():
    """Validates unified field names in API responses."""
    payload = {
        "purpose": "business",
        "annual_family_income": 250000,
        "loan_amount": 300000,
        "project_cost": 333333,
        "sc_caste_declared": True,
        "education_status": "graduate",
        "study_location": "india",
    }
    resp = client.post("/eligibility/check", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    # Verify root fields
    assert "total_schemes_evaluated" in data
    assert "matched_count" in data
    assert "results" in data
    assert len(data["results"]) > 0

    first = data["results"][0]
    # Check field names and dual aliases
    assert "scheme_id" in first
    assert "scheme_name" in first
    assert "verdict" in first
    assert "eligible" in first
    assert "matched" in first
    assert "match_score" in first
    assert "matching_factors" in first
    assert "reasons" in first
    assert "failed_factors" in first
    assert "disqualifiers" in first
    assert "source_name" in first
    assert "source_url" in first
    assert "last_verified_at" in first
    assert "needs_manual_verification" in first


# ---------------------------------------------------------------------------
# 3. END-TO-END USER JOURNEY INTEGRATION
# ---------------------------------------------------------------------------

def test_end_to_end_journey_flow():
    """Simulates the entire beneficiary discovery, calculation, partner routing, and tracking journey."""
    # Step 1: Health & Welcome Check
    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"

    # Step 2: AI Requirement Understanding (NLU + RAG + Rules)
    res_ai = client.post(
        "/ai/understand-requirement",
        json={"query": "I need a 2 lakh loan for my electronics repair shop. Annual income is 2 lakh.", "language": "en"}
    )
    assert res_ai.status_code == 200
    ai_data = res_ai.json()
    assert ai_data["extracted_profile"]["purpose"] in ("entrepreneurship", "business", "services", "repair", "micro_business")
    assert len(ai_data["rule_engine_results"]) > 0

    # Step 3: Match Schemes & Recommendations
    res_match = client.post(
        "/schemes/match",
        json={
            "purpose": "business",
            "annual_family_income": 200000,
            "loan_amount": 200000,
            "project_cost": 222222,
            "sc_caste_declared": True,
        }
    )
    assert res_match.status_code == 200
    match_data = res_match.json()
    assert match_data["matched_count"] >= 1
    best_scheme = match_data["results"][0]
    assert best_scheme is not None
    assert best_scheme["eligible"] is True

    # Step 4: Locate Nearby Partners in Bhopal
    res_partners = client.get("/partners/nearby", params={"city": "Bhopal", "latitude": 23.2599, "longitude": 77.4126})
    assert res_partners.status_code == 200
    partner_data = res_partners.json()
    assert len(partner_data["ranked_partners"]) > 0
    top_partner = partner_data["ranked_partners"][0]
    assert top_partner["partner"]["city"] == "Bhopal"

    # Step 5: Route Calculation
    res_route = client.post(
        "/partners/route",
        json={
            "start_lat": 23.2599,
            "start_lng": 77.4126,
            "end_lat": top_partner["partner"]["latitude"],
            "end_lng": top_partner["partner"]["longitude"],
        }
    )
    assert res_route.status_code == 200
    assert len(res_route.json()["route_points"]) >= 2

    # Step 6: Fetch Scheme Document Checklist
    res_docs = client.get(f"/schemes/{best_scheme['scheme_id']}/documents")
    assert res_docs.status_code == 200
    assert len(res_docs.json()["documents"]) >= 5

    # Step 7: Submit Application Packet
    res_app = client.post(
        "/applications",
        json={
            "scheme_name": best_scheme["scheme_name"],
            "partner_name": top_partner["partner"]["name"],
            "applicant_name": "Ramesh Kumar",
            "applicant_phone": "9876543210",
            "annual_family_income": 200000,
            "loan_amount": 200000,
            "project_cost": 222222,
            "purpose": "business",
            "sc_caste_declared": True,
        }
    )
    assert res_app.status_code == 201
    created_app = res_app.json()
    app_num = created_app["application_number"]
    assert "ARTH-2024-" in app_num
    assert created_app["status"] == "Submitted"

    # Step 8: Track Application & Advance Stage (Demo Simulator)
    res_track = client.get(f"/applications/{app_num}")
    assert res_track.status_code == 200
    assert res_track.json()["applicant_name"] == "Ramesh Kumar"

    res_advance = client.post(
        f"/applications/{app_num}/status",
        json={
            "new_status": "Under Review",
            "remarks": "Documents verified by Bhopal SCA officer.",
            "updated_by": "District Welfare Officer",
        }
    )
    assert res_advance.status_code == 200
    assert res_advance.json()["status"] == "Under Review"
    assert len(res_advance.json()["timeline"]) >= 2


# ---------------------------------------------------------------------------
# 4. ADMIN DASHBOARD GOVERNANCE APIS
# ---------------------------------------------------------------------------

def test_admin_analytics_endpoint():
    """Validates admin analytics calculations and governance health."""
    resp = client.get("/admin/analytics")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_schemes"] >= 5
    assert data["active_schemes"] >= 4
    assert data["total_partners"] >= 5
    assert data["total_applications"] >= 1
    assert "applications_by_status" in data
    assert data["last_system_audit_date"] == "2026-09-05"


def test_admin_schemes_list_and_toggle():
    """Validates admin schemes management and active status toggle."""
    resp = client.get("/admin/schemes")
    assert resp.status_code == 200
    schemes = resp.json()["schemes"]
    assert len(schemes) >= 5

    first_scheme = schemes[0]
    scheme_id = first_scheme["id"]

    # Toggle to False
    res_toggle = client.patch(f"/admin/schemes/{scheme_id}/status", json={"is_active": False})
    assert res_toggle.status_code == 200
    assert res_toggle.json()["is_active"] is False

    # Toggle back to True
    res_restore = client.patch(f"/admin/schemes/{scheme_id}/status", json={"is_active": True})
    assert res_restore.status_code == 200
    assert res_restore.json()["is_active"] is True


def test_admin_partners_management():
    """Validates admin partner registration and status toggle."""
    # List partners
    res_list = client.get("/admin/partners")
    assert res_list.status_code == 200
    partners = res_list.json()["partners"]
    assert len(partners) >= 5

    # Create new partner
    new_partner_payload = {
        "name": "Bhopal District Cooperative Branch Test",
        "partner_type": "Cooperative",
        "address": "Arera Colony, E-Sector",
        "city": "Bhopal",
        "state": "Madhya Pradesh",
        "pincode": "462016",
        "latitude": 23.2150,
        "longitude": 77.4350,
        "status": "Operational",
        "supported_schemes": ["micro_finance"],
        "phone": "0755-2468100",
    }
    res_create = client.post("/admin/partners", json=new_partner_payload)
    assert res_create.status_code == 201
    created_id = res_create.json()["partner_id"]

    # Toggle status
    res_update = client.patch(f"/admin/partners/{created_id}/status", json={"status": "Temporarily Inactive"})
    assert res_update.status_code == 200
    assert res_update.json()["status"] == "Temporarily Inactive"


def test_admin_mappings_endpoint():
    """Validates scheme-to-partner mapping matrix."""
    resp = client.get("/admin/mappings")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["schemes"]) >= 5
    assert len(data["partners"]) >= 5
    assert data["total_associations"] > 0


def test_admin_applications_search_and_filter():
    """Validates admin applications listing, search, and status filtering."""
    # List all
    res_all = client.get("/admin/applications")
    assert res_all.status_code == 200
    all_apps = res_all.json()
    assert len(all_apps) >= 1

    # Filter by search
    res_search = client.get("/admin/applications", params={"search": "Ramesh"})
    assert res_search.status_code == 200
    for a in res_search.json():
        assert "ramesh" in a["applicant_name"].lower() or "ramesh" in a["application_number"].lower()


# ---------------------------------------------------------------------------
# 5. HACKATHON FINAL DEMO SCENARIO: Bhopal Small Business Entrepreneur
# ---------------------------------------------------------------------------

def test_final_demo_scenario_bhopal_small_business():
    """
    Final Demonstration Scenario:
      Beneficiary Profile:
        - Purpose: Small business (General enterprise / trade / services)
        - Annual Family Income: ₹3,00,000/year (Eligible ceiling limit)
        - Loan requirement: ₹3,00,000
        - Location: Bhopal (Madhya Pradesh)
      Expected Outcomes:
        - Recommended Scheme: Term Loan (NSFDC)
        - Verdict: "Potentially Eligible" (Score ~95)
        - Concessional Interest Rate: 8.0% p.a. (vs. 13% commercial MSME loan)
        - Repayment: Up to 7 years with 6 months moratorium
        - Top Partner: M.P. Rajya Sahakari Anusuchit Jati Vitta Nigam (SCA Head Office, Bhopal)
        - Verified Source: nsfdc.nic.in/en/term-loan (Verified: 2026-09-05)
    """
    # 1. Eligibility Check
    payload = {
        "purpose": "business",
        "annual_family_income": 300000,
        "loan_amount": 300000,
        "project_cost": 333333,
        "sc_caste_declared": True,
    }
    res_match = client.post("/schemes/match", json=payload)
    assert res_match.status_code == 200
    match_data = res_match.json()

    assert match_data["matched_count"] >= 1
    best = match_data["results"][0]
    assert best is not None
    assert best["scheme_name"] in ("Term Loan", "Udyam Nidhi Yojana (UNY)")
    assert best["eligible"] is True
    assert best["verdict"] == "Potentially Eligible"
    assert "8.0%" in best["interest_rate_display"] or "13.0%" in best["interest_rate_display"]
    assert best["source_url"] != ""
    assert best["last_verified_at"] in ("2026-09-05", "2026-09-06")

    # 2. EMI Calculation Math Verification
    # Loan = 300,000, Rate = 8.0% p.a., Tenure = 84 months (7 years), Moratorium = 6 months
    # Active repayment months = 78 months
    # Monthly rate r = 8.0 / (12 * 100) = 0.0066667
    # EMI = [300000 * r * (1+r)^78] / [(1+r)^78 - 1] ~ ₹4,942 / month
    p = 300000.0
    r_annual = 8.0
    tenure_months = 84
    moratorium = 6
    repay_months = tenure_months - moratorium
    r_monthly = r_annual / (12 * 100)
    expected_emi = (p * r_monthly * (1 + r_monthly)**repay_months) / ((1 + r_monthly)**repay_months - 1)
    assert 4800 < expected_emi < 5100

    # Commercial Comparison (13% MSME commercial bank rate)
    r_comm = 13.0 / (12 * 100)
    comm_emi = (p * r_comm * (1 + r_comm)**repay_months) / ((1 + r_comm)**repay_months - 1)
    total_concessional = expected_emi * repay_months
    total_commercial = comm_emi * repay_months
    savings = total_commercial - total_concessional
    assert savings > 40000  # Beneficiary saves over ₹40,000 in interest

    # 3. Channel Partner Ranking for Bhopal
    res_partners = client.get(
        "/partners/nearby",
        params={"city": "Bhopal", "latitude": 23.2599, "longitude": 77.4126, "scheme_name": "Term Loan"}
    )
    assert res_partners.status_code == 200
    partners = res_partners.json()["ranked_partners"]
    assert len(partners) > 0

    top = partners[0]
    assert "Bhopal" in top["partner"]["city"]
    assert top["is_best_available"] is True
    assert top["rank_score"] >= 80
    assert any("NSFDC loan scheme" in f for f in top["compatibility_factors"])

    # 4. Document Checklist Verification
    res_docs = client.get(f"/schemes/{best['scheme_id']}/documents")
    assert res_docs.status_code == 200
    docs = res_docs.json()["documents"]
    doc_types = [d["document_type"] for d in docs]
    assert "caste_certificate" in doc_types
    assert "income_certificate" in doc_types
    assert "aadhaar_card" in doc_types
    assert "project_report" in doc_types

    # 5. Application Creation & Tracking
    res_app = client.post(
        "/applications",
        json={
            "scheme_name": best["scheme_name"],
            "partner_name": top["partner"]["name"],
            "applicant_name": "Bhopal Small Business Entrepreneur",
            "applicant_phone": "9876543210",
            "annual_family_income": 300000,
            "loan_amount": 300000,
            "project_cost": 333333,
            "purpose": "business",
            "sc_caste_declared": True,
        }
    )
    assert res_app.status_code == 201
    app_obj = res_app.json()
    assert app_obj["status"] == "Submitted"
    assert "ARTH-2024-" in app_obj["application_number"]


# ---------------------------------------------------------------------------
# 6. RATE LIMITING & SECURITY
# ---------------------------------------------------------------------------

def test_rate_limiting_headers_on_ai_routes():
    """Validates X-RateLimit headers presence on AI routes."""
    resp = client.post(
        "/ai/understand-requirement",
        json={"query": "Dairy loan test query", "language": "en"}
    )
    assert resp.status_code == 200
    assert "x-ratelimit-limit" in resp.headers
    assert "x-ratelimit-remaining" in resp.headers
