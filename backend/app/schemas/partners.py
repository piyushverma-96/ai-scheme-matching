"""
Pydantic Schemas for Channelizing Agency & Partner Locator (Step 5)
===================================================================
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class PartnerOut(BaseModel):
    """Full Partner Agency record."""
    id: str
    name: str
    partner_type: str = Field(
        description="Partner institution category: 'SCA' | 'PSB' | 'RRB' | 'NBFC_MFI' | 'NBFC-MFI' | 'Cooperative' | 'Bank'"
    )

    @field_validator("partner_type", mode="before")
    @classmethod
    def normalize_partner_type(cls, v: Any) -> Any:
        if isinstance(v, str) and v.upper() in ("NBFC-MFI", "NBFC_MFI"):
            return "NBFC_MFI"
        return v
    address: Optional[str] = None
    city: str
    district: Optional[str] = None
    state: str
    pincode: Optional[str] = None
    latitude: float
    longitude: float
    status: str = Field(default="Operational", description="'Operational' | 'Active' | 'Temporarily Inactive'")
    supported_schemes: List[str] = Field(default_factory=list)
    scheme_ids: List[str] = Field(default_factory=list)

    # Financial & Operational Eligibility Fields
    is_authorized: bool = Field(default=True, description="Government/NSFDC Authorization flag")
    is_active: bool = Field(default=True, description="Active status flag")
    fund_utilization_percent: Optional[float] = Field(default=None, description="Reported fund utilization percentage")
    fund_utilization_status: Optional[str] = Field(default="Satisfactory", description="Fund utilization condition")
    overdue_status: Optional[str] = Field(default="Current / No Overdues", description="Overdue status flag")
    npa_status: Optional[str] = Field(default="Standard Asset", description="Asset categorization / NPA status")
    eligibility_status: str = Field(default="Eligible", description="'Eligible' | 'Suspended / Overdue' | 'Ineligible'")
    eligibility_reason: Optional[str] = Field(default=None, description="Explanation of eligibility or exclusion")
    last_verified_at: Optional[str] = Field(default="2026-08-15", description="Audit verification timestamp string")
    source_name: Optional[str] = Field(default="NSFDC Channelizing Agency Master Directory", description="Audit source")
    source: Optional[str] = Field(default="NSFDC Channelizing Agency Master Directory", description="Audit source summary")
    source_url: Optional[str] = Field(default="https://nsfdc.nic.in", description="Audit source URL")
    is_demo_data: bool = Field(default=True, description="Flag indicating demo / prototype record")
    data_confidence_label: str = Field(default="Verified Master Data", description="Data confidence label")

    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    operating_hours: Optional[str] = "10:00 AM - 5:00 PM (Mon-Sat)"

    model_config = {"from_attributes": True}


class RankedPartnerOut(BaseModel):
    """Partner with multi-factor ranking, distance, travel time, and route points."""
    partner: PartnerOut
    distance_km: float = Field(description="Distance in kilometers from applicant location")
    driving_duration_mins: Optional[float] = Field(
        default=None, description="Estimated driving duration in minutes"
    )
    rank_score: int = Field(description="Multi-factor rank score between 0 and 100")
    is_eligible: bool = Field(default=True, description="Whether partner passed all eligibility gates")
    compatibility_factors: List[str] = Field(
        default_factory=list, description="Criteria satisfied (Scheme match, operational status, clean dues)"
    )
    exclusion_reason: Optional[str] = Field(
        default=None, description="High-level non-sensitive exclusion reason if ineligible"
    )
    is_best_available: bool = Field(
        default=False, description="True for top ranked compatible partner"
    )
    route_geometry: Optional[List[List[float]]] = Field(
        default=None, description="GeoJSON coordinates array [[lon, lat], ...]"
    )


class ExcludedPartnerOut(BaseModel):
    id: str
    name: str
    partner_type: str
    distance_km: float
    exclusion_reason: str
    last_verified_at: Optional[str] = None


class NearbyPartnersResponse(BaseModel):
    user_location: Dict[str, Any]
    total_partners_evaluated: int
    eligible_count: int
    excluded_count: int
    recommended_partner: Optional[RankedPartnerOut] = None
    eligible_partners: List[RankedPartnerOut] = Field(default_factory=list)
    excluded_partners: List[ExcludedPartnerOut] = Field(default_factory=list)
    # Backward compatibility fields
    ranked_partners: List[RankedPartnerOut] = Field(default_factory=list)
    best_partner: Optional[RankedPartnerOut] = None
    verification_notice: str = (
        "Partner eligibility information is subject to verification by the respective authority/partner. "
        "Financial health and fund utilization criteria are audited against NSFDC channel partner guidelines."
    )
    attribution: str = (
        "Map Data © OpenStreetMap contributors, ODbL 1.0. "
        "Routing powered by openrouteservice.org / Local Haversine Calculation. "
        "Partner data categorized under NSFDC Directory & Prototype Simulation."
    )


class RouteRequest(BaseModel):
    start_lat: float = Field(..., ge=-90, le=90)
    start_lng: float = Field(..., ge=-180, le=180)
    end_lat: float = Field(..., ge=-90, le=90)
    end_lng: float = Field(..., ge=-180, le=180)


class RouteResponse(BaseModel):
    distance_km: float
    duration_mins: float
    route_points: List[List[float]] = Field(
        description="List of [latitude, longitude] pairs for MapLibre/Leaflet rendering"
    )
    is_live_routing: bool = Field(
        description="True if calculated via OpenRouteService API, False if Haversine fallback"
    )
    attribution: str = "Route calculation © OpenRouteService / OpenStreetMap"


class GeocodeResponse(BaseModel):
    query: str
    found: bool
    display_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    attribution: str = "Geocoding © OpenStreetMap Nominatim"
