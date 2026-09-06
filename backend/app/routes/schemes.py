"""
ArthSetu AI — Scheme & Eligibility Routes (Step 2)
==================================================
Deterministic Endpoints:
  GET  /schemes                  & /api/v1/schemes             – list all NSFDC verified schemes
  GET  /schemes/{id}             & /api/v1/schemes/{id}        – get single scheme by UUID
  POST /eligibility/check        & /api/v1/eligibility/check   – check all schemes for applicant
  POST /schemes/match            & /api/v1/schemes/match       – return matching (Potentially Eligible) schemes
  POST /eligibility/best-match   & /api/v1/eligibility/best-match – return single best-match scheme
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, status

from app.database import get_supabase_client
from app.schemas.schemes import (
    BestMatchResponse,
    EligibilityCheckRequest,
    EligibilityCheckResponse,
    SchemeMatchResult,
    SchemeOut,
    SchemesListOut,
)
from app.services.eligibility import (
    EligibilityResult,
    check_all_schemes,
    get_best_match,
    get_rules_for_scheme,
    get_verified_schemes_data,
)


logger = logging.getLogger("arthsetu.routes.schemes")

# Router definitions
router = APIRouter(prefix="/schemes", tags=["Schemes & Eligibility"])
eligibility_router = APIRouter(prefix="/eligibility", tags=["Schemes & Eligibility"])


def _is_unavailability_error(exc: Exception) -> bool:
    """
    Checks if an exception represents network, connection, or service unavailability
    (where falling back to verified seed data is appropriate), vs. a schema or programming bug.
    """
    msg = str(exc).lower()
    unavailability_markers = [
        "connect",
        "timeout",
        "network",
        "offline",
        "unreachable",
        "temporary",
        "502",
        "503",
        "504",
        "placeholder-project",
        "name resolution",
        "max retries",
        "connection refused",
        "reset by peer",
        "closed connection",
        "failed to establish a new connection",
        "remote end closed",
        "bad gateway",
        "service unavailable",
    ]
    if isinstance(exc, (ConnectionError, TimeoutError, OSError)):
        return True
    return any(marker in msg for marker in unavailability_markers)


def _to_schema(result: EligibilityResult) -> SchemeMatchResult:
    return SchemeMatchResult(
        scheme_id=result.scheme_id,
        scheme_name=result.scheme_name,
        scheme_type=result.scheme_type,
        verdict=result.verdict,
        status=getattr(
            result,
            "status",
            "eligible" if result.eligible else ("partially_eligible" if getattr(result, "partially_eligible", False) else "ineligible")
        ),
        eligible=result.eligible,
        partially_eligible=getattr(result, "partially_eligible", False),
        matched=result.matched,
        match_score=result.match_score,
        matching_factors=result.matching_factors,
        reasons=result.reasons,
        failed_factors=result.failed_factors,
        disqualifiers=result.disqualifiers,
        missing_information=result.missing_information,
        explanation=result.explanation,
        recommended_loan_amount=result.recommended_loan_amount,
        interest_rate_display=result.interest_rate_display,
        repayment_years=result.repayment_years,
        moratorium_note=result.moratorium_note,
        benefit_type=getattr(result, "benefit_type", "loan"),
        benefit_summary=getattr(result, "benefit_summary", None),
        has_financial_calculation=getattr(result, "has_financial_calculation", True),
        support_type_display=getattr(result, "support_type_display", None),
        application_channel_type=getattr(result, "application_channel_type", "channel_partner"),
        application_channel_details=getattr(result, "application_channel_details", None),
        coverage_percent=getattr(result, "coverage_percent", 90.0),
        business_categories=getattr(result, "business_categories", []),
        eligible_channel_types=getattr(result, "eligible_channel_types", ["SCA", "PSB", "RRB"]),
        application_mode=getattr(result, "application_mode", "channel_agency"),
        official_application_url=getattr(result, "official_application_url", "https://nsfdc.nic.in/scheme"),
        required_documents=getattr(result, "required_documents", []),
        ministry=getattr(result, "ministry", "Ministry of Social Justice and Empowerment"),
        target_beneficiary=getattr(result, "target_beneficiary", None),
        source_name=result.source_name,
        source_url=result.source_url,
        last_verified_at=result.last_verified_at,
        needs_manual_verification=result.needs_manual_verification,
        verification_note=result.verification_note,
    )




# ---------------------------------------------------------------------------
# GET /schemes (Supports both no-slash and trailing slash without 307 redirect)
# ---------------------------------------------------------------------------
@router.get(
    "",
    response_model=SchemesListOut,
    response_model_by_alias=True,
    summary="List all NSFDC verified schemes",
    description=(
        "Returns verified schemes from Supabase PostgreSQL database. "
        "Falls back to local verified seed data only if database is unreachable or offline."
    ),
)
@router.get(
    "/",
    response_model=SchemesListOut,
    response_model_by_alias=True,
    summary="List all NSFDC verified schemes (trailing slash)",
    include_in_schema=False,
)
async def list_schemes():
    try:
        supabase = get_supabase_client()
        # Query schemes without filtering on non-existent is_active column
        resp = (
            supabase.table("schemes")
            .select("*")
            .order("name")
            .execute()
        )
        if resp.data and len(resp.data) > 0:
            schemes_out = [
                SchemeOut(**s, _data_source="supabase")
                for s in resp.data
            ]
            logger.info(
                f"[DATA_SOURCE: used live Supabase data] Successfully fetched {len(schemes_out)} schemes from Supabase PostgreSQL."
            )
            return SchemesListOut(
                count=len(schemes_out),
                _data_source="supabase",
                schemes=schemes_out,
            )
        else:
            logger.warning(
                "[DATA_SOURCE: used live Supabase data] Supabase returned empty table 'schemes'."
            )
    except Exception as exc:
        logger.error(
            f"[DATA_SOURCE: used local fallback seed data] Supabase schemes query failed: {exc}",
            exc_info=True,
        )
        # If this is a schema or SQL bug (not connection unavailability), raise 500 so it gets caught
        if not _is_unavailability_error(exc):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database query error in schemes table: {str(exc)}",
            )

    # Fallback to verified local seed dataset for genuine connection unavailability
    local_data = get_verified_schemes_data()
    schemes_out = [
        SchemeOut(**s, _data_source="local_fallback")
        for s in local_data
        if s.get("is_active", True)
    ]
    logger.info(
        f"[DATA_SOURCE: used local fallback seed data] Serving {len(schemes_out)} verified schemes from local seed cache."
    )
    return SchemesListOut(
        count=len(schemes_out),
        _data_source="local_fallback",
        schemes=schemes_out,
    )


# ---------------------------------------------------------------------------
# GET /schemes/{scheme_id}
# ---------------------------------------------------------------------------
@router.get(
    "/{scheme_id}",
    response_model=SchemeOut,
    response_model_by_alias=True,
    summary="Get a specific scheme by UUID",
)
async def get_scheme(scheme_id: str):
    try:
        supabase = get_supabase_client()
        resp = (
            supabase.table("schemes")
            .select("*")
            .eq("id", scheme_id)
            .maybe_single()
            .execute()
        )
        if resp and resp.data:
            logger.info(
                f"[DATA_SOURCE: used live Supabase data] Fetched scheme '{scheme_id}' from Supabase."
            )
            return SchemeOut(**resp.data, _data_source="supabase")
    except Exception as exc:
        logger.error(
            f"[DATA_SOURCE: used local fallback seed data] Supabase get_scheme query failed for id '{scheme_id}': {exc}",
            exc_info=True,
        )
        if not _is_unavailability_error(exc):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database query error in schemes table: {str(exc)}",
            )

    # Fallback check for genuine connection unavailability
    local_data = get_verified_schemes_data()
    match = next((s for s in local_data if s["id"] == scheme_id), None)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme with id '{scheme_id}' not found.",
        )
    logger.info(
        f"[DATA_SOURCE: used local fallback seed data] Serving scheme '{scheme_id}' from local seed cache."
    )
    return SchemeOut(**match, _data_source="local_fallback")


# ---------------------------------------------------------------------------
# GET /schemes/{scheme_id}/rules
# ---------------------------------------------------------------------------
@router.get(
    "/{scheme_id}/rules",
    summary="Get data-defined eligibility rules for a specific scheme",
    description="Returns the exact eligibility criteria/rules defined for this scheme.",
)
async def get_scheme_rules_endpoint(scheme_id: str):
    rules = get_rules_for_scheme(scheme_id)
    if not rules:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No eligibility rules found for scheme '{scheme_id}'.",
        )
    return {
        "scheme_id": scheme_id,
        "rules_count": len(rules),
        "rules": [
            {
                "rule_id": r.rule_id,
                "field_name": r.field_name,
                "operator": r.operator,
                "value_num": r.value_num,
                "value_list": r.value_list,
                "value_text": r.value_text,
                "description": r.description,
                "is_hard_rule": r.is_hard_rule,
                "rule_type": r.rule_type,
                "source_note": r.source_note,
            }
            for r in rules
        ],
    }


# ---------------------------------------------------------------------------
# POST /schemes/match
# ---------------------------------------------------------------------------
@router.post(
    "/match",
    response_model=EligibilityCheckResponse,
    summary="Find matching NSFDC schemes for applicant",
    description=(
        "Runs the deterministic Python rule engine and returns matching schemes "
        "(Potentially Eligible or Partially Eligible), ordered by match score."
    ),
)
async def schemes_match(body: EligibilityCheckRequest):
    all_results = check_all_schemes(
        purpose=body.purpose,
        annual_family_income=body.annual_family_income,
        project_cost=body.project_cost,
        loan_amount=body.loan_amount,
        sc_caste_declared=body.sc_caste_declared,
        education_status=body.education_status,
        study_location=body.study_location,
        gender=body.gender,
        caste_category=body.caste_category,
        age=body.age,
        state=body.state,
        district=body.district,
        city=body.city,
        pincode=body.pincode,
        project_type=body.project_type,
        business_type=body.business_type,
        business_status=body.business_status,
        occupation=body.occupation,
    )
    # Matched includes both fully eligible and partially eligible
    matched = [r for r in all_results if r.matched]
    # Sort priority: fully eligible first, then partially eligible, then match_score desc
    matched.sort(key=lambda r: (1 if r.eligible else 0, r.match_score), reverse=True)

    return EligibilityCheckResponse(
        input_summary=body.model_dump(),
        total_schemes_evaluated=len(all_results),
        matched_count=len(matched),
        results=[_to_schema(r) for r in matched],
    )


# ---------------------------------------------------------------------------
# POST /eligibility/check
# ---------------------------------------------------------------------------
@eligibility_router.post(
    "/check",
    response_model=EligibilityCheckResponse,
    summary="Check eligibility across all NSFDC schemes",
    description=(
        "Runs the deterministic Python rule engine against all verified NSFDC schemes. "
        "Returns verdict ('Potentially Eligible', 'Partially Eligible', or 'Does Not Match Current Criteria'), "
        "matching factors, failed factors, missing info, and structured explanation for each."
    ),
)
async def eligibility_check(body: EligibilityCheckRequest):
    results = check_all_schemes(
        purpose=body.purpose,
        annual_family_income=body.annual_family_income,
        project_cost=body.project_cost,
        loan_amount=body.loan_amount,
        sc_caste_declared=body.sc_caste_declared,
        education_status=body.education_status,
        study_location=body.study_location,
        gender=body.gender,
        caste_category=body.caste_category,
        age=body.age,
        state=body.state,
        district=body.district,
        city=body.city,
        pincode=body.pincode,
        project_type=body.project_type,
        business_type=body.business_type,
        business_status=body.business_status,
        occupation=body.occupation,
    )
    matched_count = sum(1 for r in results if r.matched)

    return EligibilityCheckResponse(
        input_summary=body.model_dump(),
        total_schemes_evaluated=len(results),
        matched_count=matched_count,
        results=[_to_schema(r) for r in results],
    )


# ---------------------------------------------------------------------------
# POST /eligibility/best-match
# ---------------------------------------------------------------------------
@eligibility_router.post(
    "/best-match",
    response_model=BestMatchResponse,
    summary="Find single best-matching NSFDC scheme",
)
async def eligibility_best_match(body: EligibilityCheckRequest):
    best = get_best_match(
        purpose=body.purpose,
        annual_family_income=body.annual_family_income,
        project_cost=body.project_cost,
        loan_amount=body.loan_amount,
        sc_caste_declared=body.sc_caste_declared,
        education_status=body.education_status,
        study_location=body.study_location,
        gender=body.gender,
        caste_category=body.caste_category,
        age=body.age,
        state=body.state,
        district=body.district,
        city=body.city,
        pincode=body.pincode,
        project_type=body.project_type,
        business_type=body.business_type,
        business_status=body.business_status,
        occupation=body.occupation,
    )

    if best:
        loan_str = f"₹{best.recommended_loan_amount:,.0f}" if best.recommended_loan_amount else "up to the scheme limit"
        verdict_str = "Potentially Eligible" if best.eligible else "Partially Eligible"
        message = (
            f"You appear {verdict_str} for '{best.scheme_name}' "
            f"(match score: {best.match_score}/100). "
            f"Recommended support: {loan_str} at {best.interest_rate_display}. "
            "Please contact your nearest Channelizing Agency or apply via PM SURAJ portal. "
            "This is NOT a sanction — final approval rests with the issuing authority."
        )
    else:
        message = (
            "Based on the criteria evaluated, no current NSFDC scheme matches your profile. "
            "Please check your income ceiling, project scale, or purpose, or contact NSFDC directly "
            "at https://nsfdc.nic.in (Toll-Free: 1800-110-396)."
        )

    return BestMatchResponse(
        input_summary=body.model_dump(),
        matched=best is not None,
        best_match=_to_schema(best) if best else None,
        message=message,
    )

