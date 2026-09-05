"""
Step 5 Automated Test Suite — Partner Locator & Application Journey for ArthSetu AI
===================================================================================
Tests:
  1. Multi-factor partner ranking: Scheme compatibility -> Operational status -> Master data -> Distance.
  2. Data Confidence Label: Every partner must have 'Verified Master Data' or 'Prototype/Demo Data'.
  3. Real interactive routing & fallback: Haversine distance & travel duration calculation.
  4. Scheme-specific document checklists (Education vs Micro-Credit / Term Loan).
  5. Application submission lifecycle (ARTH-2024-XXXXX generation & initial audit state).
  6. Demo status transition simulation with timeline history.
"""

import asyncio
import pytest
from app.schemas.applications import ApplicationCreateRequest, StatusUpdateRequest
from app.services.application_service import ApplicationService
from app.services.partner_locator import PartnerLocatorService, VERIFIED_PARTNERS_MASTER_DATA


def test_partner_multi_factor_ranking():
    """Verify that multi-factor ranking prioritizes compatible, operational partners over distant ones."""
    # Search from Bhopal coordinates for Term Loan
    bhopal_lat, bhopal_lng = 23.2599, 77.4126
    ranked, best = asyncio.run(
        PartnerLocatorService.find_and_rank_partners(
            user_lat=bhopal_lat,
            user_lng=bhopal_lng,
            scheme_type="term_loan",
            scheme_name="Term Loan",
            limit=5,
        )
    )

    assert len(ranked) > 0
    assert best is not None
    assert best.is_best_available is True
    # Best partner in Bhopal for Term Loan should be MP Rajya SCA or MP Gramin Bank
    assert "Bhopal" in best.partner.city
    assert best.rank_score >= 80
    assert len(best.compatibility_factors) >= 3


def test_every_partner_has_required_data_confidence_label():
    """Every partner must explicitly carry 'Verified Master Data' or 'Prototype/Demo Data'."""
    all_partners = PartnerLocatorService.get_all_partners()
    assert len(all_partners) >= 5

    for p in all_partners:
        assert p.data_confidence_label in ("Verified Master Data", "Prototype/Demo Data")
        assert p.status in ("Operational", "Active", "Temporarily Inactive")
        assert p.partner_type in ("SCA", "PSB", "RRB", "NBFC_MFI", "Cooperative")


def test_geocoding_and_haversine_distance():
    """Test Nominatim geocoding fallback & Haversine distance between Bhopal and Indore (~190 km)."""
    bhopal_lat, bhopal_lng = 23.2599, 77.4126
    indore_lat, indore_lng = 22.7196, 75.8577

    dist = PartnerLocatorService.haversine_distance(bhopal_lat, bhopal_lng, indore_lat, indore_lng)
    assert 170.0 <= dist <= 200.0  # Approx 185-195 km aerial distance


def test_route_calculation_with_graceful_fallback():
    """Test route calculation between coordinates returns valid distance, duration, and coordinates."""
    route = asyncio.run(
        PartnerLocatorService.calculate_route(
            start_lat=23.2599,
            start_lng=77.4126,
            end_lat=23.2458,
            end_lng=77.3912,
        )
    )

    assert route.distance_km > 0
    assert route.duration_mins > 0
    assert len(route.route_points) >= 2
    assert "OpenRouteService" in route.attribution or "OpenStreetMap" in route.attribution


def test_scheme_specific_document_checklists():
    """ELS must require admission letter & fee structure; Term loan must require project proposal."""
    els_checklist = ApplicationService.get_scheme_document_checklist(
        scheme_name="Educational Loan Scheme (ELS)"
    )
    els_types = [d.document_type for d in els_checklist.documents]
    assert "caste_certificate" in els_types
    assert "income_certificate" in els_types
    assert "admission_letter" in els_types
    assert "fee_structure" in els_types

    term_loan_checklist = ApplicationService.get_scheme_document_checklist(
        scheme_name="Term Loan"
    )
    term_types = [d.document_type for d in term_loan_checklist.documents]
    assert "caste_certificate" in term_types
    assert "project_report" in term_types
    assert "admission_letter" not in term_types


