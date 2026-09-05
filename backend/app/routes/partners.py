"""
ArthSetu AI — Channelizing Agency & Partner Locator Routes (Step 5)
===================================================================
Endpoints:
  GET  /partners/nearby     – Multi-factor ranking (Scheme compatibility -> Partner status -> Master Data -> Distance)
  GET  /partners/{id}       – Single partner details
  POST /partners/route      – Driving route, distance & estimated travel time (OpenRouteService with fallback)
  GET  /partners/geocode    – Geocode address/city via OpenStreetMap Nominatim
"""

from __future__ import annotations

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.partners import (
    GeocodeResponse,
    NearbyPartnersResponse,
    PartnerOut,
    RankedPartnerOut,
    RouteRequest,
    RouteResponse,
)
from app.services.partner_locator import PartnerLocatorService

logger = logging.getLogger("arthsetu.routes.partners")

router = APIRouter(prefix="/partners", tags=["Partner Locator & Maps (Step 5)"])


@router.get(
    "/nearby",
    response_model=NearbyPartnersResponse,
    summary="Find & rank compatible channelizing agencies near beneficiary",
    description=(
        "Executes deterministic multi-gate eligibility filtering (Authorization, Scheme compatibility, "
        "Fund utilization, Overdues, Asset quality) BEFORE sorting by distance."
    ),
)
async def get_nearby_partners(
    latitude: Optional[float] = Query(None, description="Applicant GPS latitude"),
    longitude: Optional[float] = Query(None, description="Applicant GPS longitude"),
    city: Optional[str] = Query(None, description="Applicant city or district name"),
    scheme_id: Optional[str] = Query(None, description="Optional target scheme UUID"),
    scheme_type: Optional[str] = Query(None, description="Optional target scheme type (e.g. micro_finance, term_loan)"),
    scheme_name: Optional[str] = Query(None, description="Optional target scheme name"),
    limit: int = Query(10, ge=1, le=50),
):
    try:
        eligible_list, best_partner, excluded_list, total_eval = (
            await PartnerLocatorService.find_and_rank_partners(
                user_lat=latitude,
                user_lng=longitude,
                city=city,
                scheme_id=scheme_id,
                scheme_type=scheme_type,
                scheme_name=scheme_name,
                limit=limit,
            )
        )

        final_lat = latitude or (best_partner.partner.latitude if best_partner else 23.2350)
        final_lng = longitude or (best_partner.partner.longitude if best_partner else 77.4000)

        return NearbyPartnersResponse(
            user_location={
                "latitude": final_lat,
                "longitude": final_lng,
                "city": city or "Bhopal",
            },
            total_partners_evaluated=total_eval,
            eligible_count=len(eligible_list),
            excluded_count=len(excluded_list),
            recommended_partner=best_partner,
            eligible_partners=eligible_list,
            excluded_partners=excluded_list,
            ranked_partners=eligible_list,
            best_partner=best_partner,
        )
    except Exception as exc:
        logger.error(f"Error finding nearby partners: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to locate channelizing partners: {str(exc)}",
        )


@router.post(
    "/route",
    response_model=RouteResponse,
    summary="Calculate driving route & estimated travel time",
    description=(
        "Uses openrouteservice.org driving-car API with transparent fallback to straight-line "
        "distance and speed calculations if API key is not configured or quota exceeded."
    ),
)
async def calculate_route(body: RouteRequest):
    try:
        route = await PartnerLocatorService.calculate_route(
            start_lat=body.start_lat,
            start_lng=body.start_lng,
            end_lat=body.end_lat,
            end_lng=body.end_lng,
        )
        return route
    except Exception as exc:
        logger.error(f"Error calculating route: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate route: {str(exc)}",
        )


@router.get(
    "/geocode",
    response_model=GeocodeResponse,
    summary="Geocode city or address using OpenStreetMap Nominatim",
)
async def geocode_address(query: str = Query(..., description="City or address in India")):
    try:
        res = await PartnerLocatorService.geocode_location(query)
        return res
    except Exception as exc:
        logger.error(f"Error in geocoding: {exc}", exc_info=True)
        return GeocodeResponse(query=query, found=False)


@router.get(
    "/{partner_id}",
    response_model=PartnerOut,
    summary="Get single partner agency details",
)
async def get_partner_details(partner_id: str):
    all_p = PartnerLocatorService.get_all_partners()
    match = next((p for p in all_p if p.id == partner_id), None)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Partner agency with id '{partner_id}' not found.",
        )
    return match