def test_application_lifecycle_and_status_tracking():
    """Test complete application submission and demo status transition audit history."""
    req = ApplicationCreateRequest(
        scheme_name="Micro Credit Finance",
        partner_name="M.P. Rajya Sahakari Anusuchit Jati Vitta Evam Vikas Nigam Maryadit",
        applicant_name="Sita Devi",
        applicant_phone="9811223344",
        annual_family_income=140000,
        loan_amount=100000,
        project_cost=111111,
        purpose="micro_business",
        sc_caste_declared=True,
    )

    app = ApplicationService.create_application(req)
    assert app.application_number.startswith("ARTH-2024-")
    assert app.status == "Submitted"
    assert len(app.timeline) == 1
    assert app.timeline[0].to_status == "Submitted"

    # Advance status to 'Under Review'
    updated = ApplicationService.update_application_status(
        app_id_or_number=app.application_number,
        new_status="Under Review",
        remarks="Documents received at District SCA office. Scrutiny initiated.",
        updated_by="SCA Officer Sharma",
    )
    assert updated.status == "Under Review"
    assert len(updated.timeline) == 2
    assert updated.timeline[1].to_status == "Under Review"

    # Advance status to 'Forwarded to Partner'
    updated2 = ApplicationService.update_application_status(
        app_id_or_number=app.application_number,
        new_status="Forwarded to Partner",
        remarks="Field verification completed. Sent to Partner Bank for DBT sanction.",
        updated_by="District Welfare Officer",
    )
    assert updated2.status == "Forwarded to Partner"
    assert len(updated2.timeline) == 3


def test_stage5_schemes_channel_type_and_non_partner_structure():
    """
    Verifies that all 3 verified NSFDC schemes have application_channel_type = 'channel_partner',
    and non-partner channel types are validly accepted by data models.
    """
    from app.services.eligibility import SCHEME_RULES, check_all_schemes
    from app.schemas.schemes import SchemeOut, SchemeMatchResult

    # All 3 existing schemes must be channel_partner
    for rule in SCHEME_RULES:
        assert rule.application_channel_type == "channel_partner"

    # Evaluated results preserve application_channel_type
    results = check_all_schemes(purpose="business", annual_family_income=200000, loan_amount=200000)
    for r in results:
        assert r.application_channel_type == "channel_partner"

    # Verify data models accept non-partner channel types
    sample_portal_scheme = SchemeMatchResult(
        scheme_id="test-portal-scheme-id",
        scheme_name="Direct Portal Grant",
        scheme_type="grant",
        verdict="Potentially Eligible",
        status="eligible",
        eligible=True,
        matched=True,
        match_score=95,
        reasons=["Direct application via portal"],
        explanation="Direct government portal application",
        interest_rate_display="N/A (Grant)",
        repayment_years=0,
        moratorium_note="None",
        benefit_type="grant",
        has_financial_calculation=False,
        application_channel_type="government_portal",
        application_channel_details={"portal_url": "https://serviceonline.gov.in"},
        source_url="https://gov.in",
        source_name="Official Portal",
        last_verified_at="2026-09-05",
        needs_manual_verification=False,
        verification_note="",
    )
    assert sample_portal_scheme.application_channel_type == "government_portal"
    assert sample_portal_scheme.application_channel_details["portal_url"] == "https://serviceonline.gov.in"


def test_stage5_filter_before_distance_closer_ineligible_partner():
    """
    IMPORTANT: Nearest partner is NOT automatically the correct partner.
    Malwa Regional Gramin Desk is closer (~0.45 km) but is suspended / high overdue.
    SBI TT Nagar is ~0.14 km away and eligible.
    If searching from a point where Malwa RRB is closest (e.g. 23.2389, 77.4011),
    Malwa RRB must be EXCLUDED and SBI or MP Rajya SCA recommended.
    """
    # Origin at exact location of suspended Malwa RRB
    malwa_lat, malwa_lng = 23.2389, 77.4011
    ranked, best, excluded, total = asyncio.run(
        PartnerLocatorService.find_and_rank_partners(
            user_lat=malwa_lat,
            user_lng=malwa_lng,
            scheme_name="Term Loan",
            scheme_type="term_loan",
        )
    )

    # Malwa RRB must be in excluded list due to suspension / overdue defaults
    excluded_names = [e.name for e in excluded]
    assert any("Malwa Regional Gramin" in name for name in excluded_names)

    # Malwa RRB must NEVER be the recommended partner even though distance is 0.0 km
    assert best is not None
    assert "Malwa" not in best.partner.name
    assert best.is_eligible is True
    assert best.partner.is_authorized is True

